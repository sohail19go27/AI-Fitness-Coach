"use client";

import React from "react";
import { motion } from "framer-motion";

type Props = {
  onPrimary?: () => void;
};

export default function Hero({ onPrimary }: Props) {
  return (
    <section className="w-full min-h-screen bg-slate-900 flex items-center">
      <div className="mx-auto max-w-6xl py-20 px-6 w-full">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center rounded-full bg-indigo-100/20 px-3 py-1 text-sm font-medium text-indigo-300">
              New · AI powered plans
            </div>

            <h1 className="text-5xl font-extrabold leading-tight tracking-tight fade-up text-white" style={{ lineHeight: 1.04 }}>
              <span className="block">Your personal</span>
              <span className="block mt-1 bg-clip-text text-transparent accent-gradient">AI fitness coach</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-white/80">Personalized workout and nutrition plans tailored to your goals, experience level, and available equipment — generated instantly.</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={onPrimary} className="inline-flex items-center gap-2 rounded-full px-6 py-3 btn-primary hover:opacity-95 transition-transform active:translate-y-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11.5V10h2.5a.5.5 0 010 1H10.5a.5.5 0 01-.5-.5V6.5a.5.5 0 011 0z" clipRule="evenodd" />
                </svg>
                Generate my plan
              </button>

              <a href="/saved" className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-medium btn-ghost">
                Saved plans
              </a>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border card-surface p-3 text-center shadow-sm card-inner-shadow">
                <div className="text-sm font-semibold text-white">Workouts</div>
                <div className="mt-1 text-xs text-white/70">Built for your goals</div>
              </div>
              <div className="rounded-lg border card-surface p-3 text-center shadow-sm card-inner-shadow">
                <div className="text-sm font-semibold text-white">Meal Plans</div>
                <div className="mt-1 text-xs text-white/70">Simple, tasty, balanced</div>
              </div>
              <div className="rounded-lg border card-surface p-3 text-center shadow-sm card-inner-shadow">
                <div className="text-sm font-semibold text-white">Voice Guidance</div>
                <div className="mt-1 text-xs text-white/70">Listen to your plan</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative rounded-2xl bg-white/6 p-6 shadow-lg">
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-30" />
              <div className="rounded-xl border bg-white p-6 shadow card-inner-shadow">
                <h3 className="text-lg font-medium">Try a demo plan</h3>
                <p className="mt-2 text-sm text-zinc-700">Answer a few quick questions and receive a complete plan with exercises, nutrition, and tips.</p>
                <div className="mt-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">🏋️</div>
                    <div>
                      <div className="text-sm font-semibold">Personalized workouts</div>
                      <div className="text-xs text-zinc-600">Adaptive to your level</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600">🍎</div>
                    <div>
                      <div className="text-sm font-semibold">Smart meal plans</div>
                      <div className="text-xs text-zinc-600">Macros and recipes</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
