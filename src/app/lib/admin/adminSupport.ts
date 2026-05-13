import { supabase } from '../../../lib/supabase';
import type { AdminSupportRequestRow, AdminSupportStatus } from '../../types/admin';

type AdminSupportRaw = {
  id?: string;
  user_id?: string | null;
  user_name?: string | null;
  subject?: string | null;
  message?: string | null;
  description?: string | null;
  status?: string | null;
  admin_note?: string | null;
  created_at?: string | null;
};

export async function getAdminSupportRequests(): Promise<AdminSupportRequestRow[]> {
  const rpcResult = await supabase.rpc('admin_list_support_requests');

  if (!rpcResult.error && Array.isArray(rpcResult.data)) {
    return normalizeSupportRows(rpcResult.data as AdminSupportRaw[], false);
  }

  const { data, error } = await supabase
    .from('support_requests')
    .select('id, user_id, subject, message, description, status, admin_note, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    const fallback = await supabase
      .from('support_requests')
      .select('id, user_id, subject, message, description, status, created_at')
      .order('created_at', { ascending: false });

    if (fallback.error) {
      throw fallback.error;
    }

    return normalizeSupportRows((fallback.data as AdminSupportRaw[] | null) ?? [], false);
  }

  return normalizeSupportRows((data as AdminSupportRaw[] | null) ?? [], true);
}

export async function updateSupportRequestStatus(
  requestId: string,
  status: AdminSupportStatus
) {
  const { error } = await supabase.rpc('admin_update_support_request_status', {
    request_id: requestId,
    next_status: status,
  });

  if (error) {
    throw error;
  }
}

export async function updateAdminSupportRequestStatus(
  requestId: string,
  status: AdminSupportStatus
) {
  return updateSupportRequestStatus(requestId, status);
}

export async function updateAdminSupportRequestNote(requestId: string, adminNote: string) {
  const { error } = await supabase
    .from('support_requests')
    .update({ admin_note: adminNote })
    .eq('id', requestId);

  if (error) {
    throw error;
  }
}

function normalizeSupportRows(
  rows: AdminSupportRaw[],
  canEditAdminNote: boolean
): AdminSupportRequestRow[] {
  return rows
    .map((row, index) => ({
      id: row.id || `${row.user_id ?? 'support'}-${row.created_at ?? index}`,
      user_id: row.user_id ?? null,
      user_name: row.user_name ?? null,
      subject: row.subject ?? null,
      message: row.message ?? row.description ?? null,
      status: normalizeStatus(row.status),
      admin_note: row.admin_note ?? null,
      can_edit_admin_note: canEditAdminNote,
      created_at: row.created_at ?? null,
    }))
    .sort((a, b) => getTime(b.created_at) - getTime(a.created_at));
}

function normalizeStatus(value: string | null | undefined): AdminSupportStatus {
  if (value === 'in_progress' || value === 'resolved') {
    return value;
  }

  return 'new';
}

function getTime(value: string | null) {
  if (!value) {
    return 0;
  }

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}
