"use client";

import React from "react";
import { motion } from "framer-motion";

type Props = {
  onPrimary?: () => void;
};

export default function Hero({ onPrimary }: Props) {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 w-full">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Left: Hero content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 px-4 py-2 text-sm font-medium text-indigo-300 backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              New · AI powered plans
            </motion.div>

            {/* Heading with animated glow */}
            <div className="relative">
              <div className="absolute inset-0 blur-3xl opacity-30 bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-500" />
              <h1 className="relative text-6xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tight">
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="block text-white"
                >
                  Your personal
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400"
                >
                  AI fitness coach
                </motion.span>
              </h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-6 max-w-2xl text-lg md:text-xl text-slate-300 leading-relaxed"
            >
              Personalized workout and nutrition plans tailored to your goals, experience level, and available equipment — generated instantly.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start"
            >
              <button
                onClick={onPrimary}
                className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-indigo-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/60 hover:-translate-y-0.5 active:translate-y-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11.5V10h2.5a.5.5 0 010 1H10.5a.5.5 0 01-.5-.5V6.5a.5.5 0 011 0z" clipRule="evenodd" />
                </svg>
                Generate my plan
              </button>

              <a
                href="/saved"
                className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/50 backdrop-blur-sm px-8 py-4 text-lg font-medium text-slate-300 transition-all duration-300 hover:bg-slate-800/50 hover:border-slate-600 hover:-translate-y-0.5"
              >
                Saved plans
              </a>
            </motion.div>

            {/* Feature cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {[
                { title: "Workouts", subtitle: "Built for your goals", icon: "💪" },
                { title: "Meal Plans", subtitle: "Simple, tasty, balanced", icon: "🥗" },
                { title: "Voice Guidance", subtitle: "Listen to your plan", icon: "🎧" },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 + i * 0.1 }}
                  className="group rounded-2xl bg-slate-900/40 backdrop-blur-sm border border-slate-800 p-4 text-center transition-all duration-300 hover:bg-slate-800/60 hover:border-slate-700 hover:-translate-y-1"
                >
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <div className="text-sm font-semibold text-white">{feature.title}</div>
                  <div className="mt-1 text-xs text-slate-400">{feature.subtitle}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Demo card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative rounded-3xl bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-xl border border-slate-700 p-8 shadow-2xl">
              {/* Decorative glow */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-xl opacity-50" />
              
              <div className="relative space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Try a demo plan</h3>
                  <p className="mt-2 text-slate-400">Answer a few quick questions and receive a complete plan with exercises, nutrition, and tips.</p>
                </div>

                <div className="space-y-4">
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-4 rounded-xl bg-slate-900/50 p-4 border border-slate-800 transition-all hover:border-slate-700"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl">
                      🏋️
                    </div>
                    <div>
                      <div className="font-semibold text-white">Personalized workouts</div>
                      <div className="text-sm text-slate-400">Adaptive to your level</div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-4 rounded-xl bg-slate-900/50 p-4 border border-slate-800 transition-all hover:border-slate-700"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-2xl">
                      🍎
                    </div>
                    <div>
                      <div className="font-semibold text-white">Smart meal plans</div>
                      <div className="text-sm text-slate-400">Macros and recipes</div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
