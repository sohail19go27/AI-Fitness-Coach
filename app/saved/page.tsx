"use client";

import React, { useRef } from "react";
import PlanDisplay from "../../components/PlanDisplay/PlanDisplay";
import { useLocalStorage } from "../../hooks/useLocalStorage";

export default function SavedPage() {
  const { state: savedPlan } = useLocalStorage<any>("ai_fitness_saved_plan", null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  async function exportPdf() {
    try {
      // dynamic imports to avoid adding deps at SSR
      const [{ jsPDF }, html2canvas] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      if (!containerRef.current) return;

      const canvas = await html2canvas.default(containerRef.current as HTMLElement);
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({ unit: "px", format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("ai-fitness-plan.pdf");
    } catch (err: any) {
      alert("Export failed: " + (err?.message ?? String(err)));
    }
  }

  if (!savedPlan) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="text-2xl font-semibold">Saved Plans</h2>
        <p className="mt-4 text-zinc-600">You don't have any saved plans yet. Generate a plan from the home page.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Saved Plan</h2>
        <div className="flex gap-3">
          <button onClick={exportPdf} className="rounded bg-indigo-600 px-4 py-2 text-white">Export PDF</button>
        </div>
      </div>

      <div ref={containerRef}>
        <PlanDisplay plan={savedPlan} />
      </div>
    </div>
  );
}
