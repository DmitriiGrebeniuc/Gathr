export function AdminEmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border p-5 text-center" style={emptyStyle}>
      <p className="font-medium text-foreground">{title}</p>
      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

const emptyStyle = {
  borderColor: 'var(--border-subtle)',
  backgroundColor: 'var(--surface-strong)',
} as const;
