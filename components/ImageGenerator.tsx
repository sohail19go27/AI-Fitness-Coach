
"use client";

import React, { useState } from "react";
import { Loader2, RefreshCw, Wand2, MonitorPlay } from "lucide-react";

export default function ImageGenerator() {
    const [prompt, setPrompt] = useState("");
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateImage = async () => {
        if (!prompt.trim()) return;

        setIsLoading(true);
        setError(null);
        setImageUrl(null); // Clear previous image while loading new one

        try {
            const res = await fetch("/api/generate-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });

            if (!res.ok) throw new Error("Failed to generate image");

            const data = await res.json();
            if (data.url) {
                setImageUrl(data.url);
            } else {
                throw new Error("No image URL returned");
            }
        } catch (err) {
            setError("Failed to generate image. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200 mt-8">
            <div className="flex items-center gap-2 mb-4">
                <Wand2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-800">AI Image Generator</h3>
            </div>

            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe an image to generate..."
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80"
                    onKeyDown={(e) => e.key === "Enter" && generateImage()}
                />
                <button
                    onClick={generateImage}
                    disabled={isLoading || !prompt.trim()}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2 min-w-[140px] justify-center"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        <>Create Art</>
                    )}
                </button>
            </div>

            {error && (
                <div className="text-sm text-red-500 mb-4 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            {imageUrl && (
                <div className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100 min-h-[300px] flex items-center justify-center">
                    <img
                        src={imageUrl}
                        alt={prompt}
                        className="w-full h-auto object-cover max-h-[512px]"
                        onLoad={() => {
                            // Optional: Image loaded callback
                        }}
                    />

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={generateImage}
                            className="p-2 bg-white/90 hover:bg-white text-slate-700 rounded-full shadow-sm backdrop-blur-sm"
                            title="Regenerate"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {!imageUrl && !isLoading && !error && (
                <div className="text-center py-10 text-slate-400 text-sm italic">
                    Enter a prompt above to generate a unique image.
                </div>
            )}
        </div>
    );
}
