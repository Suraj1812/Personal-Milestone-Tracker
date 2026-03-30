import { Router, type RequestHandler } from "express";
import { ZodError } from "zod";
import {
  createMilestone,
  deleteMilestone,
  listMilestones,
  updateMilestone
} from "../store/milestoneStore.js";
import { createMilestoneSchema, updateMilestoneSchema } from "../validation/milestoneSchema.js";

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

export const handleUpdateMilestone: RequestHandler = (request, response) => {
  try {
    const milestoneId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
    const payload = updateMilestoneSchema.parse(request.body);
    const milestone = updateMilestone(milestoneId, payload);

    if (!milestone) {
      response.status(404).json({
        message: "Milestone not found."
      });
      return;
    }

    response.json(milestone);
  } catch (error) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0];

      response.status(400).json({
        message: firstIssue?.message ?? "Your milestone could not be updated."
      });
      return;
    }

    throw error;
  }
};

export const handleDeleteMilestone: RequestHandler = (request, response) => {
  const milestoneId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  const deletedMilestone = deleteMilestone(milestoneId);

  if (!deletedMilestone) {
    response.status(404).json({
      message: "Milestone not found."
    });
    return;
  }

  response.json({
    id: deletedMilestone.id
  });
};

milestonesRouter.get("/", handleListMilestones);
milestonesRouter.post("/", handleCreateMilestone);
milestonesRouter.put("/:id", handleUpdateMilestone);
milestonesRouter.delete("/:id", handleDeleteMilestone);
