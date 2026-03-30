import { z } from "zod";
import { milestoneCategories } from "../types.js";

export const createMilestoneSchema = z.object({
  title: z
    .string({
      required_error: "Please enter a title.",
      invalid_type_error: "Please enter a title."
    })
    .trim()
    .min(3, "Title must be at least 3 characters long."),
  category: z.enum(milestoneCategories, {
    errorMap: () => ({
      message: "Choose a valid category."
    })
  })
});
