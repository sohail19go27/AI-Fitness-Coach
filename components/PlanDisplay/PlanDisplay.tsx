"use client";

import React, { useState } from "react";
import ExerciseCard from "../ExerciseCard";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import useSpeech from "../../hooks/useSpeech";

type PlanProps = {
  plan: any;
};

export default function PlanDisplay({ plan }: PlanProps) {
  const [tab, setTab] = useState<"workout" | "diet" | "tips">("workout");
  const { state: saved, setState: savePlan } = useLocalStorage<any>("ai_fitness_saved_plan", null);
  const { speak, stop, isPlaying, isLoading } = useSpeech();

  function speakSection(section: "workout" | "diet" | "tips") {
    if (section === "workout") {
      const text = (plan.workoutPlan?.dayWise ?? [])
        .map((d: any) => `${d.day}: ${d.exercises?.map((ex: any) => ex.name).join(", ") || "Rest"}`)
        .join(". ");
      speak(`Workout plan: ${text}`);
    } else if (section === "diet") {
      const d = plan.dietPlan ?? {};
      const text = `Breakfast: ${(d.breakfast || []).join(", ")}. Lunch: ${(d.lunch || []).join(", ")}. Dinner: ${(d.dinner || []).join(", ")}. Snacks: ${(d.snacks || []).join(", ")}.`;
      speak(`Diet plan: ${text}`);
    } else {
      const tips = (plan.tips || []).join(". ");
      speak(`Tips: ${tips}`);
    }
  }

  function save() {
    savePlan(plan);
    alert("Plan saved locally");
  }

  return (
    <div className="rounded bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-3">
          <button onClick={() => setTab("workout")} className={`px-3 py-1 ${tab === "workout" ? "bg-indigo-600 text-white" : "bg-zinc-100"}`}>Workout</button>
          <button onClick={() => setTab("diet")} className={`px-3 py-1 ${tab === "diet" ? "bg-indigo-600 text-white" : "bg-zinc-100"}`}>Diet</button>
          <button onClick={() => setTab("tips")} className={`px-3 py-1 ${tab === "tips" ? "bg-indigo-600 text-white" : "bg-zinc-100"}`}>Tips</button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => speakSection(tab)} className="rounded border px-3 py-1">{isPlaying ? 'Playing' : 'Read'}</button>
          <button onClick={() => stop()} className="rounded border px-3 py-1">Stop</button>
          <button onClick={save} className="rounded bg-green-600 px-3 py-1 text-white">Save</button>
        </div>
      </div>

      {tab === "workout" && (
        <div className="grid gap-4">
          {(plan.workoutPlan?.dayWise || []).map((day: any, idx: number) => (
            <div key={idx} className="rounded border p-3">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-semibold">{day.day}</h4>
              </div>
              <div className="grid gap-3">
                {(day.exercises || []).map((ex: any, i: number) => (
                  <ExerciseCard key={i} name={ex.name} onGenerate={() => {}} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "diet" && (
        <div className="grid gap-4">
          <div className="rounded border p-3">
            <h4 className="font-semibold">Breakfast</h4>
            <ul className="mt-2 list-disc pl-5">{(plan.dietPlan?.breakfast || []).map((it: string, i: number) => <li key={i}>{it}</li>)}</ul>
          </div>
          <div className="rounded border p-3">
            <h4 className="font-semibold">Lunch</h4>
            <ul className="mt-2 list-disc pl-5">{(plan.dietPlan?.lunch || []).map((it: string, i: number) => <li key={i}>{it}</li>)}</ul>
          </div>
          <div className="rounded border p-3">
            <h4 className="font-semibold">Dinner</h4>
            <ul className="mt-2 list-disc pl-5">{(plan.dietPlan?.dinner || []).map((it: string, i: number) => <li key={i}>{it}</li>)}</ul>
          </div>
        </div>
      )}

      {tab === "tips" && (
        <div>
          <div className="rounded border p-3">
            <h4 className="font-semibold">Tips</h4>
            <ul className="mt-2 list-disc pl-5">{(plan.tips || []).map((t: string, i: number) => <li key={i}>{t}</li>)}</ul>
            <div className="mt-3 italic">"{plan.motivationQuote}"</div>
          </div>
        </div>
      )}
    </div>
  );
}
