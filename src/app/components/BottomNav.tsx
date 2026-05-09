import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Home, Plus, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../../lib/supabase';
import { fetchMyProfileAccessSummary } from '../lib/publicData';

export function BottomNav({
  activeScreen,
  onNavigate
}: {
  activeScreen: string;
  onNavigate: (screen: string) => void;
}) {
  const { translate } = useLanguage();
  const [hasProPlan, setHasProPlan] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadProfileAccess = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        if (!cancelled) {
          setHasProPlan(false);
        }
        return;
      }

      const profileAccess = await fetchMyProfileAccessSummary();

      if (!cancelled) {
        setHasProPlan(
          profileAccess?.plan === 'pro' || profileAccess?.has_unlimited_access === true
        );
      }
    };

    void loadProfileAccess();

    return () => {
      cancelled = true;
    };
  }, [activeScreen]);

  const navItems = [
    {
      id: 'home',
      label: translate('bottomNav.home'),
      icon: Home,
      isActive: activeScreen === 'home',
      onClick: () => onNavigate('home'),
    },
    {
      id: 'create',
      label: translate('bottomNav.create'),
      icon: Plus,
      isActive: false,
      onClick: () => onNavigate('create-event'),
      isPrimary: true,
    },
    {
      id: 'profile',
      label: translate('bottomNav.profile'),
      icon: User,
      isActive: activeScreen === 'profile',
      onClick: () => onNavigate('profile'),
      showProBadge: hasProPlan,
    },
  ];

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex w-full shrink-0 items-end justify-around border-t"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--background)',
        backdropFilter: 'blur(10px)',
        paddingTop: '0.65rem',
        paddingBottom: 'calc(0.7rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <motion.button
            key={item.id}
            whileTap={{ scale: item.isPrimary ? 0.92 : 0.9 }}
            onClick={item.onClick}
            className="relative flex min-w-0 flex-1 flex-col items-center gap-1 transition-colors"
            style={{
              color: item.isPrimary || item.isActive ? 'var(--accent)' : 'var(--muted-foreground)',
            }}
          >
            {item.isActive && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute -top-1 h-1 w-1 rounded-full"
                style={{ backgroundColor: 'var(--accent)' }}
              />
            )}

            <span
              className="relative flex items-center justify-center rounded-full"
              style={{
                width: item.isPrimary ? 40 : 28,
                height: item.isPrimary ? 40 : 28,
                backgroundColor: item.isPrimary ? 'var(--accent)' : 'transparent',
                color: item.isPrimary ? 'var(--accent-foreground)' : 'currentColor',
                boxShadow: item.isPrimary ? '0 8px 20px rgba(212, 175, 55, 0.24)' : 'none',
              }}
            >
              <Icon size={item.isPrimary ? 22 : 23} strokeWidth={item.isPrimary ? 2.4 : 2} />

              {item.showProBadge && (
                <span
                  className="absolute -right-2 -top-1 rounded-full border px-1.5 py-0.5 text-[8px] font-semibold uppercase leading-none tracking-[0.12em]"
                  style={{
                    backgroundColor: 'var(--accent)',
                    borderColor: 'var(--background)',
                    color: 'var(--accent-foreground)',
                  }}
                >
                  {translate('home.proBadge')}
                </span>
              )}
            </span>

            <span className="max-w-full truncate text-[11px]">{item.label}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
