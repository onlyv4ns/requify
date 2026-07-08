"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Download, FileDown } from "lucide-react";
import { getSharedPrd, type Prd } from "@/lib/api";
import { downloadMarkdown } from "@/lib/download";
import Markdown from "@/components/Markdown";
import { PageHeader } from "@/components/ui";

export default function SharedPrdPage() {
  const { token } = useParams<{ token: string }>();
  const [prd, setPrd] = useState<Prd | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getSharedPrd(token)
      .then(setPrd)
      .catch((err) => setError(err instanceof Error ? err.message : "PRD not found"));
  }, [token]);

  if (error) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 text-sm text-red-400">{error}</div>
    );
  }

  if (!prd) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 text-sm text-foreground/50">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <PageHeader title={prd.title} subtitle={new Date(prd.created_at).toLocaleString()} />
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => downloadMarkdown(prd.title, prd.content)}
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
      <div className="rounded border border-border bg-background p-5">
        <Markdown>{prd.content}</Markdown>
      </div>
    </div>
  );
}
