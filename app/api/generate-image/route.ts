import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // 1️⃣ Build fitness-specific descriptive prompt
    const finalPrompt = `A realistic fitness photograph of a person performing ${prompt} in a modern gym, correct form, professional lighting, high detail`;

    // 2️⃣ Strong cache busting with random seed and timestamp
    const seed = Math.floor(Math.random() * 10_000_000);
    const ts = Date.now();

    // 3️⃣ Build unique URL with seed and timestamp for cache busting
    const url =
      "https://image.pollinations.ai/prompt/" +
      encodeURIComponent(finalPrompt) +
      `?seed=${seed}&ts=${ts}&nologo=true`;

    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json(
      { error: "Image generation failed" },
      { status: 500 }
    );
  }
}
