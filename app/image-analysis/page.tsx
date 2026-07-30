"use client";

import { useState } from "react";
import { FileText, RotateCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ImageAnalysis() {
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState("");

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
  }

  function handleReset() {
    setFileName("");
    setPreview("");
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="flex items-center gap-2 text-xl font-semibold">
              <Sparkles className="size-5" />
              Image analysis
            </h1>
            <p className="text-sm text-gray-500">
              Upload a food photo, and AI will detect the ingredients.
            </p>
          </div>
          <Button
            variant="outline"
            size="icon-lg"
            aria-label="Reset"
            onClick={handleReset}
          >
            <RotateCw />
          </Button>
        </div>

        <label className="flex h-11 w-full cursor-pointer items-center gap-3 rounded-lg border px-3 text-sm hover:bg-gray-50">
          <span className="font-medium">Choose File</span>
          <span className="truncate text-gray-500">
            {fileName || "JPG , PNG"}
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {preview && (
          <div className="rounded-lg border p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt={fileName}
              className="max-h-80 w-full rounded-lg object-contain"
            />
          </div>
        )}

        <Button size="lg" className="self-end px-6" disabled={!preview}>
          Generate
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <FileText className="size-5" />
          Here is the summary
        </h2>
        <p className="rounded-lg border p-3 text-sm text-gray-500">
          First, enter your image to recognize an ingredients.
        </p>
      </div>
    </div>
  );
}
