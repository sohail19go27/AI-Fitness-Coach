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
  workoutPlan: z.object({
    dayWise: z.array(
      z.object({
        day: z.string().min(1),
        exercises: z
          .array(
            z.object({
              name: z.string().min(1),
              sets: z.number().int().positive().optional(),
              reps: z.union([z.number().int().positive(), z.string()]).optional(),
              rest: z.string().optional(),
              description: z.string().optional(),
            })
          )
          .optional(),
      })
    ),
  }),
  dietPlan: z.object({
    breakfast: z.array(z.string()).optional(),
    lunch: z.array(z.string()).optional(),
    dinner: z.array(z.string()).optional(),
    snacks: z.array(z.string()).optional(),
  }),
  tips: z.array(z.string()).optional(),
  motivationQuote: z.string().optional(),
  error: z.string().optional(),
});

export type UserSchema = z.infer<typeof userSchema>;
export type PlanSchema = z.infer<typeof planSchema>;

export default { userSchema, exerciseSchema, planSchema };
