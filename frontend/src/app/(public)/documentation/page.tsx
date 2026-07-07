import { PageHeader, SectionLabel } from "@/components/ui";

const FEATURES = [
  { name: "Generate", desc: "Describe a product idea and a tech stack, get a full PRD back." },
  { name: "Edit with AI", desc: "Give a plain-language instruction and the PRD is rewritten in place." },
  { name: "Undo", desc: "Revert the last AI edit back to the previous version." },
  { name: "Ask", desc: "Ask questions about a PRD without changing it." },
  { name: "Export", desc: "Download any PRD as Markdown or PDF." },
];

const PROVIDERS = [
  { name: "api", desc: "Uses the Anthropic API directly. Needs ANTHROPIC_API_KEY set on the server." },
  { name: "claude_code", desc: "Uses the claude CLI already logged in on the server — no API key needed." },
];

export default function DocumentationPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <PageHeader
        title="Documentation"
        subtitle="Everything you need to get around Requify."
      />

      <SectionLabel>GETTING STARTED</SectionLabel>
      <p className="mt-4 text-sm text-foreground/70">
        Sign in, then go to Generate — write a short prompt describing the
        product, optionally pick a frontend/backend/database/deployment
        stack, and submit. The PRD opens as soon as it's ready.
      </p>

      <div className="mt-8">
        <SectionLabel>FEATURES</SectionLabel>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {FEATURES.map(({ name, desc }) => (
          <div key={name} className="rounded border border-border p-3 text-sm">
            <div className="text-accent">{name}</div>
            <div className="mt-1 text-foreground/50">{desc}</div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <SectionLabel>AI PROVIDERS</SectionLabel>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {PROVIDERS.map(({ name, desc }) => (
          <div key={name} className="rounded border border-border p-3 text-sm">
            <div className="text-accent">{name}</div>
            <div className="mt-1 text-foreground/50">{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
