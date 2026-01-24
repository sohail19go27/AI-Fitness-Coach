"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  name: string;
  sets?: number;
  reps?: string | number;
  rest?: string;
  size?: "256x256" | "512x512" | "1024x1024";
  className?: string;
  onGenerate?: (url: string) => void;
};

export const ExerciseCard: React.FC<Props> = ({ 
  name, 
  sets, 
  reps, 
  rest, 
  size = "512x512", 
  className = "", 
  onGenerate 
}) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  async function generateImage() {
    setLoading(true);
    setError(null);
    try {
      // Fetch with cache: "no-store" to prevent cached responses
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: name, size }),
        cache: "no-store",
      });
      
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Image generation failed");
        setLoading(false);
        return;
      }
      
      const url = data?.url;
      if (!url) {
        setError("No image returned from API");
      } else {
        // Append client-side timestamp to ensure unique URL
        const uniqueUrl = `${url}&client_ts=${Date.now()}`;
        setImageUrl(uniqueUrl);
        setIsExpanded(true); // Auto-expand when image is generated
        onGenerate?.(uniqueUrl);
      }
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  // Build sets/reps text
  const detailsText = [
    sets && `${sets} sets`,
    reps && `${reps} reps`,
    rest && `${rest} rest`,
  ].filter(Boolean).join(" • ");

  return (
    <div className={`group ${className}`}>
      {/* Compact exercise row */}
      <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 hover:border-slate-300 hover:bg-slate-100 transition-all">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-slate-900 truncate">{name}</h4>
          {detailsText && (
            <p className="text-xs text-slate-600 mt-0.5">{detailsText}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Generate/Hide toggle button */}
          <button
            onClick={imageUrl && isExpanded ? () => setIsExpanded(false) : generateImage}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              imageUrl && isExpanded
                ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                : "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white"
            }`}
            aria-label={imageUrl && isExpanded ? "Hide image" : `Generate image for ${name}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : imageUrl && isExpanded ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Hide
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                Generate image
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-2 text-xs text-red-600 px-4">{error}</div>
      )}

      {/* Collapsible image container */}
      <AnimatePresence>
        {imageUrl && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
              <img 
                key={imageUrl}
                src={imageUrl} 
                alt={`${name} demonstration`} 
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExerciseCard;
