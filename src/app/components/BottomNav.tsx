import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../../lib/supabase';
import { fetchUnreadNotificationCountForUser } from '../lib/notificationReads';

export function BottomNav({
  activeScreen,
  onNavigate
}: {
  activeScreen: string;
  onNavigate: (screen: string) => void;
}) {
  const { translate } = useLanguage();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadUnreadCount = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        if (!cancelled) {
          setUnreadCount(0);
        }
        return;
      }

      const count = await fetchUnreadNotificationCountForUser(user.id);

      if (!cancelled) {
        setUnreadCount(count);
      }
    };

    void loadUnreadCount();

    const participantsChannel = supabase
      .channel('bottom-nav-notifications-participants')
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
      .channel('bottom-nav-notifications-events')
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
      .channel('bottom-nav-notifications-invitations')
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
      .channel('bottom-nav-notifications-event-join-requests')
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
  }, [activeScreen]);

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex items-center justify-around border-t"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--background)',
        backdropFilter: 'blur(10px)',
        paddingTop: '0.75rem',
        paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onNavigate('home')}
        className="flex flex-col items-center gap-1 transition-colors relative"
        style={{ color: activeScreen === 'home' ? 'var(--accent)' : 'var(--muted-foreground)' }}
      >
        {activeScreen === 'home' && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute -top-1 w-1 h-1 rounded-full"
            style={{ backgroundColor: 'var(--accent)' }}
          />
        )}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span className="text-xs">{translate('bottomNav.home')}</span>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onNavigate('notifications')}
        className="flex flex-col items-center gap-1 transition-colors relative"
        style={{ color: activeScreen === 'notifications' ? 'var(--accent)' : 'var(--muted-foreground)' }}
      >
        {activeScreen === 'notifications' && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute -top-1 w-1 h-1 rounded-full"
            style={{ backgroundColor: 'var(--accent)' }}
          />
        )}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {activeScreen !== 'notifications' && unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute -top-1 right-0 min-w-[1.15rem] h-[1.15rem] px-1 rounded-full flex items-center justify-center text-[0.625rem] font-semibold"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-foreground)',
              boxShadow: '0 0 0 2px var(--background)',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}
        <span className="text-xs">{translate('bottomNav.notifications')}</span>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onNavigate('profile')}
        className="flex flex-col items-center gap-1 transition-colors relative"
        style={{ color: activeScreen === 'profile' ? 'var(--accent)' : 'var(--muted-foreground)' }}
      >
        {activeScreen === 'profile' && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute -top-1 w-1 h-1 rounded-full"
            style={{ backgroundColor: 'var(--accent)' }}
          />
        )}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span className="text-xs">{translate('bottomNav.profile')}</span>
      </motion.button>
    </motion.div>
  );
}
