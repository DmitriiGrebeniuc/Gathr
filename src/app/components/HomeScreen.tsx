import { useEffect, useMemo, useRef, useState, type UIEvent } from 'react';
import { motion } from 'motion/react';
import { Check, LifeBuoy, Palette } from 'lucide-react';
import { PullToRefresh } from './PullToRefresh';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  ACTIVITY_TYPES,
  type ActivityType,
  getActivityTypeMeta,
} from '../constants/activityTypes';
import { LoadingLogo } from './LoadingLogo';
import { normalizeCityName } from '../lib/locationCity';
import { INPUT_LIMITS, limitText } from '../constants/inputLimits';
import {
  fetchMyProfileAccessSummary,
  fetchJoinedEventIdsForUser,
  fetchParticipantCounts,
  fetchPublicProfileNameMap,
} from '../lib/publicData';
type EventItem = {
  id: string;
  title: string;
  description?: string | null;
  date_time?: string | null;
  location?: string | null;
  city?: string | null;
  city_normalized?: string | null;
  creator_id?: string | null;
  creatorName?: string | null;
  activity_type?: ActivityType | null;
  join_mode?: 'open' | 'request' | null;
  participantCount: number;
};

type CityFilterOption = {
  city: string;
  cityNormalized: string;
};

const SERVER_BATCH_SIZE = 100;
const LOCAL_BATCH_SIZE = 10;
const HOME_LAUNCH_OVERLAY_DISMISSED_KEY = 'gathr-home-launch-overlay-dismissed';

