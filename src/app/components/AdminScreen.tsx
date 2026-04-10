import { ChevronLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { ACTIVITY_TYPES, getActivityTypeMeta, type ActivityType } from '../constants/activityTypes';
import { feedback } from '../lib/feedback';

type SummaryValue = number | null;

type EventPreview = {
  id: string;
  title: string;
  date_time: string | null;
  location: string | null;
};

type AdminModerationEvent = {
  id: string;
  title: string;
  description: string | null;
  date_time: string | null;
  location: string | null;
  location_lat: number | null;
  location_lng: number | null;
  creator_id: string | null;
  creatorName: string | null;
  activity_type: ActivityType | null;
  participantCount: number;
};

type AdminUser = {
  id: string;
  name: string | null;
  role: string | null;
  plan: string | null;
  has_unlimited_access: boolean | null;
};

type AdminListProfilesRow = {
  id: string;
  name: string | null;
  role: string | null;
  plan: string | null;
  has_unlimited_access: boolean | null;
};



type InvitationPreview = {
  id: string;
  created_at: string | null;
  inviterName: string | null;
  eventTitle: string | null;
};


type AdminSummary = {
  totalUsers: SummaryValue;
  totalEvents: SummaryValue;
  futureEvents: SummaryValue;
  participants: SummaryValue;
  pendingInvitations: SummaryValue;
  supportRequests: SummaryValue;
};

const INITIAL_SUMMARY: AdminSummary = {
  totalUsers: null,
  totalEvents: null,
  futureEvents: null,
  participants: null,
  pendingInvitations: null,
  supportRequests: null,
};

export function AdminScreen({
  onNavigate,
}: {
  onNavigate: (
    screen: string,
    data?: any,
    customDirection?: 'forward' | 'back' | 'up' | 'down'
  ) => void;
}) {
  const { language, translate } = useLanguage();
  const [summary, setSummary] = useState<AdminSummary>(INITIAL_SUMMARY);
  const [latestEvents, setLatestEvents] = useState<EventPreview[]>([]);
  const [moderationEvents, setModerationEvents] = useState<AdminModerationEvent[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [creatorFilter, setCreatorFilter] = useState('');
  const [activityFilter, setActivityFilter] = useState<ActivityType | 'all'>('all');
  const [timeFilter, setTimeFilter] = useState<'future' | 'past'>('future');
  const [latestPendingInvitations, setLatestPendingInvitations] = useState<InvitationPreview[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [eventsUnavailable, setEventsUnavailable] = useState(false);
  const [moderationUnavailable, setModerationUnavailable] = useState(false);
  const [invitationsUnavailable, setInvitationsUnavailable] = useState(false);
  const [usersUnavailable, setUsersUnavailable] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  const isPastEvent = (dateString?: string | null) => {
    if (!dateString) {
      return false;
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    return date.getTime() < Date.now();
  };

  const loadAdminOverview = async () => {
      setLoading(true);

      try {
        const nowIso = new Date().toISOString();

        const [
          usersResult,
          totalEventsResult,
          futureEventsResult,
          participantsResult,
          pendingInvitationsResult,
          supportRequestsResult,
          latestEventsResult,
          moderationEventsResult,
          latestPendingInvitationsResult,
          usersListResult,
        ] = await Promise.allSettled([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),

          supabase.from('events').select('*', { count: 'exact', head: true }),
          supabase
            .from('events')
            .select('*', { count: 'exact', head: true })
            .gte('date_time', nowIso),
          supabase.from('participants').select('*', { count: 'exact', head: true }),
          supabase
            .from('event_invitations')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending'),
          supabase.from('support_requests').select('*', { count: 'exact', head: true }),
          supabase
            .from('events')
            .select('id, title, date_time, location')
            .order('date_time', { ascending: false })
            .limit(5),
          supabase
            .from('events')
            .select(
              'id, title, description, date_time, location, location_lat, location_lng, creator_id, activity_type'
            )
            .order('date_time', { ascending: false }),
          supabase
            .from('event_invitations')
            .select(`
              id,
              created_at,
              inviter:profiles!event_invitations_inviter_id_fkey (
                name
              ),
              events (
                title
              )
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase.rpc('admin_list_profiles'),

        ]);



        setSummary({
          totalUsers:
            usersResult.status === 'fulfilled' && !usersResult.value.error
              ? usersResult.value.count ?? 0
              : null,
          totalEvents:
            totalEventsResult.status === 'fulfilled' && !totalEventsResult.value.error
              ? totalEventsResult.value.count ?? 0
              : null,
          futureEvents:
            futureEventsResult.status === 'fulfilled' && !futureEventsResult.value.error
              ? futureEventsResult.value.count ?? 0
              : null,
          participants:
            participantsResult.status === 'fulfilled' && !participantsResult.value.error
              ? participantsResult.value.count ?? 0
              : null,
          pendingInvitations:
            pendingInvitationsResult.status === 'fulfilled' &&
              !pendingInvitationsResult.value.error
              ? pendingInvitationsResult.value.count ?? 0
              : null,
          supportRequests:
            supportRequestsResult.status === 'fulfilled' && !supportRequestsResult.value.error
              ? supportRequestsResult.value.count ?? 0
              : null,
        });

        if (latestEventsResult.status === 'fulfilled' && !latestEventsResult.value.error) {
          setLatestEvents((latestEventsResult.value.data as EventPreview[] | null) || []);
          setEventsUnavailable(false);
        } else {
          setLatestEvents([]);
          setEventsUnavailable(true);
        }

        if (moderationEventsResult.status === 'fulfilled' && !moderationEventsResult.value.error) {
          const baseEvents = (moderationEventsResult.value.data as any[] | null) || [];
          const creatorIds = Array.from(
            new Set(baseEvents.map((event) => event.creator_id).filter(Boolean))
          ) as string[];

          const participantCountsResult = await supabase.from('participants').select('event_id');

          const participantCountsMap: Record<string, number> = {};

          if (!participantCountsResult.error) {
            ((participantCountsResult.data as { event_id: string | null }[] | null) || []).forEach(
              (participant) => {
                if (!participant.event_id) {
                  return;
                }

                participantCountsMap[participant.event_id] =
                  (participantCountsMap[participant.event_id] || 0) + 1;
              }
            );
          }

          let creatorNameMap: Record<string, string> = {};

          if (creatorIds.length > 0) {
            const creatorProfilesResult = await supabase
              .from('profiles')
              .select('id, name')
              .in('id', creatorIds);

            if (!creatorProfilesResult.error) {
              ((creatorProfilesResult.data as { id: string; name: string | null }[] | null) || []).forEach(
                (profile) => {
                  creatorNameMap[profile.id] = profile.name || translate('common.unknown');
                }
              );
            }
          }

          const normalizedModerationEvents: AdminModerationEvent[] = baseEvents.map((event) => ({
            id: event.id,
            title: event.title || translate('common.event'),
            description: event.description ?? null,
            date_time: event.date_time ?? null,
            location: event.location ?? null,
            location_lat: typeof event.location_lat === 'number' ? event.location_lat : null,
            location_lng: typeof event.location_lng === 'number' ? event.location_lng : null,
            creator_id: event.creator_id ?? null,
            creatorName: event.creator_id
              ? creatorNameMap[event.creator_id] || translate('common.unknown')
              : translate('common.unknown'),
            activity_type: (event.activity_type || 'other') as ActivityType,
            participantCount: participantCountsMap[event.id] || 0,
          }));

          setModerationEvents(normalizedModerationEvents);
          setModerationUnavailable(
            !!participantCountsResult.error ||
              (creatorIds.length > 0 &&
                Object.keys(creatorNameMap).length === 0 &&
                baseEvents.some((event) => !!event.creator_id))
          );
        } else {
          setModerationEvents([]);
          setModerationUnavailable(true);
        }

        if (
          latestPendingInvitationsResult.status === 'fulfilled' &&
          !latestPendingInvitationsResult.value.error
        ) {
          const normalizedInvitations = (
            (latestPendingInvitationsResult.value.data as any[] | null) || []
          ).map((invitation: any) => {
            const inviterData = Array.isArray(invitation.inviter)
              ? invitation.inviter[0]
              : invitation.inviter;

            const eventData = Array.isArray(invitation.events)
              ? invitation.events[0]
              : invitation.events;

            return {
              id: invitation.id,
              created_at: invitation.created_at ?? null,
              inviterName: inviterData?.name ?? null,
              eventTitle: eventData?.title ?? null,
            };
          });

          setLatestPendingInvitations(normalizedInvitations);
          setInvitationsUnavailable(false);
        } else {
          setLatestPendingInvitations([]);
          setInvitationsUnavailable(true);
        }
        
        if (usersListResult.status === 'fulfilled' && !usersListResult.value.error) {
          const nextUsers = (usersListResult.value.data as AdminListProfilesRow[] | null) || [];


          setUsers(nextUsers);
          setUsersUnavailable(false);
          setSelectedUserId((prev) =>
            prev && nextUsers.some((user) => user.id === prev) ? prev : nextUsers[0]?.id ?? null
          );
        } else {
          setUsers([]);
          setUsersUnavailable(true);
          setSelectedUserId(null);
          setUserSearch('');
        }



      } catch (error) {
        console.error('Unexpected admin overview load error:', error);
        setSummary(INITIAL_SUMMARY);
        setLatestEvents([]);
        setModerationEvents([]);
        setUsers([]);
        setSelectedUserId(null);
        setUserSearch('');
        setLatestPendingInvitations([]);
        setEventsUnavailable(true);
        setModerationUnavailable(true);
        setInvitationsUnavailable(true);
        setUsersUnavailable(true);

      } finally {
        setLoading(false);
      }


    };

  useEffect(() => {
    loadAdminOverview();
  }, [language]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) {
      return translate('admin.notAvailable');
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return translate('admin.notAvailable');
    }

    return date.toLocaleString();
  };

  const getSummaryValue = (value: SummaryValue) => {
    if (loading) {
      return translate('common.loading');
    }

    if (value === null) {
      return translate('admin.unavailable');
    }

    return String(value);
  };

  const summaryCards = [
    {
      key: 'users',
      title: translate('admin.totalUsers'),
      value: getSummaryValue(summary.totalUsers),
    },
    {
      key: 'events',
      title: translate('admin.totalEvents'),
      value: getSummaryValue(summary.totalEvents),
    },
    {
      key: 'future-events',
      title: translate('admin.futureEvents'),
      value: getSummaryValue(summary.futureEvents),
    },
    {
      key: 'participants',
      title: translate('admin.participantsCount'),
      value: getSummaryValue(summary.participants),
    },
    {
      key: 'pending-invitations',
      title: translate('admin.pendingInvitations'),
      value: getSummaryValue(summary.pendingInvitations),
    },
    {
      key: 'support-requests',
      title: translate('admin.supportRequests'),
      value: getSummaryValue(summary.supportRequests),
    },
  ];

  const normalizedUserSearch = userSearch.trim().toLowerCase();

  const filteredUsers = users.filter((user) => {
    if (!normalizedUserSearch) {
      return true;
    }

    const name = user.name?.toLowerCase() || '';
    return name.includes(normalizedUserSearch);
  });

  const selectedUser =
    filteredUsers.find((user) => user.id === selectedUserId) || filteredUsers[0] || null;

  const normalizedCreatorFilter = creatorFilter.trim().toLowerCase();

  const filteredModerationEvents = moderationEvents.filter((event) => {
    const matchesTime = timeFilter === 'future' ? !isPastEvent(event.date_time) : isPastEvent(event.date_time);
    const matchesCreator = !normalizedCreatorFilter
      ? true
      : (event.creatorName || '').toLowerCase().includes(normalizedCreatorFilter);
    const matchesActivity =
      activityFilter === 'all' ? true : (event.activity_type || 'other') === activityFilter;

    return matchesTime && matchesCreator && matchesActivity;
  });

  const handleViewEventDetails = (event: AdminModerationEvent) => {
    onNavigate(
      'event-details',
      {
        ...event,
        backTarget: 'admin',
      },
      'forward'
    );
  };

  const handleViewParticipants = (event: AdminModerationEvent) => {
    onNavigate(
      'participants',
      {
        ...event,
        backTarget: 'admin',
      },
      'forward'
    );
  };

  const handleDeleteEvent = async (event: AdminModerationEvent) => {
    const confirmed = await feedback.confirm({
      title: translate('details.deleteEvent'),
      description: translate('admin.deleteEventConfirm'),
      confirmLabel: translate('details.deleteEvent'),
      cancelLabel: translate('common.cancel'),
      variant: 'destructive',
    });

    if (!confirmed) {
      return;
    }

    setDeletingEventId(event.id);

    try {
      const { error: invitationsError } = await supabase
        .from('event_invitations')
        .delete()
        .eq('event_id', event.id);

      if (invitationsError) {
        console.error('Admin delete event invitations error:', invitationsError);
        feedback.error(translate('admin.deleteEventFailed'));
        return;
      }

      const { error: participantsError } = await supabase
        .from('participants')
        .delete()
        .eq('event_id', event.id);

      if (participantsError) {
        console.error('Admin delete participants error:', participantsError);
        feedback.error(translate('admin.deleteEventFailed'));
        return;
      }

      const { error: eventError } = await supabase.from('events').delete().eq('id', event.id);

      if (eventError) {
        console.error('Admin delete event error:', eventError);
        feedback.error(translate('admin.deleteEventFailed'));
        return;
      }

      await loadAdminOverview();
    } catch (error) {
      console.error('Unexpected admin delete event error:', error);
      feedback.error(translate('admin.deleteEventUnexpectedError'));
    } finally {
      setDeletingEventId(null);
    }
  };



  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-6 py-4 border-b border-border flex items-center gap-3">
        <button
          onClick={() => onNavigate('profile')}
          className="p-2 -ml-2 hover:opacity-70 transition-opacity"
        >
          <ChevronLeft size={24} />
        </button>
        <h1>{translate('admin.title')}</h1>
      </div>

      <div
        className="flex-1 overflow-y-auto px-6 py-8"
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="max-w-sm mx-auto space-y-6">
          <div
            className="rounded-xl border p-5"
            style={{
              borderColor: 'rgba(212, 175, 55, 0.28)',
              backgroundColor: '#1A1A1A',
            }}
          >
            <h3 className="mb-2">{translate('admin.enabledTitle')}</h3>
            <p className="text-sm text-muted-foreground">
              {translate('admin.enabledDescription')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {summaryCards.map((card) => (
              <div
                key={card.key}
                className="rounded-xl border p-4"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  backgroundColor: '#1A1A1A',
                }}
              >
                <p className="text-xs text-muted-foreground mb-2">{card.title}</p>
                <p className="text-xl" style={{ color: '#D4AF37' }}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          <div
            className="rounded-xl border p-5"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.1)',
              backgroundColor: '#1A1A1A',
            }}
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3>{translate('admin.latestEvents')}</h3>
              <span className="text-xs text-muted-foreground">
                {translate('admin.readOnly')}
              </span>
            </div>

            {loading && (
              <p className="text-sm text-muted-foreground">{translate('common.loading')}</p>
            )}

            {!loading && eventsUnavailable && (
              <p className="text-sm text-muted-foreground">{translate('admin.unavailable')}</p>
            )}

            {!loading && !eventsUnavailable && latestEvents.length === 0 && (
              <p className="text-sm text-muted-foreground">{translate('admin.noEvents')}</p>
            )}

            {!loading && !eventsUnavailable && latestEvents.length > 0 && (
              <div className="space-y-3">
                {latestEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-lg border p-3"
                    style={{
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      backgroundColor: '#111111',
                    }}
                  >
                    <p className="mb-1">{event.title || translate('common.event')}</p>
                    <p className="text-xs text-muted-foreground mb-1">
                      {formatDate(event.date_time)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {event.location || translate('admin.notAvailable')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className="rounded-xl border p-5"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.1)',
              backgroundColor: '#1A1A1A',
            }}
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3>{translate('admin.eventsModerationTitle')}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {translate('admin.eventsModerationDescription')}
                </p>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setTimeFilter('future')}
                className="px-3 py-2 rounded-lg text-sm transition-opacity"
                style={{
                  backgroundColor:
                    timeFilter === 'future' ? 'rgba(212, 175, 55, 0.12)' : '#111111',
                  border:
                    timeFilter === 'future'
                      ? '1px solid rgba(212, 175, 55, 0.35)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                  color: timeFilter === 'future' ? '#D4AF37' : 'inherit',
                }}
              >
                {translate('admin.futureFilter')}
              </button>
              <button
                onClick={() => setTimeFilter('past')}
                className="px-3 py-2 rounded-lg text-sm transition-opacity"
                style={{
                  backgroundColor:
                    timeFilter === 'past' ? 'rgba(212, 175, 55, 0.12)' : '#111111',
                  border:
                    timeFilter === 'past'
                      ? '1px solid rgba(212, 175, 55, 0.35)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                  color: timeFilter === 'past' ? '#D4AF37' : 'inherit',
                }}
              >
                {translate('admin.pastFilter')}
              </button>
            </div>

            <input
              type="text"
              placeholder={translate('admin.creatorFilterPlaceholder')}
              value={creatorFilter}
              onChange={(e) => setCreatorFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors mb-4"
              style={{
                backgroundColor: '#111111',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
            />

            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setActivityFilter('all')}
                className="px-3 py-2 rounded-full text-xs transition-opacity"
                style={{
                  backgroundColor:
                    activityFilter === 'all' ? 'rgba(212, 175, 55, 0.12)' : '#111111',
                  border:
                    activityFilter === 'all'
                      ? '1px solid rgba(212, 175, 55, 0.35)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                  color: activityFilter === 'all' ? '#D4AF37' : 'inherit',
                }}
              >
                {translate('admin.allActivityTypes')}
              </button>

              {ACTIVITY_TYPES.map((activityType) => {
                const meta = getActivityTypeMeta(activityType.value, language);
                const isSelected = activityFilter === activityType.value;

                return (
                  <button
                    key={activityType.value}
                    onClick={() => setActivityFilter(activityType.value)}
                    className="px-3 py-2 rounded-full text-xs transition-opacity"
                    style={{
                      backgroundColor: isSelected ? 'rgba(212, 175, 55, 0.12)' : '#111111',
                      border: isSelected
                        ? '1px solid rgba(212, 175, 55, 0.35)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      color: isSelected ? '#D4AF37' : 'inherit',
                    }}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>

            {loading && (
              <p className="text-sm text-muted-foreground">{translate('common.loading')}</p>
            )}

            {!loading && moderationUnavailable && (
              <p className="text-sm text-muted-foreground">{translate('admin.unavailable')}</p>
            )}

            {!loading && !moderationUnavailable && filteredModerationEvents.length === 0 && (
              <p className="text-sm text-muted-foreground">{translate('admin.noModerationEvents')}</p>
            )}

            {!loading && !moderationUnavailable && filteredModerationEvents.length > 0 && (
              <div className="space-y-3">
                {filteredModerationEvents.map((event) => {
                  const activityMeta = getActivityTypeMeta(event.activity_type || 'other', language);

                  return (
                    <div
                      key={event.id}
                      className="rounded-lg border p-4"
                      style={{
                        borderColor: 'rgba(255, 255, 255, 0.08)',
                        backgroundColor: '#111111',
                      }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="mb-1">{event.title || translate('common.event')}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(event.date_time)}
                          </p>
                        </div>
                        <span
                          className="text-[10px] px-2 py-1 rounded-full border whitespace-nowrap"
                          style={{
                            borderColor: 'rgba(212, 175, 55, 0.28)',
                            color: '#D4AF37',
                            backgroundColor: 'rgba(212, 175, 55, 0.08)',
                          }}
                        >
                          {activityMeta.label}
                        </span>
                      </div>

                      <div className="space-y-1 mb-4">
                        <p className="text-xs text-muted-foreground">
                          {translate('admin.creatorLabel')}: {event.creatorName || translate('common.unknown')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {translate('admin.participantsLabel')}: {event.participantCount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {event.location || translate('admin.notAvailable')}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleViewEventDetails(event)}
                          className="px-3 py-2 rounded-lg text-xs transition-opacity"
                          style={{
                            backgroundColor: 'rgba(212, 175, 55, 0.12)',
                            border: '1px solid rgba(212, 175, 55, 0.35)',
                            color: '#D4AF37',
                          }}
                        >
                          {translate('admin.viewEventDetails')}
                        </button>
                        <button
                          onClick={() => handleViewParticipants(event)}
                          className="px-3 py-2 rounded-lg text-xs transition-opacity"
                          style={{
                            backgroundColor: '#171717',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                          }}
                        >
                          {translate('admin.viewParticipants')}
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event)}
                          disabled={deletingEventId === event.id}
                          className="px-3 py-2 rounded-lg text-xs transition-opacity disabled:opacity-60"
                          style={{
                            backgroundColor: 'rgba(255, 77, 109, 0.08)',
                            border: '1px solid rgba(255, 77, 109, 0.28)',
                            color: '#FF4D6D',
                            marginLeft: 'auto',
                          }}
                        >
                          {deletingEventId === event.id
                            ? translate('admin.deletingEvent')
                            : translate('details.deleteEvent')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div
            className="rounded-xl border p-5"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.1)',
              backgroundColor: '#1A1A1A',
            }}
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3>{translate('admin.latestPendingInvitations')}</h3>
              <span className="text-xs text-muted-foreground">
                {translate('admin.readOnly')}
              </span>
            </div>

            {loading && (
              <p className="text-sm text-muted-foreground">{translate('common.loading')}</p>
            )}

            {!loading && invitationsUnavailable && (
              <p className="text-sm text-muted-foreground">{translate('admin.unavailable')}</p>
            )}

            {!loading && !invitationsUnavailable && latestPendingInvitations.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {translate('admin.noPendingInvitations')}
              </p>
            )}

            {!loading && !invitationsUnavailable && latestPendingInvitations.length > 0 && (
              <div className="space-y-3">
                {latestPendingInvitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="rounded-lg border p-3"
                    style={{
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      backgroundColor: '#111111',
                    }}
                  >
                    <p className="mb-1">
                      {invitation.eventTitle || translate('common.event')}
                    </p>
                    <p className="text-xs text-muted-foreground mb-1">
                      {translate('admin.invitedBy')}: {invitation.inviterName || translate('common.unknown')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(invitation.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className="rounded-xl border p-5"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.1)',
              backgroundColor: '#1A1A1A',
            }}
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3>{translate('admin.usersTitle')}</h3>
              <span className="text-xs text-muted-foreground">
                {translate('admin.readOnly')}
              </span>
            </div>

            <input
              type="text"
              placeholder={translate('admin.userSearchPlaceholder')}
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors mb-4"
              style={{
                backgroundColor: '#111111',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
            />

            {loading && (
              <p className="text-sm text-muted-foreground">{translate('common.loading')}</p>
            )}

            {!loading && usersUnavailable && (
              <p className="text-sm text-muted-foreground">{translate('admin.unavailable')}</p>
            )}

            {!loading && !usersUnavailable && users.length === 0 && (
              <p className="text-sm text-muted-foreground">{translate('admin.noUsers')}</p>
            )}

            {!loading && !usersUnavailable && users.length > 0 && filteredUsers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {translate('admin.noUsersMatch')}
              </p>
            )}

            {!loading && !usersUnavailable && filteredUsers.length > 0 && (
              <div className="space-y-3">
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {filteredUsers.map((user) => {
                    const isSelected = user.id === selectedUserId;

                    return (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUserId(user.id)}
                        className="w-full rounded-lg border p-3 text-left transition-colors"
                        style={{
                          borderColor: isSelected
                            ? 'rgba(212, 175, 55, 0.35)'
                            : 'rgba(255, 255, 255, 0.08)',
                          backgroundColor: '#111111',
                        }}
                      >
                        <p className="mb-1">{user.name || translate('common.user')}</p>
                        <p className="text-xs text-muted-foreground">
                          {translate('admin.roleLabel')}: {user.role || translate('admin.notAvailable')}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div
                  className="rounded-lg border p-4"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    backgroundColor: '#111111',
                  }}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h4>{translate('admin.userProfileTitle')}</h4>
                    <span className="text-xs text-muted-foreground">
                      {translate('admin.readOnly')}
                    </span>
                  </div>

                  {!selectedUser && (
                    <p className="text-sm text-muted-foreground">
                      {translate('admin.selectUser')}
                    </p>
                  )}

                  {selectedUser && (
                    <div className="space-y-2">
                      <p>
                        {translate('common.name')}: {selectedUser.name || translate('common.user')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {translate('admin.roleLabel')}: {selectedUser.role || translate('admin.notAvailable')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {translate('admin.planLabel')}: {selectedUser.plan || translate('admin.notAvailable')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {translate('admin.unlimitedAccessLabel')}:{' '}
                        {selectedUser.has_unlimited_access
                          ? translate('admin.enabled')
                          : translate('admin.disabled')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div
            className="rounded-xl border p-5"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.1)',
              backgroundColor: '#1A1A1A',
            }}
          >
            <h3 className="mb-2">{translate('admin.comingSoonTitle')}</h3>
            <p className="text-sm text-muted-foreground">
              {translate('admin.comingSoonDescription')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
