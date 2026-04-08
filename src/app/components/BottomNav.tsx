import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

export function BottomNav({
  activeScreen,
  onNavigate
}: {
  activeScreen: string;
  onNavigate: (screen: string) => void;
}) {
  const { translate } = useLanguage();

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex items-center justify-around py-4 border-t"
      style={{
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: '#0F0F0F',
        backdropFilter: 'blur(10px)'
      }}
    >
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onNavigate('home')}
        className="flex flex-col items-center gap-1 transition-colors relative"
        style={{ color: activeScreen === 'home' ? '#D4AF37' : '#8A8A8A' }}
      >
        {activeScreen === 'home' && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute -top-1 w-1 h-1 rounded-full"
            style={{ backgroundColor: '#D4AF37' }}
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
        style={{ color: activeScreen === 'notifications' ? '#D4AF37' : '#8A8A8A' }}
      >
        {activeScreen === 'notifications' && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute -top-1 w-1 h-1 rounded-full"
            style={{ backgroundColor: '#D4AF37' }}
          />
        )}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span className="text-xs">{translate('bottomNav.notifications')}</span>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onNavigate('profile')}
        className="flex flex-col items-center gap-1 transition-colors relative"
        style={{ color: activeScreen === 'profile' ? '#D4AF37' : '#8A8A8A' }}
      >
        {activeScreen === 'profile' && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute -top-1 w-1 h-1 rounded-full"
            style={{ backgroundColor: '#D4AF37' }}
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