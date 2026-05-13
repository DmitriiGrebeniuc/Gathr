import { useEffect, useState } from 'react';
import { getAdminGrowthSnapshot } from '../../lib/admin/adminEvents';
import type { AdminGrowthSnapshot } from '../../types/admin';
import { LoadingCard } from '../LoadingState';
import { AdminEmptyState } from './AdminEmptyState';
import { AdminSectionHeader } from './AdminSectionHeader';

export function AdminGrowth() {
  const [snapshot, setSnapshot] = useState<AdminGrowthSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(false);

      try {
        const nextSnapshot = await getAdminGrowthSnapshot();

        if (!cancelled) {
          setSnapshot(nextSnapshot);
        }
      } catch (loadError) {
        console.error('Failed to load admin growth snapshot:', loadError);

        if (!cancelled) {
          setSnapshot(null);
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
        title="Growth"
        description="Lightweight product signals from currently available event and profile data."
      />

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <LoadingCard key={index} lines={['50%', '72%', '42%']} className="rounded-2xl border" />
          ))}
        </div>
      )}

      {!loading && error && (
        <AdminEmptyState
          title="Growth data is unavailable"
          description="The available RLS/RPC paths did not expose enough data."
        />
      )}

      {!loading && !error && snapshot && (
        <div className="space-y-4">
          {snapshot.warnings.map((warning) => (
            <div key={warning} className="rounded-2xl border p-4 text-sm" style={warningStyle}>
              {warning}
            </div>
          ))}

          <MetricList title="Events by city" items={snapshot.eventsByCity} />
          <MetricList title="Events by activity" items={snapshot.eventsByActivityType} />
          <MetricList title="Events by join mode" items={snapshot.eventsByJoinMode} />
          <MetricList title="Users by plan" items={snapshot.usersByPlan} />
          <MetricList title="Users by role" items={snapshot.usersByRole} />
          <MetricList title="Users by banned status" items={snapshot.usersByBannedStatus} />

          <div className="rounded-2xl border p-4" style={panelStyle}>
            <h3 className="font-medium">Upcoming events without participants</h3>
            {snapshot.eventsWithoutParticipants.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No zero-participant upcoming events are visible with the current data.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {snapshot.eventsWithoutParticipants.map((event) => (
                  <p key={event.id} className="text-sm text-muted-foreground">
                    {event.title}
                  </p>
                ))}
              </div>
            )}
          </div>

          <SimpleList
            title="Latest users"
            items={snapshot.latestUsers.map((user) => ({
              id: user.id,
              text: `${user.name || user.email || user.id} / ${user.plan || 'free'}`,
            }))}
          />
          <SimpleList
            title="Latest events"
            items={snapshot.latestEvents.map((event) => ({
              id: event.id,
              text: `${event.title} / ${event.city || 'Unknown city'}`,
            }))}
          />
        </div>
      )}
    </section>
  );
}

function MetricList({ title, items }: { title: string; items: Array<{ key: string; count: number }> }) {
  return (
    <div className="rounded-2xl border p-4" style={panelStyle}>
      <h3 className="font-medium">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Not enough data yet.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate text-muted-foreground">{item.key}</span>
              <span className="font-medium text-foreground">{item.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SimpleList({ title, items }: { title: string; items: Array<{ id: string; text: string }> }) {
  return (
    <div className="rounded-2xl border p-4" style={panelStyle}>
      <h3 className="font-medium">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Not enough data yet.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <p key={item.id} className="text-sm text-muted-foreground">
              {item.text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

const panelStyle = {
  borderColor: 'var(--border)',
  backgroundColor: 'var(--card)',
} as const;

const warningStyle = {
  borderColor: 'var(--warning-border)',
  backgroundColor: 'var(--warning-soft)',
  color: 'var(--warning)',
} as const;
