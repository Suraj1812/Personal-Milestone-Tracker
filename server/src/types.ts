export const milestoneCategories = ["Work", "Personal", "Health"] as const;

export type MilestoneCategory = (typeof milestoneCategories)[number];

export interface Milestone {
  id: string;
  title: string;
  category: MilestoneCategory;
  createdAt: string;
  updatedAt: string;
}

export interface MilestoneInput {
  title: string;
  category: MilestoneCategory;
}

export type CreateMilestoneInput = MilestoneInput;
export type UpdateMilestoneInput = MilestoneInput;
