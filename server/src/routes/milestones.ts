import { Router, type RequestHandler } from "express";
import { ZodError } from "zod";
import { createMilestone, listMilestones } from "../store/milestoneStore.js";
import { createMilestoneSchema } from "../validation/milestoneSchema.js";

export const milestonesRouter = Router();

export const handleListMilestones: RequestHandler = (_request, response) => {
  response.json(listMilestones());
};

export const handleCreateMilestone: RequestHandler = (request, response) => {
  try {
    const payload = createMilestoneSchema.parse(request.body);
    const milestone = createMilestone(payload);

    response.status(201).json(milestone);
  } catch (error) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0];

      response.status(400).json({
        message: firstIssue?.message ?? "Your milestone could not be saved."
      });
      return;
    }

    throw error;
  }
};

milestonesRouter.get("/", handleListMilestones);
milestonesRouter.post("/", handleCreateMilestone);
