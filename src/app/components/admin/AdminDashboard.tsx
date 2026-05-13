import { useEffect, useState } from 'react';
import { getAdminNeedsAttention, getAdminStats } from '../../lib/admin/adminStats';
import type { AdminAttentionItem, AdminStats } from '../../types/admin';
import { LoadingCard } from '../LoadingState';
import { AdminEmptyState } from './AdminEmptyState';
import { AdminSectionHeader } from './AdminSectionHeader';
import { AdminStatCard } from './AdminStatCard';

const initialStats: AdminStats = {
  totalUsers: null,
  totalEvents: null,
  upcomingEvents: null,
  supportRequests: null,
  bannedUsers: null,
  proUsers: null,
};

export function AdminDashboard({
  onOpenAttention,
}: {
  onOpenAttention: (item: AdminAttentionItem) => void;
}) {
  const [stats, setStats] = useState<AdminStats>(initialStats);
  const [attention, setAttention] = useState<AdminAttentionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(false);

      try {
        const [nextStats, nextAttention] = await Promise.all([
          getAdminStats(),
          getAdminNeedsAttention(),
        ]);

        if (!cancelled) {
          setStats(nextStats);
          setAttention(nextAttention);
        }
      } catch (loadError) {
        console.error('Failed to load admin stats:', loadError);

        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="space-y-4">
      <AdminSectionHeader
        title="Dashboard"
        description="A compact read on current users, events and support load."
      />

      {loading && (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <LoadingCard key={index} lines={['50%', '32%']} className="rounded-2xl border" />
          ))}
        </div>
      )}

      {!loading && error && (
        <AdminEmptyState
          title="Stats are unavailable"
          description="Current RLS or admin RPC access did not allow loading the dashboard."
        />
      )}

      {!loading && !error && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminStatCard label="Total users" value={stats.totalUsers} />
            <AdminStatCard label="Total events" value={stats.totalEvents} />
            <AdminStatCard label="Upcoming events" value={stats.upcomingEvents} />
            <AdminStatCard label="Support requests" value={stats.supportRequests} />
            <AdminStatCard label="Banned users" value={stats.bannedUsers} />
            <AdminStatCard label="Pro users" value={stats.proUsers} />
          </div>

          <div className="space-y-3 pt-2">
            <AdminSectionHeader
              title="Needs attention"
              description="Quick checks that help keep the MVP tidy."
            />
            {attention.map((item) => (
              <div key={item.id} className="rounded-2xl border p-4" style={panelStyle}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{item.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <p className="text-2xl font-semibold">{item.count === null ? '-' : item.count}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenAttention(item)}
                  className="mt-3 rounded-xl border px-4 py-2 text-sm"
                  style={{
                    borderColor: 'var(--accent-border)',
                    backgroundColor: 'var(--accent-soft)',
                    color: 'var(--accent)',
                  }}
                >
                  Open
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

const panelStyle = {
  borderColor: 'var(--border)',
  backgroundColor: 'var(--card)',
} as const;
