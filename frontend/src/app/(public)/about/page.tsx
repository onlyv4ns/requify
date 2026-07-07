import { PageHeader, SectionLabel } from "@/components/ui";

const STATS = [
  { value: "4", label: "core actions" },
  { value: "2", label: "AI providers" },
  { value: "1", label: "minute to a first draft" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <PageHeader
        title="About Requify"
        subtitle="A fast, no-nonsense way to turn a product idea into a PRD."
      />

      <SectionLabel>MISSION</SectionLabel>
      <p className="mt-4 text-sm text-foreground/70">
        Writing a Product Requirements Document from scratch is slow.
        Requify generates a full first draft from a short prompt and a tech
        stack, then lets you edit it with plain-language instructions, ask
        questions about it, and export it — keyboard-first, no clutter.
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
