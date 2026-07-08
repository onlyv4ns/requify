"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Trash2 } from "lucide-react";
import { PageHeader, SectionLabel } from "@/components/ui";
import { listPrds, deletePrd, type Prd } from "@/lib/api";
import { useAppDialog } from "@/components/AppDialog";

export default function PrdsPage() {
  const [prds, setPrds] = useState<Prd[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { dialog, confirm } = useAppDialog();
  const filtered = prds.filter((p) => p.title.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    listPrds()
      .then(setPrds)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load PRDs")
      );
  }, []);

  async function handleDelete(e: React.MouseEvent, id: number, title: string) {
    e.preventDefault();
    e.stopPropagation();
    if (deletingId !== null) return;
    if (!(await confirm(`Delete "${title}"? This can't be undone.`, true))) return;
    setDeletingId(id);
    try {
      await deletePrd(String(id));
      setPrds((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete PRD");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      {dialog}
      <PageHeader
        title="PRDs"
        subtitle="All Product Requirements Documents you've created."
      />

      <SectionLabel>{filtered.length} PRD</SectionLabel>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search PRDs..."
        className="mt-4 w-full rounded border border-border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-foreground/40 focus:border-accent/60"
      />

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.map(({ id, title, created_at }) => (
          <Link
            key={id}
            href={`/prds/${id}`}
            className="group relative flex flex-col gap-3 rounded border border-border p-4 text-left text-sm hover:border-accent/50 hover:bg-accent-dim/20"
          >
            <button
              onClick={(e) => handleDelete(e, id, title)}
              disabled={deletingId === id}
              title="Delete"
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded border border-transparent text-foreground/40 opacity-0 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10 group-hover:opacity-100 disabled:opacity-50"
            >
              <Trash2 size={13} />
            </button>
            <span className="flex h-8 w-8 items-center justify-center rounded bg-accent-dim text-accent">
              <FileText size={16} />
            </span>
            <div>
              <div className="font-medium pr-6">{title}</div>
              <div className="mt-1 text-xs text-foreground/50">
                {new Date(created_at).toLocaleString()}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