export function HomeScreen({
  onNavigate,
}: {
  onNavigate: (screen: string, data?: any) => void;
}) {
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const [activeTab, setActiveTab] = useState<'discover' | 'my' | 'joined'>('discover');
  const [selectedActivityType, setSelectedActivityType] = useState<ActivityType | 'all'>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [isCityPickerOpen, setIsCityPickerOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const [isLaunchOverlayVisible, setIsLaunchOverlayVisible] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem(HOME_LAUNCH_OVERLAY_DISMISSED_KEY) !== 'true';
  });
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>('User');
  const [isAdmin, setIsAdmin] = useState(false);
  const [openSupportTicketCount, setOpenSupportTicketCount] = useState(0);
  const [joinedEventIds, setJoinedEventIds] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(LOCAL_BATCH_SIZE);
  const [serverOffset, setServerOffset] = useState(0);
  const [hasMoreServerEvents, setHasMoreServerEvents] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const themePickerRef = useRef<HTMLDivElement | null>(null);
  const eventsRef = useRef<EventItem[]>([]);
  const currentUserIdRef = useRef<string | null>(null);

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

  const isPastEvent = (dateString?: string | null) => {
    if (!dateString) return false;

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    return date.getTime() < Date.now();
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
        setIsAdmin(nextIsAdmin);

        if (nextIsAdmin) {
          await refreshOpenSupportTicketCount();
        } else {
          setOpenSupportTicketCount(0);
        }
      } else {
        setCurrentUserName(translate('common.user'));
        setIsAdmin(false);
        setOpenSupportTicketCount(0);
      }

      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('date_time', { ascending: true })
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

      const [creatorNameMapRaw, countsMap, nextJoinedEventIds] = await Promise.all([
        fetchPublicProfileNameMap(creatorIds),
        fetchParticipantCounts((eventsData || []).map((event: any) => event.id)),
        fetchJoinedEventIdsForUser(userId),
      ]);

      const creatorNameMap = Object.fromEntries(
        Object.entries(creatorNameMapRaw).map(([id, name]) => [id, name || translate('common.unknown')])
      );

      setJoinedEventIds(nextJoinedEventIds);

      const mappedEvents: EventItem[] = (eventsData || []).map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date_time: event.date_time,
        location: event.location,
        city: event.city,
        city_normalized: event.city_normalized,
        creator_id: event.creator_id,
        creatorName: event.creator_id
          ? creatorNameMap[event.creator_id] || translate('common.unknown')
          : translate('common.unknown'),
        activity_type: (event.activity_type || 'other') as ActivityType,
        join_mode: (event.join_mode || 'open') as 'open' | 'request',
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

      const [creatorNameMapRaw, countsMap] = await Promise.all([
        fetchPublicProfileNameMap(creatorIds),
        fetchParticipantCounts((moreEventsData || []).map((event: any) => event.id)),
      ]);

      const creatorNameMap = Object.fromEntries(
        Object.entries(creatorNameMapRaw).map(([id, name]) => [id, name || translate('common.unknown')])
      );

      const mappedMoreEvents: EventItem[] = (moreEventsData || []).map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date_time: event.date_time,
        location: event.location,
        city: event.city,
        city_normalized: event.city_normalized,
        creator_id: event.creator_id,
        creatorName: event.creator_id
          ? creatorNameMap[event.creator_id] || translate('common.unknown')
          : translate('common.unknown'),
        activity_type: (event.activity_type || 'other') as ActivityType,
        join_mode: (event.join_mode || 'open') as 'open' | 'request',
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
      const matchesActivity =
        selectedActivityType === 'all' ||
        (event.activity_type || 'other') === selectedActivityType;
      const matchesCity =
        selectedCity === 'all' || event.city_normalized === selectedCity;

      if (!matchesActivity || !matchesCity) {
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
  }, [events, currentUserId, joinedEventIds, activeTab, selectedActivityType, selectedCity]);

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

  const handleDismissLaunchOverlay = () => {
    setIsLaunchOverlayVisible(false);

    try {
      window.localStorage.setItem(HOME_LAUNCH_OVERLAY_DISMISSED_KEY, 'true');
    } catch (error) {
      console.error('Failed to persist home launch overlay dismissal:', error);
    }
  };

  useEffect(() => {
    fetchEvents(true);
  }, [language]);

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
      <motion.div
        animate={{
          paddingTop: isHeaderCompact ? 12 : 16,
          paddingBottom: isHeaderCompact ? 12 : 16,
        }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="sticky top-0 z-20 flex items-center justify-between px-6 border-b border-border"
        style={{
          backgroundColor: 'rgba(15, 15, 15, 0.94)',
          backdropFilter: 'blur(14px)',
        }}
      >
        <motion.h1
          animate={{
            scale: isHeaderCompact ? 0.92 : 1,
            transformOrigin: 'left center',
          }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="text-2xl"
          style={{ color: 'var(--accent)' }}
        >
          Gathr
        </motion.h1>

        <div ref={themePickerRef} className="relative flex items-center gap-2 shrink-0">
          <motion.button
            whileTap={{ scale: 0.92 }}
            animate={{
              width: isHeaderCompact ? 36 : 40,
              height: isHeaderCompact ? 36 : 40,
            }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={() => setIsThemePickerOpen((prev) => !prev)}
            className="rounded-full flex items-center justify-center border shrink-0"
            style={{
              backgroundColor: isThemePickerOpen ? 'var(--accent-soft)' : 'var(--primary)',
              borderColor: isThemePickerOpen ? 'var(--accent-border-strong)' : 'var(--border)',
              boxShadow: isThemePickerOpen ? 'var(--accent-outline-soft)' : 'none',
              color: isThemePickerOpen ? 'var(--accent)' : 'var(--foreground-strong)',
            }}
            title={translate('profile.appearance')}
          >
            <Palette size={isHeaderCompact ? 16 : 18} strokeWidth={2} />
          </motion.button>

          {isAdmin && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              animate={{
                width: isHeaderCompact ? 36 : 40,
                height: isHeaderCompact ? 36 : 40,
              }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              onClick={() =>
                onNavigate('admin', {
                  adminPage: 'support',
                  supportStatus: 'new',
                })
              }
              className="relative rounded-full flex items-center justify-center border shrink-0"
              style={{
                backgroundColor:
                  openSupportTicketCount > 0 ? 'var(--accent-soft)' : 'var(--primary)',
                borderColor:
                  openSupportTicketCount > 0 ? 'var(--accent-border-strong)' : 'var(--border)',
                color:
                  openSupportTicketCount > 0 ? 'var(--accent)' : 'var(--foreground-strong)',
              }}
              title={translate('admin.supportRequests')}
              aria-label={translate('admin.supportRequests')}
            >
              <LifeBuoy size={isHeaderCompact ? 16 : 18} strokeWidth={2} />
              {openSupportTicketCount > 0 && (
                <span
                  className="absolute -right-1 -top-1 min-w-5 h-5 rounded-full px-1 flex items-center justify-center text-[10px] border"
                  style={{
                    backgroundColor: 'var(--accent)',
                    borderColor: 'var(--background)',
                    color: 'var(--accent-foreground)',
                  }}
                >
                  {openSupportTicketCount > 99 ? '99+' : openSupportTicketCount}
                </span>
              )}
            </motion.button>
          )}

          <motion.button
            whileTap={{ scale: 0.92 }}
            animate={{
              width: isHeaderCompact ? 36 : 40,
              height: isHeaderCompact ? 36 : 40,
            }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={() => onNavigate('profile')}
            className="rounded-full flex items-center justify-center border shrink-0"
            style={{
              backgroundColor: 'var(--primary)',
              borderColor: 'var(--accent-border)',
              boxShadow: 'var(--accent-outline-soft)',
              color: 'var(--foreground-strong)',
            }}
            title={currentUserName}
          >
            <span className={isHeaderCompact ? 'text-xs' : 'text-sm'}>
              {getInitials(currentUserName)}
            </span>
          </motion.button>

          {isThemePickerOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16 }}
              className="absolute right-0 top-full mt-2 w-56 rounded-2xl border p-2"
              style={{
                backgroundColor: 'var(--surface-overlay)',
                borderColor: 'var(--border-subtle)',
                boxShadow: '0 16px 32px rgba(0, 0, 0, 0.18)',
              }}
            >
              <div className="space-y-1">
                {themeOptions.map((option) => {
                  const isActive = themeMode === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setThemeMode(option.value);
                        setIsThemePickerOpen(false);
                      }}
                      className="w-full rounded-xl px-3 py-2 text-left transition-all"
                      style={{
                        backgroundColor: isActive
                          ? 'var(--accent-soft-muted)'
                          : 'transparent',
                        color: isActive ? 'var(--accent)' : 'var(--foreground-strong)',
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm">{option.label}</p>
                          {option.hint && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {option.hint}
                            </p>
                          )}
                        </div>

                        <span
                          className="shrink-0"
                          style={{
                            color: isActive ? 'var(--accent)' : 'var(--muted-foreground)',
                          }}
                        >
                          {isActive ? <Check size={16} strokeWidth={2.25} /> : null}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      <div className="flex border-b border-border">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveTab('discover')}
          className={`flex-1 py-3 transition-colors ${activeTab === 'discover' ? 'border-b-2' : 'text-muted-foreground'
            }`}
          style={
            activeTab === 'discover'
              ? { borderColor: 'var(--accent)', color: 'var(--accent)' }
              : {}
          }
        >
          {translate('home.discover')}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveTab('joined')}
          className={`flex-1 py-3 transition-colors ${activeTab === 'joined' ? 'border-b-2' : 'text-muted-foreground'
            }`}
          style={
            activeTab === 'joined'
              ? { borderColor: 'var(--accent)', color: 'var(--accent)' }
              : {}
          }
        >
          {translate('home.joined')}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveTab('my')}
          className={`flex-1 py-3 transition-colors ${activeTab === 'my' ? 'border-b-2' : 'text-muted-foreground'
            }`}
          style={
            activeTab === 'my'
              ? { borderColor: 'var(--accent)', color: 'var(--accent)' }
              : {}
          }
        >
          {translate('home.myEvents')}
        </motion.button>
      </div>

      <div className="border-b border-border px-4 py-2">
        <div
          className="flex gap-2 overflow-x-auto no-scrollbar"
          style={{
            scrollPaddingLeft: '0.25rem',
            scrollPaddingRight: '0.25rem',
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorX: 'contain',
            paddingLeft: '0.125rem',
            paddingRight: '0.125rem',
          }}
        >
          <motion.button
            type="button"
            onClick={() => setSelectedActivityType('all')}
            whileTap={{ scale: 0.96 }}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs border transition-all"
            style={{
              backgroundColor:
                selectedActivityType === 'all' ? 'var(--accent-soft)' : 'var(--card)',
              borderColor:
                selectedActivityType === 'all'
                  ? 'var(--accent-border-strong)'
                  : 'var(--border)',
              color: selectedActivityType === 'all' ? 'var(--accent)' : 'var(--foreground-strong)',
              boxShadow:
                selectedActivityType === 'all'
                  ? 'var(--accent-outline-soft)'
                  : 'none',
            }}
          >
            {translate('home.all')}
          </motion.button>

          {ACTIVITY_TYPES.map((type) => {
            const isActive = selectedActivityType === type.value;
            const activityMeta = getActivityTypeMeta(type.value, language);

            return (
              <motion.button
                key={type.value}
                type="button"
                onClick={() => setSelectedActivityType(type.value)}
                whileTap={{ scale: 0.96 }}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs border transition-all"
                style={{
                  backgroundColor: isActive ? 'var(--accent-soft)' : 'var(--card)',
                  borderColor: isActive
                    ? 'var(--accent-border-strong)'
                    : 'var(--border)',
                  color: isActive ? 'var(--accent)' : 'var(--foreground-strong)',
                  boxShadow: isActive ? 'var(--accent-outline-soft)' : 'none',
                }}
              >
                  <span className="mr-1.5">{activityMeta.emoji}</span>
                  <span>{activityMeta.label}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-2">
          <motion.button
            type="button"
            onClick={toggleCityPicker}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-xl border px-3 py-2 text-left transition-all"
            style={{
              backgroundColor: isCityPickerOpen ? 'var(--accent-soft-muted)' : 'rgba(255, 255, 255, 0.03)',
              borderColor: isCityPickerOpen
                ? 'var(--accent-border)'
                : 'var(--border-subtle)',
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {translate('home.cityFilterLabel')}
                </p>
                <p
                  className="truncate text-sm"
                  style={{
                    color:
                      selectedCity === 'all' ? 'var(--foreground-strong)' : 'var(--accent)',
                  }}
                >
                  {selectedCityLabel}
                </p>
              </div>
              <span
                className="shrink-0 text-xs text-muted-foreground transition-transform"
                style={{
                  transform: isCityPickerOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                ▼
              </span>
            </div>
          </motion.button>

          {isCityPickerOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16 }}
              className="mt-2 rounded-xl border overflow-hidden"
              style={{
                backgroundColor: 'var(--surface-overlay)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="border-b border-border px-3 py-2">
                <input
                  type="text"
                  value={citySearchQuery}
                  onChange={(event) =>
                    setCitySearchQuery(limitText(event.target.value, INPUT_LIMITS.search))
                  }
                  maxLength={INPUT_LIMITS.search}
                  placeholder={translate('home.citySearchPlaceholder')}
                  autoComplete="off"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--foreground-strong)',
                  }}
                />
              </div>

              <div className="max-h-48 overflow-y-auto no-scrollbar py-1">
                <button
                  type="button"
                  onClick={() => handleSelectCity('all')}
                  className="w-full px-3 py-2 text-left text-sm transition-colors"
                  style={{
                    color: selectedCity === 'all' ? 'var(--accent)' : 'var(--foreground-strong)',
                    backgroundColor:
                      selectedCity === 'all' ? 'var(--accent-soft-muted)' : 'transparent',
                  }}
                >
                  {translate('home.allCities')}
                </button>

                {filteredCityOptions.map((cityOption) => {
                  const isActive = selectedCity === cityOption.cityNormalized;

                  return (
                    <button
                      key={cityOption.cityNormalized}
                      type="button"
                      onClick={() => handleSelectCity(cityOption.cityNormalized)}
                      className="w-full px-3 py-2 text-left text-sm transition-colors"
                      style={{
                        color: isActive ? 'var(--accent)' : 'var(--foreground-strong)',
                        backgroundColor: isActive
                          ? 'var(--accent-soft-muted)'
                          : 'transparent',
                      }}
                    >
                      {cityOption.city}
                    </button>
                  );
                })}

                {filteredCityOptions.length === 0 && (
                  <div className="px-3 py-3 text-sm text-muted-foreground">
                    {translate('home.noCitiesFound')}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <PullToRefresh onRefresh={handleRefresh}>
        <div
          className="h-full overflow-y-auto px-6 py-4 space-y-3"
          style={{ paddingBottom: 'calc(9rem + env(safe-area-inset-bottom, 0px))' }}
          onScroll={handleContentScroll}
        >
          {shouldShowInitialLoader && (
            <div className="flex justify-center py-8">
              <LoadingLogo size={52} label={translate('common.loading')} />
            </div>
          )}

          {shouldShowEmptyState && (
            <div
              className="rounded-xl p-4 border border-border"
              style={{
                backgroundColor: 'var(--card)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
            >
              <h3 className="mb-2">
                {activeTab === 'my'
                  ? translate('home.noMyEvents')
                  : activeTab === 'joined'
                    ? translate('home.noJoinedEvents')
                    : translate('home.noDiscoverEvents')}
              </h3>

              <p className="text-sm text-muted-foreground">
                {selectedCity !== 'all'
                  ? translate('home.noEventsForCity')
                  : selectedActivityType !== 'all'
                  ? translate('home.noEventsForFilter')
                  : activeTab === 'my'
                    ? translate('home.createFirstEvent')
                    : activeTab === 'joined'
                      ? translate('home.joinedWillAppear')
                      : translate('home.noEventsFromOthers')}
              </p>
            </div>
          )}

          {visibleEvents.map((event, index) => {
            const past = isPastEvent(event.date_time);
            const activityMeta = getActivityTypeMeta(event.activity_type, language);
            const isRequestMode = event.join_mode === 'request';
            const canViewClosedPreview =
              !isRequestMode ||
              event.creator_id === currentUserId ||
              joinedEventIds.includes(event.id);
            const dateLabel = isRequestMode && !canViewClosedPreview
              ? translate('home.closedDateHidden')
              : formatEventDate(event.date_time);
            const locationLabel = isRequestMode && !canViewClosedPreview
              ? translate('home.closedLocationHidden')
              : event.location || translate('details.locationNotSpecified');

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: Math.min(index, 8) * 0.03,
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
                  backgroundColor: 'var(--card)',
                  borderColor: isRequestMode ? 'var(--accent-border-strong)' : 'var(--border)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  opacity: past ? 0.72 : 1,
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3>{event.title}</h3>

                  <div className="flex items-center gap-2">
                    {isRequestMode && (
                      <span
                        className="text-[10px] px-2 py-1 rounded-full border whitespace-nowrap"
                        style={{
                          borderColor: 'var(--accent-border-strong)',
                          color: 'var(--accent)',
                          backgroundColor: 'var(--accent-soft-muted)',
                        }}
                      >
                        {translate('home.closedBadge')}
                      </span>
                    )}

                    {past && (
                      <span
                        className="text-[10px] px-2 py-1 rounded-full border whitespace-nowrap"
                        style={{
                          borderColor: 'var(--accent-border-muted)',
                          color: 'var(--accent)',
                          backgroundColor: 'var(--accent-soft-muted)',
                        }}
                      >
                        {translate('home.past')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-2">
                  <span
                    className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border"
                    style={{
                      borderColor: 'rgba(212, 175, 55, 0.22)',
                      color: 'var(--accent)',
                      backgroundColor: 'rgba(212, 175, 55, 0.06)',
                    }}
                  >
                    <span>{activityMeta.emoji}</span>
                    <span>{activityMeta.label}</span>
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-2">
                  {dateLabel}
                </p>

                <p className="text-sm text-muted-foreground mb-3">
                  {locationLabel}
                </p>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">
                    {translate('home.createdBy')}{' '}
                    {event.creator_id === currentUserId
                      ? translate('home.you')
                      : event.creatorName || translate('common.unknown')}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {event.participantCount}{' '}
                    {event.participantCount === 1
                      ? translate('home.participant')
                      : translate('home.participants')}
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
                backgroundColor: 'var(--card)',
                color: 'var(--accent)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
            >
              {loadingMore ? translate('home.loading') : translate('home.loadMore')}
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
          bottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))',
          backgroundColor: 'var(--accent)',
          color: 'var(--accent-foreground)',
          boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)',
        }}
      >
        <span className="text-2xl">+</span>
      </motion.button>

      {isLaunchOverlayVisible && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center px-6"
          style={{
            backgroundColor: launchOverlayStyles.scrimBackground,
            backdropFilter: 'blur(6px)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-sm rounded-2xl border p-6"
            style={{
              backgroundColor: launchOverlayStyles.cardBackground,
              borderColor: launchOverlayStyles.cardBorder,
              boxShadow: launchOverlayStyles.cardShadow,
            }}
          >
            <div className="space-y-3">
              <div
                className="inline-flex rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em]"
                style={{
                  borderColor: launchOverlayStyles.badgeBorder,
                  color: 'var(--accent)',
                  backgroundColor: launchOverlayStyles.badgeBackground,
                }}
              >
                Gathr
              </div>

              <h2 className="text-xl leading-tight">{translate('home.launchOverlayTitle')}</h2>

              <p className="text-sm leading-6 text-muted-foreground">
                {translate('home.launchOverlayText')}
              </p>
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={handleDismissLaunchOverlay}
              className="mt-6 w-full rounded-xl px-4 py-3 text-sm font-medium"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-foreground)',
                boxShadow: launchOverlayStyles.buttonShadow,
              }}
            >
              {translate('home.launchOverlayButton')}
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

