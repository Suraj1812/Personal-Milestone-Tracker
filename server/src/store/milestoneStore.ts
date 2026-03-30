import { randomUUID } from "node:crypto";
import type { CreateMilestoneInput, Milestone } from "../types.js";

const milestones: Milestone[] = [];

function sortMilestonesByNewest(first: Milestone, second: Milestone): number {
  return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
}

export function listMilestones(): Milestone[] {
  return [...milestones].sort(sortMilestonesByNewest);
}

export function createMilestone(input: CreateMilestoneInput): Milestone {
  const milestone: Milestone = {
    id: randomUUID(),
    title: input.title.trim(),
    category: input.category,
    createdAt: new Date().toISOString()
  };

  milestones.unshift(milestone);

  return milestone;
}

export function resetMilestones(): void {
  milestones.length = 0;
}
