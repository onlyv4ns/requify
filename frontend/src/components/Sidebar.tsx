"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  FileText,
  Settings,
  HelpCircle,
  Menu,
  X,
} from "lucide-react";

const NAV = [
  { label: "Generate", href: "/generate", icon: Sparkles },
  { label: "PRDs", href: "/prds", icon: FileText },
];

const FOOTER_NAV = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help", href: "/help", icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
        className="fixed left-4 top-4 z-30 flex h-8 w-8 items-center justify-center rounded border border-border bg-background text-foreground/70 md:hidden"
      >
        <Menu size={16} />
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-20 flex w-64 shrink-0 flex-col overflow-y-auto border-r border-border bg-background p-4 transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
          className="mb-2 flex h-8 w-8 items-center justify-center self-end rounded border border-border text-foreground/70 md:hidden"
        >
          <X size={16} />
        </button>

        <Link href="/generate" className="flex items-center gap-2 border-b border-border py-1 pb-4">
          <span className="text-accent font-bold">|&gt; REQUIFY</span>
          <span className="rounded border border-border px-2 py-0.5 text-xs text-foreground/70">
            1.0
          </span>
        </Link>

      <nav className="mt-4 flex flex-col gap-1">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-2 rounded px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-accent-dim text-accent"
                  : "text-foreground/70 hover:bg-accent-dim/40"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <nav className="flex flex-col gap-1 border-t border-border pt-2">
        {FOOTER_NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-2 rounded px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-accent-dim text-accent"
                  : "text-foreground/70 hover:bg-accent-dim/40"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
      </aside>
    </>
  );
}
