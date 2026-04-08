import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { PullToRefresh } from './PullToRefresh';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../constants/translations';
import {
  ACTIVITY_TYPES,
  type ActivityType,
  getActivityTypeMeta,
} from '../constants/activityTypes';

type EventItem = {
  id: string;
  title: string;
  description?: string | null;
  date_time?: string | null;
  location?: string | null;
  creator_id?: string | null;
  creatorName?: string | null;
  activity_type?: ActivityType | null;
  participantCount: number;
};

const SERVER_BATCH_SIZE = 100;
const LOCAL_BATCH_SIZE = 10;

export function HomeScreen({
  onNavigate,
}: {
  onNavigate: (screen: string, data?: any) => void;
}) {
  const [activeTab, setActiveTab] = useState<'discover' | 'my' | 'joined'>('discover');
  const [selectedActivityType, setSelectedActivityType] = useState<ActivityType | 'all'>('all');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>('User');
  const [joinedEventIds, setJoinedEventIds] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(LOCAL_BATCH_SIZE);
  const [serverOffset, setServerOffset] = useState(0);
  const [hasMoreServerEvents, setHasMoreServerEvents] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

 const { language, translate } = useLanguage();

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

  const isPastEvent = (dateString?: string | null) => {
    if (!dateString) return false;

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    return date.getTime() < Date.now();
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
        .order('date_time', { ascending: true })
        .range(0, SERVER_BATCH_SIZE - 1);

      if (eventsError) {
        console.error('Ошибка загрузки событий:', eventsError);
        setEvents([]);
        setServerOffset(0);
        setHasMoreServerEvents(false);
        return;
      }

      setServerOffset(eventsData?.length || 0);
      setHasMoreServerEvents((eventsData?.length || 0) === SERVER_BATCH_SIZE);

      const creatorIds = Array.from(
        new Set(
          (eventsData || [])
            .map((event: any) => event.creator_id)
            .filter(Boolean)
        )
      );

      let creatorNameMap: Record<string, string> = {};

      if (creatorIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', creatorIds);

        if (profilesError) {
          console.error('Ошибка загрузки профилей создателей:', profilesError);
        } else {
          (profilesData || []).forEach((profile: any) => {
            if (!profile?.id) return;
            creatorNameMap[profile.id] = profile.name || 'Unknown';
          });
        }
      }

      const { data: participantsData, error: participantsError } = await supabase
        .from('participants')
        .select('event_id, user_id');

      if (participantsError) {
        console.error('Ошибка загрузки участников для счетчика:', participantsError);

        const fallbackEvents: EventItem[] = (eventsData || []).map((event: any) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          date_time: event.date_time,
          location: event.location,
          creator_id: event.creator_id,
          creatorName: event.creator_id ? creatorNameMap[event.creator_id] || 'Unknown' : 'Unknown',
          activity_type: (event.activity_type || 'other') as ActivityType,
          participantCount: 0,
        }));

        setEvents(fallbackEvents);
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
        activity_type: (event.activity_type || 'other') as ActivityType,
        participantCount: countsMap[event.id] || 0,
      }));

      setEvents(mappedEvents);
    } catch (error) {
      console.error('Unexpected error while fetching events:', error);
      setEvents([]);
      setServerOffset(0);
      setHasMoreServerEvents(false);
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  const loadMoreEventsFromServer = async () => {
    if (loadingMore || !hasMoreServerEvents) {
      return;
    }

    setLoadingMore(true);

    try {
      const from = serverOffset;
      const to = serverOffset + SERVER_BATCH_SIZE - 1;

      const { data: moreEventsData, error: moreEventsError } = await supabase
        .from('events')
        .select('*')
        .order('date_time', { ascending: true })
        .range(from, to);

      if (moreEventsError) {
        console.error('Ошибка догрузки событий:', moreEventsError);
        return;
      }

      const creatorIds = Array.from(
        new Set(
          (moreEventsData || [])
            .map((event: any) => event.creator_id)
            .filter(Boolean)
        )
      );

      let creatorNameMap: Record<string, string> = {};

      if (creatorIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', creatorIds);

        if (profilesError) {
          console.error('Ошибка загрузки профилей создателей при догрузке:', profilesError);
        } else {
          (profilesData || []).forEach((profile: any) => {
            if (!profile?.id) return;
            creatorNameMap[profile.id] = profile.name || 'Unknown';
          });
        }
      }

      const { data: participantsData, error: participantsError } = await supabase
        .from('participants')
        .select('event_id, user_id');

      if (participantsError) {
        console.error('Ошибка загрузки участников при догрузке:', participantsError);
        return;
      }

      const countsMap: Record<string, number> = {};

      (participantsData || []).forEach((participant: any) => {
        const eventId = participant.event_id;

        if (!eventId) return;

        countsMap[eventId] = (countsMap[eventId] || 0) + 1;
      });

      const mappedMoreEvents: EventItem[] = (moreEventsData || []).map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date_time: event.date_time,
        location: event.location,
        creator_id: event.creator_id,
        creatorName: event.creator_id ? creatorNameMap[event.creator_id] || 'Unknown' : 'Unknown',
        activity_type: (event.activity_type || 'other') as ActivityType,
        participantCount: countsMap[event.id] || 0,
      }));

      setEvents((prevEvents) => {
        const existingIds = new Set(prevEvents.map((event) => event.id));
        const uniqueNewEvents = mappedMoreEvents.filter((event) => !existingIds.has(event.id));
        return [...prevEvents, ...uniqueNewEvents];
      });

      setServerOffset((prev) => prev + (moreEventsData?.length || 0));
      setHasMoreServerEvents((moreEventsData?.length || 0) === SERVER_BATCH_SIZE);
    } catch (error) {
      console.error('Unexpected error while loading more events from server:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const past = isPastEvent(event.date_time);

      if (!currentUserId) {
        if (activeTab !== 'discover' || past) {
          return false;
        }

        return selectedActivityType === 'all' || (event.activity_type || 'other') === selectedActivityType;
      }

      const isMyEvent = event.creator_id === currentUserId;
      const isJoined = joinedEventIds.includes(event.id);

      let matchesTab = false;

      if (activeTab === 'my') {
        matchesTab = isMyEvent;
      } else if (activeTab === 'joined') {
        matchesTab = !isMyEvent && isJoined && !past;
      } else {
        matchesTab = !isMyEvent && !isJoined && !past;
      }

      if (!matchesTab) {
        return false;
      }

      return selectedActivityType === 'all' || (event.activity_type || 'other') === selectedActivityType;
    });
  }, [events, currentUserId, joinedEventIds, activeTab, selectedActivityType]);

  const sortedEvents = useMemo(() => {
    const result = [...filteredEvents];

    if (activeTab === 'my') {
      result.sort((a, b) => {
        const aTime = a.date_time ? new Date(a.date_time).getTime() : 0;
        const bTime = b.date_time ? new Date(b.date_time).getTime() : 0;
        return bTime - aTime;
      });
    }

    return result;
  }, [filteredEvents, activeTab]);

  const visibleEvents = useMemo(() => {
    return sortedEvents.slice(0, visibleCount);
  }, [sortedEvents, visibleCount]);

  const shouldShowInitialLoader = loading && events.length === 0;
  const shouldShowEmptyState = !loading && sortedEvents.length === 0;
  const canShowLoadMore = !loading && visibleEvents.length < sortedEvents.length;
  const canLoadMoreFromServer =
    !loading &&
    !loadingMore &&
    hasMoreServerEvents &&
    sortedEvents.length >= visibleCount;
  const shouldShowLoadMore = canShowLoadMore || canLoadMoreFromServer;

  const handleLoadMore = async () => {
    if (visibleCount < sortedEvents.length) {
      setVisibleCount((prev) => prev + LOCAL_BATCH_SIZE);
      return;
    }

    if (hasMoreServerEvents) {
      await loadMoreEventsFromServer();
      setVisibleCount((prev) => prev + LOCAL_BATCH_SIZE);
    }
  };

  const handleRefresh = async () => {
    setVisibleCount(LOCAL_BATCH_SIZE);
    setServerOffset(0);
    setHasMoreServerEvents(true);
    await fetchEvents(true);
  };

  useEffect(() => {
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
  }, [currentUserId]);

  useEffect(() => {
    setVisibleCount(LOCAL_BATCH_SIZE);
  }, [activeTab, selectedActivityType]);

  useEffect(() => {
    fetchEvents(true);
  }, []);

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
          className={`flex-1 py-3 transition-colors ${
            activeTab === 'discover' ? 'border-b-2' : 'text-muted-foreground'
          }`}
          style={
            activeTab === 'discover'
              ? { borderColor: '#D4AF37', color: '#D4AF37' }
              : {}
          }
        >
          {t(language, 'home.discover')}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveTab('joined')}
          className={`flex-1 py-3 transition-colors ${
            activeTab === 'joined' ? 'border-b-2' : 'text-muted-foreground'
          }`}
          style={
            activeTab === 'joined'
              ? { borderColor: '#D4AF37', color: '#D4AF37' }
              : {}
          }
        >
          {t(language, 'home.joined')}
        </motion.button>

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
          {t(language, 'home.myEvents')}
        </motion.button>
      </div>

      <div className="border-b border-border px-4 py-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedActivityType('all')}
            className="shrink-0 px-3 py-2 rounded-full text-sm border transition-all"
            style={{
              backgroundColor:
                selectedActivityType === 'all' ? 'rgba(212, 175, 55, 0.12)' : '#1A1A1A',
              borderColor:
                selectedActivityType === 'all'
                  ? 'rgba(212, 175, 55, 0.5)'
                  : 'rgba(255, 255, 255, 0.1)',
              color: selectedActivityType === 'all' ? '#D4AF37' : '#F5F5F5',
            }}
          >
            {t(language, 'home.all')}
          </button>

          {ACTIVITY_TYPES.map((type) => {
            const isActive = selectedActivityType === type.value;

            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setSelectedActivityType(type.value)}
                className="shrink-0 px-3 py-2 rounded-full text-sm border transition-all"
                style={{
                  backgroundColor: isActive ? 'rgba(212, 175, 55, 0.12)' : '#1A1A1A',
                  borderColor: isActive
                    ? 'rgba(212, 175, 55, 0.5)'
                    : 'rgba(255, 255, 255, 0.1)',
                  color: isActive ? '#D4AF37' : '#F5F5F5',
                }}
              >
                <span className="mr-2">{type.emoji}</span>
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <PullToRefresh onRefresh={handleRefresh}>
        <div className="h-full overflow-y-auto px-6 py-4 space-y-3">
          {shouldShowInitialLoader && (
            <div className="flex justify-center py-6">
              <div
                className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{
                  borderColor: 'rgba(212, 175, 55, 0.35)',
                  borderTopColor: 'transparent',
                }}
              />
            </div>
          )}

          {shouldShowEmptyState && (
            <div
              className="rounded-xl p-4 border border-border"
              style={{
                backgroundColor: '#1A1A1A',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
            >
              <h3 className="mb-2">
                {activeTab === 'my'
                  ? t(language, 'home.noMyEvents')
                  : activeTab === 'joined'
                    ? t(language, 'home.noJoinedEvents')
                    : t(language, 'home.noDiscoverEvents')}
              </h3>

              <p className="text-sm text-muted-foreground">
                {selectedActivityType !== 'all'
                  ? t(language, 'home.noEventsForFilter')
                  : activeTab === 'my'
                    ? t(language, 'home.createFirstEvent')
                    : activeTab === 'joined'
                      ? t(language, 'home.joinedWillAppear')
                      : t(language, 'home.noEventsFromOthers')}
              </p>
            </div>
          )}

          {visibleEvents.map((event, index) => {
            const past = isPastEvent(event.date_time);
            const activityMeta = getActivityTypeMeta(event.activity_type);

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.03,
                  duration: 0.18,
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
                  opacity: past ? 0.72 : 1,
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3>{event.title}</h3>

                  {past && (
                    <span
                      className="text-[10px] px-2 py-1 rounded-full border whitespace-nowrap"
                      style={{
                        borderColor: 'rgba(212, 175, 55, 0.28)',
                        color: '#D4AF37',
                        backgroundColor: 'rgba(212, 175, 55, 0.08)',
                      }}
                    >
                      {t(language, 'home.past')}
                    </span>
                  )}
                </div>

                <div className="mb-2">
                  <span
                    className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border"
                    style={{
                      borderColor: 'rgba(212, 175, 55, 0.22)',
                      color: '#D4AF37',
                      backgroundColor: 'rgba(212, 175, 55, 0.06)',
                    }}
                  >
                    <span>{activityMeta.emoji}</span>
                    <span>{activityMeta.label}</span>
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-2">
                  {formatEventDate(event.date_time)}
                </p>

                <p className="text-sm text-muted-foreground mb-3">
                  {event.location || 'Location not specified'}
                </p>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">
                    {t(language, 'home.createdBy')} {event.creator_id === currentUserId ? t(language, 'home.you') : event.creatorName || 'Unknown'}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {event.participantCount}{' '}
                    {event.participantCount === 1
                      ? t(language, 'home.participant')
                      : t(language, 'home.participants')}
                  </span>
                </div>
              </motion.div>
            );
          })}

          {shouldShowLoadMore && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="w-full rounded-xl p-4 border border-border text-sm transition-all disabled:opacity-60"
              style={{
                backgroundColor: '#1A1A1A',
                color: '#D4AF37',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
            >
              {loadingMore ? t(language, 'home.loading') : t(language, 'home.loadMore')}
            </motion.button>
          )}
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