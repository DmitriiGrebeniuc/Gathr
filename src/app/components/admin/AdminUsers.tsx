import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  getAdminUsers,
  banAdminUser,
  unbanAdminUser,
  updateAdminUserPlan,
  updateAdminUserUnlimitedAccess,
} from '../../lib/admin/adminUsers';
import type { AdminAttentionTarget, AdminUserPlan, AdminUserRow } from '../../types/admin';
import { feedback } from '../../lib/feedback';
import { LoadingCard } from '../LoadingState';
import { AdminEmptyState } from './AdminEmptyState';
import { AdminSectionHeader } from './AdminSectionHeader';

type RoleFilter = 'all' | 'admin' | 'user';
type StatusFilter = 'all' | 'active' | 'banned';
type PlanFilter = 'all' | 'free' | 'pro' | 'unlimited';
type SortMode = 'created_desc' | 'created_asc';

export function AdminUsers({
  currentAdminId,
  attentionFilter,
}: {
  currentAdminId: string | null;
  attentionFilter?: AdminAttentionTarget | null;
}) {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('created_desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mutatingUserId, setMutatingUserId] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(false);

    try {
      setUsers(await getAdminUsers());
    } catch (loadError) {
      console.error('Failed to load admin users:', loadError);
      setUsers([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (attentionFilter === 'banned-users' || attentionFilter === 'banned-users-with-reason') {
      setStatusFilter('banned');
    }

    if (attentionFilter === 'users-without-name') {
      setSearch('__missing_name__');
    }
  }, [attentionFilter]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const missingNameMode = normalizedSearch === '__missing_name__';

    return users
      .filter((user) => {
        const matchesSearch =
          !normalizedSearch ||
          missingNameMode ||
          [user.name, user.email, user.id].some((value) =>
            (value ?? '').toLowerCase().includes(normalizedSearch)
          );
        const matchesMissingName = !missingNameMode || !user.name;
        const matchesRole = roleFilter === 'all' || (user.role ?? 'user') === roleFilter;
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'banned' ? !!user.is_banned : !user.is_banned);
        const matchesPlan =
          planFilter === 'all' ||
          (planFilter === 'unlimited'
            ? !!user.has_unlimited_access
            : (user.plan ?? 'free') === planFilter);

        return matchesSearch && matchesMissingName && matchesRole && matchesStatus && matchesPlan;
      })
      .sort((a, b) => {
        const direction = sortMode === 'created_desc' ? -1 : 1;
        return direction * (getTime(a.created_at) - getTime(b.created_at));
      });
  }, [planFilter, roleFilter, search, sortMode, statusFilter, users]);

  const selectedUser =
    users.find((user) => user.id === selectedUserId) ?? filteredUsers[0] ?? null;

  const handleToggleBan = async (user: AdminUserRow) => {
    if (user.id === currentAdminId) {
      feedback.warning('You cannot ban your own admin account.');
      return;
    }

    const nextBanState = !user.is_banned;
    const reason = nextBanState
      ? window.prompt('Ban reason (visible only to admins)', user.ban_reason ?? '')?.trim()
      : undefined;

    if (nextBanState && typeof reason === 'undefined') {
      return;
    }

    const confirmed = await feedback.confirm({
      title: nextBanState ? 'Ban user?' : 'Unban user?',
      description: nextBanState
        ? 'This user will lose access until an admin unbans them.'
        : 'This user will regain access to the app.',
      confirmLabel: nextBanState ? 'Ban' : 'Unban',
      cancelLabel: 'Cancel',
    });

    if (!confirmed) {
      return;
    }

    setMutatingUserId(user.id);

    try {
      if (nextBanState) {
        await banAdminUser(user.id, reason);
      } else {
        await unbanAdminUser(user.id);
      }
      setUsers((current) =>
        current.map((item) =>
          item.id === user.id
            ? {
                ...item,
                is_banned: nextBanState,
                ban_reason: nextBanState ? reason || null : null,
                banned_at: nextBanState ? new Date().toISOString() : null,
                banned_by: nextBanState ? currentAdminId : null,
              }
            : item
        )
      );
      feedback.success(nextBanState ? 'User banned.' : 'User unbanned.');
    } catch (mutationError) {
      console.error('Failed to update ban status:', mutationError);
      feedback.error('Could not update user ban status. RLS may block this action.');
    } finally {
      setMutatingUserId(null);
    }
  };

  const handlePlanChange = async (user: AdminUserRow, plan: 'free' | 'pro') => {
    const confirmed = await feedback.confirm({
      title: `Set plan to ${plan}?`,
      description: 'This uses the current admin session and Supabase RLS.',
      confirmLabel: 'Update',
      cancelLabel: 'Cancel',
    });

    if (!confirmed) {
      return;
    }

    setMutatingUserId(user.id);

    try {
      await updateAdminUserPlan(user.id, plan);
      setUsers((current) =>
        current.map((item) => (item.id === user.id ? { ...item, plan } : item))
      );
      feedback.success('User plan updated.');
    } catch (mutationError) {
      console.error('Failed to update user plan:', mutationError);
      feedback.error('Could not update user plan. RLS may block this action.');
    } finally {
      setMutatingUserId(null);
    }
  };

  const handleUnlimitedChange = async (user: AdminUserRow) => {
    const nextValue = !user.has_unlimited_access;
    const confirmed = await feedback.confirm({
      title: nextValue ? 'Enable unlimited access?' : 'Disable unlimited access?',
      description: 'This uses the current admin session and Supabase RLS.',
      confirmLabel: 'Update',
      cancelLabel: 'Cancel',
    });

    if (!confirmed) {
      return;
    }

    setMutatingUserId(user.id);

    try {
      await updateAdminUserUnlimitedAccess(user.id, nextValue);
      setUsers((current) =>
        current.map((item) =>
          item.id === user.id ? { ...item, has_unlimited_access: nextValue } : item
        )
      );
      feedback.success('Unlimited access updated.');
    } catch (mutationError) {
      console.error('Failed to update unlimited access:', mutationError);
      feedback.error('Could not update unlimited access. RLS may block this action.');
    } finally {
      setMutatingUserId(null);
    }
  };

  return (
    <section className="space-y-4">
      <AdminSectionHeader
        title="Users"
        description="Search profiles, inspect account details and manage safe access flags."
      />

      <div className="grid gap-2 rounded-2xl border p-3" style={panelStyle}>
        <input
          value={search === '__missing_name__' ? '' : search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, email or id"
          className="w-full rounded-xl border bg-transparent px-4 py-3 text-sm outline-none"
          style={{ borderColor: 'var(--border-subtle)' }}
        />
        {search === '__missing_name__' && (
          <p className="text-xs text-muted-foreground">Showing users without a name.</p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Select value={roleFilter} onChange={(value) => setRoleFilter(value as RoleFilter)}>
            <option value="all">All roles</option>
            <option value="admin">Admins</option>
            <option value="user">Users</option>
          </Select>
          <Select value={statusFilter} onChange={(value) => setStatusFilter(value as StatusFilter)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
          </Select>
          <Select value={planFilter} onChange={(value) => setPlanFilter(value as PlanFilter)}>
            <option value="all">All plans</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="unlimited">Unlimited</option>
          </Select>
          <Select value={sortMode} onChange={(value) => setSortMode(value as SortMode)}>
            <option value="created_desc">Newest first</option>
            <option value="created_asc">Oldest first</option>
          </Select>
        </div>
      </div>

      {loading && <LoadingList />}

      {!loading && error && (
        <AdminEmptyState
          title="Users are unavailable"
          description="The current admin account could not read profiles through the available RLS/RPC path."
        />
      )}

      {!loading && !error && filteredUsers.length === 0 && (
        <AdminEmptyState title="No users found" description="Try changing search or filters." />
      )}

      {!loading && !error && filteredUsers.length > 0 && (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <article
              key={user.id}
              onClick={() => setSelectedUserId(user.id)}
              className="rounded-2xl border p-4"
              style={{
                ...panelStyle,
                borderColor:
                  selectedUser?.id === user.id ? 'var(--accent-border)' : 'var(--border)',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <h3 className="truncate font-medium">{user.name || 'Unnamed user'}</h3>
                  <p className="break-all text-xs text-muted-foreground">
                    {user.email || user.id}
                  </p>
                </div>
                <span
                  className="rounded-full border px-2 py-1 text-xs"
                  style={{
                    borderColor: user.is_banned
                      ? 'var(--destructive-border)'
                      : 'var(--success-border)',
                    color: user.is_banned ? 'var(--destructive-strong)' : 'var(--success)',
                  }}
                >
                  {user.is_banned ? 'Banned' : 'Active'}
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Meta label="Role" value={user.role || 'user'} />
                <Meta label="Plan" value={user.plan || 'free'} />
                <Meta label="Created" value={formatDate(user.created_at)} />
                <Meta label="Unlimited" value={user.has_unlimited_access ? 'Yes' : 'No'} />
              </dl>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleToggleBan(user);
                }}
                disabled={mutatingUserId === user.id || user.id === currentAdminId}
                className="mt-4 w-full rounded-xl border px-4 py-3 text-sm font-medium transition-opacity disabled:opacity-50"
                style={{
                  borderColor: 'var(--destructive-border)',
                  color: 'var(--destructive-strong)',
                  backgroundColor: 'var(--destructive-soft)',
                }}
              >
                {mutatingUserId === user.id
                  ? 'Saving...'
                  : user.is_banned
                    ? 'Unban user'
                    : 'Ban user'}
              </button>
            </article>
          ))}
        </div>
      )}

      {!loading && !error && selectedUser && (
        <div className="rounded-2xl border p-4" style={panelStyle}>
          <h3 className="font-medium">User details</h3>
          <dl className="mt-4 grid grid-cols-1 gap-3 text-sm">
            <Meta label="ID" value={selectedUser.id} />
            <Meta label="Name" value={selectedUser.name || '-'} />
            <Meta label="Email" value={selectedUser.email || '-'} />
            <Meta label="Role" value={selectedUser.role || 'user'} />
            <Meta label="Plan" value={selectedUser.plan || 'free'} />
            <Meta label="Unlimited access" value={selectedUser.has_unlimited_access ? 'Yes' : 'No'} />
            <Meta label="Banned" value={selectedUser.is_banned ? 'Yes' : 'No'} />
            <Meta label="Ban reason" value={selectedUser.ban_reason || '-'} />
            <Meta label="Banned at" value={formatDate(selectedUser.banned_at)} />
            <Meta label="Banned by" value={selectedUser.banned_by || '-'} />
            <Meta label="Created" value={formatDate(selectedUser.created_at)} />
            <Meta label="Updated" value={formatDate(selectedUser.updated_at)} />
            <Meta label="Legal version" value={selectedUser.accepted_legal_version || '-'} />
            <Meta label="Terms accepted" value={formatDate(selectedUser.accepted_terms_at)} />
            <Meta label="Privacy accepted" value={formatDate(selectedUser.accepted_privacy_at)} />
          </dl>

          <div className="mt-4 grid gap-2">
            <div className="grid grid-cols-2 gap-2">
              {(['free', 'pro'] as Array<Extract<AdminUserPlan, 'free' | 'pro'>>).map((plan) => (
                <button
                  key={plan}
                  type="button"
                  onClick={() => handlePlanChange(selectedUser, plan)}
                  disabled={mutatingUserId === selectedUser.id || selectedUser.plan === plan}
                  className="rounded-xl border px-4 py-3 text-sm disabled:opacity-50"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    backgroundColor: 'var(--surface-strong)',
                  }}
                >
                  Set {plan}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleUnlimitedChange(selectedUser)}
              disabled={mutatingUserId === selectedUser.id}
              className="rounded-xl border px-4 py-3 text-sm disabled:opacity-50"
              style={{
                borderColor: 'var(--accent-border)',
                backgroundColor: 'var(--accent-soft)',
                color: 'var(--accent)',
              }}
            >
              {selectedUser.has_unlimited_access
                ? 'Disable unlimited access'
                : 'Enable unlimited access'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-xl border bg-transparent px-3 py-3 text-sm"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      {children}
    </select>
  );
}

function LoadingList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }, (_, index) => (
        <LoadingCard key={index} lines={['48%', '78%', '54%']} className="rounded-2xl border" />
      ))}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-foreground">{value}</dd>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString();
}

function getTime(value: string | null) {
  if (!value) {
    return 0;
  }

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

const panelStyle = {
  borderColor: 'var(--border)',
  backgroundColor: 'var(--card)',
} as const;
