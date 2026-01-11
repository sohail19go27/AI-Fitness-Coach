"use client";

import React, { useState } from "react";

type Props = {
  name: string;
  size?: "256x256" | "512x512" | "1024x1024";
  className?: string;
  onGenerate?: (url: string) => void;
};

export const ExerciseCard: React.FC<Props> = ({ name, size = "512x512", className = "", onGenerate }) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generateImage() {
    setLoading(true);
    setError(null);
    try {
      const prompt = `Realistic gym photo of a person performing ${name}. High-quality, realistic lighting, full-body action shot, diverse model.`;
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, size }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Image generation failed");
        setLoading(false);
        return;
      }
      const url = data?.url || data?.dataUrl;
      if (!url) {
        setError("No image returned from API");
      } else {
        setImageUrl(url);
        onGenerate?.(url);
      }
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`rounded-md border p-3 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold">{name}</h4>
          <p className="text-xs text-zinc-600 mt-1">Click to generate an illustrative image.</p>
        </div>
        <div>
          <button
            onClick={generateImage}
            disabled={loading}
            className="inline-flex items-center rounded bg-indigo-600 px-3 py-1 text-sm text-white disabled:opacity-60"
            aria-label={`Generate image for ${name}`}
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>

      {error ? <div className="mt-3 text-xs text-red-600">{error}</div> : null}

      {imageUrl ? (
        <div className="mt-3">
          <img src={imageUrl} alt={name} className="w-full rounded object-cover" />
        </div>
      ) : (
        <div className="mt-3 flex h-32 items-center justify-center rounded bg-zinc-50 text-zinc-500">No image yet</div>
      )}
    </div>
  );
};

export default ExerciseCard;
