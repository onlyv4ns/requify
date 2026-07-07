import { PageHeader, SectionLabel } from "@/components/ui";

const FEATURES = [
  { name: "Chat", desc: "Ask questions, get code, or explore ideas in a running conversation." },
  { name: "Code", desc: "Keep files in a workspace, run them, and generate new code from a prompt." },
  { name: "Explore", desc: "Browse curated prompt ideas across code, data, and writing." },
  { name: "Projects", desc: "Group related chats and files together under one project." },
];

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

export default function DocumentationPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <PageHeader
        title="Documentation"
        subtitle="Everything you need to get around Nexa."
      />

      <SectionLabel>GETTING STARTED</SectionLabel>
      <p className="mt-4 text-sm text-foreground/70">
        Sign in, then start typing in the Chat box on the home screen — no
        setup required. Every feature below works without connecting an API
        key; wire one up in Settings once you're ready for real model
        responses.
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
        <SectionLabel>KEYBOARD SHORTCUTS</SectionLabel>
      </div>
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
    </div>
  );
}
