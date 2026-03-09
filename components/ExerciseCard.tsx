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
  const [imageLoadError, setImageLoadError] = useState(false);

  async function generateImage() {
    if (imageUrl) {
      setIsExpanded(!isExpanded);
      return;
    }

    setLoading(true);
    setError(null);
    setImageLoadError(false);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: name }),
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Image generation failed");
      }

      const url = data?.url;
      if (!url) {
        throw new Error("No image returned from API");
      }

      setImageUrl(url);
      setIsExpanded(true);
      onGenerate?.(url);

    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Failed to generate image");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`group ${className}`}>
      {/* Exercise Header */}
      <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 hover:border-slate-300 hover:bg-slate-100 transition-all">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-slate-900 truncate">{name}</h4>
          <div className="flex flex-wrap gap-2 text-xs text-slate-600 mt-1">
            {sets && <span>{sets} sets</span>}
            {sets && reps && <span>•</span>}
            {reps && <span>{reps} reps</span>}
            {(sets || reps) && rest && <span>•</span>}
            {rest && <span>{rest} rest</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Generate/Toggle Button */}
          <button
            onClick={generateImage}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${imageUrl && isExpanded
                ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : imageUrl ? (
              isExpanded ? "Hide Preview" : "Show Preview"
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                Generate Image
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-xs text-red-600 px-1">{error}</div>
      )}

    {/* Image Display */}
      <AnimatePresence>
        {imageUrl && isExpanded && !imageLoadError && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-lg overflow-hidden border border-slate-200">
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-auto object-cover max-h-64"
                // Removed onError handler to allow Pollinations to render directly 
                // without being incorrectly hidden due to cross-origin or load timing
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExerciseCard;
