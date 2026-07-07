import Link from "next/link";
import { ArrowRight, BookOpen, MessageCircle, Mail } from "lucide-react";
import { PageHeader, SectionLabel } from "@/components/ui";

const SHORTCUTS = [
  { keys: "Ctrl + K", desc: "Toggle sidebar" },
  { keys: "Ctrl + Enter", desc: "Send message" },
  { keys: "@", desc: "Mention a file or project" },
  { keys: "/", desc: "Open the command menu" },
];

const COMMANDS = [
  { cmd: "/help", desc: "Show available commands" },
  { cmd: "/clear", desc: "Clear the current chat" },
  { cmd: "/model", desc: "Switch the active model" },
  { cmd: "/export", desc: "Export the chat as markdown" },
];

const SUPPORT = [
  { icon: BookOpen, label: "Documentation", desc: "Guides and API reference", href: "/documentation" },
  { icon: MessageCircle, label: "Community", desc: "Ask questions, share prompts", href: "/explore" },
  { icon: Mail, label: "Email support", desc: "support@nexa.app", href: "mailto:support@nexa.app" },
];

export default function HelpPage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <PageHeader title="Help" subtitle="Shortcuts, commands, and support." />

      <SectionLabel>KEYBOARD SHORTCUTS</SectionLabel>
      <div className="mt-4 flex flex-col gap-2">
        {SHORTCUTS.map(({ keys, desc }) => (
          <div
            key={keys}
            className="flex items-center justify-between rounded border border-border p-3 text-sm"
          >
            <span className="text-foreground/70">{desc}</span>
            <kbd className="rounded border border-border bg-accent-dim/30 px-2 py-1 text-xs text-accent">
              {keys}
            </kbd>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <SectionLabel>COMMANDS</SectionLabel>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {COMMANDS.map(({ cmd, desc }) => (
          <div
            key={cmd}
            className="flex items-center justify-between rounded border border-border p-3 text-sm"
          >
            <span className="text-accent">{cmd}</span>
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
