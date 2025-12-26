"use client";

import React, { useState } from "react";
import PlanDisplay from "../PlanDisplay/PlanDisplay";
import { useLocalStorage } from "../../hooks/useLocalStorage";

type FormState = {
  name: string;
  age: number | "";
  gender: "male" | "female" | "other" | "";
  heightCm: number | "";
  weightKg: number | "";
  goal: string;
  fitnessLevel: string;
  location: string;
  dietary: string;
  medical?: string;
  stressLevel?: string;
  timePerDay?: string;
};

export default function MultiStepForm() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);

  const { state: saved, setState: savePlan } = useLocalStorage<any>("ai_fitness_saved_plan", null);

  const [form, setForm] = useState<FormState>({
    name: "",
    age: "",
    gender: "",
    heightCm: "",
    weightKg: "",
    goal: "Build muscle",
    fitnessLevel: "Beginner",
    location: "Home",
    dietary: "Non-Veg",
    medical: "",
    stressLevel: "",
    timePerDay: "",
  });

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function next() {
    setStep((s) => Math.min(3, s + 1));
  }
  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const user = {
        name: form.name,
        age: typeof form.age === "number" ? form.age : undefined,
        gender: form.gender || undefined,
        heightCm: typeof form.heightCm === "number" ? form.heightCm : undefined,
        weightKg: typeof form.weightKg === "number" ? form.weightKg : undefined,
        activityLevel: form.fitnessLevel.toLowerCase(),
        goals: [form.goal],
      };

      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, goal: form.goal }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to generate plan");
        setLoading(false);
        return;
      }

      const plan = data?.plan ?? null;
      setGeneratedPlan(plan);
      savePlan(plan);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  if (generatedPlan) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Generated Plan</h2>
          <div>
            <button
              onClick={() => {
                setGeneratedPlan(null);
              }}
              className="rounded border px-3 py-1"
            >
              Back to form
            </button>
          </div>
        </div>
        <PlanDisplay plan={generatedPlan} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl rounded bg-white p-6 shadow">
      <div className="mb-4">
        <div className="mb-2 text-sm text-zinc-600">Step {step + 1} of 4</div>
        <div className="h-2 w-full rounded bg-zinc-200">
          <div
            className="h-2 rounded bg-indigo-600"
            style={{ width: `${((step + 1) / 4) * 100}%` }}
          />
        </div>
      </div>

      {step === 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          <input placeholder="Name" value={form.name} onChange={(e) => update("name", e.target.value)} className="rounded border px-3 py-2" />
          <input type="number" placeholder="Age" value={form.age as any} onChange={(e) => update("age", Number(e.target.value))} className="rounded border px-3 py-2" />
          <select value={form.gender} onChange={(e) => update("gender", e.target.value as any)} className="rounded border px-3 py-2">
            <option value="">Prefer not</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <input type="number" placeholder="Height (cm)" value={form.heightCm as any} onChange={(e) => update("heightCm", Number(e.target.value))} className="rounded border px-3 py-2" />
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-3 sm:grid-cols-2">
          <input type="number" placeholder="Weight (kg)" value={form.weightKg as any} onChange={(e) => update("weightKg", Number(e.target.value))} className="rounded border px-3 py-2" />
          <select value={form.goal} onChange={(e) => update("goal", e.target.value)} className="rounded border px-3 py-2">
            <option>Build muscle</option>
            <option>Lose fat</option>
            <option>Maintenance</option>
          </select>
          <select value={form.fitnessLevel} onChange={(e) => update("fitnessLevel", e.target.value)} className="rounded border px-3 py-2">
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
          <select value={form.location} onChange={(e) => update("location", e.target.value)} className="rounded border px-3 py-2">
            <option>Home</option>
            <option>Gym</option>
            <option>Outdoor</option>
          </select>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-3 sm:grid-cols-2">
          <select value={form.dietary} onChange={(e) => update("dietary", e.target.value)} className="rounded border px-3 py-2">
            <option>Non-Veg</option>
            <option>Veg</option>
            <option>Vegan</option>
            <option>Keto</option>
          </select>
          <input placeholder="Medical conditions (optional)" value={form.medical} onChange={(e) => update("medical", e.target.value)} className="rounded border px-3 py-2" />
          <input placeholder="Stress level (low/medium/high)" value={form.stressLevel} onChange={(e) => update("stressLevel", e.target.value)} className="rounded border px-3 py-2" />
          <input placeholder="Time available per day (minutes)" value={form.timePerDay} onChange={(e) => update("timePerDay", e.target.value)} className="rounded border px-3 py-2" />
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 className="text-sm font-medium">Review</h3>
          <pre className="mt-2 text-xs">{JSON.stringify(form, null, 2)}</pre>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <div>
          {step > 0 && (
            <button onClick={back} className="mr-2 rounded border px-3 py-1">Back</button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {step < 3 ? (
            <button onClick={next} className="rounded bg-indigo-600 px-4 py-2 text-white">Next</button>
          ) : (
            <button onClick={submit} disabled={loading} className="rounded bg-green-600 px-4 py-2 text-white">{loading ? 'Generating...' : 'Generate My Plan'}</button>
          )}
        </div>
      </div>

      {error ? <div className="mt-3 text-sm text-red-600">{error}</div> : null}
    </div>
  );
}
