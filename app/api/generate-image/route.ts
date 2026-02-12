
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

    const hfApiKey = process.env.HF_API_KEY;

    if (!hfApiKey) {
      return NextResponse.json(
        { error: "Hugging Face API key is missing" },
        { status: 500 }
      );
    }

    // Enhance prompt for fitness specific context
    const finalPrompt = `A realistic photo of a person performing ${prompt} in a modern gym, proper form, fitness photography, natural lighting, high detail, 4k`;

    // Hugging Face Inference API
    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
      {
        headers: {
          Authorization: `Bearer ${hfApiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: finalPrompt }),
      }
    );

    if (!response.ok) {
      // Handle 503 (Model Loading) or other errors
      if (response.status === 503) {
        const errorData = await response.json();
        return NextResponse.json(
          { error: `Model is loading. Estimated time: ${errorData.estimated_time}s. Please try again.` },
          { status: 503 }
        );
      }
      throw new Error(`Hugging Face API Error: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    return NextResponse.json({ url: dataUrl });

  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
