"use client";

import Link from "next/link";
import { ChevronDown, LogOut } from "lucide-react";
import { useAppDialog } from "@/components/AppDialog";
import { logout, type AuthUser } from "@/lib/api";

export default function ProfileMenu({ user }: { user: AuthUser }) {
  const { dialog, confirm } = useAppDialog();

  async function signOut() {
    if (!(await confirm("Sign out?", true))) return;
    await logout();
    window.location.href = "/login";
  }

  return (
    <header className="flex justify-end p-4 text-sm">
      {dialog}
      <details className="group relative [&_summary::-webkit-details-marker]:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-2 rounded border border-border px-2 py-1.5 hover:bg-accent-dim/40">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-accent-dim text-xs text-accent">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <span className="text-foreground/80">{user.name}</span>
          <ChevronDown
            size={14}
            className="text-foreground/50 transition-transform group-open:rotate-180"
          />
        </summary>
        <div className="absolute right-0 z-10 mt-1 flex w-44 flex-col gap-1 rounded border border-border bg-background p-1">
          <Link
            href="/settings"
            className="rounded px-2 py-1.5 text-foreground/70 hover:bg-accent-dim/40"
          >
            Profile & settings
          </Link>
          <button
            onClick={signOut}
            className="flex items-center gap-2 rounded px-2 py-1.5 text-left text-red-400 hover:bg-red-500/10"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </details>
    </header>
  );
}
