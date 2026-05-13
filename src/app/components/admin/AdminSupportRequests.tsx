import { useEffect, useMemo, useState } from 'react';
import {
  getAdminSupportRequests,
  updateAdminSupportRequestNote,
  updateSupportRequestStatus,
} from '../../lib/admin/adminSupport';
import type {
  AdminAttentionTarget,
  AdminSupportFilters,
  AdminSupportRequestRow,
  AdminSupportStatus,
  AdminSupportStatusFilter,
} from '../../types/admin';
import { feedback } from '../../lib/feedback';
import { LoadingCard } from '../LoadingState';
import { AdminEmptyState } from './AdminEmptyState';
import { AdminSectionHeader } from './AdminSectionHeader';

const statusFilters: AdminSupportStatusFilter[] = ['all', 'new', 'in_progress', 'resolved'];

export function AdminSupportRequests({
  initialStatus = 'all',
  onOpenUser,
}: {
  initialStatus?: AdminSupportStatusFilter;
  onOpenUser: (filter: AdminAttentionTarget | null) => void;
}) {
  const [requests, setRequests] = useState<AdminSupportRequestRow[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [filters, setFilters] = useState<AdminSupportFilters>({
    search: '',
    status: initialStatus,
    sort: 'newest',
  });
  const [adminNoteDraft, setAdminNoteDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mutatingRequestId, setMutatingRequestId] = useState<string | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    setError(false);

    try {
      setRequests(await getAdminSupportRequests());
    } catch (loadError) {
      console.error('Failed to load support requests:', loadError);
      setRequests([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    setFilters((current) => ({ ...current, status: initialStatus }));
  }, [initialStatus]);

  const filteredRequests = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase();

    return requests
      .filter((request) => {
        const matchesStatus =
          filters.status === 'all' ? true : request.status === filters.status;
        const matchesSearch =
          !normalizedSearch ||
          [request.subject, request.message, request.user_name, request.user_id].some((value) =>
            (value ?? '').toLowerCase().includes(normalizedSearch)
          );

        return matchesStatus && matchesSearch;
      })
      .sort((a, b) =>
        filters.sort === 'newest'
          ? getTime(b.created_at) - getTime(a.created_at)
          : getTime(a.created_at) - getTime(b.created_at)
      );
  }, [filters, requests]);

  const selectedRequest = requests.find((request) => request.id === selectedRequestId) ?? null;

  useEffect(() => {
    setAdminNoteDraft(selectedRequest?.admin_note ?? '');
  }, [selectedRequest]);

  const handleStatusChange = async (requestId: string, status: AdminSupportStatus) => {
    setMutatingRequestId(requestId);

    try {
      await updateSupportRequestStatus(requestId, status);
      setRequests((current) =>
        current.map((request) =>
          request.id === requestId ? { ...request, status } : request
        )
      );
      feedback.success('Support request status updated.');
    } catch (updateError) {
      console.error('Failed to update support request:', updateError);
      feedback.error('Could not update support request status.');
    } finally {
      setMutatingRequestId(null);
    }
  };

  const handleSaveNote = async (request: AdminSupportRequestRow) => {
    setMutatingRequestId(request.id);

    try {
      await updateAdminSupportRequestNote(request.id, adminNoteDraft);
      setRequests((current) =>
        current.map((item) =>
          item.id === request.id ? { ...item, admin_note: adminNoteDraft } : item
        )
      );
      feedback.success('Admin note updated.');
    } catch (updateError) {
      console.error('Failed to update admin note:', updateError);
      feedback.error('Could not update admin note. The field or RLS may block this action.');
    } finally {
      setMutatingRequestId(null);
    }
  };

  return (
    <section className="space-y-4">
      <AdminSectionHeader
        title="Support"
        description="Inbox for support requests, statuses and admin notes when available."
      />

      <div className="grid gap-2 rounded-2xl border p-3" style={panelStyle}>
        <input
          value={filters.search}
          onChange={(event) =>
            setFilters((current) => ({ ...current, search: event.target.value }))
          }
          placeholder="Search support text or user"
          className="w-full rounded-xl border bg-transparent px-4 py-3 text-sm outline-none"
          style={{ borderColor: 'var(--border-subtle)' }}
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                status: event.target.value as AdminSupportStatusFilter,
              }))
            }
            className="rounded-xl border bg-transparent px-3 py-3 text-sm"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            {statusFilters.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
          <select
            value={filters.sort}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                sort: event.target.value as AdminSupportFilters['sort'],
              }))
            }
            className="rounded-xl border bg-transparent px-3 py-3 text-sm"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      {loading && <LoadingList />}

      {!loading && error && (
        <AdminEmptyState
          title="Support requests are unavailable"
          description="The current admin account could not read support requests."
        />
      )}

      {!loading && !error && filteredRequests.length === 0 && (
        <AdminEmptyState title="No support requests" description="Nothing matches these filters." />
      )}

      {!loading && !error && filteredRequests.length > 0 && (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <article
              key={request.id}
              onClick={() => setSelectedRequestId((current) => (current === request.id ? null : request.id))}
              className="rounded-2xl border p-4"
              style={{
                ...panelStyle,
                borderColor:
                  selectedRequest?.id === request.id ? 'var(--accent-border)' : 'var(--border)',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-medium">{request.subject || 'Support request'}</h3>
                  <p className="mt-1 break-all text-xs text-muted-foreground">
                    {request.user_name || request.user_id || 'Unknown user'}
                  </p>
                </div>
                <span className="rounded-full border px-2 py-1 text-xs" style={badgeStyle}>
                  {statusLabel(request.status)}
                </span>
              </div>

              <p className="mt-4 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {request.message || 'No message'}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Submitted: {formatDate(request.created_at)}
              </p>

              {selectedRequestId === request.id && (
                <div
                  className="mt-4 rounded-2xl border p-4"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    backgroundColor: 'var(--background)',
                  }}
                >
                  <h3 className="font-medium">Request card</h3>
                  <dl className="mt-4 grid grid-cols-1 gap-3 text-sm">
                    <Meta label="ID" value={request.id} />
                    <Meta label="User" value={request.user_name || request.user_id || '-'} />
                    <Meta label="Subject" value={request.subject || '-'} />
                    <Meta label="Created" value={formatDate(request.created_at)} />
                    <Meta label="Status" value={statusLabel(request.status)} />
                  </dl>
                  <p className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground">
                    {request.message || 'No message'}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(['new', 'in_progress', 'resolved'] as AdminSupportStatus[]).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleStatusChange(request.id, status);
                        }}
                        disabled={request.status === status || mutatingRequestId === request.id}
                        className="rounded-xl border px-3 py-2 text-xs transition-opacity disabled:opacity-50"
                        style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--surface-strong)' }}
                      >
                        {statusLabel(status)}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenUser(null);
                      }}
                      className="rounded-xl border px-3 py-2 text-xs"
                      style={{ borderColor: 'var(--accent-border)', backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
                    >
                      Open user
                    </button>
                  </div>

                  <div className="mt-4" onClick={(event) => event.stopPropagation()}>
                    <label className="text-xs text-muted-foreground">Admin note</label>
                    {request.can_edit_admin_note ? (
                      <>
                        <textarea
                          value={adminNoteDraft}
                          onChange={(event) => setAdminNoteDraft(event.target.value)}
                          className="mt-2 min-h-24 w-full rounded-xl border bg-transparent p-3 text-sm"
                          style={{ borderColor: 'var(--border-subtle)' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveNote(request)}
                          disabled={mutatingRequestId === request.id}
                          className="mt-2 rounded-xl border px-4 py-2 text-sm disabled:opacity-50"
                          style={{ borderColor: 'var(--accent-border)', backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
                        >
                          Save note
                        </button>
                      </>
                    ) : (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Read-only: admin_note is not exposed by the current support_requests shape. TODO:
                        enable this when the column is available through RLS.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function LoadingList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }, (_, index) => (
        <LoadingCard key={index} lines={['46%', '80%', '36%']} className="rounded-2xl border" />
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

function statusLabel(status: AdminSupportStatusFilter) {
  if (status === 'in_progress') {
    return 'In progress';
  }

  return status === 'all' ? 'All' : status[0].toUpperCase() + status.slice(1);
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

const badgeStyle = {
  borderColor: 'var(--border-subtle)',
  backgroundColor: 'var(--surface-strong)',
} as const;
