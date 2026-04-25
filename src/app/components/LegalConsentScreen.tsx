import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { TouchButton } from './TouchButton';
import { useLanguage } from '../context/LanguageContext';
import { feedback } from '../lib/feedback';
import { CURRENT_LEGAL_VERSION } from '../constants/legalDocuments';

export function LegalConsentScreen({
  onNavigate,
  onAccepted,
  onLogout,
}: {
  onNavigate: (screen: string, data?: any, customDirection?: 'forward' | 'back' | 'up' | 'down') => void;
  onAccepted: () => Promise<void>;
  onLogout: () => Promise<void>;
}) {
  const { translate } = useLanguage();
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [showLegalRequired, setShowLegalRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleContinue = async () => {
    if (!acceptedLegal) {
      setShowLegalRequired(true);
      feedback.warning(translate('legal.mustAcceptTerms'));
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Failed to load current user for legal consent:', userError);
        feedback.error(translate('legal.consentSaveFailed'));
        return;
      }

      const acceptedAt = new Date().toISOString();

      const { error } = await supabase
        .from('profiles')
        .update({
          accepted_terms_at: acceptedAt,
          accepted_privacy_at: acceptedAt,
          accepted_legal_version: CURRENT_LEGAL_VERSION,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Failed to save legal consent:', error);
        feedback.error(translate('legal.consentSaveFailed'));
        return;
      }

      await onAccepted();
    } catch (error) {
      console.error('Unexpected legal consent save error:', error);
      feedback.error(translate('legal.consentSaveFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);

    try {
      await onLogout();
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col px-6 py-8 bg-background">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border p-5 space-y-5"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--accent-border-muted)',
            boxShadow: 'var(--accent-outline-soft)',
          }}
        >
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--accent)' }}>
              Gathr
            </p>
            <h2>{translate('legal.consentTitle')}</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {translate('legal.consentDescription')}
            </p>
          </div>

          <div
            className="rounded-xl border p-4"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: showLegalRequired
                ? 'var(--destructive-border-strong)'
                : acceptedLegal
                  ? 'var(--accent-border-muted)'
                  : 'var(--border)',
              boxShadow: showLegalRequired ? '0 0 0 1px var(--destructive-border-strong)' : 'none',
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
                disabled={loading || logoutLoading}
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
                  disabled={loading || logoutLoading}
                >
                  {translate('legal.acceptTermsLabel')}
                </button>{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('terms', { backTarget: 'legal-consent' })}
                  className="underline underline-offset-2"
                  style={{ color: 'var(--accent)' }}
                  disabled={loading || logoutLoading}
                >
                  {translate('legal.termsLink')}
                </button>{' '}
                {translate('legal.and')}{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('privacy', { backTarget: 'legal-consent' })}
                  className="underline underline-offset-2"
                  style={{ color: 'var(--accent)' }}
                  disabled={loading || logoutLoading}
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
          </div>

          <div className="space-y-3">
            <TouchButton
              onClick={handleContinue}
              variant="primary"
              fullWidth
              disabled={loading || logoutLoading}
            >
              {loading ? translate('legal.savingConsent') : translate('legal.continue')}
            </TouchButton>

            <TouchButton
              onClick={handleLogout}
              variant="ghost"
              fullWidth
              disabled={loading || logoutLoading}
              style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
            >
              {logoutLoading ? translate('profile.loggingOut') : translate('profile.logout')}
            </TouchButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
