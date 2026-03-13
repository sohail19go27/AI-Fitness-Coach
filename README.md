# AI Fitness Coach

Small Next.js + TypeScript app skeleton for an AI-powered fitness coach.

Features included in this scaffold:
- Multi-step user form (client) to collect profile data
- Server API route calling an LLM to generate structured JSON plans (`/api/generate-plan`)
- Native browser text-to-speech for audio playback (`hooks/useSpeech.ts`)
- Free AI image generation using Pollinations AI (`/api/generate-image`)
- LocalStorage persistence and saved plans page with PDF export

## Quick start

1. Copy `.env.example` to `.env.local` and fill your API keys.

2. Install dependencies:

```powershell
npm install
npm install framer-motion
npm install jspdf html2canvas  # if you want PDF export
```

3. Run the dev server:

```powershell
npm run dev
```

Environment variables
- `GEMINI_API_KEY`: Google Gemini API key (used for generating fitness plans)
- `GEMINI_MODEL`: default Gemini model (e.g., gemini-1.5-flash)
- `OPENAI_API_KEY`: OpenAI (or compatible) API key (optional fallback if Gemini fails)
- `OPENAI_MODEL`: default LLM model

Notes
- The generate-plan API instructs the LLM to return strict JSON. The server validates the response with Zod and will attempt an automated repair prompt when the JSON doesn't match the schema.
- Image generation uses the free Pollinations AI service via REST API (no SDK or API key required).
- Text-to-speech uses the user's native device/browser capabilities via the Web Speech API `SpeechSynthesisUtterance`.
- This scaffold is intended as a starting point, not a finished product. You should secure API keys (don't commit `.env.local`), add rate-limiting, usage monitoring, and tests for production readiness.

Deployment
- Deploy to Vercel. Add environment variables in the Vercel dashboard.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
