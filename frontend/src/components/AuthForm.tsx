export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-sm rounded border border-border p-6">
      <h1 className="flex items-center gap-3 text-lg font-bold">
        <span className="text-accent">&gt;_</span> {title}
      </h1>
      <p className="mt-2 text-sm text-foreground/50">{subtitle}</p>
      <div className="mt-6 flex flex-col gap-4">{children}</div>
      {footer && (
        <div className="mt-6 border-t border-border pt-4 text-center text-sm text-foreground/50">
          {footer}
        </div>
      )}
    </div>
  );
}

export function Field({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-foreground/70">{label}</span>
      <input
        {...props}
        className={`rounded border bg-transparent px-3 py-2 outline-none placeholder:text-foreground/60 ${
          error ? "border-red-500/60" : "border-border focus:border-accent/60"
        }`}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </label>
  );
}
