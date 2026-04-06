"use client";

import Hero from "../components/Hero";
import MultiStepForm from "../components/MultiStepForm";
import { useRef } from "react";

export default function Home() {
  const formRef = useRef<null | { open?: () => void }>(null);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#050b1e] via-[#0b1a3a] to-[#1b1148]">
      <Hero onPrimary={() => {
        // scroll to form
        const el = document.getElementById("multi-step-form");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }} />

      {/* Form section - decorative elements only, no background */}
      <div className="relative py-20">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <main id="multi-step-form" className="relative z-10 mx-auto max-w-4xl px-6 pb-20">
          <MultiStepForm />

        </main>
      </div>
    </div>
  );
}
