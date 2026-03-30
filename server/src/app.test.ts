import type { Request, Response } from "express";
import { beforeEach, describe, expect, it } from "vitest";
import type { Milestone } from "./types.js";
import {
  handleCreateMilestone,
  handleDeleteMilestone,
  handleListMilestones,
  handleUpdateMilestone
} from "./routes/milestones.js";
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
        category: "Work",
        date: "2026-03-30"
      }
    } as Request;
    const response = createMockResponse();

    handleCreateMilestone(request, response, () => undefined);

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({
      title: "Completed the assessment build",
      category: "Work",
      date: "2026-03-30"
    });
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("createdAt");
    expect(response.body).toHaveProperty("updatedAt");
  });

  it("trims the title before storing a milestone", () => {
    const request = {
      body: {
        title: "  Completed the assessment build  ",
        category: "Work",
        date: "2026-03-30"
      }
    } as Request;
    const response = createMockResponse();

    handleCreateMilestone(request, response, () => undefined);

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({
      title: "Completed the assessment build",
      category: "Work",
      date: "2026-03-30"
    });
  });

  it("rejects titles shorter than 3 characters", () => {
    const request = {
      body: {
        title: "Hi",
        category: "Personal",
        date: "2026-03-30"
      }
    } as Request;
    const response = createMockResponse();

    handleCreateMilestone(request, response, () => undefined);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      message: "Title must be at least 3 characters long."
    });
  });

  it("rejects invalid categories", () => {
    const request = {
      body: {
        title: "Finished the weekly reflection",
        category: "Other",
        date: "2026-03-30"
      }
    } as Request;
    const response = createMockResponse();

    handleCreateMilestone(request, response, () => undefined);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      message: "Choose a valid category."
    });
  });

  it("rejects invalid milestone dates", () => {
    const request = {
      body: {
        title: "Finished the weekly reflection",
        category: "Work",
        date: "2026-31-99"
      }
    } as Request;
    const response = createMockResponse();

    handleCreateMilestone(request, response, () => undefined);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      message: "Please choose a valid date."
    });
  });

  it("updates an existing milestone", () => {
    const createRequest = {
      body: {
        title: "Completed the assessment build",
        category: "Work",
        date: "2026-03-30"
      }
    } as Request;
    const createResponse = createMockResponse();

    handleCreateMilestone(createRequest, createResponse, () => undefined);

    const createdMilestone = createResponse.body as Milestone;
    const updateRequest = {
      params: {
        id: createdMilestone.id
      },
      body: {
        title: "Completed the assessment build review",
        category: "Personal",
        date: "2026-03-29"
      }
    } as unknown as Request;
    const updateResponse = createMockResponse();

    handleUpdateMilestone(updateRequest, updateResponse, () => undefined);

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body).toMatchObject({
      id: createdMilestone.id,
      title: "Completed the assessment build review",
      category: "Personal",
      date: "2026-03-29"
    });
  });

  it("returns 404 when updating a missing milestone", () => {
    const request = {
      params: {
        id: "missing-id"
      },
      body: {
        title: "Completed the assessment build review",
        category: "Personal",
        date: "2026-03-29"
      }
    } as unknown as Request;
    const response = createMockResponse();

    handleUpdateMilestone(request, response, () => undefined);

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      message: "Milestone not found."
    });
  });

  it("deletes an existing milestone", () => {
    const createRequest = {
      body: {
        title: "Completed the assessment build",
        category: "Work",
        date: "2026-03-30"
      }
    } as Request;
    const createResponse = createMockResponse();

    handleCreateMilestone(createRequest, createResponse, () => undefined);

    const createdMilestone = createResponse.body as Milestone;
    const deleteRequest = {
      params: {
        id: createdMilestone.id
      }
    } as unknown as Request;
    const deleteResponse = createMockResponse();

    handleDeleteMilestone(deleteRequest, deleteResponse, () => undefined);

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.body).toEqual({
      id: createdMilestone.id
    });

    const listResponse = createMockResponse();
    handleListMilestones({} as Request, listResponse, () => undefined);

    expect(listResponse.body).toEqual([]);
  });

  it("returns 404 when deleting a missing milestone", () => {
    const request = {
      params: {
        id: "missing-id"
      }
    } as unknown as Request;
    const response = createMockResponse();

    handleDeleteMilestone(request, response, () => undefined);

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      message: "Milestone not found."
    });
  });
});
