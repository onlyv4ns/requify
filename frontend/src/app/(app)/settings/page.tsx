"use client";

import { Check } from "lucide-react";
import { PageHeader, SectionLabel } from "@/components/ui";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { useModel } from "@/lib/useModel";
import { useAppDialog } from "@/components/AppDialog";

const MODEL_INFO: Record<string, string> = {
  "Nexa 1.0": "Balanced, 128K context",
  "Nexa Mini": "Fastest, lower cost",
  "Nexa Vision": "Adds image understanding",
};

const TOGGLES = [
  { key: "stream", label: "Stream responses", desc: "Show tokens as they're generated" },
  { key: "autosave", label: "Auto-save chats", desc: "Keep history without saving manually" },
  { key: "sound", label: "Sound effects", desc: "Play a tone when a response finishes" },
];

type Toggles = { stream: boolean; autosave: boolean; sound: boolean };

function Toggle({
  on,
  onClick,
  label,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={on}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
        on ? "bg-accent" : "bg-border"
      }`}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full bg-black transition-[left]"
        style={{ left: on ? "18px" : "2px" }}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [model, setModel] = useModel();
  const [toggles, setToggles] = useLocalStorage<Toggles>("nexa-toggles", {
    stream: true,
    autosave: true,
    sound: false,
  });
  const { dialog, confirm } = useAppDialog();

  async function clearAll() {
    const ok = await confirm(
      "Delete every conversation and project? This can't be undone.",
      true
    );
    if (!ok) return;
    for (const key of ["nexa-chat-messages", "nexa-projects", "nexa-code-files"]) {
      window.localStorage.removeItem(key);
    }
    window.location.reload();
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      {dialog}
      <PageHeader title="Settings" subtitle="Configure model and preferences." />

      <SectionLabel>MODEL</SectionLabel>
      <div className="mt-4 flex flex-col gap-2">
        {Object.entries(MODEL_INFO).map(([name, desc]) => (
          <button
            key={name}
            onClick={() => setModel(name)}
            className={`flex items-center justify-between rounded border p-3 text-left text-sm ${
              model === name
                ? "border-accent/60 bg-accent-dim/30"
                : "border-border hover:bg-accent-dim/20"
            }`}
          >
            <div>
              <div>{name}</div>
              <div className="text-xs text-foreground/50">{desc}</div>
            </div>
            {model === name && <Check size={16} className="text-accent" />}
          </button>
        ))}
      </div>

      <div className="mt-8">
        <SectionLabel>PREFERENCES</SectionLabel>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {TOGGLES.map(({ key, label, desc }) => (
          <div
            key={key}
            className="flex items-center justify-between rounded border border-border p-3 text-sm"
          >
            <div>
              <div>{label}</div>
              <div className="text-xs text-foreground/50">{desc}</div>
            </div>
            <Toggle
              label={label}
              on={toggles[key as keyof Toggles]}
              onClick={() =>
                setToggles((t) => ({ ...t, [key]: !t[key as keyof Toggles] }))
              }
            />
          </div>
        ))}
      </div>

      <div className="mt-8">
        <SectionLabel>DANGER ZONE</SectionLabel>
      </div>
      <div className="mt-4 flex items-center justify-between rounded border border-red-500/30 p-3 text-sm">
        <div>
          <div>Clear all chats</div>
          <div className="text-xs text-foreground/50">
            Permanently delete every conversation and project.
          </div>
        </div>
        <button
          onClick={clearAll}
          className="rounded border border-red-500/50 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
