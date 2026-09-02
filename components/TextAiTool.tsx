"use client";

import { useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";

import AiText from "@/components/AiText";
import ToolPage from "@/components/ToolPage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askAi, type AiAction } from "@/lib/ai-client";

type TextAiToolProps = {
  action: Extract<AiAction, "identify-ingredients" | "generate-image">;
  title: string;
  description: string;
  resultTitle: string;
  emptyMessage: string;
};

export default function TextAiTool({
  action,
  title,
  description,
  resultTitle,
  emptyMessage,
}: TextAiToolProps) {
  const [prompt, setPrompt] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const requestRef = useRef<AbortController | null>(null);

  function reset() {
    requestRef.current?.abort();
    setPrompt("");
    setText("");
    setImage("");
    setError("");
    setLoading(false);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!prompt.trim() || loading) return;

    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    setText("");
    setImage("");
    setError("");

    try {
      const result = await askAi(
        { action, prompt: prompt.trim() },
        controller.signal,
      );
      setText(result.text || "");
      setImage(result.image || "");
    } catch (requestError) {
      if ((requestError as Error).name !== "AbortError") {
        setError((requestError as Error).message);
      }
    } finally {
      if (requestRef.current === controller) {
        setLoading(false);
        requestRef.current = null;
      }
    }
  }

  const result = loading ? (
    <div className="result-message">
      <LoaderCircle className="size-4 animate-spin" />
      Working on your request. This may take a moment.
    </div>
  ) : error ? (
    <p className="result-error" role="alert">
      {error}
    </p>
  ) : image ? (
    <figure className="result-card">
      {text && <figcaption className="mb-3 font-medium">{text}</figcaption>}
      {/* Generated data URLs are not supported by next/image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt={`AI-generated food for: ${prompt}`}
        className="max-h-[430px] w-full rounded-lg object-contain"
      />
    </figure>
  ) : text ? (
    <div className="result-card text-sm leading-6">
      <AiText text={text} />
    </div>
  ) : (
    <p className="text-sm text-muted-foreground">{emptyMessage}</p>
  );

  return (
    <ToolPage
      title={title}
      description={description}
      resultTitle={resultTitle}
      onReset={reset}
      result={result}
    >
      <form className="flex flex-col gap-4" onSubmit={submit}>
        <label htmlFor={`${action}-prompt`} className="sr-only">
          Food description
        </label>
        <Textarea
          id={`${action}-prompt`}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          className="min-h-32 resize-y"
          placeholder="Food description"
          maxLength={4000}
          disabled={loading}
        />
        <Button
          type="submit"
          size="lg"
          className="self-end px-6"
          disabled={!prompt.trim() || loading}
        >
          {loading && <LoaderCircle className="animate-spin" />}
          Generate
        </Button>
      </form>
    </ToolPage>
  );
}
