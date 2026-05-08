import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
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
      className="flex w-full shrink-0 items-center justify-around"
      style={{
        backgroundColor: 'rgba(12, 12, 12, 0.95)',
        backdropFilter: 'blur(12px)',
        paddingTop: '0.625rem',
        paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom, 0px))',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* Home */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => onNavigate('home')}
        className="flex flex-col items-center gap-0.5 transition-colors relative px-4 py-1"
        style={{ color: activeScreen === 'home' ? 'var(--accent)' : 'var(--muted-foreground)' }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span className="text-[10px] font-medium">{translate('bottomNav.home')}</span>
      </motion.button>

      {/* Create - Center button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onNavigate('create-event')}
        className="flex items-center justify-center rounded-full -mt-4 relative"
        style={{
          width: 48,
          height: 48,
          backgroundColor: 'var(--accent)',
          color: 'var(--accent-foreground)',
          boxShadow: '0 4px 16px rgba(212, 175, 55, 0.3)',
        }}
      >
        <Plus size={24} strokeWidth={2.5} />
      </motion.button>

      {/* Notifications */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => onNavigate('notifications')}
        className="flex flex-col items-center gap-0.5 transition-colors relative px-4 py-1"
        style={{ color: activeScreen === 'notifications' ? 'var(--accent)' : 'var(--muted-foreground)' }}
      >
        <div className="relative">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center text-[9px] font-semibold"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-foreground)',
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.div>
          )}
        </div>
        <span className="text-[10px] font-medium">{translate('bottomNav.notifications')}</span>
      </motion.button>

      {/* Profile */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => onNavigate('profile')}
        className="flex flex-col items-center gap-0.5 transition-colors relative px-4 py-1"
        style={{ color: activeScreen === 'profile' ? 'var(--accent)' : 'var(--muted-foreground)' }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span className="text-[10px] font-medium">{translate('bottomNav.profile')}</span>
      </motion.button>
    </motion.div>
  );
}
