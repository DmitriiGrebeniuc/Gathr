import { supabase } from '../../lib/supabase';
import { logDiagnostic } from './diagnostics';

export type ReportTargetType = 'user' | 'event';

export type CreateReportInput = {
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  details?: string;
};

export type MyReportRow = {
  id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string | null;
};

export async function createReport(input: CreateReportInput) {
  const targetType = normalizeTargetType(input.target_type);
  const targetId = input.target_id.trim();
  const reason = input.reason.trim();
  const details = input.details?.trim() ? input.details.trim().slice(0, 1000) : null;

  if (!targetType) {
    throw new Error('Invalid report target type');
  }

  if (!targetId) {
    throw new Error('Report target is required');
  }

  if (!reason) {
    throw new Error('Report reason is required');
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Authentication is required to submit a report');
  }

  const { data, error } = await supabase.rpc('create_report', {
    p_target_type: targetType,
    p_target_id: targetId,
    p_reason: reason,
    p_details: details,
  });

  if (error) {
    void logDiagnostic({
      level: 'warning',
      source: 'reporting',
      eventName: 'create_report_failed',
      message: error.message,
      metadata: {
        target_type: targetType,
        target_id: targetId,
        reason,
      },
    });
    throw error;
  }

  return data as { id: string };
}

export async function getMyReports(limit = 20): Promise<MyReportRow[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return [];
  }

  const { data, error } = await supabase
    .from('reports')
    .select('id, target_type, target_id, reason, details, status, created_at')
    .eq('reporter_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return ((data as Partial<MyReportRow>[] | null) ?? [])
    .map((row) => ({
      id: row.id ?? '',
      target_type: normalizeTargetType(row.target_type) ?? 'event',
      target_id: row.target_id ?? '',
      reason: row.reason ?? '',
      details: row.details ?? null,
      status: row.status ?? 'pending',
      created_at: row.created_at ?? null,
    }))
    .filter((row) => row.id && row.target_id);
}

export async function hasRecentReport(targetType: ReportTargetType, targetId: string) {
  const normalizedTargetType = normalizeTargetType(targetType);
  const normalizedTargetId = targetId.trim();

  if (!normalizedTargetType || !normalizedTargetId) {
    return false;
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return false;
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('reports')
    .select('id')
    .eq('reporter_id', user.id)
    .eq('target_type', normalizedTargetType)
    .eq('target_id', normalizedTargetId)
    .gte('created_at', since)
    .limit(1);

  if (error) {
    console.warn('Could not check recent reports:', error);
    return false;
  }

  return ((data as Array<{ id: string }> | null) ?? []).length > 0;
}

function normalizeTargetType(value: unknown): ReportTargetType | null {
  return value === 'user' || value === 'event' ? value : null;
}
