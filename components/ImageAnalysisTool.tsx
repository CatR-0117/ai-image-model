"use client";

import { useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";

import ToolPage from "@/components/ToolPage";
import { Button } from "@/components/ui/button";
import { askAi, readImage } from "@/lib/ai-client";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

export default function ImageAnalysisTool() {
  const [fileName, setFileName] = useState("");
  const [image, setImage] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<AbortController | null>(null);

  function reset() {
    requestRef.current?.abort();
    if (inputRef.current) inputRef.current.value = "";
    setFileName("");
    setImage("");
    setResult("");
    setError("");
    setLoading(false);
  }

  async function selectFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setResult("");
    setError("");

    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      setError("Please choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("Please choose an image smaller than 8 MB.");
      event.target.value = "";
      return;
    }

    try {
      setImage(await readImage(file));
      setFileName(file.name);
    } catch (readError) {
      setError((readError as Error).message);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!image || loading) return;

    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    setResult("");
    setError("");

    try {
      const response = await askAi(
        { action: "analyze-image", image },
        controller.signal,
      );
      setResult(response.text || "");
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

  const resultContent = loading ? (
    <div className="result-message">
      <LoaderCircle className="size-4 animate-spin" />
      Analyzing your image. This may take a moment.
    </div>
  ) : error ? (
    <p className="result-error" role="alert">
      {error}
    </p>
  ) : result ? (
    <div className="result-card whitespace-pre-wrap text-sm leading-6">
      {result}
    </div>
  ) : (
    <p className="text-sm text-muted-foreground">
      First, enter your image to recognize its contents.
    </p>
  );

  return (
    <ToolPage
      title="Image analysis"
      description="Upload a food photo, and AI will describe what it sees."
      resultTitle="Here is the summary"
      onReset={reset}
      result={resultContent}
    >
      <form className="flex flex-col gap-4" onSubmit={submit}>
        <label className="flex h-11 w-full cursor-pointer items-center gap-3 rounded-lg border px-3 text-sm transition-colors hover:bg-muted/60 focus-within:ring-3 focus-within:ring-ring/50">
          <span className="font-medium">Choose File</span>
          <span className="truncate text-muted-foreground">
            {fileName || "JPG, PNG, WebP · max 8 MB"}
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={selectFile}
            disabled={loading}
          />
        </label>

        {image && (
          <div className="rounded-lg border bg-muted/20 p-3">
            {/* Local data URLs are not supported by next/image. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={`Preview of ${fileName}`}
              className="max-h-72 w-full rounded-md object-contain"
            />
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="self-end px-6"
          disabled={!image || loading}
        >
          {loading && <LoaderCircle className="animate-spin" />}
          Generate
        </Button>
      </form>
    </ToolPage>
  );
}
