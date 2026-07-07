"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, FileDown, Sparkles, Loader2, ArrowUp, ArrowDown, Trash2, Undo2, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { getPrd, editPrd, deletePrd, undoPrd, askPrd, PROVIDERS, type Prd, type Provider } from "@/lib/api";
import { downloadMarkdown } from "@/lib/download";
import Markdown from "@/components/Markdown";
import { useAppDialog } from "@/components/AppDialog";

export default function PrdDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { dialog, confirm } = useAppDialog();
  const [prd, setPrd] = useState<Prd | null>(null);
  const [error, setError] = useState("");
  const [instruction, setInstruction] = useState("");
  const [provider, setProvider] = useState<Provider>("api");
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [undoing, setUndoing] = useState(false);
  const [undoError, setUndoError] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ question: string; answer: string }[]>([]);
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState("");

  useEffect(() => {
    getPrd(id)
      .then(setPrd)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load PRD")
      );
  }, [id]);

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!instruction.trim() || editing) return;
    setEditing(true);
    setEditError("");
    try {
      const updated = await editPrd(id, instruction.trim(), provider);
      setPrd(updated);
      setInstruction("");
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to edit PRD");
    } finally {
      setEditing(false);
    }
  }

  async function handleUndo() {
    if (!prd || undoing) return;
    setUndoing(true);
    setUndoError("");
    try {
      setPrd(await undoPrd(id));
    } catch (err) {
      setUndoError(err instanceof Error ? err.message : "Failed to undo");
    } finally {
      setUndoing(false);
    }
  }

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || asking) return;
    setAsking(true);
    setAskError("");
    const q = question.trim();
    try {
      const { answer } = await askPrd(id, q, provider);
      setMessages((prev) => [...prev, { question: q, answer }]);
      setQuestion("");
    } catch (err) {
      setAskError(err instanceof Error ? err.message : "Failed to get an answer");
    } finally {
      setAsking(false);
    }
  }

  async function handleDelete() {
    if (!prd || deleting) return;
    if (!(await confirm(`Delete "${prd.title}"? This can't be undone.`, true))) return;
    setDeleting(true);
    try {
      await deletePrd(id);
      router.push("/prds");
    } catch (err) {
      setDeleting(false);
      setDeleteError(err instanceof Error ? err.message : "Failed to delete PRD");
    }
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 text-sm text-red-400">
        {error}
      </div>
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
      {dialog}
      <div className="print-area">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <PageHeader
            title={prd.title}
            subtitle={new Date(prd.created_at).toLocaleString()}
          />
          <div className="flex shrink-0 gap-2 print:hidden">
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
            {prd.previous_content && (
              <button
                onClick={handleUndo}
                disabled={undoing}
                title="Revert the last AI edit"
                className="flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs font-medium text-foreground/80 hover:bg-accent-dim/40 disabled:opacity-50"
              >
                <Undo2 size={14} /> {undoing ? "Undoing..." : "Undo last edit"}
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 rounded border border-red-500/50 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50"
            >
              <Trash2 size={13} /> {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
        {deleteError && <p className="mb-4 text-sm text-red-400">{deleteError}</p>}
        {undoError && <p className="mb-4 text-sm text-red-400">{undoError}</p>}
        {(prd.frontend || prd.backend || prd.database || prd.deployment) && (
          <div className="mb-4 flex flex-wrap gap-2 text-xs">
            {prd.frontend && (
              <span className="rounded border border-border px-2 py-1 text-foreground/70">
                Frontend: {prd.frontend}
              </span>
            )}
            {prd.backend && (
              <span className="rounded border border-border px-2 py-1 text-foreground/70">
                Backend: {prd.backend}
              </span>
            )}
            {prd.database && (
              <span className="rounded border border-border px-2 py-1 text-foreground/70">
                Database: {prd.database}
              </span>
            )}
            {prd.deployment && (
              <span className="rounded border border-border px-2 py-1 text-foreground/70">
                Deployment: {prd.deployment}
              </span>
            )}
          </div>
        )}
        <div className="rounded border border-border bg-background p-5">
          <Markdown>{prd.content}</Markdown>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2 print:hidden">
        <label className="text-xs text-foreground/60">Ask about this PRD</label>
        {messages.length > 0 && (
          <div className="flex flex-col gap-3 rounded border border-border p-3">
            {messages.map((m, i) => (
              <div key={i} className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground/80">{m.question}</p>
                <div className="text-sm text-foreground/70">
                  <Markdown>{m.answer}</Markdown>
                </div>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleAsk} className="flex items-end gap-2">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="e.g. Apakah ini cocok pakai Supabase? (Enter untuk kirim, Shift+Enter baris baru)"
            rows={2}
            className="w-full resize-none rounded border border-border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-foreground/40 focus:border-accent/60"
          />
          <button
            type="submit"
            disabled={asking}
            className="flex shrink-0 items-center justify-center gap-2 rounded border border-border px-4 py-2 text-sm font-medium text-foreground/80 hover:bg-accent-dim/40 disabled:opacity-50"
          >
            {asking ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <MessageCircle size={16} />
            )}
            {asking ? "Asking..." : "Ask"}
          </button>
        </form>
        {askError && <p className="text-sm text-red-400">{askError}</p>}
      </div>

      <form onSubmit={handleEdit} className="mt-6 flex flex-col gap-2 print:hidden">
        <label className="text-xs text-foreground/60">Edit with AI</label>
        <div className="flex gap-2">
          <input
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g. Add a section on rate limiting"
            className="w-full rounded border border-border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-foreground/40 focus:border-accent/60"
          />
          <button
            type="submit"
            disabled={editing}
            className="flex shrink-0 items-center justify-center gap-2 rounded bg-accent px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {editing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            {editing ? "Applying..." : "Apply"}
          </button>
        </div>
        <div className="flex gap-2">
          {PROVIDERS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setProvider(p.value)}
              title={p.hint}
              className={`rounded border px-3 py-1.5 text-xs transition-colors ${
                provider === p.value
                  ? "border-accent/60 bg-accent-dim text-accent"
                  : "border-border text-foreground/70 hover:bg-accent-dim/20"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {editError && <p className="text-sm text-red-400">{editError}</p>}
      </form>

      <div className="fixed bottom-6 right-6 flex flex-col gap-2 print:hidden">
        <button
          onClick={() =>
            document
              .querySelector("main")
              ?.scrollTo({ top: 0, behavior: "smooth" })
          }
          title="Scroll to top"
          className="flex h-9 w-9 items-center justify-center rounded border border-border bg-background text-foreground/70 hover:bg-accent-dim/40"
        >
          <ArrowUp size={16} />
        </button>
        <button
          onClick={() => {
            const main = document.querySelector("main");
            main?.scrollTo({ top: main.scrollHeight, behavior: "smooth" });
          }}
          title="Scroll to bottom"
          className="flex h-9 w-9 items-center justify-center rounded border border-border bg-background text-foreground/70 hover:bg-accent-dim/40"
        >
          <ArrowDown size={16} />
        </button>
      </div>
    </div>
  );
}
