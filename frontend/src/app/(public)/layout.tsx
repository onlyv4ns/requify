import Link from "next/link";

const NAV = [
  { label: "Documentation", href: "/documentation" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border px-4 py-4 text-sm sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-accent font-bold">|&gt; REQUIFY</span>
          <span className="rounded border border-border px-2 py-0.5 text-xs text-foreground/70">
            1.0
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-foreground/70 md:flex">
          {NAV.map(({ label, href }) => (
            <Link key={href} href={href} className="hover:text-foreground">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-foreground/70 hover:text-foreground">
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded bg-accent px-3 py-1.5 text-xs font-medium text-black"
          >
            Get started
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border px-4 py-4 text-center text-xs text-foreground/60 sm:px-6">
        <nav className="mb-2 flex items-center justify-center gap-4 md:hidden">
          {NAV.map(({ label, href }) => (
            <Link key={href} href={href} className="hover:text-foreground">
              {label}
            </Link>
          ))}
        </nav>
        <span>&copy; {new Date().getFullYear()} Nexa.</span>{" "}
        <Link href="/terms" className="hover:text-foreground">
          Terms
        </Link>{" "}
        &middot;{" "}
        <Link href="/policy" className="hover:text-foreground">
          Privacy Policy
        </Link>
      </footer>
    </div>
  );
}
