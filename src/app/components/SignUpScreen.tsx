import { motion } from 'motion/react';
import { TouchButton } from './TouchButton';
import { SwipeableScreen } from './SwipeableScreen';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { feedback } from '../lib/feedback';
import { Check } from 'lucide-react';
import { CURRENT_LEGAL_VERSION } from '../constants/legalDocuments';

export function SignUpScreen({
  onNavigate,
}: {
  onNavigate: (screen: string, data?: any) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [loading, setLoading] = useState(false);

  const { translate } = useLanguage();

  const handleSignUp = async () => {
    if (!name.trim()) {
      feedback.warning(translate('signup.enterName'));
      return;
    }

    if (!email.trim()) {
      feedback.warning(translate('signup.enterEmail'));
      return;
    }

    if (!password.trim()) {
      feedback.warning(translate('signup.enterPassword'));
      return;
    }

    if (!acceptedLegal) {
      feedback.warning(translate('legal.mustAcceptTerms'));
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            name: name.trim(),
            accepted_terms_at: new Date().toISOString(),
            accepted_privacy_at: new Date().toISOString(),
            accepted_legal_version: CURRENT_LEGAL_VERSION,
          },
        },
      });

      if (error) {
        console.error('Ошибка регистрации:', error);
        feedback.error(error.message || translate('signup.failed'));
        setLoading(false);
        return;
      }

      feedback.success(
        `${translate('signup.confirmEmailTitle')}\n\n${translate('signup.confirmEmailMessage')}`
      );
      onNavigate('login');
    } catch (error) {
      console.error('Unexpected signup error:', error);
      feedback.error(translate('signup.unexpectedError'));
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
          ← {translate('signup.back')}
        </motion.button>

        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            {translate('signup.title')}
          </motion.h2>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <label className="block mb-2 text-sm text-muted-foreground">
                {translate('signup.name')}
              </label>
              <input
                type="text"
                placeholder={translate('signup.namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors"
                style={{ backgroundColor: 'var(--card)' }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block mb-2 text-sm text-muted-foreground">
                {translate('signup.email')}
              </label>
              <input
                type="email"
                placeholder={translate('signup.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors"
                style={{ backgroundColor: 'var(--card)' }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <label className="block mb-2 text-sm text-muted-foreground">
                {translate('signup.password')}
              </label>
              <input
                type="password"
                placeholder={translate('signup.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors"
                style={{ backgroundColor: 'var(--card)' }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border p-4"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: acceptedLegal ? 'var(--accent-border-muted)' : 'var(--border)',
              }}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setAcceptedLegal((prev) => !prev)}
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border"
                  style={{
                    backgroundColor: acceptedLegal ? 'var(--accent-soft)' : 'transparent',
                    borderColor: acceptedLegal ? 'var(--accent-border-strong)' : 'var(--border)',
                    color: acceptedLegal ? 'var(--accent)' : 'transparent',
                  }}
                  disabled={loading}
                  aria-pressed={acceptedLegal}
                >
                  {acceptedLegal ? <Check size={14} strokeWidth={2.5} /> : null}
                </button>

                <div className="text-sm leading-6 text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => setAcceptedLegal((prev) => !prev)}
                    className="text-left"
                    disabled={loading}
                  >
                    {translate('legal.acceptTermsLabel')}
                  </button>{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('terms', { backTarget: 'signup' })}
                    className="text-accent underline underline-offset-2"
                    style={{ color: 'var(--accent)' }}
                    disabled={loading}
                  >
                    {translate('legal.termsLink')}
                  </button>{' '}
                  {translate('legal.and')}{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('privacy', { backTarget: 'signup' })}
                    className="text-accent underline underline-offset-2"
                    style={{ color: 'var(--accent)' }}
                    disabled={loading}
                  >
                    {translate('legal.privacyLink')}
                  </button>
                  {' '}
                  {translate('legal.and')} {translate('legal.acceptTermsSuffix')}.
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <TouchButton
                onClick={handleSignUp}
                variant="primary"
                fullWidth
                className="mt-6"
              >
                {loading ? translate('signup.submitting') : translate('signup.submit')}
              </TouchButton>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center text-sm text-muted-foreground mt-4"
            >
              {translate('signup.haveAccount')}{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-accent"
                style={{ color: 'var(--accent)' }}
                disabled={loading}
              >
                {translate('signup.loginLink')}
              </button>
            </motion.p>
          </div>
        </div>
      </div>
    </SwipeableScreen>
  );
}
