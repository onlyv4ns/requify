"use client";

import { ChevronDown } from "lucide-react";
import { MODELS } from "@/lib/models";

export default function ModelSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Model"
        className="appearance-none rounded border border-border bg-transparent py-1 pl-2 pr-6 text-xs text-foreground/70 outline-none"
      >
        {MODELS.map((m) => (
          <option key={m} value={m} className="bg-black">
            {m}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-foreground/50"
      />
    </div>
  );
}
