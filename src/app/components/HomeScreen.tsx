import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type TouchEvent,
  type UIEvent,
} from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PullToRefresh } from './PullToRefresh';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { getActivityTypeMeta, type ActivityType } from '../constants/activityTypes';
import { canonicalizeCityName, normalizeCityName } from '../lib/locationCity';
import { LoadingLine } from './LoadingState';
import {
  fetchAccessibleEventPrivateDetailsMap,
  fetchEventFeedMetadata,
  fetchMyProfileAccessSummary,
  fetchJoinedEventIdsForUser,
  fetchParticipantCounts,
  fetchPublicProfileNameMap,
} from '../lib/publicData';
import { HomeEventCard } from './home/HomeEventCard';
import { HomeEmptyState, HomeInitialLoader } from './home/HomeFeedStates';
import {
  getEventTimestamp,
  HomeCityPulse,
  HomeDiscoverHistoryNudge,
  HomeFeedSection,
  HomeSocialProofSummary,
  HomeTemplateIdeas,
  HomeTrendingCreators,
} from './home/HomeFeedSections';
import { HomeFilters } from './home/HomeFilters';
import { HomeHeader } from './home/HomeHeader';
import { HomeLaunchOverlay } from './home/HomeLaunchOverlay';
import type { CityFilterOption, HomeEventItem, HomeTab } from './home/types';

const SERVER_BATCH_SIZE = 100;
const LOCAL_BATCH_SIZE = 10;
const HOME_LAUNCH_OVERLAY_DISMISSED_KEY = 'gathr-home-launch-overlay-dismissed';
type HomeTabTransitionDirection = 'next' | 'prev';

