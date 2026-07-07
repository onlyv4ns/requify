import Link from "next/link";
import { ArrowRight, BookOpen, Mail } from "lucide-react";
import { PageHeader, SectionLabel } from "@/components/ui";

const ACTIONS = [
  { name: "Generate", desc: "Describe a product idea and a tech stack, get a full PRD back." },
  { name: "Edit with AI", desc: "Give a plain-language instruction and the PRD is rewritten in place." },
  { name: "Undo", desc: "Revert the last AI edit back to the previous version." },
  { name: "Ask", desc: "Ask questions about a PRD without changing it." },
];

const SUPPORT = [
  { icon: BookOpen, label: "Documentation", desc: "Guides and provider reference", href: "/documentation" },
  { icon: Mail, label: "Email support", desc: "support@requify.app", href: "mailto:support@requify.app" },
];

export default function HelpPage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <PageHeader title="Help" subtitle="What each action does, and how to get support." />

      <SectionLabel>ACTIONS</SectionLabel>
      <div className="mt-4 flex flex-col gap-2">
        {ACTIONS.map(({ name, desc }) => (
          <div
            key={name}
            className="flex items-center justify-between rounded border border-border p-3 text-sm"
          >
            <span className="text-accent">{name}</span>
            <span className="text-foreground/50">{desc}</span>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <SectionLabel>SUPPORT</SectionLabel>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {SUPPORT.map(({ icon: Icon, label, desc, href }) => (
          <Link
            key={label}
            href={href}
            className="group flex items-center justify-between rounded border border-border p-3 text-left text-sm hover:border-accent/50 hover:bg-accent-dim/20"
          >
            <span className="flex items-center gap-3">
              <Icon size={16} className="text-accent" />
              <span>
                <div>{label}</div>
                <div className="text-xs text-foreground/50">{desc}</div>
              </span>
            </span>
            <ArrowRight
              size={16}
              className="text-foreground/60 group-hover:text-accent"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
