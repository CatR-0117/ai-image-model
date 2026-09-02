import { GoogleGenAI, type Content, type Part } from "@google/genai";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_PROMPT_LENGTH = 4000;
const MAX_IMAGE_BASE64_LENGTH = 12_000_000;
const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || "gemini-3.6-flash";
const CLOUDFLARE_IMAGE_MODEL = "@cf/black-forest-labs/flux-1-schnell";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

type RequestBody = {
  action?: "analyze-image" | "identify-ingredients" | "generate-image" | "chat";
  prompt?: string;
  image?: string;
  messages?: ChatMessage[];
};

type CloudflareImageResponse = {
  success?: boolean;
  result?: { image?: string };
};

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Gemini is not configured. Add GEMINI_API_KEY to your .env.local file.",
    );
  }
  return new GoogleGenAI({ apiKey });
}

function requiredPrompt(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Please enter a food description.");
  }
  if (value.length > MAX_PROMPT_LENGTH) {
    throw new Error("The description is too long.");
  }
  return value.trim();
}

function parseImage(dataUrl: unknown): Part {
  if (typeof dataUrl !== "string" || dataUrl.length > MAX_IMAGE_BASE64_LENGTH) {
    throw new Error("Please provide an image smaller than 8 MB.");
  }

  const match = dataUrl.match(
    /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/,
  );
  if (!match) {
    throw new Error("Please provide a valid JPG, PNG, or WebP image.");
  }

  return { inlineData: { mimeType: match[1], data: match[2] } };
}

async function generateText(contents: string | Part[] | Content[]) {
  const response = await getClient().models.generateContent({
    model: TEXT_MODEL,
    contents,
    config: {
      temperature: 0.35,
      maxOutputTokens: 1200,
    },
  });

  const text = response.text?.trim();
  if (!text) throw new Error("The model returned an empty response.");
  return text;
}

async function generateImage(prompt: string) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const apiToken = process.env.CLOUDFLARE_API_TOKEN?.trim();

  if (!accountId || !apiToken) {
    throw new Error(
      "Cloudflare Workers AI is not configured. Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN to .env.local.",
    );
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/run/${CLOUDFLARE_IMAGE_MODEL}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `Professional appetizing food photograph, realistic, well-lit, clean composition, square image. ${prompt}`,
      }),
      signal: AbortSignal.timeout(55_000),
    },
  );

  if (response.status === 401 || response.status === 403) {
    throw new Error(
      "Cloudflare Workers AI credentials are invalid or missing permission.",
    );
  }
  if (response.status === 429) {
    throw new Error(
      "Cloudflare Workers AI free daily quota is exhausted. Try again after 00:00 UTC.",
    );
  }

  const data = (await response.json().catch(() => null)) as
    | CloudflareImageResponse
    | null;
  const image = data?.result?.image;
  if (!response.ok || !data?.success || !image) {
    throw new Error("Cloudflare Workers AI could not generate an image.");
  }

  return `data:image/jpeg;base64,${image}`;
}

function safeMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("Please enter a message.");
  }

  return value.slice(-10).map((message) => {
    if (
      !message ||
      (message.role !== "user" && message.role !== "assistant") ||
      typeof message.text !== "string" ||
      !message.text.trim() ||
      message.text.length > 2000
    ) {
      throw new Error("The chat history is invalid.");
    }
    return { role: message.role, text: message.text.trim() };
  });
}

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    const message = error.message;

    const safeMessages = [
      "Gemini is not configured. Add GEMINI_API_KEY to your .env.local file.",
      "Cloudflare Workers AI is not configured. Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN to .env.local.",
      "Cloudflare Workers AI credentials are invalid or missing permission.",
      "Cloudflare Workers AI free daily quota is exhausted. Try again after 00:00 UTC.",
      "Cloudflare Workers AI could not generate an image.",
      "Please enter a food description.",
      "The description is too long.",
      "Please provide an image smaller than 8 MB.",
      "Please provide a valid JPG, PNG, or WebP image.",
      "Please enter a message.",
      "The chat history is invalid.",
      "The model returned an empty response.",
    ];

    if (safeMessages.includes(message)) return message;

    if (/429|quota|resource exhausted/i.test(message)) {
      return "The AI service is busy or its quota is exhausted. Please try again shortly.";
    }
    if (/403|permission.denied|consumer.suspended|suspended/i.test(message)) {
      return "The Gemini API key or Google project is suspended. Use an active key and try again.";
    }
    if (/401|api.key.invalid|invalid api key|unauthenticated/i.test(message)) {
      return "The Gemini API key is invalid. Check GEMINI_API_KEY and try again.";
    }

  }
  return "The AI service rejected the request. Check the server configuration and try again.";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    if (body.action === "analyze-image") {
      const imagePart = parseImage(body.image);
      const text = await generateText([
        imagePart,
        {
          text: "Describe this food image clearly. Identify the dish if possible, list the visible ingredients, and mention anything uncertain. Use concise plain text.",
        },
      ]);
      return Response.json({ text });
    }

    if (body.action === "identify-ingredients") {
      const prompt = requiredPrompt(body.prompt);
      const text = await generateText(
        `Identify the likely ingredients in the following food description. Return a short introductory sentence, then a clear bulleted list. Distinguish likely ingredients from optional garnishes when uncertain.\n\nFood description:\n${prompt}`,
      );
      return Response.json({ text });
    }

    if (body.action === "generate-image") {
      const prompt = requiredPrompt(body.prompt);
      const image = await generateImage(prompt);
      return Response.json({
        text: "Generated with Cloudflare FLUX.1 Schnell",
        image,
      });
    }

    if (body.action === "chat") {
      const messages = safeMessages(body.messages);
      const contents: Content[] = messages.map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.text }],
      }));
      const response = await getClient().models.generateContent({
        model: TEXT_MODEL,
        contents,
        config: {
          systemInstruction:
            "You are a concise, friendly food assistant. Help with dishes, ingredients, cooking, and food-image prompts. Clearly state uncertainty and never invent allergy or food-safety guarantees.",
          temperature: 0.6,
          maxOutputTokens: 1000,
        },
      });
      const text = response.text?.trim();
      if (!text) throw new Error("The model returned an empty response.");
      return Response.json({ text });
    }

    return Response.json({ error: "Unknown AI action." }, { status: 400 });
  } catch (error) {
    const message = errorMessage(error);
    const status = /quota is exhausted/i.test(message)
      ? 429
      : /not configured/i.test(message)
        ? 503
        : /credentials are invalid/i.test(message)
          ? 502
          : 400;
    return Response.json({ error: message }, { status });
  }
}
