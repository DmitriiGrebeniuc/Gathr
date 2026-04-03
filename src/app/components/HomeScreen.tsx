import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { PullToRefresh } from './PullToRefresh';
import { supabase } from '../../lib/supabase';

type EventItem = {
  id: string;
  title: string;
  description?: string | null;
  date_time?: string | null;
  location?: string | null;
  creator_id?: string | null;
  participantCount: number;
};

export function HomeScreen({
  onNavigate,
}: {
  onNavigate: (screen: string, data?: any) => void;
}) {
  const [activeTab, setActiveTab] = useState<'my' | 'discover'>('my');
  const [refreshKey, setRefreshKey] = useState(0);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const formatEventDate = (dateString?: string | null) => {
    if (!dateString) return 'Date not specified';

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return 'Invalid date';
    }

    return date.toLocaleString();
  };

  const refreshParticipantCounts = async () => {
  try {
    const { data: participantsData, error } = await supabase
      .from('participants')
      .select('event_id');

    if (error) {
      console.error('Ошибка загрузки участников для счетчика:', error);
      return;
    }

    const countsMap: Record<string, number> = {};

    (participantsData || []).forEach((participant: any) => {
      const eventId = participant.event_id;

      if (!eventId) return;

      countsMap[eventId] = (countsMap[eventId] || 0) + 1;
    });

    setEvents((prevEvents) =>
      prevEvents.map((event) => ({
        ...event,
        participantCount: countsMap[event.id] || 0,
      }))
    );
  } catch (error) {
    console.error('Unexpected error while refreshing participant counts:', error);
  }
};

  const fetchEvents = async (showLoader = true) => {
  if (showLoader) {
    setLoading(true);
  }

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('Ошибка получения пользователя:', userError);
    }

    const userId = user?.id ?? null;
    setCurrentUserId(userId);

    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .order('date_time', { ascending: true });

    if (eventsError) {
      console.error('Ошибка загрузки событий:', eventsError);
      setEvents([]);
      return;
    }

    const { data: participantsData, error: participantsError } = await supabase
      .from('participants')
      .select('event_id');

    if (participantsError) {
      console.error('Ошибка загрузки участников для счетчика:', participantsError);
      setEvents(
        (eventsData || []).map((event: any) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          date_time: event.date_time,
          location: event.location,
          creator_id: event.creator_id,
          participantCount: 0,
        }))
      );
      return;
    }

    const countsMap: Record<string, number> = {};

    (participantsData || []).forEach((participant: any) => {
      const eventId = participant.event_id;

      if (!eventId) return;

      countsMap[eventId] = (countsMap[eventId] || 0) + 1;
    });

    const mappedEvents: EventItem[] = (eventsData || []).map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date_time: event.date_time,
      location: event.location,
      creator_id: event.creator_id,
      participantCount: countsMap[event.id] || 0,
    }));

    setEvents(mappedEvents);
  } catch (error) {
    console.error('Unexpected error while fetching events:', error);
    setEvents([]);
  } finally {
  if (showLoader) {
    setLoading(false);
  }
}
};

 useEffect(() => {
  fetchEvents();

  const eventsChannel = supabase
  .channel('home-events')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'events',
    },
    async () => {
      await fetchEvents(false);
    }
  )
  .subscribe();

  const participantsChannel = supabase
    .channel('home-participants')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'participants',
      },
      async () => {
        await refreshParticipantCounts();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(eventsChannel);
    supabase.removeChannel(participantsChannel);
  };
}, []);

  const handleRefresh = async () => {
    await fetchEvents();
    setRefreshKey((prev) => prev + 1);
  };

  const filteredEvents = events.filter((event) => {
    if (!currentUserId) {
      return activeTab === 'discover';
    }

    if (activeTab === 'my') {
      return event.creator_id === currentUserId;
    }

    return event.creator_id !== currentUserId;
  });

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h1 className="text-2xl" style={{ color: '#D4AF37' }}>
          Gathr
        </h1>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onNavigate('profile')}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#3A3A3A' }}
        >
          <span className="text-sm">JD</span>
        </motion.button>
      </div>

      <div className="flex border-b border-border">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveTab('my')}
          className={`flex-1 py-3 transition-colors ${
            activeTab === 'my' ? 'border-b-2' : 'text-muted-foreground'
          }`}
          style={
            activeTab === 'my'
              ? { borderColor: '#D4AF37', color: '#D4AF37' }
              : {}
          }
        >
          My Events
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveTab('discover')}
          className={`flex-1 py-3 transition-colors ${
            activeTab === 'discover' ? 'border-b-2' : 'text-muted-foreground'
          }`}
          style={
            activeTab === 'discover'
              ? { borderColor: '#D4AF37', color: '#D4AF37' }
              : {}
          }
        >
          Discover
        </motion.button>
      </div>

      <PullToRefresh onRefresh={handleRefresh}>
        <div className="h-full overflow-y-auto px-6 py-4 space-y-3">
          {loading && (
            <div className="text-sm text-muted-foreground">
              Loading events...
            </div>
          )}

          {!loading && filteredEvents.length === 0 && (
            <div
              className="rounded-xl p-4 border border-border"
              style={{
                backgroundColor: '#1A1A1A',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
            >
              <h3 className="mb-2">
                {activeTab === 'my' ? 'No my events yet' : 'No discover events yet'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {activeTab === 'my'
                  ? 'Create your first event by tapping the + button.'
                  : 'There are no events from other users yet.'}
              </p>
            </div>
          )}

          {!loading &&
            filteredEvents.map((event, index) => (
              <motion.div
                key={`${event.id}-${refreshKey}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.05,
                  type: 'spring',
                  stiffness: 300,
                  damping: 25,
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('event-details', event)}
                className="rounded-xl p-4 border border-border cursor-pointer transition-all active:opacity-90"
                style={{
                  backgroundColor: '#1A1A1A',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                }}
              >
                <h3 className="mb-1">{event.title}</h3>

                <p className="text-sm text-muted-foreground mb-2">
                  {formatEventDate(event.date_time)}
                </p>

                <p className="text-sm text-muted-foreground mb-3">
                  {event.location || 'Location not specified'}
                </p>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">
                    {event.creator_id === currentUserId ? 'Created by you' : 'Created by another user'}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {event.participantCount} participant{event.participantCount === 1 ? '' : 's'}
                  </span>
                </div>
              </motion.div>
            ))}
        </div>
      </PullToRefresh>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onNavigate('create-event')}
        className="absolute bottom-24 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        style={{
          backgroundColor: '#D4AF37',
          color: '#0F0F0F',
          boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)',
        }}
      >
        <span className="text-2xl">+</span>
      </motion.button>
    </div>
  );
}