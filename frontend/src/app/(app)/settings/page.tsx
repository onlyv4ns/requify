"use client";

import { PageHeader, SectionLabel } from "@/components/ui";
import { useAuth } from "@/lib/useAuth";
import { useAppDialog } from "@/components/AppDialog";
import { logout } from "@/lib/api";

export default function SettingsPage() {
  const { user } = useAuth();
  const { dialog, confirm } = useAppDialog();

  async function signOut() {
    if (!(await confirm("Sign out?", true))) return;
    await logout();
    window.location.href = "/login";
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      {dialog}
      <PageHeader title="Settings" subtitle="Your account." />

      <SectionLabel>ACCOUNT</SectionLabel>
      <div className="mt-4 flex flex-col gap-2">
        <div className="rounded border border-border p-3 text-sm">
          <div className="text-foreground/50">Name</div>
          <div>{user?.name ?? "—"}</div>
        </div>
        <div className="rounded border border-border p-3 text-sm">
          <div className="text-foreground/50">Email</div>
          <div>{user?.email ?? "—"}</div>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={signOut}
          className="rounded border border-red-500/50 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
