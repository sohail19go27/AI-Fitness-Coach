import { z } from "zod";

export const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  age: z.number().int().positive().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  heightCm: z.number().positive().optional(),
  weightKg: z.number().positive().optional(),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very-active"]).optional(),
  goals: z.array(z.string()).optional(),
});

export const exerciseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  sets: z.number().int().positive().optional(),
  reps: z.union([z.number().int().positive(), z.string()]).optional(),
  durationMinutes: z.number().positive().optional(),
  notes: z.string().optional(),
});

export const planSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  durationWeeks: z.number().int().positive().optional(),
  schedule: z.array(z.string()).optional(),
  exercises: z.record(z.array(exerciseSchema)).optional(),
  createdAt: z.string().optional(),
});

export type UserSchema = z.infer<typeof userSchema>;
export type PlanSchema = z.infer<typeof planSchema>;

export default { userSchema, exerciseSchema, planSchema };
