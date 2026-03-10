
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Enhance prompt for fitness specific context and URL encode it
    const finalPrompt = `A realistic fitness photo of a person performing ${prompt} in a modern gym, proper form, cinematic lighting, high detail, 4k, photorealistic`;
    const encodedPrompt = encodeURIComponent(finalPrompt);

    // Using Pollinations AI - A free, no-key required image generation API
    // We append a random seed to ensure a unique image is generated each time
    const seed = Math.floor(Math.random() * 1000000);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=800&nologo=true&seed=${seed}`;

    try {
      // Fetch the image server-side to prevent browser timeout/CORS issues on the img tag
      const imageRes = await fetch(pollinationsUrl, { signal: AbortSignal.timeout(15000) }); // 15s timeout
      
      if (!imageRes.ok) {
        throw new Error(`Pollinations API responded with status: ${imageRes.status}`);
      }
      
      const arrayBuffer = await imageRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = `data:${imageRes.headers.get('content-type') || 'image/jpeg'};base64,${buffer.toString('base64')}`;
      
      return NextResponse.json({ url: base64Image });
    } catch (fetchError) {
      console.error("Pollinations generation failed or timed out, using fallback:", fetchError);
      // Generic high-quality gym fallback if Pollinations is down or too slow
      const fallbackUrl = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1024&auto=format&fit=crop";
      return NextResponse.json({ url: fallbackUrl });
    }

  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}