export function HomeScreen({
  onNavigate,
}: {
  onNavigate: (screen: string, data?: any) => void;
}) {
  const tabTransition = {
    duration: 0.22,
    ease: [0.22, 1, 0.36, 1] as const,
  };
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const [activeTab, setActiveTab] = useState<HomeTab>('discover');
  const [tabContentDirection, setTabContentDirection] =
    useState<HomeTabTransitionDirection>('next');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [selectedActivityType, setSelectedActivityType] = useState<ActivityType | 'all'>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [isCityPickerOpen, setIsCityPickerOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [isEventSearchOpen, setIsEventSearchOpen] = useState(false);
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [isLaunchOverlayVisible, setIsLaunchOverlayVisible] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem(HOME_LAUNCH_OVERLAY_DISMISSED_KEY) !== 'true';
  });
  const [events, setEvents] = useState<HomeEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [openSupportTicketCount, setOpenSupportTicketCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [joinedEventIds, setJoinedEventIds] = useState<string[]>([]);
  const [outgoingJoinRequestCount, setOutgoingJoinRequestCount] = useState(0);
  const [visibleCount, setVisibleCount] = useState(LOCAL_BATCH_SIZE);
  const [serverOffset, setServerOffset] = useState(0);
  const [hasMoreServerEvents, setHasMoreServerEvents] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoaderPhase, setInitialLoaderPhase] = useState<'hidden' | 'visible' | 'exiting'>(
    'hidden'
  );
  const eventsRef = useRef<HomeEventItem[]>([]);
  const currentUserIdRef = useRef<string | null>(null);
  const initialLoaderShownAtRef = useRef<number | null>(null);
  const homeTabSwipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const homeTabTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const contentScrollRef = useRef<HTMLDivElement | null>(null);

  const { language, translate } = useLanguage();
  const { effectiveTheme } = useTheme();

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    syncPreference();
    mediaQuery.addEventListener('change', syncPreference);

    return () => {
      mediaQuery.removeEventListener('change', syncPreference);
    };
  }, []);

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
    if (!dateString) return translate('common.dateNotSpecified');

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return translate('common.invalidDate');
    }

    return date.toLocaleString();
  };

  const isPastEvent = (eventOrDate?: HomeEventItem | string | null) => {
    if (!eventOrDate) return false;

    if (typeof eventOrDate === 'object') {
      if (typeof eventOrDate.is_past === 'boolean') {
        return eventOrDate.is_past;
      }

      const nextDateString = eventOrDate.date_time;

      if (!nextDateString) {
        return false;
      }

      const nextDate = new Date(nextDateString);

      if (Number.isNaN(nextDate.getTime())) {
        return false;
      }

      return nextDate.getTime() < Date.now();
    }

    const date = new Date(eventOrDate);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    return date.getTime() < Date.now();
  };

  const getEventSortTime = (event: HomeEventItem) => {
    if (typeof event.sort_rank === 'number' && Number.isFinite(event.sort_rank)) {
      return event.sort_rank;
    }

    const primaryTime = event.date_time ? new Date(event.date_time).getTime() : Number.NaN;

    if (!Number.isNaN(primaryTime)) {
      return primaryTime;
    }

    const fallbackTime = event.created_at ? new Date(event.created_at).getTime() : Number.NaN;

    if (!Number.isNaN(fallbackTime)) {
      return fallbackTime;
    }

    return 0;
  };

  const refreshOpenSupportTicketCount = async () => {
    try {
      const { data, error } = await supabase.rpc('admin_list_support_requests');

      if (error) {
        console.error('Failed to load admin support ticket count:', error);
        setOpenSupportTicketCount(0);
        return;
      }

      const rows = (data as Array<{ status?: string | null }> | null) || [];
      setOpenSupportTicketCount(rows.filter((row) => row.status === 'new').length);
    } catch (error) {
      console.error('Unexpected admin support ticket count error:', error);
      setOpenSupportTicketCount(0);
    }
  };

  const refreshParticipantCounts = async () => {
    try {
      const eventIds = eventsRef.current.map((event) => event.id);
      const [countsMap, nextJoinedEventIds] = await Promise.all([
        fetchParticipantCounts(eventIds),
        fetchJoinedEventIdsForUser(currentUserIdRef.current),
      ]);
      setJoinedEventIds(nextJoinedEventIds);
      setEvents((prevEvents) =>
        prevEvents.map((event) => ({
          ...event,
          participantCount:
            Object.prototype.hasOwnProperty.call(countsMap, event.id)
              ? countsMap[event.id]
              : event.participantCount,
        }))
      );
    } catch (error) {
      console.error('Unexpected error while refreshing participant counts:', error);
    }
  };

  const refreshOutgoingJoinRequestCount = async (userId: string | null | undefined) => {
    if (!userId) {
      setOutgoingJoinRequestCount(0);
      return;
    }

    try {
      const { count, error } = await supabase
        .from('event_join_requests')
        .select('id', { count: 'exact', head: true })
        .eq('requester_id', userId)
        .eq('status', 'pending');

      if (error) {
        console.error('Failed to load outgoing join request count:', error);
        setOutgoingJoinRequestCount(0);
        return;
      }

      setOutgoingJoinRequestCount(count ?? 0);
    } catch (error) {
      console.error('Unexpected outgoing join request count error:', error);
      setOutgoingJoinRequestCount(0);
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
        console.error('Failed to load current user:', userError);
      }

      const userId = user?.id ?? null;
      setCurrentUserId(userId);

      if (userId) {
        const profileData = await fetchMyProfileAccessSummary();
        const nextIsAdmin = profileData?.role === 'admin';
        setIsAdmin(nextIsAdmin);
        await refreshOutgoingJoinRequestCount(userId);

        if (nextIsAdmin) {
          await refreshOpenSupportTicketCount();
        } else {
          setOpenSupportTicketCount(0);
        }
      } else {
        setIsAdmin(false);
        setOpenSupportTicketCount(0);
        setOutgoingJoinRequestCount(0);
      }

      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
        .range(0, SERVER_BATCH_SIZE - 1);

      if (eventsError) {
        console.error('Failed to load events:', eventsError);
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

      const [creatorNameMapRaw, countsMap, nextJoinedEventIds, feedMetadataMap] = await Promise.all([
        fetchPublicProfileNameMap(creatorIds),
        fetchParticipantCounts((eventsData || []).map((event: any) => event.id)),
        fetchJoinedEventIdsForUser(userId),
        fetchEventFeedMetadata((eventsData || []).map((event: any) => event.id)),
      ]);

      const privateDetailsMap = await fetchAccessibleEventPrivateDetailsMap(
        (eventsData || []).map((event: any) => event.id)
      );

      const creatorNameMap = Object.fromEntries(
        Object.entries(creatorNameMapRaw).map(([id, name]) => [id, name || translate('common.unknown')])
      );

      setJoinedEventIds(nextJoinedEventIds);

      const mappedEvents: HomeEventItem[] = (eventsData || []).map((event: any) => {
        const privateDetails = privateDetailsMap[event.id];
        const canonicalCity = canonicalizeCityName(event.city || event.city_normalized);

        return {
          id: event.id,
          title: event.title,
          description: event.description,
          created_at: event.created_at ?? null,
          sort_rank: feedMetadataMap[event.id]?.sortRank ?? null,
          is_past: feedMetadataMap[event.id]?.isPast ?? null,
          date_time: privateDetails?.date_time ?? event.date_time ?? null,
          location: privateDetails?.location ?? event.location ?? null,
          location_lat:
            typeof privateDetails?.location_lat === 'number'
              ? privateDetails.location_lat
              : typeof event.location_lat === 'number'
                ? event.location_lat
                : null,
          location_lng:
            typeof privateDetails?.location_lng === 'number'
              ? privateDetails.location_lng
              : typeof event.location_lng === 'number'
                ? event.location_lng
                : null,
          city: canonicalCity.city || event.city,
          city_normalized: canonicalCity.cityNormalized || event.city_normalized,
          creator_id: event.creator_id,
          creatorName: event.creator_id
            ? creatorNameMap[event.creator_id] || translate('common.unknown')
            : translate('common.unknown'),
          activity_type: (event.activity_type || 'other') as ActivityType,
          join_mode: (event.join_mode || 'open') as 'open' | 'request',
          participantCount: countsMap[event.id] || 0,
        };
      });

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
        .order('created_at', { ascending: false })
        .range(from, to);

      if (moreEventsError) {
        console.error('Failed to load more events:', moreEventsError);
        return;
      }

      const creatorIds = Array.from(
        new Set(
          (moreEventsData || [])
            .map((event: any) => event.creator_id)
            .filter(Boolean)
        )
      );

      const [creatorNameMapRaw, countsMap, feedMetadataMap] = await Promise.all([
        fetchPublicProfileNameMap(creatorIds),
        fetchParticipantCounts((moreEventsData || []).map((event: any) => event.id)),
        fetchEventFeedMetadata((moreEventsData || []).map((event: any) => event.id)),
      ]);

      const privateDetailsMap = await fetchAccessibleEventPrivateDetailsMap(
        (moreEventsData || []).map((event: any) => event.id)
      );

      const creatorNameMap = Object.fromEntries(
        Object.entries(creatorNameMapRaw).map(([id, name]) => [id, name || translate('common.unknown')])
      );

      const mappedMoreEvents: HomeEventItem[] = (moreEventsData || []).map((event: any) => {
        const privateDetails = privateDetailsMap[event.id];
        const canonicalCity = canonicalizeCityName(event.city || event.city_normalized);

        return {
          id: event.id,
          title: event.title,
          description: event.description,
          created_at: event.created_at ?? null,
          sort_rank: feedMetadataMap[event.id]?.sortRank ?? null,
          is_past: feedMetadataMap[event.id]?.isPast ?? null,
          date_time: privateDetails?.date_time ?? event.date_time ?? null,
          location: privateDetails?.location ?? event.location ?? null,
          location_lat:
            typeof privateDetails?.location_lat === 'number'
              ? privateDetails.location_lat
              : typeof event.location_lat === 'number'
                ? event.location_lat
                : null,
          location_lng:
            typeof privateDetails?.location_lng === 'number'
              ? privateDetails.location_lng
              : typeof event.location_lng === 'number'
                ? event.location_lng
                : null,
          city: canonicalCity.city || event.city,
          city_normalized: canonicalCity.cityNormalized || event.city_normalized,
          creator_id: event.creator_id,
          creatorName: event.creator_id
            ? creatorNameMap[event.creator_id] || translate('common.unknown')
            : translate('common.unknown'),
          activity_type: (event.activity_type || 'other') as ActivityType,
          join_mode: (event.join_mode || 'open') as 'open' | 'request',
          participantCount: countsMap[event.id] || 0,
        };
      });

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

  const filteredEventsByControls = useMemo(() => {
    return events.filter((event) => {
      const matchesActivity =
        selectedActivityType === 'all' ||
        (event.activity_type || 'other') === selectedActivityType;
      const matchesCity =
        selectedCity === 'all' || event.city_normalized === selectedCity;
      const normalizedSearchQuery = eventSearchQuery.trim().toLocaleLowerCase();
      const searchableContent = [
        event.title,
        event.description,
        event.location,
        event.city,
        event.creatorName,
      ]
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        .join(' ')
        .toLocaleLowerCase();
      const matchesSearch =
        normalizedSearchQuery.length === 0 || searchableContent.includes(normalizedSearchQuery);

      if (!matchesActivity || !matchesCity || !matchesSearch) {
        return false;
      }

      return true;
    });
  }, [events, selectedActivityType, selectedCity, eventSearchQuery]);

  const filteredEvents = useMemo(() => {
    return filteredEventsByControls.filter((event) => {
      const past = isPastEvent(event);

      if (activeTab === 'overview') {
        return false;
      }

      if (!currentUserId) {
        if (activeTab !== 'discover' || past) {
          return false;
        }

        return true;
      }

      const isMyEvent = event.creator_id === currentUserId;
      const isJoined = joinedEventIds.includes(event.id);

      let matchesTab = false;

      if (activeTab === 'my') {
        matchesTab = isMyEvent;
      } else if (activeTab === 'visited') {
        matchesTab = isJoined && past;
      } else if (activeTab === 'joined') {
        matchesTab = !isMyEvent && isJoined && !past;
      } else {
        matchesTab = !isMyEvent && !isJoined && !past;
      }

      if (!matchesTab) {
        return false;
      }

      return true;
    });
  }, [filteredEventsByControls, currentUserId, joinedEventIds, activeTab]);

  const availableCities = useMemo<CityFilterOption[]>(() => {
    const cityMap = new Map<string, string>();

    events.forEach((event) => {
      const city = event.city?.trim();
      const cityNormalized = event.city_normalized?.trim();

      if (!city || !cityNormalized || cityMap.has(cityNormalized)) {
        return;
      }

      cityMap.set(cityNormalized, city);
    });

    return Array.from(cityMap.entries())
      .map(([cityNormalized, city]) => ({
        city,
        cityNormalized,
      }))
      .sort((a, b) => a.city.localeCompare(b.city, language));
  }, [events, language]);

  const filteredCityOptions = useMemo(() => {
    const normalizedQuery = normalizeCityName(citySearchQuery);

    if (!normalizedQuery) {
      return availableCities;
    }

    return availableCities.filter((cityOption) =>
      normalizeCityName(cityOption.city)?.includes(normalizedQuery)
    );
  }, [availableCities, citySearchQuery]);

  const selectedCityLabel = useMemo(() => {
    if (selectedCity === 'all') {
      return translate('home.allCities');
    }

    return (
      availableCities.find((cityOption) => cityOption.cityNormalized === selectedCity)?.city ||
      translate('home.allCities')
    );
  }, [availableCities, selectedCity, translate]);

  const homeTabs = useMemo(
    () => [
      { key: 'discover' as const, label: translate('home.discover') },
      { key: 'joined' as const, label: translate('home.joined') },
      { key: 'my' as const, label: translate('home.myEvents') },
      { key: 'visited' as const, label: translate('home.visited') },
      { key: 'overview' as const, label: translate('home.overview') },
    ],
    [translate]
  );

  const launchOverlayStyles = useMemo(() => {
    if (effectiveTheme === 'dark') {
      return {
        scrimBackground: 'rgba(8, 8, 8, 0.68)',
        cardBackground: 'rgba(20, 20, 20, 0.96)',
        cardBorder: 'var(--accent-border-faint)',
        cardShadow: '0 18px 48px rgba(0, 0, 0, 0.42)',
        badgeBackground: 'var(--accent-soft-muted)',
        badgeBorder: 'var(--accent-border-muted)',
        buttonShadow: '0 8px 24px rgba(212, 175, 55, 0.24)',
      };
    }

    return {
      scrimBackground: 'rgba(63, 47, 18, 0.18)',
      cardBackground: 'rgba(255, 250, 242, 0.96)',
      cardBorder: 'var(--accent-border-soft)',
      cardShadow: '0 18px 48px rgba(66, 50, 20, 0.18)',
      badgeBackground: 'var(--accent-soft-subtle)',
      badgeBorder: 'var(--accent-border-soft)',
      buttonShadow: '0 8px 24px rgba(196, 151, 36, 0.2)',
    };
  }, [effectiveTheme]);

  const sortedEvents = useMemo(() => {
    const result = [...filteredEvents];

    result.sort((a, b) => {
      const aTime = getEventSortTime(a);
      const bTime = getEventSortTime(b);

      if (activeTab === 'my' || activeTab === 'visited') {
        return bTime - aTime;
      }

      return aTime - bTime;
    });

    return result;
  }, [filteredEvents, activeTab]);

  const visibleEvents = useMemo(() => {
    return sortedEvents.slice(0, visibleCount);
  }, [sortedEvents, visibleCount]);

  const featuredEvents = useMemo(() => {
    if (activeTab !== 'discover') {
      return [];
    }

    return [...sortedEvents]
      .filter((event) => !isPastEvent(event))
      .sort((a, b) => {
        if (b.participantCount !== a.participantCount) {
          return b.participantCount - a.participantCount;
        }

        return getEventTimestamp(a) - getEventTimestamp(b);
      })
      .slice(0, 5);
  }, [activeTab, sortedEvents]);

  const primaryFeaturedEvent = featuredEvents[0] ?? null;

  const featuredEventIds = useMemo(() => {
    return new Set(primaryFeaturedEvent ? [primaryFeaturedEvent.id] : []);
  }, [primaryFeaturedEvent]);

  const discoverUpcomingEvents = useMemo(() => {
    if (activeTab !== 'discover') {
      return [];
    }

    return sortedEvents.filter((event) => !featuredEventIds.has(event.id));
  }, [activeTab, sortedEvents, featuredEventIds]);

  const visibleUpcomingEvents = useMemo(() => {
    if (activeTab !== 'discover') {
      return visibleEvents;
    }

    return discoverUpcomingEvents.slice(0, visibleCount);
  }, [activeTab, discoverUpcomingEvents, visibleCount, visibleEvents]);

  const recentlyHappenedEvents = useMemo(() => {
    if (activeTab !== 'discover') {
      return [];
    }

    return filteredEventsByControls
      .filter((event) => isPastEvent(event))
      .sort((a, b) => getEventTimestamp(b) - getEventTimestamp(a))
      .slice(0, 3);
  }, [activeTab, filteredEventsByControls]);

  const popularPastEvents = useMemo(() => {
    if (activeTab !== 'overview') {
      return [];
    }

    const recentlyHappenedIds = new Set(recentlyHappenedEvents.map((event) => event.id));

    return filteredEventsByControls
      .filter((event) => isPastEvent(event) && !recentlyHappenedIds.has(event.id))
      .sort((a, b) => {
        if (b.participantCount !== a.participantCount) {
          return b.participantCount - a.participantCount;
        }

        return getEventTimestamp(b) - getEventTimestamp(a);
      })
      .slice(0, 5);
  }, [activeTab, filteredEventsByControls, recentlyHappenedEvents]);

  const trendingCreators = useMemo(() => {
    if (activeTab !== 'overview') {
      return [];
    }

    const creatorMap = new Map<
      string,
      {
        id: string;
        name: string;
        eventCount: number;
        totalParticipants: number;
        lastActivityAt: number;
      }
    >();

    filteredEventsByControls.forEach((event) => {
      if (!event.creator_id) {
        return;
      }

      const existing = creatorMap.get(event.creator_id);
      const lastActivityAt = Math.max(
        getEventTimestamp(event),
        event.created_at ? new Date(event.created_at).getTime() || 0 : 0
      );

      if (existing) {
        existing.eventCount += 1;
        existing.totalParticipants += event.participantCount;
        existing.lastActivityAt = Math.max(existing.lastActivityAt, lastActivityAt);
        return;
      }

      creatorMap.set(event.creator_id, {
        id: event.creator_id,
        name: event.creatorName || translate('common.unknown'),
        eventCount: 1,
        totalParticipants: event.participantCount,
        lastActivityAt,
      });
    });

    return Array.from(creatorMap.values())
      .filter((creator) => creator.eventCount > 1 || creator.totalParticipants > 0)
      .sort((a, b) => {
        if (b.eventCount !== a.eventCount) {
          return b.eventCount - a.eventCount;
        }

        if (b.totalParticipants !== a.totalParticipants) {
          return b.totalParticipants - a.totalParticipants;
        }

        return b.lastActivityAt - a.lastActivityAt;
      })
      .slice(0, 3)
      .map((creator) => ({
        id: creator.id,
        name: creator.name,
        initials: getInitials(creator.name),
        eventCount: creator.eventCount,
        totalParticipants: creator.totalParticipants,
      }));
  }, [activeTab, filteredEventsByControls, translate]);

  const cityPulseItems = useMemo(() => {
    if (activeTab !== 'overview') {
      return [];
    }

    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
    const items: Array<{ id: string; text: string }> = [];
    const primaryRecentlyHappenedId = recentlyHappenedEvents[0]?.id ?? null;

    const createdThisWeekCount = filteredEventsByControls.filter((event) => {
      const createdAt = event.created_at ? new Date(event.created_at).getTime() : Number.NaN;
      return !Number.isNaN(createdAt) && createdAt >= weekAgo;
    }).length;

    if (createdThisWeekCount >= 2) {
      items.push({
        id: 'created-this-week',
        text: `${createdThisWeekCount} ${translate('home.cityPulseCreatedThisWeek')}`,
      });
    }

    const topPastEvent = filteredEventsByControls
      .filter(
        (event) =>
          isPastEvent(event) &&
          event.participantCount > 0 &&
          event.id !== primaryRecentlyHappenedId
      )
      .sort((a, b) => b.participantCount - a.participantCount)[0];

    if (topPastEvent) {
      items.push({
        id: `past-participants-${topPastEvent.id}`,
        text: `${topPastEvent.title} ${translate('home.cityPulseHad')} ${
          topPastEvent.participantCount
        } ${translate('home.socialProofParticipants')}`,
      });
    }

    const monthlyActivityCounts = new Map<ActivityType, number>();
    filteredEventsByControls.forEach((event) => {
      const eventAt = getEventTimestamp(event);

      if (eventAt < monthAgo || !event.activity_type) {
        return;
      }

      monthlyActivityCounts.set(
        event.activity_type,
        (monthlyActivityCounts.get(event.activity_type) || 0) + 1
      );
    });

    const topActivity = Array.from(monthlyActivityCounts.entries()).sort((a, b) => b[1] - a[1])[0];

    if (topActivity && topActivity[1] >= 2) {
      const activityMeta = getActivityTypeMeta(topActivity[0], language);
      items.push({
        id: `popular-activity-${topActivity[0]}`,
        text: `${activityMeta.label} ${translate('home.cityPulsePopularThisMonth')}`,
      });
    }

    const recentPastEvent = filteredEventsByControls
      .filter((event) => isPastEvent(event) && event.id !== primaryRecentlyHappenedId)
      .sort((a, b) => getEventTimestamp(b) - getEventTimestamp(a))[0];

    if (recentPastEvent && !items.some((item) => item.id.includes(recentPastEvent.id))) {
      items.push({
        id: `recent-${recentPastEvent.id}`,
        text: `${recentPastEvent.title} ${translate('home.cityPulseHappenedRecently')}`,
      });
    }

    return items.slice(0, 3);
  }, [activeTab, filteredEventsByControls, language, recentlyHappenedEvents, translate]);

  const templateIdeas = useMemo(
    () => [
      {
        id: 'football',
        label: translate('home.templateFootball'),
        activityType: 'sports' as ActivityType,
      },
      {
        id: 'coffee',
        label: translate('home.templateCoffee'),
        activityType: 'food_drinks' as ActivityType,
      },
      {
        id: 'walk',
        label: translate('home.templateWalk'),
        activityType: 'outdoors' as ActivityType,
      },
      {
        id: 'board-games',
        label: translate('home.templateBoardGames'),
        activityType: 'entertainment' as ActivityType,
      },
      {
        id: 'study',
        label: translate('home.templateStudy'),
        activityType: 'study' as ActivityType,
      },
    ],
    [translate]
  );

  const socialProofSummary = useMemo(() => {
    const citySet = new Set(
      filteredEventsByControls
        .map((event) => event.city_normalized)
        .filter((city): city is string => typeof city === 'string' && city.trim().length > 0)
    );

    return {
      eventsCount: filteredEventsByControls.length,
      totalParticipants: filteredEventsByControls.reduce(
        (sum, event) => sum + event.participantCount,
        0
      ),
      citiesCount: citySet.size,
    };
  }, [filteredEventsByControls]);

  const personalStatusSummary = useMemo(() => {
    if (!currentUserId) {
      return {
        joinedCount: 0,
        createdCount: 0,
      };
    }

    return {
      joinedCount: events.filter(
        (event) =>
          joinedEventIds.includes(event.id) &&
          event.creator_id !== currentUserId &&
          !isPastEvent(event)
      ).length,
      createdCount: events.filter((event) => event.creator_id === currentUserId).length,
    };
  }, [currentUserId, events, joinedEventIds]);

  const shouldShowInitialLoader = loading && events.length === 0;
  const shouldRenderAnimatedInitialLoader = initialLoaderPhase !== 'hidden';
  const shouldShowDiscoverHistory =
    activeTab === 'discover' &&
    recentlyHappenedEvents.length > 0;
  const shouldShowEmptyState =
    !loading && activeTab !== 'overview' && sortedEvents.length === 0 && !shouldShowDiscoverHistory;
  const canShowLoadMore =
    !loading &&
    activeTab !== 'overview' &&
    (activeTab === 'discover'
      ? visibleUpcomingEvents.length < discoverUpcomingEvents.length
      : visibleEvents.length < sortedEvents.length);
  const canLoadMoreFromServer =
    !loading &&
    !loadingMore &&
    activeTab !== 'overview' &&
    hasMoreServerEvents &&
    sortedEvents.length >= visibleCount;
  const shouldShowLoadMore = canShowLoadMore || canLoadMoreFromServer;

  const hasActiveFilters =
    selectedActivityType !== 'all' || selectedCity !== 'all' || eventSearchQuery.trim().length > 0;

  const handleClearFilters = () => {
    setSelectedActivityType('all');
    setSelectedCity('all');
    setEventSearchQuery('');
    setCitySearchQuery('');
    setIsCityPickerOpen(false);
    setIsEventSearchOpen(false);
  };

  const handleCreateEvent = () => {
    onNavigate('create-event');
  };

  const handleLoadMore = async () => {
    const visibleListLength =
      activeTab === 'discover' ? visibleUpcomingEvents.length : visibleEvents.length;
    const totalListLength =
      activeTab === 'discover' ? discoverUpcomingEvents.length : sortedEvents.length;

    if (visibleListLength < totalListLength) {
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

  const handleContentScroll = (event: UIEvent<HTMLDivElement>) => {
    const nextCompact = event.currentTarget.scrollTop > 18;
    setIsHeaderCompact((prev) => (prev === nextCompact ? prev : nextCompact));
  };

  const canSwipeHomeTabs = !isCityPickerOpen && !isEventSearchOpen;

  const isInsideHomeHorizontalScroll = (target: EventTarget | null) => {
    return target instanceof Element && Boolean(target.closest('[data-home-horizontal-scroll]'));
  };

  const switchHomeTab = (nextTab: HomeTab, direction: HomeTabTransitionDirection) => {
    if (nextTab === activeTab) {
      return;
    }

    setTabContentDirection(direction);
    setActiveTab(nextTab);

    const scrollContainer = contentScrollRef.current;
    if (scrollContainer && scrollContainer.scrollTop > 160) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    }
  };

  const getHomeTabDirection = (nextTab: HomeTab): HomeTabTransitionDirection => {
    const currentIndex = homeTabs.findIndex((tab) => tab.key === activeTab);
    const nextIndex = homeTabs.findIndex((tab) => tab.key === nextTab);

    if (currentIndex < 0 || nextIndex < 0) {
      return 'next';
    }

    const forwardDistance = (nextIndex - currentIndex + homeTabs.length) % homeTabs.length;
    const backwardDistance = (currentIndex - nextIndex + homeTabs.length) % homeTabs.length;

    return forwardDistance <= backwardDistance ? 'next' : 'prev';
  };

  const selectHomeTab = (nextTab: HomeTab) => {
    switchHomeTab(nextTab, getHomeTabDirection(nextTab));
  };

  const changeHomeTabByOffset = (offset: -1 | 1) => {
    const activeIndex = homeTabs.findIndex((tab) => tab.key === activeTab);

    if (activeIndex < 0) {
      return;
    }

    const nextIndex = (activeIndex + offset + homeTabs.length) % homeTabs.length;
    switchHomeTab(homeTabs[nextIndex].key, offset > 0 ? 'next' : 'prev');
  };

  const handleHomeTabSwipeDelta = (deltaX: number, deltaY: number) => {
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (!canSwipeHomeTabs || absX < 62 || absX < absY * 1.3) {
      return;
    }

    changeHomeTabByOffset(deltaX < 0 ? 1 : -1);
  };

  const handleHomeTabSwipeStart = (event: PointerEvent<HTMLDivElement>) => {
    if (
      !canSwipeHomeTabs ||
      event.pointerType === 'touch' ||
      isInsideHomeHorizontalScroll(event.target)
    ) {
      homeTabSwipeStartRef.current = null;
      return;
    }

    homeTabSwipeStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
  };

  const handleHomeTabSwipeEnd = (event: PointerEvent<HTMLDivElement>) => {
    const start = homeTabSwipeStartRef.current;
    homeTabSwipeStartRef.current = null;

    if (!start || !canSwipeHomeTabs) {
      return;
    }

    handleHomeTabSwipeDelta(event.clientX - start.x, event.clientY - start.y);
  };

  const handleHomeTabTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (!canSwipeHomeTabs || isInsideHomeHorizontalScroll(event.target)) {
      homeTabTouchStartRef.current = null;
      return;
    }

    const touch = event.touches[0];

    if (!touch) {
      return;
    }

    homeTabTouchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  };

  const handleHomeTabTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = homeTabTouchStartRef.current;
    const touch = event.changedTouches[0];
    homeTabTouchStartRef.current = null;

    if (!start || !touch) {
      return;
    }

    handleHomeTabSwipeDelta(touch.clientX - start.x, touch.clientY - start.y);
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
          const [countsMap, nextJoinedEventIds] = await Promise.all([
            fetchParticipantCounts(eventsRef.current.map((event) => event.id)),
            fetchJoinedEventIdsForUser(currentUserIdRef.current),
          ]);

          setJoinedEventIds(nextJoinedEventIds);
          setEvents((prevEvents) =>
            prevEvents.map((event) => ({
              ...event,
              participantCount:
                Object.prototype.hasOwnProperty.call(countsMap, event.id)
                  ? countsMap[event.id]
                  : event.participantCount,
            }))
          );
        }
      )
      .subscribe();

    const supportRequestsChannel = supabase
      .channel('home-admin-support-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_requests',
        },
        async () => {
          if (isAdmin) {
            await refreshOpenSupportTicketCount();
          }
        }
      )
      .subscribe();

    const joinRequestsChannel = supabase
      .channel('home-outgoing-join-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_join_requests',
        },
        async () => {
          await refreshOutgoingJoinRequestCount(currentUserIdRef.current);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(supportRequestsChannel);
      supabase.removeChannel(joinRequestsChannel);
    };
  }, [isAdmin]);

  useEffect(() => {
    setVisibleCount(LOCAL_BATCH_SIZE);
  }, [activeTab, selectedActivityType, selectedCity]);

  useEffect(() => {
    if (
      selectedCity !== 'all' &&
      !availableCities.some((cityOption) => cityOption.cityNormalized === selectedCity)
    ) {
      setSelectedCity('all');
    }
  }, [availableCities, selectedCity]);

  const toggleCityPicker = () => {
    setIsCityPickerOpen((prev) => {
      const nextOpen = !prev;

      if (nextOpen || prev) {
        setCitySearchQuery('');
      }

      return nextOpen;
    });
  };

  const handleSelectCity = (nextCity: string) => {
    setSelectedCity(nextCity);
    setIsCityPickerOpen(false);
    setCitySearchQuery('');
  };

  const toggleEventSearch = () => {
    setIsEventSearchOpen((prev) => {
      const nextOpen = !prev;

      if (!nextOpen) {
        setEventSearchQuery('');
      }

      return nextOpen;
    });
  };

  const handleDismissLaunchOverlay = () => {
    setIsLaunchOverlayVisible(false);

    try {
      window.localStorage.setItem(HOME_LAUNCH_OVERLAY_DISMISSED_KEY, 'true');
    } catch (error) {
      console.error('Failed to persist home launch overlay dismissal:', error);
    }
  };

  const openEventDetails = (event: HomeEventItem) => {
    onNavigate('event-details', {
      ...event,
      backTarget: 'home',
    });
  };

  useEffect(() => {
    fetchEvents(true);
  }, [language]);

  const tabContentOffset = prefersReducedMotion
    ? 0
    : tabContentDirection === 'next'
      ? 16
      : -16;
  const tabContentTransition = prefersReducedMotion
    ? { duration: 0.01 }
    : { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const };

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    if (shouldShowInitialLoader) {
      if (initialLoaderPhase === 'hidden') {
        initialLoaderShownAtRef.current = Date.now();
        setInitialLoaderPhase('visible');
      }

      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }

    if (initialLoaderPhase === 'visible') {
      const visibleFor = initialLoaderShownAtRef.current
        ? Date.now() - initialLoaderShownAtRef.current
        : 0;
      const minVisibleDuration = 700;
      const exitDelay = Math.max(0, minVisibleDuration - visibleFor);

      timeoutId = setTimeout(() => {
        setInitialLoaderPhase('exiting');

        timeoutId = setTimeout(() => {
          setInitialLoaderPhase('hidden');
        }, 420);
      }, exitDelay);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [shouldShowInitialLoader, initialLoaderPhase]);

  return (
    <div className="h-full flex flex-col bg-background">
      <HomeHeader
        isHeaderCompact={isHeaderCompact}
        isAdmin={isAdmin}
        openSupportTicketCount={openSupportTicketCount}
        unreadNotificationCount={unreadNotificationCount}
        setUnreadNotificationCount={setUnreadNotificationCount}
        selectedCity={selectedCity}
        selectedCityLabel={selectedCityLabel}
        isCityPickerOpen={isCityPickerOpen}
        toggleCityPicker={toggleCityPicker}
        citySearchQuery={citySearchQuery}
        setCitySearchQuery={setCitySearchQuery}
        filteredCityOptions={filteredCityOptions}
        handleSelectCity={handleSelectCity}
        translate={translate}
        onNavigate={onNavigate}
      />

      <div className="border-b border-border px-4 py-2">
        <div
          className="grid grid-cols-3 gap-1 rounded-2xl border px-2 py-2 text-center"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.025)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          {[
            {
              label: translate('home.statusJoined'),
              value: personalStatusSummary.joinedCount,
            },
            {
              label: translate('home.statusCreated'),
              value: personalStatusSummary.createdCount,
            },
            {
              label: translate('home.statusRequests'),
              value: outgoingJoinRequestCount,
            },
          ].map((item) => (
            <div key={item.label} className="min-w-0 px-1">
              <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                {currentUserId ? item.value : 0}
              </p>
              <p className="truncate text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <HomeFilters
        homeTabs={homeTabs}
        activeTab={activeTab}
        onSelectTab={selectHomeTab}
        tabTransition={tabTransition}
        selectedActivityType={selectedActivityType}
        setSelectedActivityType={setSelectedActivityType}
        language={language}
        isEventSearchOpen={isEventSearchOpen}
        toggleEventSearch={toggleEventSearch}
        eventSearchQuery={eventSearchQuery}
        setEventSearchQuery={setEventSearchQuery}
        onSwipePrevTab={() => changeHomeTabByOffset(-1)}
        onSwipeNextTab={() => changeHomeTabByOffset(1)}
        translate={translate}
      />

      <PullToRefresh onRefresh={handleRefresh}>
        <div
          ref={contentScrollRef}
          className="h-full overflow-y-auto px-6 py-4 space-y-3"
          style={{ paddingBottom: 'calc(9rem + env(safe-area-inset-bottom, 0px))' }}
          onScroll={handleContentScroll}
          onPointerDown={handleHomeTabSwipeStart}
          onPointerUp={handleHomeTabSwipeEnd}
          onPointerCancel={() => {
            homeTabSwipeStartRef.current = null;
          }}
          onTouchStart={handleHomeTabTouchStart}
          onTouchEnd={handleHomeTabTouchEnd}
          onTouchCancel={() => {
            homeTabTouchStartRef.current = null;
          }}
        >
          <HomeInitialLoader phase={initialLoaderPhase} translate={translate} />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: tabContentOffset }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -tabContentOffset }}
              transition={tabContentTransition}
              className="space-y-3"
            >
              {shouldShowEmptyState && (
                <HomeEmptyState
                  activeTab={activeTab}
                  selectedCity={selectedCity}
                  selectedActivityType={selectedActivityType}
                  hasActiveFilters={hasActiveFilters}
                  translate={translate}
                  onClearFilters={handleClearFilters}
                  onCreateEvent={handleCreateEvent}
                />
              )}

              {activeTab === 'discover' && (
                <div className="space-y-6">
                  {primaryFeaturedEvent && (
                    <HomeFeedSection
                      title={translate('home.featuredThisWeek')}
                      subtitle={translate('home.featuredThisWeekSubtitle')}
                    >
                      <div className="space-y-3">
                        <HomeEventCard
                          key={`featured-${primaryFeaturedEvent.id}`}
                          event={primaryFeaturedEvent}
                          currentUserId={currentUserId}
                          joinedEventIds={joinedEventIds}
                          isAdmin={isAdmin}
                          variant="featured"
                          badgeLabel={translate('home.featuredBadge')}
                          language={language}
                          translate={translate}
                          isPastEvent={isPastEvent}
                          formatEventDate={formatEventDate}
                          onOpen={openEventDetails}
                        />
                      </div>
                    </HomeFeedSection>
                  )}

                  {(visibleUpcomingEvents.length > 0 || shouldShowLoadMore) && (
                    <HomeFeedSection
                      title={translate('home.upcomingEvents')}
                      subtitle={translate('home.upcomingEventsSubtitle')}
                    >
                      <div className="space-y-3">
                        {visibleUpcomingEvents.map((event) => (
                          <HomeEventCard
                            key={event.id}
                            event={event}
                            currentUserId={currentUserId}
                            joinedEventIds={joinedEventIds}
                            isAdmin={isAdmin}
                            variant="compact"
                            language={language}
                            translate={translate}
                            isPastEvent={isPastEvent}
                            formatEventDate={formatEventDate}
                            onOpen={openEventDetails}
                          />
                        ))}
                      </div>
                    </HomeFeedSection>
                  )}

                  {visibleUpcomingEvents.length === 0 && shouldShowDiscoverHistory && !loading && (
                    <HomeDiscoverHistoryNudge
                      translate={translate}
                      onCreateEvent={handleCreateEvent}
                    />
                  )}
                </div>
              )}

              {activeTab !== 'discover' && activeTab !== 'overview' && (
                <div className="space-y-3">
                  {visibleEvents.map((event) => (
                    <HomeEventCard
                      key={event.id}
                      event={event}
                      currentUserId={currentUserId}
                      joinedEventIds={joinedEventIds}
                      isAdmin={isAdmin}
                      language={language}
                      translate={translate}
                      isPastEvent={isPastEvent}
                      formatEventDate={formatEventDate}
                      onOpen={openEventDetails}
                    />
                  ))}
                </div>
              )}

              {shouldShowLoadMore && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="w-full rounded-xl p-4 border border-border text-sm transition-all disabled:opacity-60"
                  style={{
                    backgroundColor: 'var(--card)',
                    color: 'var(--accent)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  {loadingMore ? (
                    <div className="flex items-center justify-center gap-3">
                      <LoadingLine width="4rem" height="0.75rem" />
                      <LoadingLine width="3rem" height="0.75rem" />
                    </div>
                  ) : (
                    translate('home.loadMore')
                  )}
                </motion.button>
              )}

              {activeTab === 'discover' && shouldShowDiscoverHistory && (
                <div className="space-y-6">
                  {recentlyHappenedEvents.length > 0 && (
                    <HomeFeedSection
                      title={translate('home.recentlyHappened')}
                      subtitle={translate('home.recentlyHappenedSubtitle')}
                    >
                      <div className="space-y-3">
                        {recentlyHappenedEvents.map((event) => (
                          <HomeEventCard
                            key={`recent-${event.id}`}
                            event={event}
                            currentUserId={currentUserId}
                            joinedEventIds={joinedEventIds}
                            isAdmin={isAdmin}
                            variant="compact"
                            badgeLabel={translate('home.completedBadge')}
                            language={language}
                            translate={translate}
                            isPastEvent={isPastEvent}
                            formatEventDate={formatEventDate}
                            onOpen={openEventDetails}
                          />
                        ))}
                      </div>
                    </HomeFeedSection>
                  )}

                  {popularPastEvents.length > 0 && (
                    <HomeFeedSection
                      title={translate('home.popularPastEvents')}
                      subtitle={translate('home.popularPastEventsSubtitle')}
                    >
                      <div className="space-y-3">
                        {popularPastEvents.map((event) => (
                          <HomeEventCard
                            key={`popular-past-${event.id}`}
                            event={event}
                            currentUserId={currentUserId}
                            joinedEventIds={joinedEventIds}
                            isAdmin={isAdmin}
                            variant="compact"
                            badgeLabel={translate('home.completedBadge')}
                            language={language}
                            translate={translate}
                            isPastEvent={isPastEvent}
                            formatEventDate={formatEventDate}
                            onOpen={openEventDetails}
                          />
                        ))}
                      </div>
                    </HomeFeedSection>
                  )}
                </div>
              )}

              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <HomeSocialProofSummary
                    eventsCount={socialProofSummary.eventsCount}
                    totalParticipants={socialProofSummary.totalParticipants}
                    citiesCount={socialProofSummary.citiesCount}
                    title={translate('home.citySummaryTitle')}
                    translate={translate}
                  />

                  <HomeTrendingCreators creators={trendingCreators} translate={translate} />

                  <HomeCityPulse items={cityPulseItems} translate={translate} />

                  <HomeTemplateIdeas
                    ideas={templateIdeas}
                    translate={translate}
                    onSelectTemplate={handleCreateEvent}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </PullToRefresh>

      {isLaunchOverlayVisible && (
        <HomeLaunchOverlay
          styles={launchOverlayStyles}
          translate={translate}
          onDismiss={handleDismissLaunchOverlay}
        />
      )}
    </div>
  );
}

