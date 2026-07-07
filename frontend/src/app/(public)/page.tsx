import Link from "next/link";
import {
  Sparkles,
  FileText,
  MessageCircle,
  Undo2,
  ArrowRight,
  CornerDownLeft,
} from "lucide-react";

const FEATURES = [
  { icon: Sparkles, name: "Generate", desc: "Describe a product idea and a tech stack, get a full PRD back." },
  { icon: FileText, name: "Edit with AI", desc: "Give a plain-language instruction and the PRD is rewritten in place." },
  { icon: MessageCircle, name: "Ask", desc: "Ask questions about a PRD without changing a word of it." },
  { icon: Undo2, name: "Undo", desc: "Made a bad edit? Revert straight back to the previous version." },
];

const STEPS = [
  { n: "01", title: "Create an account", desc: "Sign up in seconds — no credit card required." },
  { n: "02", title: "Describe the product", desc: "One prompt plus an optional tech stack is enough." },
  { n: "03", title: "Refine and export", desc: "Edit with AI, ask questions, then download as Markdown or PDF." },
];

export default function LandingPage() {
  return (
    <div>
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-24 text-center">
        <span className="rounded border border-border px-3 py-1 text-xs text-foreground/60">
          &gt;_ AI-generated Product Requirements Documents
        </span>
        <h1 className="mt-6 text-3xl font-bold sm:text-4xl">
          <span className="text-accent">&gt;_</span> Describe it. Get a PRD.
        </h1>
        <p className="mt-4 max-w-xl text-foreground/60">
          Requify turns a short product prompt and a tech stack into a
          complete PRD — then lets you edit it, ask questions about it, and
          export it, all in one terminal-style interface.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Link
            href="/register"
            className="rounded bg-accent px-5 py-2.5 text-sm font-medium text-black"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded border border-border px-5 py-2.5 text-sm text-foreground/70 hover:bg-accent-dim/40"
          >
            Sign in
          </Link>
        </div>

        <div className="mt-16 w-full rounded border border-accent/60 p-3 text-left">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-accent">&gt;_</span>
            <span className="text-foreground/60">
              A task management app for small teams with boards and due dates
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-xs text-foreground/60">
            <span>Next.js &middot; Go &middot; PostgreSQL</span>
            <span className="rounded bg-accent p-1.5 text-black">
              <CornerDownLeft size={14} />
            </span>
          </div>
        </div>
      </section>

      <section className="border-t border-border px-4 py-20">
        <div className="mx-auto w-full max-w-4xl">
          <div className="text-center">
            <span className="text-sm text-accent">&gt; FEATURES</span>
            <h2 className="mt-2 text-2xl font-bold">From idea to PRD</h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, name, desc }) => (
              <div key={name} className="rounded border border-border p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded bg-accent-dim text-accent">
                  <Icon size={18} />
                </span>
                <div className="mt-3 font-medium">{name}</div>
                <div className="mt-1 text-sm text-foreground/50">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border px-4 py-20">
        <div className="mx-auto w-full max-w-4xl">
          <div className="text-center">
            <span className="text-sm text-accent">&gt; HOW IT WORKS</span>
            <h2 className="mt-2 text-2xl font-bold">Up and running in a minute</h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {STEPS.map(({ n, title, desc }) => (
              <div key={n}>
                <span className="text-2xl font-bold text-accent">{n}</span>
                <div className="mt-2 font-medium">{title}</div>
                <div className="mt-1 text-sm text-foreground/50">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border px-4 py-20">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center rounded border border-border p-10 text-center">
          <h2 className="text-2xl font-bold">Ready to get started?</h2>
          <p className="mt-2 text-sm text-foreground/50">
            Free to try — no credit card required.
          </p>
          <Link
            href="/register"
            className="mt-6 flex items-center gap-2 rounded bg-accent px-5 py-2.5 text-sm font-medium text-black"
          >
            Get started <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
