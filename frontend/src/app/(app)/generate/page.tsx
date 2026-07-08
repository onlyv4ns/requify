"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  SlidersHorizontal,
  MonitorSmartphone,
  Server,
  Database,
  Rocket,
  Loader2,
  Sparkles,
  Download,
  FileDown,
} from "lucide-react";
import { PageHeader, SectionLabel } from "@/components/ui";
import { generatePrd, PROVIDERS, type Provider, type TechStack, type Prd } from "@/lib/api";
import { downloadMarkdown } from "@/lib/download";
import Markdown from "@/components/Markdown";

type StackKey = "frontend" | "backend" | "database" | "deployment";

const EXAMPLES: { title: string; prompt: string }[] = [
  {
    title: "Warehouse Inventory Management",
    prompt:
      "An app to track stock in a warehouse, including incoming and outgoing items, with low-stock notifications.",
  },
  {
    title: "Employee Leave Tracker",
    prompt:
      "An app for employees to request leave and managers to approve or reject it, with a remaining-leave-balance report.",
  },
  {
    title: "Recipe Sharing App",
    prompt:
      "An app for sharing recipes where users can upload recipes, rate them, and save favorites.",
  },
];

const STACK_FIELDS: {
  key: StackKey;
  label: string;
  hint: string;
  icon: React.ElementType;
  placeholder: string;
  options: string[];
}[] = [
  {
    key: "frontend",
    label: "Frontend",
    hint: "UI & user interface",
    icon: MonitorSmartphone,
    placeholder: "Pick or type a framework...",
    options: ["Next.js", "React", "Vue.js", "Svelte", "Flutter", "React Native"],
  },
  {
    key: "backend",
    label: "Backend",
    hint: "Logic & API server",
    icon: Server,
    placeholder: "Pick or type a backend...",
    options: ["Go", "Node.js (Express)", "Python (FastAPI/Django)", "Laravel (PHP)", "Ruby on Rails", "Java (Spring Boot)"],
  },
  {
    key: "database",
    label: "Database",
    hint: "Data storage",
    icon: Database,
    placeholder: "Pick or type a database...",
    options: ["PostgreSQL", "MySQL", "MongoDB", "SQLite", "Firebase/Firestore"],
  },
  {
    key: "deployment",
    label: "Deployment",
    hint: "Hosting & infra",
    icon: Rocket,
    placeholder: "Pick or type a platform...",
    options: ["Docker + VPS", "Vercel", "AWS", "Google Cloud", "Railway/Render"],
  },
];

export default function GeneratePage() {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [provider, setProvider] = useState<Provider>("api");
  const [stackMode, setStackMode] = useState<"ai" | "manual">("ai");
  const [stack, setStack] = useState<Required<TechStack>>({
    frontend: "",
    backend: "",
    database: "",
    deployment: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Prd | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !prompt.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const prd = await generatePrd(
        title.trim(),
        prompt.trim(),
        provider,
        stackMode === "manual"
          ? {
              frontend: stack.frontend.trim(),
              backend: stack.backend.trim(),
              database: stack.database.trim(),
              deployment: stack.deployment.trim(),
            }
          : {}
      );
      setResult(prd);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate PRD");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <PageHeader
        title="Generate PRD"
        subtitle="Describe your app idea and get a full PRD automatically."
      />

      <div className="mb-4">
        <SectionLabel>Or try an example</SectionLabel>
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.title}
              type="button"
              onClick={() => {
                setTitle(ex.title);
                setPrompt(ex.prompt);
              }}
              className="rounded border border-border px-2.5 py-1 text-xs text-foreground/70 hover:bg-accent-dim/20"
            >
              {ex.title}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs text-foreground/60">
            Project title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Warehouse Inventory Management App"
            className="w-full rounded border border-border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-foreground/40 focus:border-accent/60"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-foreground/60">
            Short description
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            placeholder="Describe the app you want to build, who it's for, and what problem it solves..."
            className="w-full resize-none rounded border border-border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-foreground/40 focus:border-accent/60"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-foreground/60">
            Tech preferences
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setStackMode("ai")}
              className={`rounded border p-3 text-left transition-colors ${
                stackMode === "ai"
                  ? "border-accent/60 bg-accent-dim/40"
                  : "border-border hover:bg-accent-dim/20"
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <Bot size={16} className="text-accent" /> Let AI decide
              </div>
              <p className="mt-1 text-xs text-foreground/50">
                AI recommends the stack that best fits this project.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setStackMode("manual")}
              className={`rounded border p-3 text-left transition-colors ${
                stackMode === "manual"
                  ? "border-accent/60 bg-accent-dim/40"
                  : "border-border hover:bg-accent-dim/20"
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <SlidersHorizontal size={16} className="text-accent" /> Choose it myself
              </div>
              <p className="mt-1 text-xs text-foreground/50">
                Pick the technologies you want to use.
              </p>
            </button>
          </div>

          {stackMode === "manual" && (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {STACK_FIELDS.map(({ key, label, hint, icon: Icon, placeholder, options }) => (
                <div key={key} className="rounded border border-border p-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-accent-dim text-accent">
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{label}</div>
                      <div className="text-xs text-foreground/50">{hint}</div>
                    </div>
                  </div>
                  <input
                    list={`${key}-options`}
                    value={stack[key]}
                    onChange={(e) => setStack((s) => ({ ...s, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="mt-2 w-full rounded border border-border bg-transparent px-3 py-1.5 text-sm outline-none placeholder:text-foreground/40 focus:border-accent/60"
                  />
                  <datalist id={`${key}-options`}>
                    {options.map((o) => (
                      <option key={o} value={o} />
                    ))}
                  </datalist>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs text-foreground/60">
            Generation source
          </label>
          <div className="flex gap-2">
            {PROVIDERS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setProvider(p.value)}
                title={p.hint}
                className={`rounded border px-3 py-1.5 text-sm transition-colors ${
                  provider === p.value
                    ? "border-accent/60 bg-accent-dim text-accent"
                    : "border-border text-foreground/70 hover:bg-accent-dim/20"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 self-start rounded bg-accent px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Sparkles size={16} />
          )}
          {loading ? "Generating..." : "Generate PRD"}
        </button>

        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>

      {result && (
        <div className="mt-8 print-area">
          <div className="flex items-center justify-between">
            <SectionLabel>RESULT</SectionLabel>
            <div className="flex shrink-0 gap-2 print:hidden">
              <button
                onClick={() => downloadMarkdown(result.title, result.content)}
                className="flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs font-medium text-foreground/80 hover:bg-accent-dim/40"
              >
                <Download size={14} /> Download .md
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs font-medium text-foreground/80 hover:bg-accent-dim/40"
              >
                <FileDown size={14} /> Download PDF
              </button>
            </div>
          </div>
          <div className="no-scrollbar mt-4 max-h-[600px] overflow-auto rounded border border-border bg-background p-5">
            <Markdown>{result.content}</Markdown>
          </div>
          <button
            onClick={() => router.push("/prds")}
            className="mt-4 text-sm text-accent hover:underline print:hidden"
          >
            View all PRDs &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
