import { motion } from 'motion/react';
import { TouchButton } from './TouchButton';
import { SwipeableScreen } from './SwipeableScreen';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { feedback } from '../lib/feedback';

export function LoginScreen({
  onNavigate,
  onGoogleLogin,
  backTarget = 'welcome',
  backData,
}: {
  onNavigate: (screen: string, data?: any) => void;
  onGoogleLogin: () => Promise<void>;
  backTarget?: string;
  backData?: any;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { translate } = useLanguage();

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);

    try {
      await onGoogleLogin();
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      feedback.warning(translate('login.enterEmail'));
      return;
    }

    if (!password.trim()) {
      feedback.warning(translate('login.enterPassword'));
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
        feedback.error(error.message || translate('login.failed'));
        setLoading(false);
        return;
      }

      return;
    } catch (error) {
      console.error('Unexpected login error:', error);
      feedback.error(translate('login.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      feedback.warning(translate('login.enterEmail'));
      return;
    }

    setResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'https://gathr-app.site',
      });

      if (error) {
        console.error('Ошибка отправки reset password email:', error);
        feedback.error(error.message || translate('login.resetFailed'));
        return;
      }

      feedback.success(translate('login.resetEmailSent'));
    } catch (error) {
      console.error('Unexpected reset password request error:', error);
      feedback.error(translate('login.resetUnexpectedError'));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <SwipeableScreen onSwipeBack={() => onNavigate(backTarget, backData)}>
      <div className="h-full flex flex-col px-6 py-8 bg-background">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate(backTarget, backData)}
          className="self-start text-muted-foreground mb-8"
          disabled={loading || resetLoading || googleLoading}
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <TouchButton
                onClick={handleGoogleAuth}
                variant="primary"
                fullWidth
                disabled={loading || resetLoading || googleLoading}
                className="flex items-center justify-center gap-3"
              >
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-semibold"
                  style={{ color: '#0F0F0F' }}
                >
                  G
                </span>
                {googleLoading ? translate('login.submitting') : translate('login.google')}
              </TouchButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18 }}
              className="flex items-center gap-3 py-1"
            >
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                {translate('login.emailDivider')}
              </span>
              <div className="h-px flex-1 bg-border" />
            </motion.div>

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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-right"
            >
              <button
                onClick={handleForgotPassword}
                className="text-sm text-accent"
                style={{ color: '#D4AF37' }}
                disabled={loading || resetLoading || googleLoading}
              >
                {resetLoading
                  ? translate('login.sendingReset')
                  : translate('login.forgotPassword')}
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <TouchButton
                onClick={handleLogin}
                variant="secondary"
                fullWidth
                className="mt-2"
                disabled={loading || resetLoading || googleLoading}
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
                disabled={loading || resetLoading || googleLoading}
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
