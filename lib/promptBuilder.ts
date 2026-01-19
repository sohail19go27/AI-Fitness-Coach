import { User } from "../types/user";
import { Plan } from "../types/plan";

/**
 * Build a strict JSON output prompt for the LLM. The LLM is instructed
 * to ONLY return JSON matching the schema described below.
 */
export function buildWorkoutPrompt(user: Partial<User>, options?: { goal?: string; plan?: Partial<Plan> }) {
  const parts: string[] = [];

  parts.push("Return ONLY valid JSON. No markdown. Start with { end with }.");
  
  // Compact schema - removed description field to save tokens
  parts.push(`Schema:
{"workoutPlan":{"dayWise":[{"day":"Day 1","exercises":[{"name":"Exercise","sets":3,"reps":"10","rest":"60s"}]}]},"dietPlan":{"breakfast":["item"],"lunch":["item"],"dinner":["item"],"snacks":["item"]},"tips":["tip"],"motivationQuote":"quote"}`);

  // Compact user context
  const ctx = [
    user.name,
    user.age ? `${user.age}y` : "",
    user.gender,
    user.heightCm ? `${user.heightCm}cm` : "",
    user.weightKg ? `${user.weightKg}kg` : "",
    user.activityLevel,
    user.goals?.join(",") || options?.goal || ""
  ].filter(Boolean).join(" ");

  parts.push(`User: ${ctx}`);

  // Compact constraints
  const weeks = options?.plan?.durationWeeks || 1;
  parts.push(`Create ${weeks}-week plan. 3-4 exercises/day, 3 meals+snacks. Keep it brief. Max 4 days in dayWise.`);

  return parts.join("\n");
}

export default buildWorkoutPrompt;
