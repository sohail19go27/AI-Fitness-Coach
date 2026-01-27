import { NextResponse } from "next/server";

// Map exercise names to static image filenames
function getStaticExerciseImage(exerciseName: string): string {
  // Normalize exercise name to filename format
  const normalized = exerciseName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-");

  // Common exercise mappings
  const exerciseMap: Record<string, string> = {
    "barbell-bench-press": "barbell-bench-press.svg",
    "bench-press": "barbell-bench-press.svg",
    "bent-over-rows": "bent-over-rows.svg",
    "bentover-rows": "bent-over-rows.svg",
    "bent-over-row": "bent-over-rows.svg",
    "overhead-press": "overhead-press.svg",
    "shoulder-press": "overhead-press.svg",
    "bicep-curls": "bicep-curls.svg",
    "bicep-curl": "bicep-curls.svg",
    "barbell-squats": "barbell-squats.svg",
    "squat": "barbell-squats.svg",
    "squats": "barbell-squats.svg",
    "romanian-deadlifts": "romanian-deadlifts.svg",
    "deadlift": "romanian-deadlifts.svg",
    "deadlifts": "romanian-deadlifts.svg",
    "leg-press": "leg-press.svg",
    "plank": "plank.svg",
    "incline-dumbbell-press": "incline-dumbbell-press.svg",
    "lat-pulldowns": "lat-pulldowns.svg",
    "lat-pulldown": "lat-pulldowns.svg",
    "dumbbell-lateral-raises": "dumbbell-lateral-raises.svg",
    "lateral-raises": "dumbbell-lateral-raises.svg",
    "lateral-raise": "dumbbell-lateral-raises.svg",
    "triceps-pushdowns": "triceps-pushdowns.svg",
    "tricep-pushdown": "triceps-pushdowns.svg",
    "triceps-pushdown": "triceps-pushdowns.svg",
  };

  // Return mapped image or default workout image
  const filename = exerciseMap[normalized] || "default-workout.svg";
  return `/exercises/${filename}`;
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // Return static exercise image URL directly
    const staticImageUrl = getStaticExerciseImage(prompt);
    return NextResponse.json({ url: staticImageUrl });

  } catch (err) {
    console.error("Image generation error:", err);
    // Final fallback to generic workout image
    return NextResponse.json({ url: "/exercises/default-workout.svg" });
  }
}
