import { spawn } from "node:child_process";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

const port = 4310;
const baseUrl = `http://127.0.0.1:${port}`;
const server = spawn("npm", ["run", "start"], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    PORT: String(port)
  },
  stdio: ["ignore", "pipe", "pipe"]
});

server.stdout.on("data", (chunk) => {
  process.stdout.write(chunk);
});

server.stderr.on("data", (chunk) => {
  process.stderr.write(chunk);
});

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`);

      if (response.ok) {
        return;
      }
    } catch {
      // Server is still starting.
    }

    await delay(500);
  }

  throw new Error("Timed out waiting for the production server to start.");
}

async function assertJson(pathname, expectedStatus) {
  const response = await fetch(`${baseUrl}${pathname}`);
  const contentType = response.headers.get("content-type") ?? "";

  if (response.status !== expectedStatus) {
    throw new Error(`Expected ${pathname} to return ${expectedStatus}, got ${response.status}.`);
  }

  if (!contentType.includes("application/json")) {
    throw new Error(`${pathname} did not return JSON.`);
  }

  return response.json();
}

async function assertRootHtml() {
  const response = await fetch(baseUrl);
  const html = await response.text();
  const contentType = response.headers.get("content-type") ?? "";

  if (response.status !== 200) {
    throw new Error(`Expected / to return 200, got ${response.status}.`);
  }

  if (!contentType.includes("text/html")) {
    throw new Error("/ did not return HTML.");
  }

  if (!html.includes("<title>Personal Milestone Tracker</title>")) {
    throw new Error("The built frontend was not served from /.");
  }

  if (!html.includes('href="/favicon.svg"')) {
    throw new Error("The favicon metadata was not included in the built frontend.");
  }
}

async function assertPost(payload, expectedStatus) {
  const response = await fetch(`${baseUrl}/milestones`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();

  if (response.status !== expectedStatus) {
    throw new Error(
      `Expected POST /milestones to return ${expectedStatus}, got ${response.status}.`
    );
  }

  return data;
}

async function assertPut(id, payload, expectedStatus) {
  const response = await fetch(`${baseUrl}/milestones/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();

  if (response.status !== expectedStatus) {
    throw new Error(`Expected PUT /milestones/${id} to return ${expectedStatus}, got ${response.status}.`);
  }

  return data;
}

async function assertDelete(id, expectedStatus) {
  const response = await fetch(`${baseUrl}/milestones/${id}`, {
    method: "DELETE"
  });
  const data = await response.json();

  if (response.status !== expectedStatus) {
    throw new Error(
      `Expected DELETE /milestones/${id} to return ${expectedStatus}, got ${response.status}.`
    );
  }

  return data;
}

async function main() {
  try {
    await waitForServer();
    await assertRootHtml();

    const health = await assertJson("/health", 200);

    if (health.status !== "ok") {
      throw new Error("Health endpoint did not return the expected payload.");
    }

    const emptyMilestones = await assertJson("/milestones", 200);

    if (!Array.isArray(emptyMilestones) || emptyMilestones.length !== 0) {
      throw new Error("Expected a new server instance to return an empty milestone list.");
    }

    const shortTitleResponse = await assertPost(
      {
        title: "Hi",
        category: "Work",
        date: "2026-03-30"
      },
      400
    );

    if (shortTitleResponse.message !== "Title must be at least 3 characters long.") {
      throw new Error("Short title validation did not return the expected message.");
    }

    const invalidCategoryResponse = await assertPost(
      {
        title: "Finished monthly review",
        category: "Other",
        date: "2026-03-30"
      },
      400
    );

    if (invalidCategoryResponse.message !== "Choose a valid category.") {
      throw new Error("Category validation did not return the expected message.");
    }

    const invalidDateResponse = await assertPost(
      {
        title: "Finished monthly review",
        category: "Work",
        date: "2026-99-99"
      },
      400
    );

    if (invalidDateResponse.message !== "Please choose a valid date.") {
      throw new Error("Date validation did not return the expected message.");
    }

    const createdMilestone = await assertPost(
      {
        title: "  Finished monthly review  ",
        category: "Work",
        date: "2026-03-25"
      },
      201
    );

    if (createdMilestone.title !== "Finished monthly review") {
      throw new Error("Created milestone title was not trimmed before storage.");
    }

    if (createdMilestone.date !== "2026-03-25") {
      throw new Error("Created milestone date was not stored correctly.");
    }

    const updatedMilestone = await assertPut(
      createdMilestone.id,
      {
        title: "Finished monthly review and retro",
        category: "Personal",
        date: "2026-03-26"
      },
      200
    );

    if (updatedMilestone.title !== "Finished monthly review and retro") {
      throw new Error("Updated milestone title was not returned correctly.");
    }

    if (updatedMilestone.category !== "Personal" || updatedMilestone.date !== "2026-03-26") {
      throw new Error("Updated milestone values were not returned correctly.");
    }

    const milestones = await assertJson("/milestones", 200);

    if (!Array.isArray(milestones) || milestones.length !== 1) {
      throw new Error("Expected the created milestone to appear in the feed.");
    }

    if (milestones[0]?.title !== "Finished monthly review and retro") {
      throw new Error("Feed data does not match the updated milestone.");
    }

    const deleteResponse = await assertDelete(createdMilestone.id, 200);

    if (deleteResponse.id !== createdMilestone.id) {
      throw new Error("Delete response did not return the deleted milestone id.");
    }

    const finalMilestones = await assertJson("/milestones", 200);

    if (!Array.isArray(finalMilestones) || finalMilestones.length !== 0) {
      throw new Error("Expected the deleted milestone to be removed from the feed.");
    }

    console.log("\nE2E verification passed.");
  } finally {
    server.kill("SIGTERM");
    await delay(500);
  }
}

main().catch((error) => {
  console.error(`\nE2E verification failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
