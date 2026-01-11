"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
      // Client-side validation: ensure required fields match server schema
      if (!form.name || form.name.trim() === "") {
        setError("Please enter your name before generating a plan.");
        setLoading(false);
        return;
      }

      // Map fitness level to activityLevel values expected by the server schema
      const activityMap: Record<string, string> = {
        Beginner: "light",
        Intermediate: "moderate",
        Advanced: "active",
      };

      const user = {
        name: form.name.trim(),
        age: typeof form.age === "number" ? form.age : undefined,
        gender: form.gender || undefined,
        heightCm: typeof form.heightCm === "number" ? form.heightCm : undefined,
        weightKg: typeof form.weightKg === "number" ? form.weightKg : undefined,
        activityLevel: activityMap[form.fitnessLevel] || "moderate",
        goals: [form.goal],
      };

      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, goal: form.goal }),
      });

      const responseText = await res.text();
      let data: any = null;
      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch (e) {
        setError(`Server returned ${res.status}: ${responseText.slice(0, 400) || "(empty response)"}`);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        // Show helpful server message in dev (include small raw snippet when available)
        const serverMsg = data?.error || data?.message || JSON.stringify(data);
        let rawSnippet = "";
        try {
          // prefer `raw` returned by the server when parsing failed
          if (data?.raw) {
            rawSnippet = typeof data.raw === "string" ? data.raw.slice(0, 400) : JSON.stringify(data.raw).slice(0, 400);
          }
        } catch (e) {
          rawSnippet = "";
        }

        console.error("/api/generate-plan failed:", res.status, serverMsg, rawSnippet ? `raw:${rawSnippet}` : "");
        const devHost = typeof window !== "undefined" && window.location && window.location.hostname === "localhost";
        setError(`Generation failed (${res.status}): ${serverMsg}${devHost && rawSnippet ? ` — raw: ${rawSnippet}` : ""}`);
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
      <div className="space-y-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Generated Plan</h2>
          <div>
            <button
              onClick={() => {
                setGeneratedPlan(null);
              }}
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
            >
              ← Back to form
            </button>
          </div>
        </div>
        <PlanDisplay plan={generatedPlan} />
      </div>
    );
  }

  return (
    <div role="form" aria-labelledby="fitness-form-heading" className="max-w-2xl rounded-2xl bg-white p-6 shadow-lg card-inner-shadow">
      <h2 id="fitness-form-heading" className="sr-only">Fitness questionnaire</h2>
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm text-label">Step {step + 1} of 4</div>
          <div className="text-sm font-medium text-primary">{step === 3 ? 'Review' : 'Tell us about you'}</div>
        </div>

        <div className="h-2 w-full rounded bg-zinc-100">
          <div
            className="h-2 rounded bg-gradient-to-r from-indigo-500 to-pink-500"
            style={{ width: `${((step + 1) / 4) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step-0"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.24 }}
            className="grid gap-3 sm:grid-cols-2"
          >
            <label className="flex flex-col">
              <span className="mb-1 text-sm text-label">Name</span>
              <input placeholder="Name" value={form.name} onChange={(e) => update("name", e.target.value)} className="rounded-md border px-3 py-2 input focus:ring-2 focus:ring-primary-200" />
            </label>
            <label className="flex flex-col">
              <span className="mb-1 text-sm text-label">Age</span>
              <input type="number" placeholder="Age" value={form.age as any} onChange={(e) => update("age", Number(e.target.value))} className="rounded-md border px-3 py-2 input focus:ring-2 focus:ring-primary-200" />
            </label>
            <label className="flex flex-col">
              <span className="mb-1 text-sm text-label">Gender</span>
              <select value={form.gender} onChange={(e) => update("gender", e.target.value as any)} className="rounded-md border px-3 py-2 input focus:ring-2 focus:ring-indigo-200">
                <option value="">Prefer not</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="flex flex-col">
              <span className="mb-1 text-sm text-label">Height (cm)</span>
              <input type="number" placeholder="Height (cm)" value={form.heightCm as any} onChange={(e) => update("heightCm", Number(e.target.value))} className="rounded-md border px-3 py-2 input focus:ring-2 focus:ring-indigo-200" />
            </label>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.24 }}
            className="grid gap-3 sm:grid-cols-2"
          >
            <label className="flex flex-col">
              <span className="mb-1 text-sm text-label">Weight (kg)</span>
              <input type="number" placeholder="Weight (kg)" value={form.weightKg as any} onChange={(e) => update("weightKg", Number(e.target.value))} className="rounded-md border px-3 py-2 input focus:ring-2 focus:ring-indigo-200" />
            </label>
            <label className="flex flex-col">
              <span className="mb-1 text-sm text-label">Goal</span>
              <select value={form.goal} onChange={(e) => update("goal", e.target.value)} className="rounded-md border px-3 py-2 input focus:ring-2 focus:ring-indigo-200">
                <option>Build muscle</option>
                <option>Lose fat</option>
                <option>Maintenance</option>
              </select>
            </label>
            <label className="flex flex-col">
              <span className="mb-1 text-sm text-label">Fitness level</span>
              <select value={form.fitnessLevel} onChange={(e) => update("fitnessLevel", e.target.value)} className="rounded-md border px-3 py-2 input focus:ring-2 focus:ring-indigo-200">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </label>
            <label className="flex flex-col">
              <span className="mb-1 text-sm text-label">Location</span>
              <select value={form.location} onChange={(e) => update("location", e.target.value)} className="rounded-md border px-3 py-2 input focus:ring-2 focus:ring-indigo-200">
                <option>Home</option>
                <option>Gym</option>
                <option>Outdoor</option>
              </select>
            </label>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.24 }}
            className="grid gap-3 sm:grid-cols-2"
          >
            <label className="flex flex-col">
              <span className="mb-1 text-sm text-label">Dietary preference</span>
              <select value={form.dietary} onChange={(e) => update("dietary", e.target.value)} className="rounded-md border px-3 py-2 input focus:ring-2 focus:ring-indigo-200">
                <option>Non-Veg</option>
                <option>Veg</option>
                <option>Vegan</option>
                <option>Keto</option>
              </select>
            </label>
            <label className="flex flex-col">
              <span className="mb-1 text-sm text-label">Medical conditions (optional)</span>
              <input placeholder="Medical conditions (optional)" value={form.medical} onChange={(e) => update("medical", e.target.value)} className="rounded-md border px-3 py-2 input focus:ring-2 focus:ring-indigo-200" />
            </label>
            <label className="flex flex-col">
              <span className="mb-1 text-sm text-label">Stress level</span>
              <input placeholder="Stress level (low/medium/high)" value={form.stressLevel} onChange={(e) => update("stressLevel", e.target.value)} className="rounded-md border px-3 py-2 input focus:ring-2 focus:ring-indigo-200" />
            </label>
            <label className="flex flex-col">
              <span className="mb-1 text-sm text-label">Time available per day (minutes)</span>
              <input placeholder="Time available per day (minutes)" value={form.timePerDay} onChange={(e) => update("timePerDay", e.target.value)} className="rounded-md border px-3 py-2 input focus:ring-2 focus:ring-indigo-200" />
            </label>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.24 }}
          >
            <h3 className="text-sm font-medium">Review</h3>
            <pre className="mt-2 text-xs">{JSON.stringify(form, null, 2)}</pre>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between">
        <div>
          {step > 0 && (
            <button onClick={back} className="mr-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">← Back</button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {step < 3 ? (
            <button onClick={next} className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-white shadow">Next</button>
          ) : (
            <button onClick={submit} disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-white shadow">{loading ? 'Generating...' : 'Generate My Plan'}</button>
          )}
        </div>
      </div>

      {error ? <div className="mt-3 text-sm text-red-600">{error}</div> : null}
    </div>
  );
}
