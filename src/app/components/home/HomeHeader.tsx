import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, CalendarClock, ChevronDown, Inbox, LifeBuoy, Mail, UserPlus, Users } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import {
  fetchUnreadNotificationCountForUser,
  markNotificationKeysSeen,
} from '../../lib/notificationReads';
import {
  fetchNotificationPreviewItems,
  type NotificationPreviewItem,
} from '../../lib/notificationPreview';
import { INPUT_LIMITS, limitText } from '../../constants/inputLimits';
import type { CityFilterOption } from './types';

type HomeHeaderProps = {
  isHeaderCompact: boolean;
  isAdmin: boolean;
  openSupportTicketCount: number;
  unreadNotificationCount: number;
  setUnreadNotificationCount: Dispatch<SetStateAction<number>>;
  selectedCity: string;
  selectedCityLabel: string;
  isCityPickerOpen: boolean;
  toggleCityPicker: () => void;
  citySearchQuery: string;
  setCitySearchQuery: Dispatch<SetStateAction<string>>;
  filteredCityOptions: CityFilterOption[];
  handleSelectCity: (nextCity: string) => void;
  translate: (key: any) => string;
  onNavigate: (screen: string, data?: any) => void;
};

export function HomeHeader({
  isHeaderCompact,
  isAdmin,
  openSupportTicketCount,
  unreadNotificationCount,
  setUnreadNotificationCount,
  selectedCity,
  selectedCityLabel,
  isCityPickerOpen,
  toggleCityPicker,
  citySearchQuery,
  setCitySearchQuery,
  filteredCityOptions,
  handleSelectCity,
  translate,
  onNavigate,
}: HomeHeaderProps) {
  const notificationPopoverRef = useRef<HTMLDivElement | null>(null);
  const notificationPopoverOpenRef = useRef(false);
  const [isNotificationPopoverOpen, setIsNotificationPopoverOpen] = useState(false);
  const [notificationPreviewItems, setNotificationPreviewItems] = useState<
    NotificationPreviewItem[]
  >([]);
  const [notificationPreviewLoading, setNotificationPreviewLoading] = useState(false);
  const [notificationPreviewError, setNotificationPreviewError] = useState<string | null>(null);

  useEffect(() => {
    notificationPopoverOpenRef.current = isNotificationPopoverOpen;
  }, [isNotificationPopoverOpen]);

  const loadNotificationPreview = async () => {
    setNotificationPreviewLoading(true);
    setNotificationPreviewError(null);

    try {
      const items = await fetchNotificationPreviewItems(translate, 7);
      setNotificationPreviewItems(items);
    } catch (error) {
      console.error('Failed to load notification preview:', error);
      setNotificationPreviewItems([]);
      setNotificationPreviewError(translate('notifications.previewError'));
    } finally {
      setNotificationPreviewLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadUnreadCount = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        if (!cancelled) {
          setUnreadNotificationCount(0);
        }
        return;
      }

      const count = await fetchUnreadNotificationCountForUser(user.id);

      if (!cancelled) {
        setUnreadNotificationCount(count);
      }
    };

    const refreshNotificationState = async () => {
      await loadUnreadCount();

      if (notificationPopoverOpenRef.current) {
        await loadNotificationPreview();
      }
    };

    void refreshNotificationState();

    const participantsChannel = supabase
      .channel('home-header-notifications-participants')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
        },
        () => {
          void refreshNotificationState();
        }
      )
      .subscribe();

    const eventsChannel = supabase
      .channel('home-header-notifications-events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
        },
        () => {
          void refreshNotificationState();
        }
      )
      .subscribe();

    const invitationsChannel = supabase
      .channel('home-header-notifications-invitations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_invitations',
        },
        () => {
          void refreshNotificationState();
        }
      )
      .subscribe();

    const joinRequestsChannel = supabase
      .channel('home-header-notifications-event-join-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_join_requests',
        },
        () => {
          void refreshNotificationState();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(invitationsChannel);
      supabase.removeChannel(joinRequestsChannel);
    };
  }, [setUnreadNotificationCount]);

  useEffect(() => {
    if (!isNotificationPopoverOpen) {
      return;
    }

    void loadNotificationPreview();
  }, [isNotificationPopoverOpen]);

  useEffect(() => {
    if (!isNotificationPopoverOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!notificationPopoverRef.current?.contains(event.target as Node)) {
        setIsNotificationPopoverOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsNotificationPopoverOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isNotificationPopoverOpen]);

  const getNotificationIcon = (type: NotificationPreviewItem['type']) => {
    if (type === 'upcoming') return CalendarClock;
    if (type === 'join') return Users;
    if (type === 'invite') return Mail;
    return UserPlus;
  };

  const openNotificationTarget = async (notification: NotificationPreviewItem) => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!error && user) {
      await markNotificationKeysSeen(user.id, [notification.id]);
      const nextUnreadCount = await fetchUnreadNotificationCountForUser(user.id);
      setUnreadNotificationCount(nextUnreadCount);
      setNotificationPreviewItems((prevItems) =>
        prevItems.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                isUnread: false,
              }
            : item
        )
      );
    }

    setIsNotificationPopoverOpen(false);
    onNavigate(notification.type === 'request' ? 'event-join-requests' : 'event-details', {
      ...notification.event,
      backTarget: 'home',
    });
  };

  const markPreviewNotificationsRead = async () => {
    const unreadNotificationIds = notificationPreviewItems
      .filter((notification) => notification.isUnread)
      .map((notification) => notification.id);

    if (unreadNotificationIds.length === 0) {
      return;
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return;
    }

    await markNotificationKeysSeen(user.id, unreadNotificationIds);
    const nextUnreadCount = await fetchUnreadNotificationCountForUser(user.id);

    setUnreadNotificationCount(nextUnreadCount);
    setNotificationPreviewItems((prevItems) =>
      prevItems.map((item) => ({
        ...item,
        isUnread: false,
      }))
    );
  };

  return (
    <motion.div
      animate={{
        paddingTop: isHeaderCompact ? 10 : 14,
        paddingBottom: isHeaderCompact ? 10 : 14,
      }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className="sticky top-0 z-20 border-b border-border px-4"
      style={{
        backgroundColor: 'rgba(15, 15, 15, 0.94)',
        backdropFilter: 'blur(14px)',
      }}
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <motion.h1
          animate={{
            scale: isHeaderCompact ? 0.92 : 1,
            transformOrigin: 'left center',
          }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="text-xl"
          style={{ color: 'var(--accent)' }}
        >
          Gathr
        </motion.h1>

        <div className="relative flex min-w-0 justify-center">
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={toggleCityPicker}
            className="flex max-w-full items-center gap-1.5 rounded-full border px-3 py-2 text-sm transition-all"
            style={{
              backgroundColor: isCityPickerOpen
                ? 'var(--accent-soft-muted)'
                : 'rgba(255, 255, 255, 0.035)',
              borderColor: isCityPickerOpen ? 'var(--accent-border)' : 'var(--border-subtle)',
              color: selectedCity === 'all' ? 'var(--foreground-strong)' : 'var(--accent)',
            }}
            aria-label={translate('home.cityFilterLabel')}
            title={translate('home.cityFilterLabel')}
          >
            <span className="max-w-[8.5rem] truncate">{selectedCityLabel}</span>
            <ChevronDown
              size={14}
              className="shrink-0 text-muted-foreground transition-transform"
              style={{ transform: isCityPickerOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              strokeWidth={2.2}
            />
          </motion.button>

          {isCityPickerOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16 }}
              className="absolute left-1/2 top-full mt-2 w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-xl border"
              style={{
                backgroundColor: 'var(--surface-overlay)',
                borderColor: 'var(--border-subtle)',
                boxShadow: '0 18px 36px rgba(0, 0, 0, 0.28)',
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

              <div className="max-h-48 overflow-y-auto py-1 no-scrollbar">
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
                        backgroundColor: isActive ? 'var(--accent-soft-muted)' : 'transparent',
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

        <div className="flex items-center justify-end gap-2">
          <div ref={notificationPopoverRef} className="relative shrink-0">
            <motion.button
              whileTap={{ scale: 0.92 }}
              animate={{
                width: isHeaderCompact ? 36 : 38,
                height: isHeaderCompact ? 36 : 38,
              }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              onClick={() => setIsNotificationPopoverOpen((prev) => !prev)}
              className="relative flex shrink-0 items-center justify-center rounded-full border"
              style={{
                backgroundColor:
                  isNotificationPopoverOpen || unreadNotificationCount > 0
                    ? 'var(--accent-soft)'
                    : 'var(--primary)',
                borderColor:
                  isNotificationPopoverOpen || unreadNotificationCount > 0
                    ? 'var(--accent-border-strong)'
                    : 'var(--border)',
                color:
                  isNotificationPopoverOpen || unreadNotificationCount > 0
                    ? 'var(--accent)'
                    : 'var(--foreground-strong)',
              }}
              title={translate('bottomNav.notifications')}
              aria-label={translate('bottomNav.notifications')}
              aria-expanded={isNotificationPopoverOpen}
            >
              <Bell size={isHeaderCompact ? 16 : 18} strokeWidth={2} />
              {unreadNotificationCount > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border px-1 text-[10px]"
                  style={{
                    backgroundColor: 'var(--accent)',
                    borderColor: 'var(--background)',
                    color: 'var(--accent-foreground)',
                  }}
                >
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </span>
              )}
            </motion.button>

            <AnimatePresence>
              {isNotificationPopoverOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-0 top-full z-30 mt-3 w-[min(21rem,calc(100vw-2rem))] rounded-2xl border p-3"
                  style={{
                    backgroundColor: 'var(--surface-overlay)',
                    borderColor: 'var(--accent-border-muted)',
                    boxShadow: '0 18px 42px rgba(0, 0, 0, 0.36)',
                  }}
                >
                  <span
                    className="absolute -top-1.5 right-4 h-3 w-3 rotate-45 border-l border-t"
                    style={{
                      backgroundColor: 'var(--surface-overlay)',
                      borderColor: 'var(--accent-border-muted)',
                    }}
                  />

                  <div className="relative flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--foreground-strong)' }}>
                        {translate('notifications.title')}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {notificationPreviewItems.some((notification) => notification.isUnread) && (
                        <button
                          type="button"
                          onClick={() => {
                            void markPreviewNotificationsRead();
                          }}
                          className="rounded-full border px-3 py-1.5 text-xs transition-opacity hover:opacity-80"
                          style={{
                            borderColor: 'var(--border-subtle)',
                            color: 'var(--foreground-strong)',
                            backgroundColor: 'rgba(255, 255, 255, 0.035)',
                          }}
                        >
                          {translate('notifications.markRead')}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setIsNotificationPopoverOpen(false);
                          onNavigate('notifications');
                        }}
                        className="rounded-full border px-3 py-1.5 text-xs transition-opacity hover:opacity-80"
                        style={{
                          borderColor: 'var(--accent-border-muted)',
                          color: 'var(--accent)',
                          backgroundColor: 'var(--accent-soft-muted)',
                        }}
                      >
                        {translate('notifications.viewAll')}
                      </button>
                    </div>
                  </div>

                  <div className="relative mt-3 max-h-[22rem] overflow-y-auto pr-1 no-scrollbar">
                    {notificationPreviewLoading && (
                      <div className="space-y-2">
                        {[0, 1, 2].map((item) => (
                          <div
                            key={item}
                            className="animate-pulse rounded-xl border p-3"
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.03)',
                              borderColor: 'var(--border-subtle)',
                            }}
                          >
                            <div className="h-3 w-4/5 rounded bg-muted-foreground/20" />
                            <div className="mt-2 h-2 w-1/3 rounded bg-muted-foreground/15" />
                          </div>
                        ))}
                      </div>
                    )}

                    {!notificationPreviewLoading && notificationPreviewError && (
                      <div
                        className="rounded-xl border p-3 text-sm text-muted-foreground"
                        style={{ borderColor: 'var(--border-subtle)' }}
                      >
                        <p>{notificationPreviewError}</p>
                        <button
                          type="button"
                          onClick={() => {
                            void loadNotificationPreview();
                          }}
                          className="mt-3 rounded-full border px-3 py-1.5 text-xs transition-opacity hover:opacity-80"
                          style={{
                            borderColor: 'var(--accent-border-muted)',
                            backgroundColor: 'var(--accent-soft-muted)',
                            color: 'var(--accent)',
                          }}
                        >
                          {translate('notifications.retry')}
                        </button>
                      </div>
                    )}

                    {!notificationPreviewLoading &&
                      !notificationPreviewError &&
                      notificationPreviewItems.length === 0 && (
                        <div className="rounded-xl border p-4 text-center" style={{ borderColor: 'var(--border-subtle)' }}>
                          <Inbox className="mx-auto text-muted-foreground" size={22} strokeWidth={1.8} />
                          <p className="mt-2 text-sm" style={{ color: 'var(--foreground-strong)' }}>
                            {translate('notifications.emptyTitle')}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {translate('notifications.emptyDescription')}
                          </p>
                        </div>
                      )}

                    {!notificationPreviewLoading &&
                      !notificationPreviewError &&
                      notificationPreviewItems.length > 0 && (
                        <div className="space-y-2">
                          {notificationPreviewItems.map((notification) => {
                            const NotificationIcon = getNotificationIcon(notification.type);

                            return (
                              <button
                                key={notification.id}
                                type="button"
                                onClick={() => {
                                  void openNotificationTarget(notification);
                                }}
                                className="flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all active:opacity-75"
                                style={{
                                  backgroundColor: notification.isUnread
                                    ? 'var(--accent-soft-muted)'
                                    : 'rgba(255, 255, 255, 0.025)',
                                  borderColor: notification.isUnread
                                    ? 'var(--accent-border-muted)'
                                    : 'var(--border-subtle)',
                                }}
                              >
                                <span
                                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border"
                                  style={{
                                    backgroundColor: notification.isUnread
                                      ? 'var(--accent-soft)'
                                      : 'var(--primary)',
                                    borderColor: notification.isUnread
                                      ? 'var(--accent-border-muted)'
                                      : 'var(--border-subtle)',
                                    color: notification.isUnread
                                      ? 'var(--accent)'
                                      : 'var(--muted-foreground)',
                                  }}
                                >
                                  <NotificationIcon size={15} strokeWidth={2} />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span
                                    className="block text-sm leading-snug"
                                    style={{
                                      color: notification.isUnread
                                        ? 'var(--foreground-strong)'
                                        : 'var(--muted-foreground)',
                                      fontWeight: notification.isUnread ? 600 : 400,
                                    }}
                                  >
                                    {notification.message}
                                  </span>
                                  <span className="mt-1 block text-[11px] text-muted-foreground">
                                    {notification.time}
                                  </span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {isAdmin && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              animate={{
                width: isHeaderCompact ? 36 : 38,
                height: isHeaderCompact ? 36 : 38,
              }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              onClick={() =>
                onNavigate('admin', {
                  adminPage: 'support',
                  supportStatus: 'new',
                })
              }
              className="relative flex shrink-0 items-center justify-center rounded-full border"
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
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border px-1 text-[10px]"
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
        </div>
      </div>
    </motion.div>
  );
}
