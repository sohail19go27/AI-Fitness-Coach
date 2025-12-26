import { User } from "../types/user";
import { Plan } from "../types/plan";

/**
 * Build a strict JSON output prompt for the LLM. The LLM is instructed
 * to ONLY return JSON matching the schema described below.
 */
export function buildWorkoutPrompt(user: Partial<User>, options?: { goal?: string; plan?: Partial<Plan> }) {
  const parts: string[] = [];

  parts.push("You are an expert fitness trainer and nutritionist.");
  parts.push("Return ONLY valid JSON and nothing else. If you cannot produce the object, return an error field in JSON.");
  parts.push("Respond using this exact JSON schema (keys and types):");

  parts.push(`{
  "workoutPlan": {
    "dayWise": [
      {
        "day": "string",
        "exercises": [
          { "name": "string", "sets": number, "reps": "string|number", "rest": "string", "description": "string" }
        ]
      }
    ]
  },
  "dietPlan": {
    "breakfast": ["string"],
    "lunch": ["string"],
    "dinner": ["string"],
    "snacks": ["string"]
  },
  "tips": ["string"],
  "motivationQuote": "string",
  "error": "string (optional, only when an error occurred)"
}`);

  // Add user context
  const namePart = user.name ? `Name: ${user.name}.` : "";
  const agePart = user.age ? `Age: ${user.age}.` : "";
  const heightPart = user.heightCm ? `HeightCm: ${user.heightCm}.` : "";
  const weightPart = user.weightKg ? `WeightKg: ${user.weightKg}.` : "";
  const activityPart = user.activityLevel ? `ActivityLevel: ${user.activityLevel}.` : "";
  const genderPart = user.gender ? `Gender: ${user.gender}.` : "";
  const goalsPart = user.goals && user.goals.length ? `Goals: ${user.goals.join(", ")}.` : options?.goal ? `Goal: ${options.goal}.` : "";

  parts.push("User context (use these values to personalize):");
  parts.push([namePart, agePart, genderPart, heightPart, weightPart, activityPart, goalsPart].filter(Boolean).join(" "));

  if (options?.plan && options.plan.durationWeeks) {
    parts.push(`The user prefers a plan lasting ${options.plan.durationWeeks} week(s).`);
  }

  parts.push("Constraints: Keep exercises safe and appropriate for the stated fitness level. Prefer minimal equipment when user indicates 'Home'. Make diet recommendations consistent with dietary preferences when provided. Provide short, actionable tips and one motivational quote.");

  parts.push("Important: Output must be parseable JSON. Do not include markdown, code fences, or extra commentary. If any value is unknown, provide an appropriate generic suggestion.");

  return parts.join("\n\n");
}

export default buildWorkoutPrompt;
