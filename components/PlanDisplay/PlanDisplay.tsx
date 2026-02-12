"use client";

import React, { useState } from "react";
import ExerciseCard from "../ExerciseCard";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useSpeech } from "../../hooks/useSpeech";

type PlanProps = {
  plan: any;
};

import { jsPDF } from "jspdf";

export default function PlanDisplay({ plan }: PlanProps) {
  const [tab, setTab] = useState<"workout" | "diet" | "tips">("workout");
  const { state: saved, setState: savePlan } = useLocalStorage<any>("ai_fitness_saved_plan", null);
  const { speak, stop, isSpeaking, isSupported } = useSpeech();
  const [isExporting, setIsExporting] = useState(false);

  function speakSection(section: "workout" | "diet" | "tips") {
    if (isSpeaking) {
      stop();
      return;
    }

    if (section === "workout") {
      const workoutText = (plan.workoutPlan?.dayWise ?? [])
        .map((d: any) => {
          const exercises = (d.exercises || [])
            .map((ex: any) => {
              const details = [ex.name];
              if (ex.sets) details.push(`${ex.sets} sets`);
              if (ex.reps) details.push(`${ex.reps} reps`);
              return details.join(", ");
            })
            .join(". ");
          return `${d.day}: ${exercises || "Rest day"}`;
        })
        .join(". ");
      speak(`Your workout plan. ${workoutText}`);
    } else if (section === "diet") {
      const d = plan.dietPlan ?? {};
      const parts = [];
      if (d.breakfast?.length) parts.push(`Breakfast: ${d.breakfast.join(", ")}`);
      if (d.lunch?.length) parts.push(`Lunch: ${d.lunch.join(", ")}`);
      if (d.dinner?.length) parts.push(`Dinner: ${d.dinner.join(", ")}`);
      if (d.snacks?.length) parts.push(`Snacks: ${d.snacks.join(", ")}`);
      speak(`Your diet plan. ${parts.join(". ")}`);
    } else {
      const tips = (plan.tips || []).join(". ");
      const quote = plan.motivationQuote || "";
      speak(`Tips for your fitness journey. ${tips}. ${quote ? `Here's your motivation: ${quote}` : ""}`);
    }
  }

  function save() {
    savePlan(plan);
    alert("Plan saved locally");
  }

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const doc = new jsPDF();
      let y = 20;

      // Title
      doc.setFontSize(22);
      doc.setTextColor(33, 33, 33);
      doc.text("AI Fitness Plan", 20, y);
      y += 15;

      // Helper to check page break
      const checkPageBreak = (height: number) => {
        if (y + height > 280) {
          doc.addPage();
          y = 20;
        }
      };

      // Helper to add section title
      const addSectionTitle = (title: string) => {
        checkPageBreak(15);
        doc.setFontSize(16);
        doc.setTextColor(37, 99, 235); // Blue color
        doc.text(title, 20, y);
        y += 10;
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
      };


      // --- WORKOUT PLAN ---
      if (plan.workoutPlan?.dayWise) {
        addSectionTitle("Workout Plan");

        plan.workoutPlan.dayWise.forEach((day: any) => {
          checkPageBreak(10);
          doc.setFont("helvetica", "bold");
          doc.text(String(day.day || "Day"), 20, y);
          y += 7;
          doc.setFont("helvetica", "normal");

          if (day.exercises) {
            day.exercises.forEach((ex: any) => {
              const details = `${ex.name || "Exercise"} - ${ex.sets || 0} sets x ${ex.reps || 0} reps ${ex.rest ? `(${ex.rest})` : ""}`;
              const splitDetails = doc.splitTextToSize(`• ${details}`, 170);
              checkPageBreak(splitDetails.length * 5);
              doc.text(splitDetails, 25, y);
              y += splitDetails.length * 5 + 2;
            });
          }
          y += 5; // Spacing between days
        });
      }

      // --- DIET PLAN ---
      if (plan.dietPlan) {
        y += 5;
        addSectionTitle("Diet Plan");
        const diet = plan.dietPlan;

        const addMealSection = (mealName: string, items: string[]) => {
          if (items && items.length > 0) {
            checkPageBreak(10);
            doc.setFont("helvetica", "bold");
            doc.text(mealName, 20, y);
            y += 6;
            doc.setFont("helvetica", "normal");

            items.forEach((item) => {
              const splitItem = doc.splitTextToSize(`• ${item}`, 170);
              checkPageBreak(splitItem.length * 5);
              doc.text(splitItem, 25, y);
              y += splitItem.length * 5 + 1;
            });
            y += 4;
          }
        };

        addMealSection("Breakfast", diet.breakfast);
        addMealSection("Lunch", diet.lunch);
        addMealSection("Dinner", diet.dinner);
        addMealSection("Snacks", diet.snacks);
      }

      // --- TIPS ---
      if (plan.tips && plan.tips.length > 0) {
        y += 5;
        addSectionTitle("Tips & Motivation");

        plan.tips.forEach((tip: string) => {
          const splitTip = doc.splitTextToSize(`• ${tip}`, 170);
          checkPageBreak(splitTip.length * 5);
          doc.text(splitTip, 25, y);
          y += splitTip.length * 5 + 3;
        });
      }

      if (plan.motivationQuote) {
        y += 5;
        checkPageBreak(20);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(100, 100, 100);
        const splitQuote = doc.splitTextToSize(`"${String(plan.motivationQuote)}"`, 160);
        doc.text(splitQuote, 25, y);
        doc.setFont("helvetica", "normal");
      }

      doc.save("AI-Fitness-Plan.pdf");
    } catch (error) {
      console.error("Failed to export PDF", error);
      alert("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="rounded-xl bg-white/95 backdrop-blur-sm p-6 shadow-lg border border-slate-200">
      {/* Tab Navigation */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setTab("workout")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${tab === "workout"
              ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
          >
            Workout
          </button>
          <button
            onClick={() => setTab("diet")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${tab === "diet"
              ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
          >
            Diet
          </button>
          <button
            onClick={() => setTab("tips")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${tab === "tips"
              ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
          >
            Tips
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Read/Stop Button */}
          <button
            onClick={() => speakSection(tab)}
            disabled={!isSupported}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${!isSupported
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : isSpeaking
                ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md"
                : "bg-slate-700 hover:bg-slate-800 text-white shadow-md"
              }`}
            title={!isSupported ? "Text-to-speech not supported in this browser" : ""}
          >
            {isSpeaking ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Stop
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
                Read
              </>
            )}
          </button>

          {/* Export PDF Button */}
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                PDF
              </>
            )}
          </button>

          {/* Save Button */}
          <button
            onClick={save}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white shadow-md transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
            </svg>
            Save
          </button>
        </div>
      </div>

      {/* Workout Tab */}
      {tab === "workout" && (
        <div className="space-y-4">
          {(plan.workoutPlan?.dayWise || []).map((day: any, idx: number) => (
            <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-lg font-semibold text-slate-900">{day.day}</h4>
              </div>
              <div className="space-y-2">
                {(day.exercises || []).map((ex: any, i: number) => (
                  <ExerciseCard
                    key={i}
                    name={ex.name}
                    sets={ex.sets}
                    reps={ex.reps}
                    rest={ex.rest}
                    onGenerate={() => { }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Diet Tab */}
      {tab === "diet" && (
        <div className="space-y-4">
          {plan.dietPlan?.breakfast?.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="font-semibold text-slate-900 mb-2">🍳 Breakfast</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                {plan.dietPlan.breakfast.map((it: string, i: number) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            </div>
          )}
          {plan.dietPlan?.lunch?.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="font-semibold text-slate-900 mb-2">🥗 Lunch</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                {plan.dietPlan.lunch.map((it: string, i: number) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            </div>
          )}
          {plan.dietPlan?.dinner?.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="font-semibold text-slate-900 mb-2">🍽️ Dinner</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                {plan.dietPlan.dinner.map((it: string, i: number) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            </div>
          )}
          {plan.dietPlan?.snacks?.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="font-semibold text-slate-900 mb-2">🍎 Snacks</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                {plan.dietPlan.snacks.map((it: string, i: number) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tips Tab */}
      {tab === "tips" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="font-semibold text-slate-900 mb-3">💡 Tips</h4>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              {(plan.tips || []).map((t: string, i: number) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
          {plan.motivationQuote && (
            <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
              <div className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h5 className="font-semibold text-indigo-900 mb-1">Motivation</h5>
                  <p className="text-slate-700 italic">"{plan.motivationQuote}"</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
