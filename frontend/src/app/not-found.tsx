import Link from "next/link";
import { AuthCard } from "@/components/AuthForm";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <span className="text-accent font-bold">|&gt; REQUIFY</span>
        <span className="rounded border border-border px-2 py-0.5 text-xs text-foreground/70">
          1.0
        </span>
      </Link>

      <AuthCard title="404" subtitle="This page doesn't exist.">
        <div className="rounded border border-border p-3 text-xs text-foreground/50">
          <div>$ cd {"{requested page}"}</div>
          <div className="mt-1 text-red-400">
            bash: cd: no such file or directory
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/"
            className="flex-1 rounded bg-accent py-2 text-center text-sm font-medium text-black"
          >
            Go home
          </Link>
          <Link
            href="/generate"
            className="flex-1 rounded border border-border py-2 text-center text-sm text-foreground/70 hover:bg-accent-dim/40"
          >
            Go to Generate
          </Link>
        </div>
      </AuthCard>
    </main>
  );
}
