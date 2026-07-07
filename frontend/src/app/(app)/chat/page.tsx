"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Code2,
  FileText,
  Cloud,
  ArrowRight,
  Paperclip,
  CornerDownLeft,
} from "lucide-react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { useModel } from "@/lib/useModel";
import { mockReply } from "@/lib/mockReply";
import ModelSelect from "@/components/ModelSelect";

type Message = { role: "user" | "assistant"; text: string };

const EXAMPLES = [
  { icon: Code2, text: "What are the advantages of using Next.js?" },
  { icon: Code2, text: "Write code to demonstrate Dijkstra's algorithm" },
  { icon: FileText, text: "Help me write an essay about Silicon Valley" },
  { icon: Cloud, text: "What is the weather in San Francisco?" },
];

function highlight(text: string) {
  const parts = text.split(
    /(Next\.js\?|Dijkstra's algorithm|Silicon Valley|San Francisco\?)/
  );
  return parts.map((part, i) =>
    /Next\.js\?|Dijkstra's algorithm|Silicon Valley|San Francisco\?/.test(part) ? (
      <span key={i} className="text-accent">
        {part}
      </span>
    ) : (
      part
    )
  );
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatInner />
    </Suspense>
  );
}

function ChatInner() {
  const [messages, setMessages] = useLocalStorage<Message[]>(
    "nexa-chat-messages",
    []
  );
  const [model, setModel] = useModel();
  const [input, setInput] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const bottomRef = useRef<HTMLDivElement>(null);
  const sentPromptRef = useRef(false);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((m) => [
      ...m,
      { role: "user", text: trimmed },
      { role: "assistant", text: mockReply(trimmed) },
    ]);
    setInput("");
  }

  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt && !sentPromptRef.current) {
      sentPromptRef.current = true;
      send(prompt);
      router.replace("/chat");
    }
  }, [searchParams]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {messages.length === 0 ? (
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 pt-16 md:pt-0">
          <h1 className="flex items-center gap-3 text-xl font-bold">
            <span className="text-accent">&gt;_</span> What can I help with?
          </h1>
          <p className="mt-2 text-sm text-foreground/50">
            Ask a question, write code, or explore ideas.
          </p>

          <div className="mt-10 flex items-center gap-2 border-b border-border pb-2 text-sm text-accent">
            <span>&gt;</span> EXAMPLES
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {EXAMPLES.map(({ icon: Icon, text }, i) => (
              <button
                key={i}
                onClick={() => send(text)}
                className="group flex items-center justify-between gap-3 rounded border border-border p-4 text-left text-sm hover:border-accent/50 hover:bg-accent-dim/20"
              >
                <span className="flex items-center gap-3">
                  <Icon size={16} className="shrink-0 text-accent" />
                  <span>{highlight(text)}</span>
                </span>
                <ArrowRight
                  size={16}
                  className="shrink-0 text-foreground/60 group-hover:text-accent"
                />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="no-scrollbar mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "ml-auto max-w-[80%]" : "max-w-[80%]"}>
              <div className="mb-1 text-xs text-foreground/60">
                {m.role === "user" ? "you" : "nexa"}
              </div>
              <div
                className={`rounded border p-3 text-sm ${
                  m.role === "user"
                    ? "border-accent/40 bg-accent-dim/20"
                    : "border-border"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      <div className="mx-auto w-full max-w-3xl px-4 pb-6 pt-4">
        <div className="rounded border border-accent/60 p-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-accent">&gt;_</span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send(input);
              }}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent py-2 outline-none placeholder:text-foreground/60"
            />
            <span className="h-4 w-2 animate-pulse bg-accent" />
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2 text-xs text-foreground/60">
            <span className="hidden sm:inline">
              /help for commands &middot; @ to mention &middot; Ctrl + K to toggle
            </span>
            <div className="ml-auto flex items-center gap-3">
              <label className="cursor-pointer text-foreground/50 hover:text-foreground">
                <Paperclip size={16} />
                <input type="file" className="hidden" />
              </label>
              <ModelSelect value={model} onChange={setModel} />
              <button
                onClick={() => send(input)}
                aria-label="Send message"
                className="rounded bg-accent p-2 text-black"
              >
                <CornerDownLeft size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
