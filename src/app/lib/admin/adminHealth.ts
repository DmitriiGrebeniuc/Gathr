import { supabase } from '../../../lib/supabase';
import type {
  AdminDiagnosticLevel,
  AdminDiagnosticRow,
  AdminDiagnosticsFilters,
  AdminHealthSummary,
} from '../../types/admin';

type DiagnosticRaw = Partial<AdminDiagnosticRow> & {
  level?: string | null;
};

export async function getAdminDiagnostics(
  filters: AdminDiagnosticsFilters,
  limit = 80
): Promise<AdminDiagnosticRow[]> {
  let query = supabase
    .from('app_diagnostics')
    .select('id, user_id, level, source, event_name, message, metadata, url, user_agent, app_version, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (filters.level !== 'all') {
    query = query.eq('level', filters.level);
  }

  if (filters.source.trim()) {
    query = query.eq('source', filters.source.trim());
  }

  if (filters.since) {
    query = query.gte('created_at', filters.since);
  }

  if (filters.userId.trim()) {
    query = query.eq('user_id', filters.userId.trim());
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const search = filters.search.trim().toLowerCase();
  const rows = normalizeDiagnostics((data as DiagnosticRaw[] | null) ?? []);

  if (!search) {
    return rows;
  }

  return rows.filter((item) =>
    [
      item.level,
      item.source,
      item.event_name,
      item.message ?? '',
      item.user_id ?? '',
      item.url ?? '',
      JSON.stringify(item.metadata ?? ''),
    ]
      .join(' ')
      .toLowerCase()
      .includes(search)
  );
}

export async function getAdminHealthSummary(): Promise<AdminHealthSummary> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('app_diagnostics')
    .select('id, user_id, level, source, event_name, created_at')
    .gte('created_at', since)
    .limit(1000);

  if (error) {
    throw error;
  }

  const rows = normalizeDiagnostics((data as DiagnosticRaw[] | null) ?? []);
  const sourceCounts = rows.reduce<Record<string, number>>((acc, row) => {
    const source = row.source || 'unknown';
    acc[source] = (acc[source] ?? 0) + 1;
    return acc;
  }, {});

  return {
    errorsLast24h: rows.filter((row) => row.level === 'error').length,
    warningsLast24h: rows.filter((row) => row.level === 'warning').length,
    authIssuesLast24h: rows.filter((row) => row.source === 'auth').length,
    telegramAuthIssuesLast24h: rows.filter((row) => row.source === 'telegram').length,
    uniqueAffectedUsersLast24h: new Set(rows.map((row) => row.user_id).filter(Boolean)).size,
    sourceBreakdown: Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count),
  };
}

export async function getRecentErrors(limit = 10): Promise<AdminDiagnosticRow[]> {
  return getAdminDiagnostics(
    {
      level: 'error',
      source: '',
      search: '',
      since: '',
      userId: '',
    },
    limit
  );
}

export async function getDiagnosticsBySource() {
  const summary = await getAdminHealthSummary();
  return summary.sourceBreakdown;
}

function normalizeDiagnostics(rows: DiagnosticRaw[]): AdminDiagnosticRow[] {
  return rows
    .map((row) => ({
      id: row.id ?? '',
      user_id: row.user_id ?? null,
      level: normalizeLevel(row.level),
      source: row.source || 'unknown',
      event_name: row.event_name || 'unknown_event',
      message: row.message ?? null,
      metadata: row.metadata ?? null,
      url: row.url ?? null,
      user_agent: row.user_agent ?? null,
      app_version: row.app_version ?? null,
      created_at: row.created_at ?? null,
    }))
    .filter((row) => row.id);
}

function normalizeLevel(value: string | null | undefined): AdminDiagnosticLevel {
  if (value === 'debug' || value === 'info' || value === 'warning' || value === 'error') {
    return value;
  }

  return 'info';
}
