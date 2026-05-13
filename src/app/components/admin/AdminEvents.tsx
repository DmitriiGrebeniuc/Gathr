import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  deleteAdminEvent,
  getAdminEventParticipants,
  getAdminEvents,
  updateAdminEventVisibilityOrStatus,
} from '../../lib/admin/adminEvents';
import type {
  AdminAttentionTarget,
  AdminEventParticipantRow,
  AdminEventRow,
} from '../../types/admin';
import { feedback } from '../../lib/feedback';
import { LoadingCard } from '../LoadingState';
import { AdminEmptyState } from './AdminEmptyState';
import { AdminSectionHeader } from './AdminSectionHeader';

type TimeFilter = 'all' | 'upcoming' | 'past';
type JoinModeFilter = 'all' | 'open' | 'request';
type VisibilityFilter = 'all' | 'public' | 'private';
type SortMode = 'date_asc' | 'date_desc' | 'created_desc' | 'created_asc';

export function AdminEvents({
  onNavigate,
  onOpenUsers,
  attentionFilter,
}: {
  onNavigate: (screen: string, data?: unknown, direction?: 'forward' | 'back' | 'up' | 'down') => void;
  onOpenUsers: (filter: AdminAttentionTarget | null) => void;
  attentionFilter?: AdminAttentionTarget | null;
}) {
  const [events, setEvents] = useState<AdminEventRow[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<AdminEventParticipantRow[]>([]);
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [joinModeFilter, setJoinModeFilter] = useState<JoinModeFilter>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  const [sortMode, setSortMode] = useState<SortMode>('created_desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mutatingEventId, setMutatingEventId] = useState<string | null>(null);

  const loadEvents = async () => {
    setLoading(true);
    setError(false);

    try {
      setEvents(await getAdminEvents());
    } catch (loadError) {
      console.error('Failed to load admin events:', loadError);
      setEvents([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (attentionFilter === 'events-without-participants') {
      setTimeFilter('upcoming');
      setSearch('__without_participants__');
    }
    if (attentionFilter === 'events-without-city') {
      setTimeFilter('upcoming');
      setSearch('__without_city__');
    }
    if (attentionFilter === 'events-without-location') {
      setTimeFilter('upcoming');
      setSearch('__without_location__');
    }
  }, [attentionFilter]);

  const cities = useMemo(
    () => Array.from(new Set(events.map((event) => event.city).filter(Boolean) as string[])).sort(),
    [events]
  );
  const activityTypes = useMemo(
    () =>
      Array.from(new Set(events.map((event) => event.activity_type).filter(Boolean) as string[])).sort(),
    [events]
  );

  const filteredEvents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const withoutParticipants = normalizedSearch === '__without_participants__';
    const withoutCity = normalizedSearch === '__without_city__';
    const withoutLocation = normalizedSearch === '__without_location__';

    return events
      .filter((event) => {
        const matchesSearch =
          !normalizedSearch ||
          withoutParticipants ||
          withoutCity ||
          withoutLocation ||
          [event.title, event.description, event.city].some((value) =>
            (value ?? '').toLowerCase().includes(normalizedSearch)
          );
        const matchesSpecial =
          (!withoutParticipants || event.participants_count === 0) &&
          (!withoutCity || !event.city) &&
          (!withoutLocation || !event.location);
        const matchesTime =
          timeFilter === 'all' ||
          (timeFilter === 'past' ? isPast(event.date_time) : !isPast(event.date_time));
        const matchesJoinMode =
          joinModeFilter === 'all' || (event.join_mode ?? 'open') === joinModeFilter;
        const matchesVisibility =
          visibilityFilter === 'all' || (event.visibility ?? 'public') === visibilityFilter;
        const matchesCity = cityFilter === 'all' || event.city === cityFilter;
        const matchesActivity =
          activityFilter === 'all' || event.activity_type === activityFilter;

        return (
          matchesSearch &&
          matchesSpecial &&
          matchesTime &&
          matchesJoinMode &&
          matchesVisibility &&
          matchesCity &&
          matchesActivity
        );
      })
      .sort((a, b) => compareEvents(a, b, sortMode));
  }, [
    activityFilter,
    cityFilter,
    events,
    joinModeFilter,
    search,
    sortMode,
    timeFilter,
    visibilityFilter,
  ]);

  const selectedEvent =
    events.find((event) => event.id === selectedEventId) ?? filteredEvents[0] ?? null;

  useEffect(() => {
    let cancelled = false;

    const loadParticipants = async () => {
      if (!selectedEvent) {
        setParticipants([]);
        return;
      }

      try {
        const nextParticipants = await getAdminEventParticipants(selectedEvent.id);
        if (!cancelled) {
          setParticipants(nextParticipants);
        }
      } catch (participantError) {
        console.error('Failed to load event participants:', participantError);
        if (!cancelled) {
          setParticipants([]);
        }
      }
    };

    loadParticipants();

    return () => {
      cancelled = true;
    };
  }, [selectedEvent]);

  const handleToggleVisibility = async (event: AdminEventRow) => {
    const nextVisibility = event.visibility === 'private' ? 'public' : 'private';
    const confirmed = await feedback.confirm({
      title: `Set event ${nextVisibility}?`,
      description: 'This uses the current admin session and Supabase RLS.',
      confirmLabel: 'Update',
      cancelLabel: 'Cancel',
    });

    if (!confirmed) {
      return;
    }

    setMutatingEventId(event.id);

    try {
      await updateAdminEventVisibilityOrStatus(event.id, { visibility: nextVisibility });
      setEvents((current) =>
        current.map((item) =>
          item.id === event.id ? { ...item, visibility: nextVisibility } : item
        )
      );
      feedback.success('Event visibility updated.');
    } catch (mutationError) {
      console.error('Failed to update event visibility:', mutationError);
      feedback.error('Could not update event visibility. The column or RLS may block this action.');
    } finally {
      setMutatingEventId(null);
    }
  };

  const handleDeleteEvent = async (event: AdminEventRow) => {
    const confirmed = await feedback.confirm({
      title: 'Delete event?',
      description: 'This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
    });

    if (!confirmed) {
      return;
    }

    setMutatingEventId(event.id);

    try {
      await deleteAdminEvent(event.id);
      setEvents((current) => current.filter((item) => item.id !== event.id));
      setSelectedEventId(null);
      feedback.success('Event deleted.');
    } catch (mutationError) {
      console.error('Failed to delete event:', mutationError);
      feedback.error('Could not delete event. RLS may block this action.');
    } finally {
      setMutatingEventId(null);
    }
  };

  return (
    <section className="space-y-4">
      <AdminSectionHeader
        title="Events"
        description="Search, inspect and perform basic moderation on event records."
      />

      <div className="grid gap-2 rounded-2xl border p-3" style={panelStyle}>
        <input
          value={search.startsWith('__') ? '' : search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by title, description or city"
          className="w-full rounded-xl border bg-transparent px-4 py-3 text-sm outline-none"
          style={{ borderColor: 'var(--border-subtle)' }}
        />
        {search.startsWith('__') && (
          <p className="text-xs text-muted-foreground">Showing a dashboard attention filter.</p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Select value={timeFilter} onChange={(value) => setTimeFilter(value as TimeFilter)}>
            <option value="all">All time</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </Select>
          <Select value={visibilityFilter} onChange={(value) => setVisibilityFilter(value as VisibilityFilter)}>
            <option value="all">All visibility</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </Select>
          <Select value={joinModeFilter} onChange={(value) => setJoinModeFilter(value as JoinModeFilter)}>
            <option value="all">All join modes</option>
            <option value="open">Open</option>
            <option value="request">Request</option>
          </Select>
          <Select value={cityFilter} onChange={setCityFilter}>
            <option value="all">All cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </Select>
          <Select value={activityFilter} onChange={setActivityFilter}>
            <option value="all">All activities</option>
            {activityTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Select>
          <Select value={sortMode} onChange={(value) => setSortMode(value as SortMode)}>
            <option value="created_desc">Newest created</option>
            <option value="created_asc">Oldest created</option>
            <option value="date_asc">Nearest date</option>
            <option value="date_desc">Latest date</option>
          </Select>
        </div>
      </div>

      {loading && <LoadingList />}

      {!loading && error && (
        <AdminEmptyState
          title="Events are unavailable"
          description="The current admin account could not read events through the available RLS path."
        />
      )}

      {!loading && !error && filteredEvents.length === 0 && (
        <AdminEmptyState title="No events found" description="Try changing search or filters." />
      )}

      {!loading && !error && filteredEvents.length > 0 && (
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <article
              key={event.id}
              onClick={() => setSelectedEventId(event.id)}
              className="rounded-2xl border p-4"
              style={{
                ...panelStyle,
                borderColor:
                  selectedEvent?.id === event.id ? 'var(--accent-border)' : 'var(--border)',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-medium">{event.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {event.city || 'Unknown city'}
                  </p>
                </div>
                <span className="rounded-full border px-2 py-1 text-xs" style={badgeStyle}>
                  {event.join_mode || 'open'}
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Meta label="Date" value={formatDate(event.date_time)} />
                <Meta label="Status" value={event.status || '-'} />
                <Meta label="Visibility" value={event.visibility || 'public'} />
                <Meta
                  label="Participants"
                  value={event.participants_count === null ? '-' : String(event.participants_count)}
                />
              </dl>
            </article>
          ))}
        </div>
      )}

      {!loading && !error && selectedEvent && (
        <div className="rounded-2xl border p-4" style={panelStyle}>
          <h3 className="font-medium">Event details</h3>
          <dl className="mt-4 grid grid-cols-1 gap-3 text-sm">
            <Meta label="ID" value={selectedEvent.id} />
            <Meta label="Title" value={selectedEvent.title} />
            <Meta label="Description" value={selectedEvent.description || '-'} />
            <Meta label="City" value={selectedEvent.city || '-'} />
            <Meta label="Location" value={selectedEvent.location || '-'} />
            <Meta label="Latitude" value={selectedEvent.location_lat?.toString() || '-'} />
            <Meta label="Longitude" value={selectedEvent.location_lng?.toString() || '-'} />
            <Meta label="Date" value={formatDate(selectedEvent.date_time)} />
            <Meta label="Creator" value={selectedEvent.creator_id || '-'} />
            <Meta label="Activity" value={selectedEvent.activity_type || '-'} />
            <Meta label="Join mode" value={selectedEvent.join_mode || 'open'} />
            <Meta label="Visibility" value={selectedEvent.visibility || 'public'} />
            <Meta label="Status" value={selectedEvent.status || '-'} />
            <Meta label="Created" value={formatDate(selectedEvent.created_at)} />
            <Meta label="Participants count" value={selectedEvent.participants_count?.toString() || '-'} />
          </dl>

          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={() =>
                onNavigate(
                  'event-details',
                  { eventId: selectedEvent.id, backTarget: 'admin', adminPage: 'events' },
                  'forward'
                )
              }
              className="rounded-xl border px-4 py-3 text-sm"
              style={{ borderColor: 'var(--accent-border)', backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              Open event
            </button>
            <button
              type="button"
              onClick={() => handleToggleVisibility(selectedEvent)}
              disabled={mutatingEventId === selectedEvent.id}
              className="rounded-xl border px-4 py-3 text-sm disabled:opacity-50"
              style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--surface-strong)' }}
            >
              {selectedEvent.visibility === 'private' ? 'Set public' : 'Set private'}
            </button>
            {selectedEvent.creator_id && (
              <button
                type="button"
                onClick={() => onOpenUsers(null)}
                className="rounded-xl border px-4 py-3 text-sm"
                style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--surface-strong)' }}
              >
                Go to creator in Users
              </button>
            )}
            <button
              type="button"
              onClick={() => handleDeleteEvent(selectedEvent)}
              disabled={mutatingEventId === selectedEvent.id}
              className="rounded-xl border px-4 py-3 text-sm disabled:opacity-50"
              style={{ borderColor: 'var(--destructive-border)', backgroundColor: 'var(--destructive-soft)', color: 'var(--destructive-strong)' }}
            >
              Delete event
            </button>
          </div>

          <div className="mt-5">
            <h4 className="font-medium">Participants</h4>
            {participants.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No participants are visible.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {participants.map((participant) => (
                  <div key={participant.id} className="rounded-xl border p-3 text-sm" style={badgeStyle}>
                    <p>{participant.name || participant.user_id || 'Unknown user'}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {participant.status || 'approved'} / {formatDate(participant.joined_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
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
        <LoadingCard key={index} lines={['60%', '36%', '74%']} className="rounded-2xl border" />
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

function compareEvents(a: AdminEventRow, b: AdminEventRow, sortMode: SortMode) {
  if (sortMode === 'date_asc') {
    return getTime(a.date_time) - getTime(b.date_time);
  }
  if (sortMode === 'date_desc') {
    return getTime(b.date_time) - getTime(a.date_time);
  }
  if (sortMode === 'created_asc') {
    return getTime(a.created_at) - getTime(b.created_at);
  }
  return getTime(b.created_at) - getTime(a.created_at);
}

function isPast(value: string | null) {
  if (!value) {
    return false;
  }

  const time = new Date(value).getTime();
  return !Number.isNaN(time) && time < Date.now();
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
