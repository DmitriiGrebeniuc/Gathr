import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

type EventItem = {
  id: string;
  title: string;
  description?: string | null;
  date_time?: string | null;
  location?: string | null;
  creator_id?: string | null;
};

type NotificationItem = {
  id: string;
  type: 'upcoming' | 'join';
  message: string;
  time: string;
  event: EventItem;
  sortDate?: string | null;
  sortPriority: number;
};

export function NotificationsScreen({
  onNavigate,
}: {
  onNavigate?: (screen: string, data?: any) => void;
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const formatRelativeTime = (dateString?: string | null) => {
    if (!dateString) return 'Time not specified';

    const now = new Date();
    const eventDate = new Date(dateString);

    if (Number.isNaN(eventDate.getTime())) {
      return 'Invalid time';
    }

    const diffMs = eventDate.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMinutes < 0) return 'Started already';
    if (diffMinutes < 60) return `In ${diffMinutes} min`;
    if (diffHours < 24) return `In ${diffHours} hour${diffHours === 1 ? '' : 's'}`;

    return eventDate.toLocaleString();
  };

  const formatPastTime = (dateString?: string | null) => {
    if (!dateString) return 'Just now';

    const now = new Date();
    const createdDate = new Date(dateString);

    if (Number.isNaN(createdDate.getTime())) {
      return 'Just now';
    }

    const diffMs = now.getTime() - createdDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

    return createdDate.toLocaleString();
  };

  const buildUpcomingMessage = (event: EventItem) => {
    const now = new Date();
    const eventDate = new Date(event.date_time || '');

    if (Number.isNaN(eventDate.getTime())) {
      return `${event.title} is coming up`;
    }

    const diffMs = eventDate.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMinutes < 60) {
      return `${event.title} starts in ${diffMinutes} min`;
    }

    if (diffHours < 24) {
      return `${event.title} starts in ${diffHours} hour${diffHours === 1 ? '' : 's'}`;
    }

    return `${event.title} is coming up`;
  };

  const fetchNotifications = async () => {
    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Ошибка получения пользователя:', userError);
        setNotifications([]);
        setLoading(false);
        return;
      }

      const { data: notificationSettings, error: notificationSettingsError } = await supabase
        .from('notification_settings')
        .select('notify_upcoming_events, notify_new_participants')
        .eq('user_id', user.id)
        .maybeSingle();

      if (notificationSettingsError) {
        console.error('Ошибка загрузки notification settings:', notificationSettingsError);
      }

      const notifyUpcomingEvents = notificationSettings?.notify_upcoming_events ?? true;
      const notifyNewParticipants = notificationSettings?.notify_new_participants ?? true;

      const now = new Date();
      const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const { data: participantRows, error: participantRowsError } = await supabase
        .from('participants')
        .select('event_id')
        .eq('user_id', user.id);

      if (participantRowsError) {
        console.error('Ошибка загрузки participant rows:', participantRowsError);
        setNotifications([]);
        setLoading(false);
        return;
      }

      const eventIds = (participantRows || []).map((p: any) => p.event_id);

      let upcomingNotifications: NotificationItem[] = [];

      if (notifyUpcomingEvents && eventIds.length > 0) {
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .in('id', eventIds)
          .gte('date_time', now.toISOString())
          .lte('date_time', next24h.toISOString())
          .order('date_time', { ascending: true });

        if (eventsError) {
          console.error('Ошибка загрузки upcoming events:', eventsError);
        } else {
          upcomingNotifications = (events || []).map((event: EventItem) => ({
            id: `upcoming-${event.id}`,
            type: 'upcoming',
            message: buildUpcomingMessage(event),
            time: formatRelativeTime(event.date_time),
            event,
            sortDate: event.date_time || null,
            sortPriority: 2,
          }));
        }
      }

      const { data: myEvents, error: myEventsError } = await supabase
        .from('events')
        .select('id, title, description, date_time, location, creator_id')
        .eq('creator_id', user.id);

      if (myEventsError) {
        console.error('Ошибка загрузки событий пользователя:', myEventsError);
      }

      const myEventIds = (myEvents || []).map((e: any) => e.id);

      let joinNotifications: NotificationItem[] = [];

      if (notifyNewParticipants && myEventIds.length > 0) {
        const { data: joins, error: joinsError } = await supabase
          .from('participants')
          .select(`
      event_id,
      user_id,
      created_at,
      profiles(name)
    `)
          .in('event_id', myEventIds)
          .neq('user_id', user.id);

        if (joinsError) {
          console.error('Ошибка загрузки join notifications:', joinsError);
        } else {
          const groupedJoins = new Map<string, any[]>();

          (joins || []).forEach((joinRow: any) => {
            const eventId = joinRow.event_id;

            if (!groupedJoins.has(eventId)) {
              groupedJoins.set(eventId, []);
            }

            groupedJoins.get(eventId)?.push(joinRow);
          });

          joinNotifications = Array.from(groupedJoins.entries())
            .map(([eventId, eventJoins]) => {
              const relatedEvent = (myEvents || []).find((e: any) => e.id === eventId);

              const eventDate = relatedEvent?.date_time
                ? new Date(relatedEvent.date_time)
                : null;

              const isFutureEvent =
                eventDate !== null &&
                !Number.isNaN(eventDate.getTime()) &&
                eventDate.getTime() > now.getTime();

              if (!isFutureEvent) {
                return null;
              }

              const sortedJoins = [...eventJoins].sort((a, b) => {
                const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
                const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
                return bTime - aTime;
              });

              const latestJoin = sortedJoins[0];

              const names = sortedJoins.map((joinRow: any) => {
                const profileData = Array.isArray(joinRow.profiles)
                  ? joinRow.profiles[0]
                  : joinRow.profiles;

                return profileData?.name || 'Someone';
              });

              let message = '';

              if (names.length === 1) {
                message = `${names[0]} joined your event ${relatedEvent?.title || ''}`.trim();
              } else if (names.length === 2) {
                message = `${names[0]} and ${names[1]} joined your event ${relatedEvent?.title || ''}`.trim();
              } else {
                message = `${names[0]}, ${names[1]} and ${names.length - 2} others joined your event ${relatedEvent?.title || ''}`.trim();
              }

              return {
                id: `join-${eventId}`,
                type: 'join',
                message,
                time: formatPastTime(latestJoin.created_at),
                event: relatedEvent || {
                  id: eventId,
                  title: 'Event',
                  description: null,
                  date_time: null,
                  location: null,
                  creator_id: user.id,
                },
                sortDate: latestJoin.created_at || null,
                sortPriority: 1,
              };
            })
            .filter(Boolean) as NotificationItem[];
        }
      }

      const mergedNotifications = [...joinNotifications, ...upcomingNotifications];

      const uniqueNotifications = Array.from(
        new Map(mergedNotifications.map((notification) => [notification.id, notification])).values()
      );

      uniqueNotifications.sort((a, b) => {
        if (a.sortPriority !== b.sortPriority) {
          return a.sortPriority - b.sortPriority;
        }

        const aTime = a.sortDate ? new Date(a.sortDate).getTime() : 0;
        const bTime = b.sortDate ? new Date(b.sortDate).getTime() : 0;

        if (a.type === 'join') {
          return bTime - aTime;
        }

        return aTime - bTime;
      });

      setNotifications(uniqueNotifications);
    } catch (error) {
      console.error('Notifications error:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const participantsChannel = supabase
      .channel('notifications-participants')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
        },
        async () => {
          await fetchNotifications();
        }
      )
      .subscribe();

    const eventsChannel = supabase
      .channel('notifications-events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
        },
        async () => {
          await fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(eventsChannel);
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-6 py-4 border-b border-border">
        <h1>Notifications</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="px-6 py-4 text-sm text-muted-foreground">
            Loading notifications...
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="px-6 py-6">
            <div
              className="rounded-xl p-4 border border-border"
              style={{
                backgroundColor: '#1A1A1A',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
            >
              <h3 className="mb-2">No notifications yet</h3>
              <p className="text-sm text-muted-foreground">
                Upcoming events and participant updates will appear here.
              </p>
            </div>
          </div>
        )}

        {!loading &&
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() =>
                onNavigate &&
                onNavigate('event-details', {
                  ...notification.event,
                  backTarget: 'notifications',
                })
              }
              className="px-6 py-4 border-b border-border flex items-start gap-3 hover:bg-card/50 transition-colors cursor-pointer active:opacity-70"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                style={{ backgroundColor: '#3A3A3A' }}
              >
                <span className="text-sm">
                  {notification.type === 'upcoming' ? '⏰' : '👋'}
                </span>
              </div>

              <div className="flex-1">
                <p className="mb-1">{notification.message}</p>
                <p className="text-sm text-muted-foreground">{notification.time}</p>
              </div>

              <span className="text-muted-foreground mt-1">→</span>
            </div>
          ))}
      </div>
    </div>
  );
}