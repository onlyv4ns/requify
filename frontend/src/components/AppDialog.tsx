"use client";

import { useCallback, useRef, useState } from "react";

type Mode = "prompt" | "confirm";

export function useAppDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<Mode>("confirm");
  const [message, setMessage] = useState("");
  const [value, setValue] = useState("");
  const [danger, setDanger] = useState(false);
  const resolveRef = useRef<(v: string | boolean | null) => void>(() => {});

  const open = useCallback((m: Mode, msg: string, initial = "", isDanger = false) => {
    setMode(m);
    setMessage(msg);
    setValue(initial);
    setDanger(isDanger);
    ref.current?.showModal();
    return new Promise<string | boolean | null>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const prompt = useCallback(
    (msg: string, initial = "") => open("prompt", msg, initial) as Promise<string | null>,
    [open]
  );

  const confirm = useCallback(
    (msg: string, isDanger = false) => open("confirm", msg, "", isDanger) as Promise<boolean>,
    [open]
  );

  function close(result: string | boolean | null) {
    ref.current?.close();
    resolveRef.current(result);
  }

  const dialog = (
    <dialog
      ref={ref}
      onCancel={() => resolveRef.current(mode === "prompt" ? null : false)}
      className="m-auto rounded border border-border bg-background p-0 text-foreground backdrop:bg-black/70"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          close(mode === "prompt" ? value.trim() || null : true);
        }}
        className="w-80 p-4"
      >
        <div className="text-sm text-foreground/80">{message}</div>
        {mode === "prompt" && (
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-3 w-full rounded border border-accent/60 bg-transparent px-3 py-2 text-sm outline-none"
          />
        )}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => close(mode === "prompt" ? null : false)}
            className="rounded border border-border px-3 py-1.5 text-xs text-foreground/70 hover:bg-accent-dim/40"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`rounded px-3 py-1.5 text-xs font-medium ${
              danger
                ? "border border-red-500/50 text-red-400 hover:bg-red-500/10"
                : "bg-accent text-black"
            }`}
          >
            {mode === "prompt" ? "OK" : danger ? "Delete" : "OK"}
          </button>
        </div>
      </form>
    </dialog>
  );

  return { dialog, prompt, confirm };
}
