import { supabase } from '../../../lib/supabase';
import type { AdminUserPlan, AdminUserRow } from '../../types/admin';
import { tryLogAdminAction } from './adminAudit';

type AdminUserRaw = Partial<AdminUserRow> & {
  user_name?: string | null;
};

const normalizeUser = (row: AdminUserRaw): AdminUserRow => ({
  id: String(row.id ?? ''),
  name: row.name ?? row.user_name ?? null,
  email: row.email ?? null,
  role: row.role ?? null,
  plan: row.plan ?? null,
  has_unlimited_access: row.has_unlimited_access ?? null,
  is_banned: row.is_banned ?? null,
  created_at: row.created_at ?? null,
  updated_at: row.updated_at ?? null,
  accepted_legal_version: row.accepted_legal_version ?? null,
  accepted_terms_at: row.accepted_terms_at ?? null,
  accepted_privacy_at: row.accepted_privacy_at ?? null,
  ban_reason: row.ban_reason ?? null,
  banned_at: row.banned_at ?? null,
  banned_by: row.banned_by ?? null,
});

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  const rpcResult = await supabase.rpc('admin_list_profiles');

  if (!rpcResult.error && Array.isArray(rpcResult.data)) {
    return (rpcResult.data as AdminUserRaw[])
      .map(normalizeUser)
      .filter((user) => user.id)
      .sort(sortUsersByCreatedAt);
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, name, email, role, plan, has_unlimited_access, is_banned, created_at, updated_at, accepted_legal_version, accepted_terms_at, accepted_privacy_at, ban_reason, banned_at, banned_by'
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return ((data as AdminUserRaw[] | null) ?? [])
    .map(normalizeUser)
    .filter((user) => user.id)
    .sort(sortUsersByCreatedAt);
}

export async function updateUserBanStatus(userId: string, isBanned: boolean) {
  return updateAdminUserBanStatus(userId, isBanned);
}

export async function updateAdminUserBanStatus(
  userId: string,
  isBanned: boolean,
  reason?: string
) {
  if (isBanned) {
    return banAdminUser(userId, reason);
  }

  return unbanAdminUser(userId);
}

export async function banAdminUser(userId: string, reason?: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const payload = {
    is_banned: true,
    ban_reason: reason?.trim() || null,
    banned_at: new Date().toISOString(),
    banned_by: user?.id ?? null,
  };

  const { error } = await supabase.from('profiles').update(payload).eq('id', userId);

  if (error) {
    throw error;
  }

  await tryLogAdminAction({
    action: 'user.ban',
    targetType: 'user',
    targetId: userId,
    newValue: payload,
  });
}

export async function unbanAdminUser(userId: string) {
  const payload = {
    is_banned: false,
    ban_reason: null,
    banned_at: null,
    banned_by: null,
  };
  const { error } = await supabase.from('profiles').update(payload).eq('id', userId);

  if (error) {
    throw error;
  }

  await tryLogAdminAction({
    action: 'user.unban',
    targetType: 'user',
    targetId: userId,
    newValue: payload,
  });
}

export async function updateAdminUserPlan(userId: string, plan: Extract<AdminUserPlan, 'free' | 'pro'>) {
  const { error } = await supabase
    .from('profiles')
    .update({ plan })
    .eq('id', userId);

  if (error) {
    throw error;
  }

  await tryLogAdminAction({
    action: 'user.plan_update',
    targetType: 'user',
    targetId: userId,
    newValue: { plan },
  });
}

export async function updateAdminUserUnlimitedAccess(
  userId: string,
  hasUnlimitedAccess: boolean
) {
  const { error } = await supabase
    .from('profiles')
    .update({ has_unlimited_access: hasUnlimitedAccess })
    .eq('id', userId);

  if (error) {
    throw error;
  }

  await tryLogAdminAction({
    action: 'user.unlimited_update',
    targetType: 'user',
    targetId: userId,
    newValue: { has_unlimited_access: hasUnlimitedAccess },
  });
}

function sortUsersByCreatedAt(a: AdminUserRow, b: AdminUserRow) {
  const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
  const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;

  if (!Number.isNaN(aTime) && !Number.isNaN(bTime) && aTime !== bTime) {
    return bTime - aTime;
  }

  return (a.name ?? '').localeCompare(b.name ?? '');
}
