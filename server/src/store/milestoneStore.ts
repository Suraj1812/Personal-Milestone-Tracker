import { randomUUID } from "node:crypto";
import type { CreateMilestoneInput, Milestone, UpdateMilestoneInput } from "../types.js";

const milestones: Milestone[] = [];

function sortMilestonesByNewest(first: Milestone, second: Milestone): number {
  const dateComparison = second.date.localeCompare(first.date);

  if (dateComparison !== 0) {
    return dateComparison;
  }

  return new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime();
}

export function listMilestones(): Milestone[] {
  return [...milestones].sort(sortMilestonesByNewest);
}

export function createMilestone(input: CreateMilestoneInput): Milestone {
  const timestamp = new Date().toISOString();
  const milestone: Milestone = {
    id: randomUUID(),
    title: input.title.trim(),
    category: input.category,
    date: input.date,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  milestones.unshift(milestone);

  return milestone;
}

export function updateMilestone(id: string, input: UpdateMilestoneInput): Milestone | null {
  const milestoneIndex = milestones.findIndex((milestone) => milestone.id === id);

  if (milestoneIndex === -1) {
    return null;
  }

  const existingMilestone = milestones[milestoneIndex];
  const updatedMilestone: Milestone = {
    ...existingMilestone,
    title: input.title.trim(),
    category: input.category,
    date: input.date,
    updatedAt: new Date().toISOString()
  };

  milestones[milestoneIndex] = updatedMilestone;

  return updatedMilestone;
}

export function deleteMilestone(id: string): Milestone | null {
  const milestoneIndex = milestones.findIndex((milestone) => milestone.id === id);

  if (milestoneIndex === -1) {
    return null;
  }

  const [deletedMilestone] = milestones.splice(milestoneIndex, 1);

  return deletedMilestone;
}

export function resetMilestones(): void {
  milestones.length = 0;
}
