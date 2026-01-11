export interface Exercise {
  id?: string;
  name: string;
  sets?: number;
  reps?: number | string; // string for formats like "AMRAP" or ranges
  durationMinutes?: number; // optional for cardio
  notes?: string;
}

export interface Plan {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  durationWeeks?: number;
  schedule?: string[]; // e.g. ["Mon", "Wed", "Fri"]
  exercises: Record<string, Exercise[]>; // week/day -> exercises
  createdAt?: string;
}

export default Plan;
