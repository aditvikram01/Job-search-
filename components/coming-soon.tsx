export function ComingSoon({
  title,
  phase,
  children,
}: {
  title: string;
  phase: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Coming in phase {phase}
        </p>
        <p className="mt-2">{children}</p>
      </div>
    </section>
  );
}
