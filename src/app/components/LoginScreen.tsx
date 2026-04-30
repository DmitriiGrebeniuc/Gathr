import { motion } from 'motion/react';
import { Check, ChevronLeft } from 'lucide-react';
import { TouchButton } from './TouchButton';
import { SwipeableScreen } from './SwipeableScreen';
import { useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { feedback } from '../lib/feedback';
import { CURRENT_LEGAL_VERSION } from '../constants/legalDocuments';
import { INPUT_LIMITS, limitText, trimAndLimitText } from '../constants/inputLimits';

type EmailAuthMode = 'login' | 'signup';

export function LoginScreen({
  onNavigate,
  onAuthenticated,
  backTarget = 'welcome',
  backData,
  initialMode = 'login',
}: {
  onNavigate: (screen: string, data?: any) => void;
  onAuthenticated: (user: User) => Promise<void>;
  backTarget?: string;
  backData?: any;
  initialMode?: EmailAuthMode;
}) {
  const [mode, setMode] = useState<EmailAuthMode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [showLegalRequired, setShowLegalRequired] = useState(false);

  const { translate } = useLanguage();

  const isLoginMode = mode === 'login';
  const title = useMemo(
    () => (isLoginMode ? translate('login.title') : translate('signup.title')),
    [isLoginMode, translate]
  );
  const description = useMemo(
    () => (isLoginMode ? translate('login.description') : translate('signup.description')),
    [isLoginMode, translate]
  );

  const handleLogin = async () => {
    const nextEmail = trimAndLimitText(email, INPUT_LIMITS.email);
    const nextPassword = limitText(password.trim(), INPUT_LIMITS.password);

    if (!nextEmail) {
      feedback.warning(translate('login.enterEmail'));
      return;
    }

    if (!nextPassword) {
      feedback.warning(translate('login.enterPassword'));
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: nextEmail,
        password: nextPassword,
      });

      if (error) {
        console.error('РћС€РёР±РєР° РІС…РѕРґР°:', error);
        feedback.error(error.message || translate('login.failed'));
        setLoading(false);
        return;
      }

      if (data.user) {
        await onAuthenticated(data.user);
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      feedback.error(translate('login.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    const nextName = trimAndLimitText(name, INPUT_LIMITS.profileName);
    const nextEmail = trimAndLimitText(email, INPUT_LIMITS.email);
    const nextPassword = limitText(password.trim(), INPUT_LIMITS.password);

    if (!nextName) {
      feedback.warning(translate('signup.enterName'));
      return;
    }

    if (!nextEmail) {
      feedback.warning(translate('signup.enterEmail'));
      return;
    }

    if (!nextPassword) {
      feedback.warning(translate('signup.enterPassword'));
      return;
    }

    if (!acceptedLegal) {
      setShowLegalRequired(true);
      feedback.warning(translate('legal.mustAcceptTerms'));
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: nextEmail,
        password: nextPassword,
        options: {
          data: {
            name: nextName,
            accepted_terms_at: new Date().toISOString(),
            accepted_privacy_at: new Date().toISOString(),
            accepted_legal_version: CURRENT_LEGAL_VERSION,
          },
        },
      });

      if (error) {
        console.error('РћС€РёР±РєР° СЂРµРіРёСЃС‚СЂР°С†РёРё:', error);
        feedback.error(error.message || translate('signup.failed'));
        setLoading(false);
        return;
      }

      feedback.success(
        `${translate('signup.confirmEmailTitle')}\n\n${translate('signup.confirmEmailMessage')}`
      );
      setMode('login');
      setPassword('');
    } catch (error) {
      console.error('Unexpected signup error:', error);
      feedback.error(translate('signup.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const nextEmail = trimAndLimitText(email, INPUT_LIMITS.email);

    if (!nextEmail) {
      feedback.warning(translate('login.enterEmail'));
      return;
    }

    setResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(nextEmail, {
        redirectTo: 'https://gathr-app.site',
      });

      if (error) {
        console.error('РћС€РёР±РєР° РѕС‚РїСЂР°РІРєРё reset password email:', error);
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

  const handleSubmit = async () => {
    if (isLoginMode) {
      await handleLogin();
      return;
    }

    await handleSignUp();
  };

  const handleModeChange = (nextMode: EmailAuthMode) => {
    setMode(nextMode);
    setShowLegalRequired(false);
  };

  const isBusy = loading || resetLoading;

  return (
    <SwipeableScreen onSwipeBack={() => onNavigate(backTarget, backData)}>
      <div className="h-full flex flex-col px-6 py-8 bg-background">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate(backTarget, backData)}
          className="self-start inline-flex items-center gap-2 text-muted-foreground mb-8"
          disabled={isBusy}
        >
          <ChevronLeft size={20} />
          <span>{translate('login.back')}</span>
        </motion.button>

        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-2"
          >
            {title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.13 }}
            className="text-sm text-muted-foreground mb-6 leading-6"
          >
            {description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border p-1 mb-6 flex gap-1"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--surface-strong)',
            }}
          >
            <button
              type="button"
              onClick={() => handleModeChange('login')}
              className="flex-1 rounded-xl px-4 py-3 text-sm transition-all"
              style={{
                backgroundColor: isLoginMode ? 'var(--accent)' : 'transparent',
                color: isLoginMode ? 'var(--accent-foreground)' : 'var(--foreground)',
              }}
              disabled={isBusy}
            >
              {translate('login.modeLogin')}
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('signup')}
              className="flex-1 rounded-xl px-4 py-3 text-sm transition-all"
              style={{
                backgroundColor: !isLoginMode ? 'var(--accent)' : 'transparent',
                color: !isLoginMode ? 'var(--accent-foreground)' : 'var(--foreground)',
              }}
              disabled={isBusy}
            >
              {translate('login.modeSignup')}
            </button>
          </motion.div>

          <div className="space-y-4">
            {!isLoginMode && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18 }}
              >
                <label className="block mb-2 text-sm text-muted-foreground">
                  {translate('signup.name')}
                </label>
                <input
                  type="text"
                  placeholder={translate('signup.namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(limitText(e.target.value, INPUT_LIMITS.profileName))}
                  maxLength={INPUT_LIMITS.profileName}
                  className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors"
                  style={{ backgroundColor: 'var(--card)' }}
                />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: isLoginMode ? 0.2 : 0.22 }}
            >
              <label className="block mb-2 text-sm text-muted-foreground">
                {translate('login.email')}
              </label>
              <input
                type="email"
                placeholder={translate('login.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(limitText(e.target.value, INPUT_LIMITS.email))}
                maxLength={INPUT_LIMITS.email}
                className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors"
                style={{ backgroundColor: 'var(--card)' }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: isLoginMode ? 0.3 : 0.32 }}
            >
              <label className="block mb-2 text-sm text-muted-foreground">
                {translate('login.password')}
              </label>
              <input
                type="password"
                placeholder={translate('login.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(limitText(e.target.value, INPUT_LIMITS.password))}
                maxLength={INPUT_LIMITS.password}
                className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors"
                style={{ backgroundColor: 'var(--card)' }}
              />
            </motion.div>

            {isLoginMode ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-right"
              >
                <button
                  onClick={handleForgotPassword}
                  className="text-sm text-accent"
                  style={{ color: 'var(--accent)' }}
                  disabled={isBusy}
                >
                  {resetLoading
                    ? translate('login.sendingReset')
                    : translate('login.forgotPassword')}
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.36 }}
                className="rounded-xl border p-4"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: showLegalRequired
                    ? 'var(--destructive-border-strong)'
                    : acceptedLegal
                      ? 'var(--accent-border-muted)'
                      : 'var(--border)',
                  boxShadow: showLegalRequired
                    ? '0 0 0 1px var(--destructive-border-strong)'
                    : 'none',
                }}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAcceptedLegal((prev) => !prev);
                      setShowLegalRequired(false);
                    }}
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border"
                    style={{
                      backgroundColor: acceptedLegal
                        ? 'var(--accent)'
                        : showLegalRequired
                          ? 'var(--destructive-soft)'
                          : 'var(--surface-strong)',
                      borderColor: acceptedLegal
                        ? 'var(--accent)'
                        : showLegalRequired
                          ? 'var(--destructive-border-strong)'
                          : 'var(--foreground-strong)',
                      color: acceptedLegal ? 'var(--accent-foreground)' : 'transparent',
                    }}
                    disabled={loading}
                    aria-pressed={acceptedLegal}
                    aria-invalid={showLegalRequired}
                  >
                    {acceptedLegal ? <Check size={14} strokeWidth={2.5} /> : null}
                  </button>

                  <div className="text-sm leading-6 text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => {
                        setAcceptedLegal((prev) => !prev);
                        setShowLegalRequired(false);
                      }}
                      className="text-left"
                      disabled={loading}
                    >
                      {translate('legal.acceptTermsLabel')}
                    </button>{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('terms', { backTarget: 'login' })}
                      className="text-accent underline underline-offset-2"
                      style={{ color: 'var(--accent)' }}
                      disabled={loading}
                    >
                      {translate('legal.termsLink')}
                    </button>{' '}
                    {translate('legal.and')}{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('privacy', { backTarget: 'login' })}
                      className="text-accent underline underline-offset-2"
                      style={{ color: 'var(--accent)' }}
                      disabled={loading}
                    >
                      {translate('legal.privacyLink')}
                    </button>{' '}
                    {translate('legal.and')} {translate('legal.acceptTermsSuffix')}.
                  </div>
                </div>

                {showLegalRequired && (
                  <p className="mt-3 text-sm" style={{ color: 'var(--destructive)' }}>
                    {translate('legal.mustAcceptTerms')}
                  </p>
                )}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isLoginMode ? 0.42 : 0.45 }}
            >
              <TouchButton
                onClick={handleSubmit}
                variant={isLoginMode ? 'secondary' : 'primary'}
                fullWidth
                className="mt-2"
                disabled={isBusy}
              >
                {loading
                  ? isLoginMode
                    ? translate('login.submitting')
                    : translate('signup.submitting')
                  : isLoginMode
                    ? translate('login.submit')
                    : translate('signup.submit')}
              </TouchButton>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: isLoginMode ? 0.47 : 0.5 }}
              className="text-center text-sm text-muted-foreground mt-4"
            >
              {isLoginMode ? translate('login.noAccount') : translate('signup.haveAccount')}{' '}
              <button
                onClick={() => handleModeChange(isLoginMode ? 'signup' : 'login')}
                className="text-accent"
                style={{ color: 'var(--accent)' }}
                disabled={isBusy}
              >
                {isLoginMode ? translate('login.signupLink') : translate('signup.loginLink')}
              </button>
            </motion.p>
          </div>
        </div>
      </div>
    </SwipeableScreen>
  );
}
