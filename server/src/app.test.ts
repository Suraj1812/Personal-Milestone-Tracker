import type { Request, Response } from "express";
import { beforeEach, describe, expect, it } from "vitest";
import { handleCreateMilestone, handleListMilestones } from "./routes/milestones.js";
import { resetMilestones } from "./store/milestoneStore.js";

interface MockResponse extends Partial<Response> {
  body?: unknown;
  statusCode: number;
}

function createMockResponse(): Response & MockResponse {
  const response: MockResponse = {
    statusCode: 200,
    status(code: number) {
      response.statusCode = code;
      return response as Response & MockResponse;
    },
    json(payload: unknown) {
      response.body = payload;
      return response as Response & MockResponse;
    }
  };

  return response as Response & MockResponse;
}

describe("milestones API", () => {
  beforeEach(() => {
    resetMilestones();
  });

  it("returns an empty list when there are no milestones", () => {
    const response = createMockResponse();

    handleListMilestones({} as Request, response, () => undefined);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("creates a milestone when the payload is valid", () => {
    const request = {
      body: {
        title: "Completed the assessment build",
        category: "Work"
      }
    } as Request;
    const response = createMockResponse();

    handleCreateMilestone(request, response, () => undefined);

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({
      title: "Completed the assessment build",
      category: "Work"
    });
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("createdAt");
  });

  it("rejects titles shorter than 3 characters", () => {
    const request = {
      body: {
        title: "Hi",
        category: "Personal"
      }
    } as Request;
    const response = createMockResponse();

    handleCreateMilestone(request, response, () => undefined);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      message: "Title must be at least 3 characters long."
    });
  });
});
