export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 border-b border-border pb-2 text-sm text-accent">
      <span>&gt;</span> {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
}: {
  title: React.ReactNode;
  subtitle: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="flex items-center gap-3 text-xl font-bold">
        <span className="text-accent">&gt;_</span> {title}
      </h1>
      <p className="mt-2 text-sm text-foreground/50">{subtitle}</p>
    </div>
  );
}
