import type { Milestone, MilestoneCategory } from "../types";

export type MilestoneFilterCategory = "All" | MilestoneCategory;

export interface MilestoneFilters {
  category: MilestoneFilterCategory;
}

export function sortMilestones(milestones: Milestone[]): Milestone[] {
  return [...milestones].sort((first, second) => {
    return new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime();
  });
}

export function filterMilestones(
  milestones: Milestone[],
  filters: MilestoneFilters
): Milestone[] {
  return milestones.filter((milestone) => {
    return filters.category === "All" || milestone.category === filters.category;
  });
}

export function formatTimestamp(timestamp: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(timestamp));
}
