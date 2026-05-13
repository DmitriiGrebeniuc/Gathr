import { supabase } from '../../../lib/supabase';
import type {
  AdminReportFilters,
  AdminReportRow,
  AdminReportStatus,
  AdminReportTargetType,
} from '../../types/admin';
import { tryLogAdminAction } from './adminAudit';

type AdminReportRaw = Partial<AdminReportRow> & {
  target_type?: string | null;
  status?: string | null;
};

export async function getAdminReports(filters: AdminReportFilters): Promise<AdminReportRow[]> {
  let query = supabase
    .from('reports')
    .select(
      'id, reporter_id, target_type, target_id, reason, details, status, admin_note, resolved_at, resolved_by, created_at'
    )
    .order('created_at', { ascending: false });

  if (filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters.targetType !== 'all') {
    query = query.eq('target_type', filters.targetType);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const search = filters.search.trim().toLowerCase();
  const rows = normalizeReportRows((data as AdminReportRaw[] | null) ?? []);

  if (!search) {
    return rows;
  }

  return rows.filter((report) =>
    [
      report.reporter_id,
      report.target_id,
      report.target_type,
      report.reason,
      report.details ?? '',
      report.status,
      report.admin_note ?? '',
    ]
      .join(' ')
      .toLowerCase()
      .includes(search)
  );
}

export async function updateAdminReportStatus(
  reportId: string,
  status: AdminReportStatus,
  adminNote?: string
) {
  const updatePayload: Record<string, string | null> = { status };

  if (typeof adminNote === 'string') {
    updatePayload.admin_note = adminNote;
  }

  if (status === 'resolved' || status === 'rejected') {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    updatePayload.resolved_at = new Date().toISOString();
    updatePayload.resolved_by = user?.id ?? null;
  } else {
    updatePayload.resolved_at = null;
    updatePayload.resolved_by = null;
  }

  const { error } = await supabase.from('reports').update(updatePayload).eq('id', reportId);

  if (error) {
    throw error;
  }

  await tryLogAdminAction({
    action: 'report.status_update',
    targetType: 'report',
    targetId: reportId,
    newValue: updatePayload,
  });
}

export async function updateAdminReportNote(reportId: string, adminNote: string) {
  const { error } = await supabase
    .from('reports')
    .update({ admin_note: adminNote })
    .eq('id', reportId);

  if (error) {
    throw error;
  }

  await tryLogAdminAction({
    action: 'report.note_update',
    targetType: 'report',
    targetId: reportId,
    newValue: { admin_note: adminNote },
  });
}

export async function getReportTargetSummary(report: AdminReportRow): Promise<string> {
  try {
    if (report.target_type === 'user') {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', report.target_id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      const profile = data as { name?: string | null; email?: string | null } | null;
      return profile?.name || profile?.email || `User ${report.target_id}`;
    }

    const { data, error } = await supabase
      .from('events')
      .select('title, city')
      .eq('id', report.target_id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const event = data as { title?: string | null; city?: string | null } | null;
    return [event?.title || `Event ${report.target_id}`, event?.city].filter(Boolean).join(' · ');
  } catch {
    return `${report.target_type} ${report.target_id}`;
  }
}

function normalizeReportRows(rows: AdminReportRaw[]): AdminReportRow[] {
  return rows
    .map((row) => ({
      id: row.id ?? '',
      reporter_id: row.reporter_id ?? '',
      target_type: normalizeTargetType(row.target_type),
      target_id: row.target_id ?? '',
      reason: row.reason ?? '',
      details: row.details ?? null,
      status: normalizeStatus(row.status),
      admin_note: row.admin_note ?? null,
      resolved_at: row.resolved_at ?? null,
      resolved_by: row.resolved_by ?? null,
      created_at: row.created_at ?? null,
    }))
    .filter((report) => report.id && report.reporter_id && report.target_id);
}

function normalizeStatus(value: string | null | undefined): AdminReportStatus {
  if (value === 'reviewing' || value === 'resolved' || value === 'rejected') {
    return value;
  }

  return 'pending';
}

function normalizeTargetType(value: string | null | undefined): AdminReportTargetType {
  return value === 'user' ? 'user' : 'event';
}
