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

      if (eventIds.length > 0) {
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

      if (myEventIds.length > 0) {
        const { data: joins, error: joinsError } = await supabase
          .from('participants')
          .select(`
            event_id,
            user_id,
            profiles(name)
          `)
          .in('event_id', myEventIds)
          .neq('user_id', user.id);

        if (joinsError) {
          console.error('Ошибка загрузки join notifications:', joinsError);
        } else {
          joinNotifications = (joins || []).map((joinRow: any) => {
            const profileData = Array.isArray(joinRow.profiles)
              ? joinRow.profiles[0]
              : joinRow.profiles;

            const participantName = profileData?.name || 'Someone';
            const relatedEvent = (myEvents || []).find((e: any) => e.id === joinRow.event_id);

            return {
              id: `join-${joinRow.event_id}-${joinRow.user_id}`,
              type: 'join',
              message: `${participantName} joined your event ${relatedEvent?.title || ''}`.trim(),
              time: 'Recently',
              event: relatedEvent || {
                id: joinRow.event_id,
                title: 'Event',
                description: null,
                date_time: null,
                location: null,
                creator_id: user.id,
              },
            };
          });
        }
      }

      setNotifications([...joinNotifications, ...upcomingNotifications]);
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
                onNavigate && onNavigate('event-details', notification.event)
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