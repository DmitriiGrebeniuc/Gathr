import { supabase } from '../../../lib/supabase';
import type {
  AdminAuditAction,
  AdminAuditFilters,
  AdminAuditLogRow,
  AdminAuditTargetType,
} from '../../types/admin';

type AdminAuditRaw = Partial<AdminAuditLogRow>;

export async function logAdminAction({
  action,
  targetType,
  targetId,
  oldValue = null,
  newValue = null,
}: {
  action: AdminAuditAction;
  targetType: AdminAuditTargetType;
  targetId: string | null;
  oldValue?: unknown | null;
  newValue?: unknown | null;
}) {
  const { error } = await supabase.rpc('log_admin_action', {
    p_action: action,
    p_target_type: targetType,
    p_target_id: targetId,
    p_old_value: oldValue,
    p_new_value: newValue,
  });

  if (error) {
    throw error;
  }
}

export async function tryLogAdminAction(
  params: Parameters<typeof logAdminAction>[0]
): Promise<boolean> {
  try {
    await logAdminAction(params);
    return true;
  } catch (error) {
    console.warn('Admin action succeeded, but audit log was not written:', error);
    return false;
  }
}

export async function getRecentAdminAuditLog(limit = 8): Promise<AdminAuditLogRow[]> {
  const { data, error } = await supabase
    .from('admin_audit_log')
    .select('id, admin_id, action, target_type, target_id, old_value, new_value, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return normalizeAuditRows((data as AdminAuditRaw[] | null) ?? []);
}

export async function getAdminAuditLog(
  filters: AdminAuditFilters,
  limit = 50
): Promise<AdminAuditLogRow[]> {
  let query = supabase
    .from('admin_audit_log')
    .select('id, admin_id, action, target_type, target_id, old_value, new_value, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (filters.action.trim()) {
    query = query.ilike('action', `%${filters.action.trim()}%`);
  }

  if (filters.targetType !== 'all') {
    query = query.eq('target_type', filters.targetType);
  }

  if (filters.adminId.trim()) {
    query = query.eq('admin_id', filters.adminId.trim());
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return normalizeAuditRows((data as AdminAuditRaw[] | null) ?? []);
}

function normalizeAuditRows(rows: AdminAuditRaw[]): AdminAuditLogRow[] {
  return rows
    .map((row) => ({
      id: row.id ?? '',
      admin_id: row.admin_id ?? '',
      action: row.action ?? 'system',
      target_type: row.target_type ?? 'system',
      target_id: row.target_id ?? null,
      old_value: row.old_value ?? null,
      new_value: row.new_value ?? null,
      created_at: row.created_at ?? null,
    }))
    .filter((row) => row.id);
}
