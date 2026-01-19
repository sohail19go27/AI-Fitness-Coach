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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      role="form"
      aria-labelledby="fitness-form-heading"
      className="relative rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-slate-700 p-8 md:p-10 shadow-2xl"
    >
      {/* Decorative gradient glow */}
      <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-indigo-500/20 blur-xl opacity-50 -z-10" />
      
      <h2 id="fitness-form-heading" className="sr-only">Fitness questionnaire</h2>
      
      {/* Progress section */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-medium text-slate-400">Step {step + 1} of 4</div>
          <div className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
            {step === 3 ? 'Review & Generate' : 'Tell us about you'}
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 w-full rounded-full bg-slate-800 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-500"
            initial={{ width: '25%' }}
            animate={{ width: `${((step + 1) / 4) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="grid gap-5 sm:grid-cols-2"
          >
            <label className="flex flex-col space-y-2">
              <span className="text-sm font-medium text-slate-300">Name</span>
              <input
                placeholder="Enter your name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
              />
            </label>
            <label className="flex flex-col space-y-2">
              <span className="text-sm font-medium text-slate-300">Age</span>
              <input
                type="number"
                placeholder="Your age"
                value={form.age as any}
                onChange={(e) => update("age", Number(e.target.value))}
                className="rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
              />
            </label>
            <label className="flex flex-col space-y-2">
              <span className="text-sm font-medium text-slate-300">Gender</span>
              <select
                value={form.gender}
                onChange={(e) => update("gender", e.target.value as any)}
                className="rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="flex flex-col space-y-2">
              <span className="text-sm font-medium text-slate-300">Height (cm)</span>
              <input
                type="number"
                placeholder="Height in cm"
                value={form.heightCm as any}
                onChange={(e) => update("heightCm", Number(e.target.value))}
                className="rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
              />
            </label>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="grid gap-5 sm:grid-cols-2"
          >
            <label className="flex flex-col space-y-2">
              <span className="text-sm font-medium text-slate-300">Weight (kg)</span>
              <input
                type="number"
                placeholder="Weight in kg"
                value={form.weightKg as any}
                onChange={(e) => update("weightKg", Number(e.target.value))}
                className="rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
              />
            </label>
            <label className="flex flex-col space-y-2">
              <span className="text-sm font-medium text-slate-300">Goal</span>
              <select
                value={form.goal}
                onChange={(e) => update("goal", e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
              >
                <option>Build muscle</option>
                <option>Lose fat</option>
                <option>Maintenance</option>
              </select>
            </label>
            <label className="flex flex-col space-y-2">
              <span className="text-sm font-medium text-slate-300">Fitness level</span>
              <select
                value={form.fitnessLevel}
                onChange={(e) => update("fitnessLevel", e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </label>
            <label className="flex flex-col space-y-2">
              <span className="text-sm font-medium text-slate-300">Location</span>
              <select
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
              >
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="grid gap-5 sm:grid-cols-2"
          >
            <label className="flex flex-col space-y-2">
              <span className="text-sm font-medium text-slate-300">Dietary preference</span>
              <select
                value={form.dietary}
                onChange={(e) => update("dietary", e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
              >
                <option>Non-Veg</option>
                <option>Veg</option>
                <option>Vegan</option>
                <option>Keto</option>
              </select>
            </label>
            <label className="flex flex-col space-y-2">
              <span className="text-sm font-medium text-slate-300">Medical conditions (optional)</span>
              <input
                placeholder="e.g., diabetes, asthma"
                value={form.medical}
                onChange={(e) => update("medical", e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
              />
            </label>
            <label className="flex flex-col space-y-2">
              <span className="text-sm font-medium text-slate-300">Stress level</span>
              <input
                placeholder="low, medium, or high"
                value={form.stressLevel}
                onChange={(e) => update("stressLevel", e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
              />
            </label>
            <label className="flex flex-col space-y-2">
              <span className="text-sm font-medium text-slate-300">Time available per day (min)</span>
              <input
                placeholder="e.g., 30"
                value={form.timePerDay}
                onChange={(e) => update("timePerDay", e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
              />
            </label>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl bg-slate-900/50 p-6 border border-slate-700"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Review your information</h3>
            <pre className="text-sm text-slate-300 overflow-auto max-h-80">{JSON.stringify(form, null, 2)}</pre>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="mt-8 flex items-center justify-between">
        <div>
          {step > 0 && (
            <motion.button
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={back}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/50 px-5 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-slate-800/50 hover:border-slate-600"
            >
              ← Back
            </motion.button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {step < 3 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={next}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40"
            >
              Next →
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={submit}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 font-semibold text-white shadow-lg shadow-green-500/30 transition-all hover:shadow-xl hover:shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                '✨ Generate My Plan'
              )}
            </motion.button>
          )}
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
}
