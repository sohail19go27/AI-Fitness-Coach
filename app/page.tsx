"use client";

import Hero from "../components/Hero";
import MultiStepForm from "../components/MultiStepForm";
import { useRef } from "react";

export default function Home() {
  const formRef = useRef<null | { open?: () => void }>(null);

  return (
    <div>
      <Hero onPrimary={() => {
        // scroll to form
        const el = document.getElementById("multi-step-form");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }} />

      <div className="section-bg py-12">
        <main id="multi-step-form" className="mx-auto max-w-3xl px-6 pb-20">
          <MultiStepForm />
        </main>
      </div>
    </div>
  );
}
