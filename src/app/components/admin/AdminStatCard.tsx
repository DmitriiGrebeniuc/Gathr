export function AdminStatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | null;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border p-4" style={cardStyle}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">
        {value === null ? '—' : value.toLocaleString()}
      </p>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const cardStyle = {
  borderColor: 'var(--border)',
  backgroundColor: 'var(--card)',
} as const;
