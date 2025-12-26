import { NextResponse } from "next/server";
import { userSchema, planSchema } from "../../../lib/schemas";
import buildWorkoutPrompt from "../../../lib/promptBuilder";
import openai from "../../../lib/openaiClient";

type RequestBody = {
  user: any;
  goal?: string;
  plan?: any;
};

function extractJSON(text: string) {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch (e) {
    // Fallback: find first {...} block
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      const sub = text.slice(start, end + 1);
      try {
        return JSON.parse(sub);
      } catch (e2) {
        return null;
      }
    }
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();

    // Validate user minimally
    const userParse = userSchema.safeParse(body.user ?? {});
    if (!userParse.success) {
      return NextResponse.json({ error: "Invalid user payload", details: userParse.error.format() }, { status: 400 });
    }

    // Optionally validate plan shape if provided (not required)
    if (body.plan) {
      const p = planSchema.safeParse(body.plan);
      if (!p.success) {
        // don't fail hard; just warn
        console.warn("Invalid plan shape provided", p.error);
      }
    }

    const prompt = buildWorkoutPrompt(userParse.data, { goal: body.goal, plan: body.plan });

    // First attempt
    const res = await openai.callLLMWithPrompt(prompt, { temperature: 0.2, maxTokens: 2500, retries: 2 });
    const text = res.text ?? JSON.stringify(res.raw ?? {});

    let parsed = extractJSON(text);
    if (!parsed) {
      return NextResponse.json({ error: "Failed to parse plan from LLM", raw: text }, { status: 502 });
    }

    // Validate parsed plan against schema
    const validation = planSchema.safeParse(parsed);
    if (!validation.success) {
      // Attempt automated repair: ask the model to fix the JSON and return corrected JSON only.
      try {
        const repairPrompt = `The previous response attempted to return a fitness plan in JSON but it does not match the required schema. Validation errors:\n${JSON.stringify(validation.error.format(), null, 2)}\n\nHere is the JSON the model previously produced:\n${JSON.stringify(parsed)}\n\nPlease return only the corrected JSON object that conforms exactly to the schema previously provided (workoutPlan.dayWise, dietPlan, tips, motivationQuote). Do NOT include any explanation, markdown, or extra text. Return valid JSON only.`;

        const repairRes = await openai.callLLMWithPrompt(repairPrompt, { temperature: 0.0, maxTokens: 2000, retries: 1 });
        const repairText = repairRes.text ?? JSON.stringify(repairRes.raw ?? {});
        const repaired = extractJSON(repairText);
        if (repaired) {
          const repairedValidation = planSchema.safeParse(repaired);
          if (repairedValidation.success) {
            return NextResponse.json({ plan: repaired, raw: [text, repairText] });
          } else {
            // still invalid
            return NextResponse.json({ error: "LLM returned JSON but it still failed schema validation", validation: repairedValidation.error.format(), raw: [text, repairText] }, { status: 502 });
          }
        }
      } catch (e) {
        console.warn("Repair attempt failed", e);
      }

      // If repair not possible, return validation errors with original parsed data
      return NextResponse.json({ error: "LLM returned JSON that failed schema validation", validation: validation.error.format(), parsed }, { status: 502 });
    }

    // OK
    return NextResponse.json({ plan: parsed, raw: text });
  } catch (err: any) {
    console.error("/api/generate-plan error", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}

export const runtime = "edge";
