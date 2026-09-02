import { Fragment } from "react";

function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

export default function AiText({ text }: { text: string }) {
  return (
    <div className="space-y-1">
      {text.split("\n").map((line, index) => {
        const bullet = line.match(/^\s*[*-]\s+(.+)$/);

        if (bullet) {
          return (
            <div key={index} className="flex gap-2 pl-1">
              <span aria-hidden="true">•</span>
              <span>
                <InlineText text={bullet[1]} />
              </span>
            </div>
          );
        }
        if (!line.trim()) return <div key={index} className="h-1" />;
        return (
          <p key={index}>
            <InlineText text={line} />
          </p>
        );
      })}
    </div>
  );
}
