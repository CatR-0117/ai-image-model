"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, MessageCircle, Send, X } from "lucide-react";

import AiText from "@/components/AiText";
import { Button } from "@/components/ui/button";
import { askAi } from "@/lib/ai-client";

type Message = { role: "user" | "assistant"; text: string };

const firstMessage: Message = {
  role: "assistant",
  text: "How can I help you today?",
};

export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([firstMessage]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    const nextMessages = [...messages, { role: "user" as const, text: question }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await askAi({
        action: "chat",
        messages: nextMessages.slice(-10),
      });
      setMessages((current) => [
        ...current,
        { role: "assistant", text: response.text || "I could not answer that." },
      ]);
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button
        type="button"
        size="icon-lg"
        className="fixed right-5 bottom-5 z-40 size-12 rounded-full shadow-lg"
        aria-label="Open chat assistant"
        onClick={() => setOpen(true)}
      >
        <MessageCircle />
      </Button>
    );
  }

  return (
    <aside
      className="fixed right-4 bottom-4 z-40 flex h-[min(472px,calc(100vh-2rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border bg-background shadow-xl"
      aria-label="Chat assistant"
    >
      <div className="flex h-12 items-center justify-between border-b px-4">
        <h2 className="font-semibold">Chat assistant</h2>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Close chat assistant"
          onClick={() => setOpen(false)}
        >
          <X />
        </Button>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4 text-sm">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={
              message.role === "assistant"
                ? "max-w-[82%] self-start whitespace-pre-wrap rounded-xl bg-foreground px-4 py-2.5 text-background"
                : "max-w-[82%] self-end whitespace-pre-wrap rounded-xl bg-muted px-4 py-2.5"
            }
          >
            <AiText text={message.text} />
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 self-start rounded-xl bg-foreground px-4 py-2.5 text-background">
            <LoaderCircle className="size-4 animate-spin" />
            Thinking…
          </div>
        )}
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <div ref={endRef} />
      </div>

      <form className="flex gap-2 border-t p-3" onSubmit={send}>
        <label htmlFor="chat-message" className="sr-only">
          Message
        </label>
        <input
          id="chat-message"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type your message…"
          maxLength={2000}
          disabled={loading}
          className="h-10 min-w-0 flex-1 rounded-lg border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <Button
          type="submit"
          size="icon-lg"
          className="size-10 rounded-full"
          aria-label="Send message"
          disabled={!input.trim() || loading}
        >
          <Send />
        </Button>
      </form>
    </aside>
  );
}
