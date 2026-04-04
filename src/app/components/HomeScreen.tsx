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
  creatorName?: string | null;
  participantCount: number;
};

export function HomeScreen({
  onNavigate,
}: {
  onNavigate: (screen: string, data?: any) => void;
}) {
  const [activeTab, setActiveTab] = useState<'discover' | 'my' | 'joined'>('discover');
  const [refreshKey, setRefreshKey] = useState(0);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>('User');
  const [joinedEventIds, setJoinedEventIds] = useState<string[]>([]);

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';

    const parts = name
      .trim()
      .split(' ')
      .filter(Boolean);

    if (parts.length === 0) return 'U';

    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('');
  };

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
        .select('event_id, user_id');

      if (error) {
        console.error('Ошибка загрузки участников для счетчика:', error);
        return;
      }

      const countsMap: Record<string, number> = {};
      const joinedIds = new Set<string>();

      (participantsData || []).forEach((participant: any) => {
        const eventId = participant.event_id;

        if (!eventId) return;

        countsMap[eventId] = (countsMap[eventId] || 0) + 1;

        if (participant.user_id === currentUserId) {
          joinedIds.add(eventId);
        }
      });

      setJoinedEventIds(Array.from(joinedIds));

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

      if (userId) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) {
          console.error('Ошибка загрузки профиля пользователя:', profileError);
          setCurrentUserName('User');
        } else {
          setCurrentUserName(profileData?.name || 'User');
        }
      } else {
        setCurrentUserName('User');
      }

      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('date_time', { ascending: true });

      if (eventsError) {
        console.error('Ошибка загрузки событий:', eventsError);
        setEvents([]);
        return;
      }

      const creatorIds = Array.from(
        new Set(
          (eventsData || [])
            .map((event: any) => event.creator_id)
            .filter(Boolean)
        )
      );

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', creatorIds);

      if (profilesError) {
        console.error('Ошибка загрузки профилей создателей:', profilesError);
      }

      const creatorNameMap: Record<string, string> = {};

      (profilesData || []).forEach((profile: any) => {
        if (!profile?.id) return;
        creatorNameMap[profile.id] = profile.name || 'Unknown';
      });

      const { data: participantsData, error: participantsError } = await supabase
        .from('participants')
        .select('event_id, user_id');

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
            creatorName: event.creator_id ? creatorNameMap[event.creator_id] || 'Unknown' : 'Unknown',
            participantCount: 0,
          }))
        );
        return;
      }

      const countsMap: Record<string, number> = {};
      const joinedIds = new Set<string>();

      (participantsData || []).forEach((participant: any) => {
        const eventId = participant.event_id;

        if (!eventId) return;

        countsMap[eventId] = (countsMap[eventId] || 0) + 1;

        if (participant.user_id === userId) {
          joinedIds.add(eventId);
        }
      });

      setJoinedEventIds(Array.from(joinedIds));

      const mappedEvents: EventItem[] = (eventsData || []).map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date_time: event.date_time,
        location: event.location,
        creator_id: event.creator_id,
        creatorName: event.creator_id ? creatorNameMap[event.creator_id] || 'Unknown' : 'Unknown',
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
    const eventDate = event.date_time ? new Date(event.date_time) : null;
    const isPastEvent =
      eventDate !== null &&
      !Number.isNaN(eventDate.getTime()) &&
      eventDate.getTime() < Date.now();

    if (!currentUserId) {
      return activeTab === 'discover' && !isPastEvent;
    }

    const isMyEvent = event.creator_id === currentUserId;
    const isJoined = joinedEventIds.includes(event.id);

    if (activeTab === 'my') {
      return isMyEvent;
    }

    if (activeTab === 'joined') {
      return !isMyEvent && isJoined && !isPastEvent;
    }

    return !isMyEvent && !isJoined && !isPastEvent;
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
          className="w-10 h-10 rounded-full flex items-center justify-center border"
          style={{
            backgroundColor: '#3A3A3A',
            borderColor: 'rgba(212, 175, 55, 0.45)',
            boxShadow: '0 0 0 1px rgba(212, 175, 55, 0.12)',
            color: '#F5F5F5',
          }}
          title={currentUserName}
        >
          <span className="text-sm">{getInitials(currentUserName)}</span>
        </motion.button>
      </div>

      <div className="flex border-b border-border">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveTab('discover')}
          className={`flex-1 py-3 transition-colors ${activeTab === 'discover' ? 'border-b-2' : 'text-muted-foreground'
            }`}
          style={
            activeTab === 'discover'
              ? { borderColor: '#D4AF37', color: '#D4AF37' }
              : {}
          }
        >
          Discover
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveTab('joined')}
          className={`flex-1 py-3 transition-colors ${activeTab === 'joined' ? 'border-b-2' : 'text-muted-foreground'
            }`}
          style={
            activeTab === 'joined'
              ? { borderColor: '#D4AF37', color: '#D4AF37' }
              : {}
          }
        >
          Joined
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveTab('my')}
          className={`flex-1 py-3 transition-colors ${activeTab === 'my' ? 'border-b-2' : 'text-muted-foreground'
            }`}
          style={
            activeTab === 'my'
              ? { borderColor: '#D4AF37', color: '#D4AF37' }
              : {}
          }
        >
          My Events
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
                {activeTab === 'my'
                  ? 'No my events yet'
                  : activeTab === 'joined'
                    ? 'No joined events yet'
                    : 'No discover events yet'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {activeTab === 'my'
                  ? 'Create your first event by tapping the + button.'
                  : activeTab === 'joined'
                    ? 'Events you join will appear here.'
                    : 'There are no events from other users yet.'}
              </p>
            </div>
          )}

          {!loading &&
            filteredEvents.map((event, index) => {
              const eventDate = event.date_time ? new Date(event.date_time) : null;
              const isPastEvent =
                eventDate !== null &&
                !Number.isNaN(eventDate.getTime()) &&
                eventDate.getTime() < Date.now();

              return (
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
                  onClick={() =>
                    onNavigate('event-details', {
                      ...event,
                      backTarget: 'home',
                    })
                  }
                  className="rounded-xl p-4 border border-border cursor-pointer transition-all active:opacity-90"
                  style={{
                    backgroundColor: '#1A1A1A',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    opacity: isPastEvent ? 0.72 : 1,
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3>{event.title}</h3>

                    {isPastEvent && (
                      <span
                        className="text-[10px] px-2 py-1 rounded-full border whitespace-nowrap"
                        style={{
                          borderColor: 'rgba(212, 175, 55, 0.28)',
                          color: '#D4AF37',
                          backgroundColor: 'rgba(212, 175, 55, 0.08)',
                        }}
                      >
                        Past
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">
                    {formatEventDate(event.date_time)}
                  </p>

                  <p className="text-sm text-muted-foreground mb-3">
                    {event.location || 'Location not specified'}
                  </p>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">
                      Created by {event.creator_id === currentUserId ? 'You' : event.creatorName || 'Unknown'}
                    </span>

                    <span className="text-xs text-muted-foreground">
                      {event.participantCount} participant{event.participantCount === 1 ? '' : 's'}
                    </span>
                  </div>
                </motion.div>
              );
            })}
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