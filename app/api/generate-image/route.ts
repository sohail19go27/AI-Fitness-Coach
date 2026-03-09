
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
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${seed}`;

    // Return the URL directly. Pollinations generates the image on the fly when the URL is loaded.
    return NextResponse.json({ url: imageUrl });

  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
