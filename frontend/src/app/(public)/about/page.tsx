import { PageHeader, SectionLabel } from "@/components/ui";

const STATS = [
  { value: "128K", label: "context window" },
  { value: "3", label: "model sizes" },
  { value: "24/7", label: "uptime target" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <PageHeader
        title="About Nexa"
        subtitle="A fast, no-nonsense interface for working with language models."
      />

      <SectionLabel>MISSION</SectionLabel>
      <p className="mt-4 text-sm text-foreground/70">
        Nexa is built for people who'd rather type a command than click
        through a menu. One workspace for chat, code, and project notes —
        keyboard-first, no clutter.
      </p>

      <div className="mt-8">
        <SectionLabel>BY THE NUMBERS</SectionLabel>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {STATS.map(({ value, label }) => (
          <div
            key={label}
            className="rounded border border-border p-4 text-center"
          >
            <div className="text-lg font-bold text-accent">{value}</div>
            <div className="mt-1 text-xs text-foreground/50">{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <SectionLabel>CONTACT</SectionLabel>
      </div>
      <p className="mt-4 text-sm text-foreground/70">
        Questions or feedback? Reach out on the{" "}
        <a href="/contact" className="underline text-accent">
          contact page
        </a>
        .
      </p>
    </div>
  );
}
