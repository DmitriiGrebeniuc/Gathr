import { useEffect, type Dispatch, type SetStateAction } from 'react';
import { motion } from 'motion/react';
import { Bell, ChevronDown, LifeBuoy } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { fetchUnreadNotificationCountForUser } from '../../lib/notificationReads';
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

    void loadUnreadCount();

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
          void loadUnreadCount();
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
          void loadUnreadCount();
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
          void loadUnreadCount();
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
          void loadUnreadCount();
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
          <motion.button
            whileTap={{ scale: 0.92 }}
            animate={{
              width: isHeaderCompact ? 36 : 38,
              height: isHeaderCompact ? 36 : 38,
            }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={() => onNavigate('notifications')}
            className="relative flex shrink-0 items-center justify-center rounded-full border"
            style={{
              backgroundColor: unreadNotificationCount > 0 ? 'var(--accent-soft)' : 'var(--primary)',
              borderColor:
                unreadNotificationCount > 0 ? 'var(--accent-border-strong)' : 'var(--border)',
              color:
                unreadNotificationCount > 0 ? 'var(--accent)' : 'var(--foreground-strong)',
            }}
            title={translate('bottomNav.notifications')}
            aria-label={translate('bottomNav.notifications')}
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
