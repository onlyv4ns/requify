"use client";

import { useRef, useState } from "react";
import { Loader2, RotateCcw, X } from "lucide-react";
import { listRevisions, getRevision, restoreRevision, type Prd, type Revision } from "@/lib/api";
import { diffLines, type DiffLine } from "@/lib/diff";

export function useRevisionHistory(prdId: string, onRestore: (prd: Prd) => void) {
  const ref = useRef<HTMLDialogElement>(null);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [currentContent, setCurrentContent] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [diff, setDiff] = useState<DiffLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [diffLoading, setDiffLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState("");

  async function open(content: string) {
    setError("");
    setSelectedId(null);
    setDiff([]);
    setCurrentContent(content);
    ref.current?.showModal();
    setLoading(true);
    try {
      setRevisions(await listRevisions(prdId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }

  async function select(id: number) {
    setSelectedId(id);
    setDiffLoading(true);
    try {
      const rev = await getRevision(prdId, id);
      setDiff(diffLines(currentContent, rev.content));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load revision");
    } finally {
      setDiffLoading(false);
    }
  }

  async function restore(id: number) {
    if (restoring) return;
    setRestoring(true);
    try {
      onRestore(await restoreRevision(prdId, id));
      ref.current?.close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restore");
    } finally {
      setRestoring(false);
    }
  }

  const dialog = (
    <dialog
      ref={ref}
      onCancel={() => ref.current?.close()}
      className="m-auto w-full max-w-2xl rounded border border-border bg-background p-0 text-foreground backdrop:bg-black/70"
    >
      <div className="flex max-h-[80vh] flex-col p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium">Version history</span>
          <button onClick={() => ref.current?.close()} className="text-foreground/50 hover:text-foreground">
            <X size={16} />
          </button>
        </div>
        {error && <p className="mb-2 text-sm text-red-400">{error}</p>}
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-foreground/50">
            <Loader2 size={14} className="animate-spin" /> Loading...
          </div>
        ) : revisions.length === 0 ? (
          <p className="text-sm text-foreground/50">No previous versions yet.</p>
        ) : (
          <div className="flex flex-1 gap-3 overflow-hidden">
            <div className="flex w-40 shrink-0 flex-col gap-1 overflow-y-auto">
              {revisions.map((rev) => (
                <button
                  key={rev.id}
                  onClick={() => select(rev.id)}
                  className={`rounded border px-2 py-1.5 text-left text-xs ${
                    selectedId === rev.id
                      ? "border-accent/60 bg-accent-dim text-accent"
                      : "border-border text-foreground/70 hover:bg-accent-dim/20"
                  }`}
                >
                  {new Date(rev.created_at).toLocaleString()}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto rounded border border-border p-2 text-xs">
              {diffLoading ? (
                <div className="flex items-center gap-2 text-foreground/50">
                  <Loader2 size={14} className="animate-spin" /> Loading diff...
                </div>
              ) : selectedId === null ? (
                <p className="text-foreground/50">Select a version to see the diff.</p>
              ) : (
                <>
                  <pre className="whitespace-pre-wrap font-mono">
                    {diff.map((d, idx) => (
                      <div
                        key={idx}
                        className={
                          d.type === "add"
                            ? "bg-green-500/10 text-green-400"
                            : d.type === "del"
                            ? "bg-red-500/10 text-red-400"
                            : "text-foreground/70"
                        }
                      >
                        {d.type === "add" ? "+ " : d.type === "del" ? "- " : "  "}
                        {d.text}
                      </div>
                    ))}
                  </pre>
                  <button
                    onClick={() => restore(selectedId)}
                    disabled={restoring}
                    className="mt-3 flex items-center gap-1.5 rounded border border-accent/60 bg-accent-dim px-3 py-1.5 text-xs font-medium text-accent disabled:opacity-50"
                  >
                    <RotateCcw size={13} /> {restoring ? "Restoring..." : "Restore this version"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </dialog>
  );

  return { dialog, open };
}
