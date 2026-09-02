export type AiAction =
  | "analyze-image"
  | "identify-ingredients"
  | "generate-image"
  | "chat";

type AiRequest = {
  action: AiAction;
  prompt?: string;
  image?: string;
  messages?: Array<{ role: "user" | "assistant"; text: string }>;
};

export type AiResponse = {
  text?: string;
  image?: string;
};

export async function askAi(
  payload: AiRequest,
  signal?: AbortSignal,
): Promise<AiResponse> {
  const response = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  const data = (await response.json().catch(() => ({}))) as AiResponse & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error || "AI request failed. Please try again.");
  }

  return data;
}

export function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("The image could not be read."));
    reader.readAsDataURL(file);
  });
}
