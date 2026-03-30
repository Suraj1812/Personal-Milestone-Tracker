import type { Milestone, MilestoneCategory } from "../types";

export type MilestoneFilterCategory = "All" | MilestoneCategory;

export interface MilestoneFilters {
  category: MilestoneFilterCategory;
  startDate: string;
  endDate: string;
}

export function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function sortMilestones(milestones: Milestone[]): Milestone[] {
  return [...milestones].sort((first, second) => {
    const dateComparison = second.date.localeCompare(first.date);

    if (dateComparison !== 0) {
      return dateComparison;
    }

    return new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime();
  });
}

export function filterMilestones(
  milestones: Milestone[],
  filters: MilestoneFilters
): Milestone[] {
  return milestones.filter((milestone) => {
    const matchesCategory =
      filters.category === "All" || milestone.category === filters.category;
    const matchesStartDate =
      !filters.startDate || milestone.date >= filters.startDate;
    const matchesEndDate =
      !filters.endDate || milestone.date <= filters.endDate;

    return matchesCategory && matchesStartDate && matchesEndDate;
  });
}

export function countMilestonesInLast30Days(milestones: Milestone[]): number {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - 30);

  return milestones.filter((milestone) => milestone.date >= thresholdDate.toISOString().slice(0, 10)).length;
}

export function formatMilestoneDate(date: string | null): string {
  if (!date) {
    return "No activity yet";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(`${date}T00:00:00`));
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
