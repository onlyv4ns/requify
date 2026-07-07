"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Code2,
  FileText,
  Cloud,
  BarChart3,
  Languages,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { PageHeader, SectionLabel } from "@/components/ui";

const PROMPTS = [
  {
    icon: Code2,
    tag: "Code",
    title: "Refactor a React component",
    desc: "Turn class components into hooks with the same behavior.",
  },
  {
    icon: BarChart3,
    tag: "Data",
    title: "Summarize a CSV dataset",
    desc: "Spot trends, outliers, and suggest a chart to visualize it.",
  },
  {
    icon: FileText,
    tag: "Writing",
    title: "Draft a project README",
    desc: "Generate install steps, usage examples, and a license section.",
  },
  {
    icon: Languages,
    tag: "Language",
    title: "Translate & localize copy",
    desc: "Adapt marketing copy for a different language and tone.",
  },
  {
    icon: Cloud,
    tag: "Utility",
    title: "Build a weather widget",
    desc: "Fetch and render a 5-day forecast with a clean UI.",
  },
  {
    icon: Lightbulb,
    tag: "Ideas",
    title: "Brainstorm product names",
    desc: "Generate ten names with a short rationale for each.",
  },
];

export default function ExplorePage() {
  const [query, setQuery] = useState("");

  const filtered = PROMPTS.filter((p) =>
    (p.title + p.desc).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <PageHeader
        title="Explore"
        subtitle="Browse prompt ideas curated across code, data, and writing."
      />

      <div className="flex items-center gap-2 rounded border border-border px-3 py-2 text-sm">
        <Search size={16} className="text-foreground/60" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search prompts..."
          className="flex-1 bg-transparent outline-none placeholder:text-foreground/60"
        />
      </div>

      <div className="mt-6">
        <SectionLabel>{filtered.length} PROMPTS</SectionLabel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.map(({ icon: Icon, tag, title, desc }) => (
          <Link
            key={title}
            href={`/chat?prompt=${encodeURIComponent(title)}`}
            className="group flex flex-col gap-3 rounded border border-border p-4 text-left text-sm hover:border-accent/50 hover:bg-accent-dim/20"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-accent">
                <Icon size={16} />
                <span className="rounded border border-border px-1.5 py-0.5 text-[10px] text-foreground/50">
                  {tag}
                </span>
              </span>
              <ArrowRight
                size={16}
                className="text-foreground/60 group-hover:text-accent"
              />
            </div>
            <div>
              <div className="font-medium">{title}</div>
              <div className="mt-1 text-xs text-foreground/50">{desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
