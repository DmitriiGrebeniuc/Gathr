import { motion } from 'motion/react';
import { TouchButton } from './TouchButton';
import { SwipeableScreen } from './SwipeableScreen';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../context/LanguageContext';

export function LoginScreen({
  onNavigate,
}: {
  onNavigate: (screen: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { translate } = useLanguage();

  const handleLogin = async () => {
    if (!email.trim()) {
      alert(translate('login.enterEmail'));
      return;
    }

    if (!password.trim()) {
      alert(translate('login.enterPassword'));
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        console.error('Ошибка входа:', error);
        alert(error.message || translate('login.failed'));
        setLoading(false);
        return;
      }

      onNavigate('home');
    } catch (error) {
      console.error('Unexpected login error:', error);
      alert(translate('login.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SwipeableScreen onSwipeBack={() => onNavigate('welcome')}>
      <div className="h-full flex flex-col px-6 py-8 bg-background">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('welcome')}
          className="self-start text-muted-foreground mb-8"
          disabled={loading}
        >
          ← {translate('login.back')}
        </motion.button>

        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            {translate('login.title')}
          </motion.h2>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block mb-2 text-sm text-muted-foreground">
                {translate('login.email')}
              </label>
              <input
                type="email"
                placeholder={translate('login.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors"
                style={{ backgroundColor: '#1A1A1A' }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block mb-2 text-sm text-muted-foreground">
                {translate('login.password')}
              </label>
              <input
                type="password"
                placeholder={translate('login.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors"
                style={{ backgroundColor: '#1A1A1A' }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <TouchButton
                onClick={handleLogin}
                variant="primary"
                fullWidth
                className="mt-6"
              >
                {loading ? translate('login.submitting') : translate('login.submit')}
              </TouchButton>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-sm text-muted-foreground mt-4"
            >
              {translate('login.noAccount')}{' '}
              <button
                onClick={() => onNavigate('signup')}
                className="text-accent"
                style={{ color: '#D4AF37' }}
                disabled={loading}
              >
                {translate('login.signupLink')}
              </button>
            </motion.p>
          </div>
        </div>
      </div>
    </SwipeableScreen>
  );
}