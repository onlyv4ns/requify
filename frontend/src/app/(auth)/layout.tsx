import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <span className="text-accent font-bold">|&gt; REQUIFY</span>
        <span className="rounded border border-border px-2 py-0.5 text-xs text-foreground/70">
          1.0
        </span>
      </Link>
      {children}
      <div className="mt-8 text-xs text-foreground/60">
        By continuing you agree to our{" "}
        <Link href="/terms" className="underline hover:text-foreground">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/policy" className="underline hover:text-foreground">
          Privacy Policy
        </Link>
        .
      </div>
    </main>
  );
}
