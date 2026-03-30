export const milestoneCategories = ["Work", "Personal", "Health"] as const;

export type MilestoneCategory = (typeof milestoneCategories)[number];

export interface Milestone {
  id: string;
  title: string;
  category: MilestoneCategory;
  createdAt: string;
}

export interface CreateMilestoneInput {
  title: string;
  category: MilestoneCategory;
}
