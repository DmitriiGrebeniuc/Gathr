import { useEffect, useState } from 'react';
import { feedback } from '../../lib/feedback';
import { getRecentAdminAuditLog } from '../../lib/admin/adminAudit';
import {
  getAdminReports,
  updateAdminReportNote,
  updateAdminReportStatus,
} from '../../lib/admin/adminReports';
import type {
  AdminAuditLogRow,
  AdminReportFilters,
  AdminReportRow,
  AdminReportStatus,
} from '../../types/admin';
import { LoadingCard } from '../LoadingState';
import { AdminEmptyState } from './AdminEmptyState';
import { AdminSectionHeader } from './AdminSectionHeader';

const initialFilters: AdminReportFilters = {
  status: 'all',
  targetType: 'all',
  search: '',
};

export function AdminModeration() {
  const [filters, setFilters] = useState<AdminReportFilters>(initialFilters);
  const [reports, setReports] = useState<AdminReportRow[]>([]);
  const [audit, setAudit] = useState<AdminAuditLogRow[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const [nextReports, nextAudit] = await Promise.all([
        getAdminReports(filters),
        getRecentAdminAuditLog(12).catch(() => []),
      ]);

      setReports(nextReports);
      setAudit(nextAudit);

      if (selectedReportId && !nextReports.some((report) => report.id === selectedReportId)) {
        setSelectedReportId(null);
        setNoteDraft('');
      }
    } catch (loadError) {
      console.error('Failed to load moderation data:', loadError);
      setError('Moderation data is unavailable with the current admin session or RLS rules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.targetType, filters.search]);

  const openReport = (report: AdminReportRow) => {
    setSelectedReportId(report.id);
    setNoteDraft(report.admin_note ?? '');
  };

  const changeStatus = async (report: AdminReportRow, status: AdminReportStatus) => {
    if (status === 'resolved' || status === 'rejected') {
      const confirmed = await feedback.confirm({
        title: status === 'resolved' ? 'Resolve report?' : 'Reject report?',
        description: 'This will mark the report as reviewed in the admin inbox.',
        confirmLabel: status === 'resolved' ? 'Resolve' : 'Reject',
        cancelLabel: 'Cancel',
        variant: status === 'rejected' ? 'destructive' : 'default',
      });

      if (!confirmed) {
        return;
      }
    }

    setMutating(true);

    try {
      await updateAdminReportStatus(report.id, status, noteDraft);
      feedback.success('Report updated');
      await load();
    } catch (mutationError) {
      console.error('Failed to update report:', mutationError);
      feedback.error('Could not update report');
    } finally {
      setMutating(false);
    }
  };

  const saveNote = async (report: AdminReportRow) => {
    setMutating(true);

    try {
      await updateAdminReportNote(report.id, noteDraft);
      feedback.success('Admin note saved');
      await load();
    } catch (mutationError) {
      console.error('Failed to save report note:', mutationError);
      feedback.error('Could not save admin note');
    } finally {
      setMutating(false);
    }
  };

  return (
    <section className="space-y-5">
      <AdminSectionHeader
        title="Moderation"
        description="Reports inbox and recent tracked admin actions."
      />

      <div className="space-y-3 rounded-2xl border p-4" style={panelStyle}>
        <AdminSectionHeader title="Reports inbox" description="Review user reports without leaving admin." />

        <div className="grid gap-2 sm:grid-cols-3">
          <input
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="Search reports"
            className="rounded-xl border bg-background px-3 py-2 text-sm outline-none"
          />
          <select
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                status: event.target.value as AdminReportFilters['status'],
              }))
            }
            className="rounded-xl border bg-background px-3 py-2 text-sm outline-none"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={filters.targetType}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                targetType: event.target.value as AdminReportFilters['targetType'],
              }))
            }
            className="rounded-xl border bg-background px-3 py-2 text-sm outline-none"
          >
            <option value="all">All targets</option>
            <option value="event">Events</option>
            <option value="user">Users</option>
          </select>
        </div>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, index) => (
              <LoadingCard key={index} lines={['60%', '90%', '45%']} className="rounded-2xl border" />
            ))}
          </div>
        )}

        {!loading && error && <AdminEmptyState title="Reports unavailable" description={error} />}

        {!loading && !error && reports.length === 0 && (
          <AdminEmptyState
            title="No reports found"
            description="There are no reports matching the current filters."
          />
        )}

        {!loading && !error && reports.length > 0 && (
          <div className="space-y-3">
            {reports.map((report) => (
              <article
                key={report.id}
                className="rounded-2xl border p-4"
                style={selectedReportId === report.id ? selectedPanelStyle : nestedPanelStyle}
              >
                <button
                  type="button"
                  onClick={() => openReport(report)}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{report.reason}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {report.target_type} · {report.target_id}
                      </p>
                    </div>
                    <span className="rounded-full border px-2 py-1 text-xs">{report.status}</span>
                  </div>
                  {report.details && (
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{report.details}</p>
                  )}
                  <div className="mt-3 grid gap-1 text-xs text-muted-foreground">
                    <span>Reporter: {report.reporter_id}</span>
                    <span>Created: {formatDateTime(report.created_at)}</span>
                    <span>Resolved: {formatDateTime(report.resolved_at)}</span>
                    <span>Resolved by: {report.resolved_by ?? '-'}</span>
                  </div>
                </button>

                {selectedReportId === report.id && (
                  <div className="mt-4 space-y-3">
                    <textarea
                      value={noteDraft}
                      onChange={(event) => setNoteDraft(event.target.value)}
                      placeholder="Admin note"
                      rows={3}
                      className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none"
                    />
                    <div className="grid gap-2 sm:grid-cols-4">
                      <ActionButton
                        disabled={mutating}
                        label="Reviewing"
                        onClick={() => changeStatus(report, 'reviewing')}
                      />
                      <ActionButton
                        disabled={mutating}
                        label="Resolve"
                        onClick={() => changeStatus(report, 'resolved')}
                      />
                      <ActionButton
                        disabled={mutating}
                        label="Reject"
                        destructive
                        onClick={() => changeStatus(report, 'rejected')}
                      />
                      <ActionButton disabled={mutating} label="Save note" onClick={() => saveNote(report)} />
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3 rounded-2xl border p-4" style={panelStyle}>
        <AdminSectionHeader
          title="Recent admin actions"
          description="Compact audit trail for important admin changes."
        />
        {audit.length === 0 ? (
          <AdminEmptyState
            title="No audit actions"
            description="Audit entries will appear after admin actions are logged."
          />
        ) : (
          <div className="space-y-3">
            {audit.map((item) => (
              <article key={item.id} className="rounded-2xl border p-4" style={nestedPanelStyle}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{item.action}</p>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {item.target_type}
                      {item.target_id ? ` · ${item.target_id}` : ''}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs text-muted-foreground">
                    {formatDateTime(item.created_at)}
                  </p>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
                  <span>Admin: {item.admin_id}</span>
                  <JsonPreview label="Old" value={item.old_value} />
                  <JsonPreview label="New" value={item.new_value} />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ActionButton({
  label,
  disabled,
  destructive = false,
  onClick,
}: {
  label: string;
  disabled: boolean;
  destructive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-xl border px-3 py-2 text-sm font-medium disabled:opacity-60"
      style={{
        borderColor: destructive ? 'rgb(244 63 94 / 0.45)' : 'var(--accent-border)',
        color: destructive ? 'rgb(244 63 94)' : 'var(--accent)',
        backgroundColor: destructive ? 'rgb(244 63 94 / 0.08)' : 'var(--accent-soft)',
      }}
    >
      {label}
    </button>
  );
}

function JsonPreview({ label, value }: { label: string; value: unknown | null }) {
  if (value === null || typeof value === 'undefined') {
    return <span>{label}: -</span>;
  }

  return (
    <span className="truncate">
      {label}: {JSON.stringify(value)}
    </span>
  );
}

function formatDateTime(value: string | null) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString();
}

const panelStyle = {
  borderColor: 'var(--border)',
  backgroundColor: 'var(--card)',
} as const;

const nestedPanelStyle = {
  borderColor: 'var(--border)',
  backgroundColor: 'var(--background)',
} as const;

const selectedPanelStyle = {
  borderColor: 'var(--accent-border)',
  backgroundColor: 'var(--accent-soft)',
} as const;
