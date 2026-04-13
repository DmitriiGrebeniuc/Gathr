import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { TouchButton } from './TouchButton';
import { useLanguage } from '../context/LanguageContext';
import { useMemo, useState } from 'react';
import { LANGUAGES, type LanguageCode } from '../constants/languages';
import { hasCompletedLanguageChoice, markLanguageChoiceCompleted } from '../../lib/language';

const ONBOARDING_COMPLETED_KEY = 'gathr-onboarding-completed';
const HOME_LAUNCH_OVERLAY_DISMISSED_KEY = 'gathr-home-launch-overlay-dismissed';

const hasCompletedOnboarding = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
};

const markOnboardingCompleted = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
  window.localStorage.setItem(HOME_LAUNCH_OVERLAY_DISMISSED_KEY, 'true');
};

export function WelcomeScreen({
  onNavigate,
  onGoogleLogin,
}: {
  onNavigate: (screen: string, data?: any) => void;
  onGoogleLogin: () => Promise<void>;
}) {
  const { language, setLanguage, translate } = useLanguage();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showLanguageChoice, setShowLanguageChoice] = useState(() => !hasCompletedLanguageChoice());
  const [showOnboarding, setShowOnboarding] = useState(
    () => hasCompletedLanguageChoice() && !hasCompletedOnboarding()
  );
  const [onboardingStep, setOnboardingStep] = useState(0);

  const onboardingPages = useMemo(
    () => [
      {
        title: translate('onboarding.page1.title'),
        body: translate('onboarding.page1.body'),
      },
      {
        title: translate('onboarding.page2.title'),
        body: translate('onboarding.page2.body'),
      },
      {
        title: translate('onboarding.page3.title'),
        body: translate('onboarding.page3.body'),
      },
      {
        title: translate('onboarding.page4.title'),
        body: translate('onboarding.page4.body'),
      },
    ],
    [translate]
  );

  const currentOnboardingPage = onboardingPages[onboardingStep];
  const isLastOnboardingStep = onboardingStep === onboardingPages.length - 1;

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);

    try {
      await onGoogleLogin();
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSelectLanguage = (nextLanguage: LanguageCode) => {
    setLanguage(nextLanguage);
    markLanguageChoiceCompleted();
    setShowLanguageChoice(false);
    setShowOnboarding(true);
    setOnboardingStep(0);
  };

  const handleCompleteOnboarding = () => {
    markOnboardingCompleted();
    setShowOnboarding(false);
    setOnboardingStep(0);
  };

  const handleNextOnboardingStep = () => {
    if (isLastOnboardingStep) {
      handleCompleteOnboarding();
      return;
    }

    setOnboardingStep((prev) => prev + 1);
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
        {showLanguageChoice && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="rounded-2xl border p-4 space-y-3"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--accent-border-muted)',
              boxShadow: 'var(--accent-outline-soft)',
            }}
          >
            <div className="space-y-1">
              <p style={{ color: 'var(--accent)' }}>{translate('welcome.languageChoiceTitle')}</p>
              <p className="text-sm text-muted-foreground">
                {translate('welcome.languageChoiceDescription')}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {LANGUAGES.map((item) => {
                const isSelected = language === item.value;

                return (
                  <motion.button
                    key={item.value}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectLanguage(item.value)}
                    className="w-full rounded-xl border px-3 py-3 text-left transition-all"
                    style={{
                      backgroundColor: 'var(--card)',
                      borderColor: isSelected ? 'var(--accent-border-strong)' : 'var(--border)',
                      boxShadow: isSelected ? 'var(--accent-outline-soft)' : 'none',
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl">{item.emoji}</span>
                        <span className="truncate">{item.label}</span>
                      </div>

                      <span
                        className="shrink-0"
                        style={{
                          color: isSelected ? 'var(--accent)' : 'var(--muted-foreground)',
                        }}
                      >
                        {isSelected ? <Check size={18} strokeWidth={2.25} /> : null}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {showOnboarding ? (
          <motion.div
            key={onboardingStep}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="rounded-2xl border p-5"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--accent-border-muted)',
              boxShadow: 'var(--accent-outline-soft)',
            }}
          >
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                {onboardingPages.map((_, index) => (
                  <span
                    key={index}
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: index === onboardingStep ? '1.5rem' : '0.5rem',
                      backgroundColor:
                        index === onboardingStep ? 'var(--accent)' : 'var(--border-subtle)',
                    }}
                  />
                ))}
              </div>

              {!isLastOnboardingStep && (
                <button
                  type="button"
                  onClick={handleCompleteOnboarding}
                  className="text-sm text-muted-foreground transition-opacity hover:opacity-80"
                >
                  {translate('onboarding.skip')}
                </button>
              )}
            </div>

            <div className="space-y-3 min-h-[184px]">
              <h2 className="text-2xl leading-tight">{currentOnboardingPage.title}</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                {currentOnboardingPage.body}
              </p>
            </div>

            <TouchButton
              onClick={handleNextOnboardingStep}
              variant="primary"
              fullWidth
              className="mt-5"
            >
              {isLastOnboardingStep
                ? translate('onboarding.start')
                : translate('onboarding.next')}
            </TouchButton>
          </motion.div>
        ) : !showLanguageChoice ? (
          <>
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
          </>
        ) : null}
      </motion.div>
    </div>
  );
}
