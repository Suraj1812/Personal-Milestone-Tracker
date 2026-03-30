import { z } from "zod";
import { milestoneCategories } from "../types.js";

const milestoneDateSchema = z
  .string({
    required_error: "Please choose a date.",
    invalid_type_error: "Please choose a date."
  })
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a valid date.")
  .refine((value) => {
    const parsedDate = new Date(`${value}T00:00:00Z`);

    return !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().startsWith(value);
  }, "Please choose a valid date.");

const milestonePayloadSchema = z.object({
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
  }),
  date: milestoneDateSchema
});

export const createMilestoneSchema = milestonePayloadSchema;
export const updateMilestoneSchema = milestonePayloadSchema;
