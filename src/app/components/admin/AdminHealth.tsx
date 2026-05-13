import { useEffect, useState } from 'react';
import { getAdminDiagnostics, getAdminHealthSummary } from '../../lib/admin/adminHealth';
import type { AdminDiagnosticRow, AdminDiagnosticsFilters, AdminHealthSummary } from '../../types/admin';
import { feedback } from '../../lib/feedback';
import { LoadingCard } from '../LoadingState';
import { AdminEmptyState } from './AdminEmptyState';
import { AdminSectionHeader } from './AdminSectionHeader';
import { AdminStatCard } from './AdminStatCard';

const initialFilters: AdminDiagnosticsFilters = {
  level: 'all',
  source: '',
  search: '',
  since: '',
  userId: '',
};

const emptySummary: AdminHealthSummary = {
  errorsLast24h: 0,
  warningsLast24h: 0,
  authIssuesLast24h: 0,
  telegramAuthIssuesLast24h: 0,
  uniqueAffectedUsersLast24h: 0,
  sourceBreakdown: [],
};

export function AdminHealth() {
  const [filters, setFilters] = useState<AdminDiagnosticsFilters>(initialFilters);
  const [summary, setSummary] = useState<AdminHealthSummary>(emptySummary);
  const [diagnostics, setDiagnostics] = useState<AdminDiagnosticRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const [nextSummary, nextDiagnostics] = await Promise.all([
        getAdminHealthSummary(),
        getAdminDiagnostics(filters),
      ]);
      setSummary(nextSummary);
      setDiagnostics(nextDiagnostics);
    } catch (loadError) {
      console.error('Failed to load admin health:', loadError);
      setError('Diagnostics are unavailable for the current admin session or RLS policy.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.level, filters.source, filters.search, filters.since, filters.userId]);

  const copyText = async (label: string, value: string) => {
    await navigator.clipboard?.writeText(value);
    feedback.success(`${label} copied.`);
  };

  return (
    <section className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <AdminSectionHeader
          title="Health"
          description="Internal diagnostics for auth, Supabase operations and client issues."
        />
        <button
          type="button"
          onClick={load}
          className="rounded-xl border px-4 py-2 text-sm"
          style={{ borderColor: 'var(--accent-border)', color: 'var(--accent)' }}
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 5 }, (_, index) => (
            <LoadingCard key={index} lines={['56%', '32%']} className="rounded-2xl border" />
          ))}
        </div>
      )}

      {!loading && error && <AdminEmptyState title="Health unavailable" description={error} />}

      {!loading && !error && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminStatCard label="Errors 24h" value={summary.errorsLast24h} />
            <AdminStatCard label="Warnings 24h" value={summary.warningsLast24h} />
            <AdminStatCard label="Auth issues 24h" value={summary.authIssuesLast24h} />
            <AdminStatCard label="Telegram issues 24h" value={summary.telegramAuthIssuesLast24h} />
            <AdminStatCard label="Affected users 24h" value={summary.uniqueAffectedUsersLast24h} />
          </div>

          <div className="grid gap-2 rounded-2xl border p-3" style={panelStyle}>
            <input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Search diagnostics"
              className="rounded-xl border bg-background px-3 py-2 text-sm outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={filters.level}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    level: event.target.value as AdminDiagnosticsFilters['level'],
                  }))
                }
                className="rounded-xl border bg-background px-3 py-2 text-sm outline-none"
              >
                <option value="all">All levels</option>
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
              <select
                value={filters.source}
                onChange={(event) => setFilters((current) => ({ ...current, source: event.target.value }))}
                className="rounded-xl border bg-background px-3 py-2 text-sm outline-none"
              >
                <option value="">All sources</option>
                {['auth', 'telegram', 'supabase', 'admin', 'reporting', 'ui', 'unknown'].map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <AdminSectionHeader title="Source breakdown" description="Diagnostics grouped by source." />
            {summary.sourceBreakdown.length === 0 ? (
              <AdminEmptyState title="No source data" description="No diagnostics in the last 24 hours." />
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {summary.sourceBreakdown.map((item) => (
                  <div key={item.source} className="rounded-2xl border p-4" style={panelStyle}>
                    <p className="font-medium">{item.source}</p>
                    <p className="mt-1 text-2xl font-semibold">{item.count}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <AdminSectionHeader title="Recent diagnostics" description="Newest events first." />
            {diagnostics.length === 0 ? (
              <AdminEmptyState title="No diagnostics found" description="Try changing filters or refresh later." />
            ) : (
              diagnostics.map((item) => (
                <article key={item.id} className="rounded-2xl border p-4" style={panelStyle}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {item.level} / {item.source}
                      </p>
                      <p className="mt-1 text-sm">{item.event_name}</p>
                      {item.message && (
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.message}</p>
                      )}
                    </div>
                    <p className="shrink-0 text-xs text-muted-foreground">{formatDate(item.created_at)}</p>
                  </div>
                  <div className="mt-3 grid gap-1 text-xs text-muted-foreground">
                    <span>User: {item.user_id ?? '-'}</span>
                    <span className="break-all">URL: {item.url ?? '-'}</span>
                    <span>App: {item.app_version ?? '-'}</span>
                  </div>
                  <details className="mt-3 text-xs">
                    <summary className="cursor-pointer text-muted-foreground">Metadata</summary>
                    <pre className="mt-2 max-h-52 overflow-auto rounded-xl border p-3 text-xs" style={nestedStyle}>
                      {JSON.stringify(item.metadata ?? {}, null, 2)}
                    </pre>
                  </details>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyText('Diagnostic id', item.id)}
                      className="rounded-xl border px-3 py-2 text-xs"
                    >
                      Copy id
                    </button>
                    <button
                      type="button"
                      onClick={() => copyText('Metadata', JSON.stringify(item.metadata ?? {}, null, 2))}
                      className="rounded-xl border px-3 py-2 text-xs"
                    >
                      Copy metadata
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </>
      )}
    </section>
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString();
}

const panelStyle = {
  borderColor: 'var(--border)',
  backgroundColor: 'var(--card)',
} as const;

const nestedStyle = {
  borderColor: 'var(--border)',
  backgroundColor: 'var(--background)',
} as const;
