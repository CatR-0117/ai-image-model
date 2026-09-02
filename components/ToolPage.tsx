import type { ReactNode } from "react";
import { RotateCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

type ToolPageProps = {
  title: string;
  description: string;
  resultTitle: string;
  onReset: () => void;
  children: ReactNode;
  result: ReactNode;
};

export default function ToolPage({
  title,
  description,
  resultTitle,
  onReset,
  children,
  result,
}: ToolPageProps) {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4" aria-labelledby="tool-title">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1
              id="tool-title"
              className="flex items-center gap-2 text-xl font-semibold"
            >
              <Sparkles className="size-5" aria-hidden="true" />
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            aria-label={`Reset ${title}`}
            onClick={onReset}
          >
            <RotateCw />
          </Button>
        </div>
        {children}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="result-title">
        <h2
          id="result-title"
          className="flex items-center gap-2 text-xl font-semibold"
        >
          <span className="grid size-5 place-items-center" aria-hidden="true">
            ▧
          </span>
          {resultTitle}
        </h2>
        <div aria-live="polite">{result}</div>
      </section>
    </div>
  );
}
