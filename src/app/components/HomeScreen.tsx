import { useEffect, useMemo, useRef, useState, type UIEvent } from 'react';
import { motion } from 'motion/react';
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
  HomeDiscoverHistoryNudge,
  HomeFeedSection,
  HomeSocialProofSummary,
} from './home/HomeFeedSections';
import { HomeFilters } from './home/HomeFilters';
import { HomeHeader } from './home/HomeHeader';
import { HomeLaunchOverlay } from './home/HomeLaunchOverlay';
import type { CityFilterOption, HomeEventItem, HomeTab } from './home/types';

const SERVER_BATCH_SIZE = 100;
const LOCAL_BATCH_SIZE = 10;
const HOME_LAUNCH_OVERLAY_DISMISSED_KEY = 'gathr-home-launch-overlay-dismissed';

export function HomeScreen({
  onNavigate,
}: {
  onNavigate: (screen: string, data?: any) => void;
}) {
  const tabTransition = {
    duration: 0.28,
    ease: [0.22, 1, 0.36, 1] as const,
  };
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const [activeTab, setActiveTab] = useState<HomeTab>('discover');
  const [selectedActivityType, setSelectedActivityType] = useState<ActivityType | 'all'>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [isCityPickerOpen, setIsCityPickerOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [isEventSearchOpen, setIsEventSearchOpen] = useState(false);
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const [isLaunchOverlayVisible, setIsLaunchOverlayVisible] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem(HOME_LAUNCH_OVERLAY_DISMISSED_KEY) !== 'true';
  });
  const [events, setEvents] = useState<HomeEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>('User');
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasProPlan, setHasProPlan] = useState(false);
  const [openSupportTicketCount, setOpenSupportTicketCount] = useState(0);
  const [joinedEventIds, setJoinedEventIds] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(LOCAL_BATCH_SIZE);
  const [serverOffset, setServerOffset] = useState(0);
  const [hasMoreServerEvents, setHasMoreServerEvents] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoaderPhase, setInitialLoaderPhase] = useState<'hidden' | 'visible' | 'exiting'>(
    'hidden'
  );
  const themePickerRef = useRef<HTMLDivElement | null>(null);
  const eventsRef = useRef<HomeEventItem[]>([]);
  const currentUserIdRef = useRef<string | null>(null);
  const initialLoaderShownAtRef = useRef<number | null>(null);

  const { language, translate } = useLanguage();
  const { themeMode, setThemeMode, systemTheme, effectiveTheme } = useTheme();

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

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
        setCurrentUserName(profileData?.name || translate('common.user'));
        const nextIsAdmin = profileData?.role === 'admin';
        const nextHasProPlan =
          profileData?.plan === 'pro' || profileData?.has_unlimited_access === true;
        setIsAdmin(nextIsAdmin);
        setHasProPlan(nextHasProPlan);

        if (nextIsAdmin) {
          await refreshOpenSupportTicketCount();
        } else {
          setOpenSupportTicketCount(0);
        }
      } else {
        setCurrentUserName(translate('common.user'));
        setIsAdmin(false);
        setHasProPlan(false);
        setOpenSupportTicketCount(0);
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

  const themeOptions = useMemo(
    () => [
      {
        value: 'system' as const,
        label: translate('appearance.system'),
        hint:
          systemTheme === 'dark'
            ? translate('appearance.currentSystemDark')
            : translate('appearance.currentSystemLight'),
      },
      {
        value: 'dark' as const,
        label: translate('appearance.dark'),
        hint: null,
      },
      {
        value: 'light' as const,
        label: translate('appearance.light'),
        hint: null,
      },
    ],
    [systemTheme, translate]
  );

  const homeTabs = useMemo(
    () => [
      { key: 'discover' as const, label: translate('home.discover') },
      { key: 'joined' as const, label: translate('home.joined') },
      { key: 'my' as const, label: translate('home.myEvents') },
      { key: 'visited' as const, label: translate('home.visited') },
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

  const featuredEventIds = useMemo(() => {
    return new Set(featuredEvents.map((event) => event.id));
  }, [featuredEvents]);

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
      .slice(0, 10);
  }, [activeTab, filteredEventsByControls]);

  const popularPastEvents = useMemo(() => {
    if (activeTab !== 'discover') {
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
    if (activeTab !== 'discover') {
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
    if (activeTab !== 'discover') {
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

    return items.slice(0, 4);
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

  const shouldShowInitialLoader = loading && events.length === 0;
  const shouldRenderAnimatedInitialLoader = initialLoaderPhase !== 'hidden';
  const shouldShowDiscoverHistory =
    activeTab === 'discover' &&
    (recentlyHappenedEvents.length > 0 || popularPastEvents.length > 0);
  const shouldShowEmptyState = !loading && sortedEvents.length === 0 && !shouldShowDiscoverHistory;
  const canShowLoadMore =
    !loading &&
    (activeTab === 'discover'
      ? visibleUpcomingEvents.length < discoverUpcomingEvents.length
      : visibleEvents.length < sortedEvents.length);
  const canLoadMoreFromServer =
    !loading &&
    !loadingMore &&
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

    return () => {
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(supportRequestsChannel);
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

  useEffect(() => {
    if (!isThemePickerOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!themePickerRef.current?.contains(event.target as Node)) {
        setIsThemePickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isThemePickerOpen]);

  return (
    <div className="h-full flex flex-col bg-background">
      <HomeHeader
        isHeaderCompact={isHeaderCompact}
        themePickerRef={themePickerRef}
        isThemePickerOpen={isThemePickerOpen}
        setIsThemePickerOpen={setIsThemePickerOpen}
        themeOptions={themeOptions}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        isAdmin={isAdmin}
        openSupportTicketCount={openSupportTicketCount}
        currentUserName={currentUserName}
        hasProPlan={hasProPlan}
        getInitials={getInitials}
        translate={translate}
        onNavigate={onNavigate}
      />

      <HomeFilters
        homeTabs={homeTabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabTransition={tabTransition}
        selectedActivityType={selectedActivityType}
        setSelectedActivityType={setSelectedActivityType}
        language={language}
        selectedCity={selectedCity}
        selectedCityLabel={selectedCityLabel}
        isCityPickerOpen={isCityPickerOpen}
        toggleCityPicker={toggleCityPicker}
        citySearchQuery={citySearchQuery}
        setCitySearchQuery={setCitySearchQuery}
        filteredCityOptions={filteredCityOptions}
        handleSelectCity={handleSelectCity}
        isEventSearchOpen={isEventSearchOpen}
        toggleEventSearch={toggleEventSearch}
        eventSearchQuery={eventSearchQuery}
        setEventSearchQuery={setEventSearchQuery}
        translate={translate}
      />

      <PullToRefresh onRefresh={handleRefresh}>
        <div
          className="h-full overflow-y-auto px-4 py-3 space-y-3"
          style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
          onScroll={handleContentScroll}
        >
          <HomeInitialLoader phase={initialLoaderPhase} translate={translate} />

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
            <div className="space-y-5">
              {/* Featured event - show just the first one prominently */}
              {featuredEvents.length > 0 && (
                <div className="space-y-2">
                  <HomeEventCard
                    key={`featured-${featuredEvents[0].id}`}
                    event={featuredEvents[0]}
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
              )}

              {/* Upcoming events - main feed */}
              {(visibleUpcomingEvents.length > 0 || shouldShowLoadMore) && (
                <HomeFeedSection
                  title={translate('home.upcomingEvents')}
                >
                  <div className="space-y-2.5">
                    {visibleUpcomingEvents.map((event) => (
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

          {activeTab !== 'discover' && (
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

          {/* Past events - compact secondary section */}
          {activeTab === 'discover' && shouldShowDiscoverHistory && (
            <div className="space-y-4 pt-2" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
              {recentlyHappenedEvents.length > 0 && (
                <HomeFeedSection
                  title={translate('home.recentlyHappened')}
                >
                  <div className="space-y-2">
                    {recentlyHappenedEvents.slice(0, 3).map((event) => (
                      <HomeEventCard
                        key={`recent-${event.id}`}
                        event={event}
                        currentUserId={currentUserId}
                        joinedEventIds={joinedEventIds}
                        isAdmin={isAdmin}
                        variant="muted"
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

          {/* Ambient sections - compact and secondary */}
          {activeTab === 'discover' && (
            <div className="space-y-3 pt-3" style={{ opacity: 0.85 }}>
              <HomeSocialProofSummary
                eventsCount={socialProofSummary.eventsCount}
                totalParticipants={socialProofSummary.totalParticipants}
                citiesCount={socialProofSummary.citiesCount}
                translate={translate}
              />

              {(trendingCreators.length > 0 || cityPulseItems.length > 0) && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {trendingCreators.slice(0, 2).map((creator) => (
                    <div
                      key={creator.id}
                      className="shrink-0 flex items-center gap-2 rounded-lg px-3 py-2"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px]"
                        style={{
                          backgroundColor: 'rgba(212, 175, 55, 0.1)',
                          color: 'var(--accent)',
                        }}
                      >
                        {creator.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[11px]" style={{ color: 'var(--foreground-strong)' }}>
                          {creator.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {creator.eventCount} {translate('home.hostedEventsLabel')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {cityPulseItems.slice(0, 1).map((item) => (
                    <div
                      key={item.id}
                      className="shrink-0 flex items-center gap-2 rounded-lg px-3 py-2 max-w-[200px]"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <span className="text-[10px]" style={{ color: 'var(--accent)' }}>•</span>
                      <p className="text-[11px] text-muted-foreground truncate">{item.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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

