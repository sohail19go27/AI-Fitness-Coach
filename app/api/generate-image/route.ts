import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Body = {
  prompt: string;
  size?: "256x256" | "512x512" | "1024x1024";
};

/**
 * Pollinations.ai Image Generation API endpoint
 * 
 * Uses Pollinations.ai's free image generation service (no API key required).
 * Pollinations provides a simple URL-based API that generates images on-demand.
 * 
 * Response format: { url: string } - compatible with existing UI components.
 */
export async function POST(req: Request) {
  try {
    const body: Body = await req.json();
    if (!body?.prompt) {
      return NextResponse.json({ error: "Missing 'prompt' in request body" }, { status: 400 });
    }

    // Parse requested size (default to 512x512)
    const [w, h] = body.size?.split("x") ?? ["512", "512"];
    const width = Number(w) || 512;
    const height = Number(h) || 512;

    // Enhance prompt for high-quality realistic fitness photography
    const enhancedPrompt = `highly realistic professional photograph of ${body.prompt}, fitness photography, sharp focus, professional lighting, high quality, photorealistic`;

    /**
     * Pollinations.ai API
     * 
     * Free image generation service with no API key required.
     * URL format: https://image.pollinations.ai/prompt/{encoded_prompt}?width={w}&height={h}&seed={seed}&nologo=true
     * 
     * The service generates images on-demand and returns the image directly.
     * We use nologo=true to remove watermarks and add a random seed + timestamp for unique images on each request.
     */
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const seed = Math.floor(Math.random() * 1_000_000); // Random seed for variety
    const ts = Date.now(); // Timestamp cache-busting
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true&timestamp=${ts}`;

    // Pollinations returns the image directly, so we just return the URL
    // The frontend will load it as a regular image
    return NextResponse.json({ url: imageUrl });

  } catch (err: any) {
    console.error("========== IMAGE GENERATION ERROR ==========");
    console.error("message:", err?.message);
    console.error("stack:", err?.stack?.split("\n").slice(0, 3).join("\n"));
    console.error("==========================================");

    return NextResponse.json(
      {
        error: err?.message || "Image generation failed",
        details: "Check server logs for details",
      },
      { status: 500 }
    );
  }
}
