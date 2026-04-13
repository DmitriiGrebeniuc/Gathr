import { motion } from 'motion/react';
import { TouchButton } from './TouchButton';
import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';

export function WelcomeScreen({
  onNavigate,
  onGoogleLogin,
}: {
  onNavigate: (screen: string, data?: any) => void;
  onGoogleLogin: () => Promise<void>;
}) {
  const { translate } = useLanguage();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);

    try {
      await onGoogleLogin();
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 bg-background">
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center"
        >
          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className="text-6xl mb-2 tracking-tight"
            style={{ color: 'var(--accent)' }}
          >
            Gathr
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground"
          >
            {translate('welcome.tagline')}
          </motion.p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-sm space-y-3 pb-12"
      >
        <TouchButton
          onClick={handleGoogleLogin}
          variant="primary"
          fullWidth
          disabled={googleLoading}
          className="flex items-center justify-center gap-3"
        >
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-semibold"
            style={{ color: 'var(--accent-foreground)' }}
          >
            G
          </span>
          {googleLoading ? translate('login.submitting') : translate('welcome.google')}
        </TouchButton>

        <TouchButton
          onClick={() => onNavigate('login')}
          variant="ghost"
          fullWidth
          disabled={googleLoading}
          style={{ borderColor: 'var(--accent-border-muted)', color: 'var(--accent)' }}
        >
          {translate('welcome.login')}
        </TouchButton>

        <button
          onClick={() => onNavigate('signup')}
          className="w-full pt-2 text-sm text-muted-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          disabled={googleLoading}
        >
          {translate('welcome.signup')}
        </button>
      </motion.div>
    </div>
  );
}
