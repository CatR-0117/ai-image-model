# AI image models

A small Next.js application with four AI-powered food tools:

- image analysis from a JPG, PNG, or WebP upload;
- ingredient identification from a food description;
- food image generation from text;
- a floating food chat assistant.

## Local setup

Install dependencies, copy `.env.example` to `.env.local`, and add:

- a Google AI Studio key as `GEMINI_API_KEY` for analysis, ingredients, and chat;
- a Cloudflare account ID and Workers AI token as `CLOUDFLARE_ACCOUNT_ID` and
  `CLOUDFLARE_API_TOKEN` for image generation.

Then run:

```bash
npm run dev
```

The credentials are read only by the server route and are never sent to the browser.

The text model ID can be changed with `GEMINI_TEXT_MODEL`. Image generation uses
Cloudflare Workers AI's `@cf/black-forest-labs/flux-1-schnell` model.
