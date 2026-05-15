import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronRight, ExternalLink, Heart, QrCode } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getUsableContactEmail, hasUsableContactEmail } from '../../lib/authContactEmail';
import { useLanguage } from '../context/LanguageContext';
import { feedback } from '../lib/feedback';
import { LoadingLine } from './LoadingState';

type CurrentUser = {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
  plan: string | null;
  has_unlimited_access: boolean;
};

type MyProfileAccess = {
  id: string;
  name: string | null;
  role: string;
  plan: string;
  has_unlimited_access: boolean;
};

export function ProfileScreen({
  onNavigate,
}: {
  onNavigate: (screen: string) => void;
}) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showContactsSupport, setShowContactsSupport] = useState(false);

  const { translate } = useLanguage();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
          console.error('РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ:', authError);
          setUser(null);
          setLoading(false);
          return;
        }

        const { data: rawProfile, error: profileError } = await supabase
          .rpc('get_my_profile_access')
          .maybeSingle();

        const profile = rawProfile as MyProfileAccess | null;

        if (profileError) {
          console.error('РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РїСЂРѕС„РёР»СЏ:', profileError);
        }

        const contactEmail = getUsableContactEmail(authUser.email ?? null);

        setUser({
          id: authUser.id,
          email: contactEmail,
          name: profile?.name ?? null,
          role: profile?.role ?? null,
          plan: profile?.plan ?? null,
          has_unlimited_access: profile?.has_unlimited_access ?? false,
        });
      } catch (error) {
        console.error('Unexpected profile load error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const getInitials = () => {
    const name = user?.name?.trim();

    if (name) {
      const parts = name.split(' ').filter(Boolean).slice(0, 2);

      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }

      return name.slice(0, 2).toUpperCase();
    }

    const email = user?.email?.trim();

    if (!email) {
      return '??';
    }

    const base = email.split('@')[0];

    if (!base) {
      return '??';
    }

    return base.slice(0, 2).toUpperCase();
  };

  const getDisplayName = () => {
    if (user?.name?.trim()) {
      return user.name;
    }

    if (user?.email?.trim()) {
      return user.email.split('@')[0];
    }

    return 'Guest User';
  };

  const handleLogout = async () => {
    setLogoutLoading(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('РћС€РёР±РєР° РІС‹С…РѕРґР°:', error);
        feedback.error(error.message || translate('profile.logoutFailed'));
        setLogoutLoading(false);
        return;
      }

      onNavigate('welcome');
    } catch (error) {
      console.error('Unexpected logout error:', error);
      feedback.error(translate('profile.logoutUnexpectedError'));
    } finally {
      setLogoutLoading(false);
    }
  };

  const isAdmin = user?.role === 'admin';
  const hasProPlan = user?.plan === 'pro' || user?.has_unlimited_access;
  const missingEmail = !loading && !hasUsableContactEmail(user?.email);
  const currentPlanLabel = hasProPlan
    ? translate('profile.planProStatus')
    : translate('profile.planFreeStatus');

  const contactLinks = [
    { label: 'Telegram', value: '@jivot_piva', href: 'https://t.me/jivot_piva' },
    { label: 'Instagram Gathr', value: '@gathr.app', href: 'https://www.instagram.com/gathr.app/' },
    { label: 'Telegram bot', value: '@gathrapp_bot', href: 'https://t.me/gathrapp_bot' },
    { label: 'Gathr', value: 'gathr-app.site', href: 'https://gathr-app.site' },
    { label: 'About Gathr', value: 'about.gathr-app.site', href: 'https://about.gathr-app.site/' },
  ];

  if (showContactsSupport) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="px-6 py-4 border-b border-border">
          <button
            type="button"
            onClick={() => setShowContactsSupport(false)}
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={16} />
            {translate('common.back')}
          </button>
          <h1>{translate('contactSupport.title')}</h1>
        </div>

        <div
          className="flex-1 overflow-y-auto px-6 py-6"
          style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="max-w-sm mx-auto space-y-5">
            <div
              className="rounded-2xl border px-4 py-4"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--card)',
              }}
            >
              <p className="text-sm leading-6 text-muted-foreground">
                {translate('contactSupport.description')}
              </p>
            </div>

            <section className="space-y-3">
              <h2 className="text-lg">{translate('contactSupport.contactsTitle')}</h2>
              <div className="space-y-2">
                {contactLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-all hover:border-accent/50"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--card)',
                    }}
                  >
                    <span className="min-w-0">
                      <span className="block text-sm">{link.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {link.value}
                      </span>
                    </span>
                    <ExternalLink size={16} className="shrink-0 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </section>

            <section
              className="rounded-2xl border px-4 py-4"
              style={{
                borderColor: 'var(--accent-border)',
                backgroundColor: 'var(--accent-soft-muted)',
                boxShadow: 'var(--accent-outline-soft)',
              }}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-lg">{translate('contactSupport.decimatrixTitle')}</h2>
                <ExternalLink size={18} className="text-muted-foreground" />
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {translate('contactSupport.decimatrixDescription')}
              </p>
              <a
                href="https://decimatrix.site"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                }}
              >
                {translate('contactSupport.decimatrixButton')}
                <ExternalLink size={16} />
              </a>
            </section>

            <section
              className="rounded-2xl border px-4 py-4"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--card)',
              }}
            >
              <div className="mb-3 flex items-center gap-2">
                <Heart size={18} style={{ color: 'var(--accent)' }} />
                <h2 className="text-lg">{translate('contactSupport.supportTitle')}</h2>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {translate('contactSupport.supportDescription')}
              </p>

              <a
                href="https://paypal.me/DmitriiGrebeniuc"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all hover:border-accent/50"
                style={{
                  borderColor: 'var(--accent-border)',
                  color: 'var(--accent)',
                }}
              >
                {translate('contactSupport.paypalButton')}
                <ExternalLink size={16} />
              </a>

              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-2">
                  <QrCode size={18} className="text-muted-foreground" />
                  <p className="text-sm font-semibold">{translate('contactSupport.miaTitle')}</p>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {translate('contactSupport.miaDescription')}
                </p>
                <div className="mx-auto w-full max-w-[280px] rounded-2xl bg-white p-3">
                  <img
                    src="/mia-qr.jpg"
                    alt="MIA QR"
                    className="h-auto w-full rounded-xl object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-6 py-4 border-b border-border">
        <h1>{translate('profile.title')}</h1>
      </div>

      <div
        className="flex-1 overflow-y-auto px-6 py-8"
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="max-w-sm mx-auto space-y-6">
          <div className="flex flex-col items-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <span className="text-3xl">{loading ? '••' : getInitials()}</span>
            </div>

            {loading ? (
              <div className="w-full flex flex-col items-center gap-2">
                <LoadingLine width="8rem" height="1.5rem" rounded="9999px" />
                <LoadingLine width="11rem" height="1rem" rounded="9999px" />
              </div>
            ) : (
              <>
                <h2 className="mb-1">{getDisplayName()}</h2>

                <p className="text-muted-foreground">
                  {user?.email || translate('profile.noEmail')}
                </p>
              </>
            )}
          </div>

          {missingEmail && (
            <div
              className="rounded-2xl border px-4 py-4"
              style={{
                borderColor: 'var(--accent-border)',
                backgroundColor: 'var(--accent-soft-muted)',
                boxShadow: 'var(--accent-outline-soft)',
              }}
            >
              <p className="text-sm">{translate('profile.addEmailTitle')}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {translate('profile.addEmailDescription')}
              </p>

              <button
                onClick={() => onNavigate('edit-profile')}
                className="mt-4 rounded-xl border px-4 py-2 text-sm transition-all hover:opacity-90"
                style={{
                  borderColor: 'var(--accent-border)',
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                }}
              >
                {translate('profile.addEmailButton')}
              </button>
            </div>
          )}

          <div className="space-y-3 pt-4">
            <div
              className="w-full rounded-2xl border px-4 py-4"
              style={{
                borderColor: hasProPlan ? 'var(--accent-border)' : 'var(--border)',
                backgroundColor: hasProPlan ? 'var(--accent-soft-muted)' : 'var(--card)',
                boxShadow: hasProPlan ? 'var(--accent-outline-soft)' : 'none',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {translate('profile.currentPlan')}
                  </p>
                  {loading ? (
                    <div className="mt-2 space-y-2">
                      <LoadingLine width="7rem" height="1.25rem" rounded="9999px" />
                      <LoadingLine width="13rem" height="0.95rem" rounded="9999px" />
                    </div>
                  ) : (
                    <>
                      <p className="mt-2 text-lg">{currentPlanLabel}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {hasProPlan
                          ? translate('profile.planDescriptionPro')
                          : translate('profile.planDescriptionFree')}
                      </p>
                    </>
                  )}
                </div>

                {!loading && hasProPlan && (
                  <span
                    className="shrink-0 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
                    style={{
                      background:
                        'linear-gradient(135deg, color-mix(in srgb, var(--accent) 92%, white 8%), color-mix(in srgb, var(--accent) 72%, black 28%))',
                      borderColor: 'color-mix(in srgb, var(--accent) 72%, white 28%)',
                      color: 'var(--accent-foreground)',
                    }}
                  >
                    {translate('home.proBadge')}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => onNavigate('edit-profile')}
              className="w-full py-4 rounded-xl border transition-all text-left px-4 hover:border-accent/50"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--card)',
              }}
            >
              <div className="flex justify-between items-center">
                <span>{translate('profile.editProfile')}</span>
                <ChevronRight size={18} className="text-muted-foreground shrink-0" />
              </div>
            </button>

            <button
              onClick={() => onNavigate('notification-settings')}
              className="w-full py-4 rounded-xl border transition-all text-left px-4 hover:border-accent/50"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--card)',
              }}
            >
              <div className="flex justify-between items-center">
                <span>{translate('profile.notificationSettings')}</span>
                <ChevronRight size={18} className="text-muted-foreground shrink-0" />
              </div>
            </button>

            <button
              onClick={() => onNavigate('language')}
              className="w-full py-4 rounded-xl border transition-all text-left px-4 hover:border-accent/50"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--card)',
              }}
            >
              <div className="flex justify-between items-center">
                <span>{translate('profile.language')}</span>
                <ChevronRight size={18} className="text-muted-foreground shrink-0" />
              </div>
            </button>

            <button
              onClick={() => onNavigate('appearance')}
              className="w-full py-4 rounded-xl border transition-all text-left px-4 hover:border-accent/50"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--card)',
              }}
            >
              <div className="flex justify-between items-center">
                <span>{translate('profile.appearance')}</span>
                <ChevronRight size={18} className="text-muted-foreground shrink-0" />
              </div>
            </button>

            <button
              onClick={() => onNavigate('security')}
              className="w-full py-4 rounded-xl border transition-all text-left px-4 hover:border-accent/50"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--card)',
              }}
            >
              <div className="flex justify-between items-center">
                <span>{translate('profile.privacySecurity')}</span>
                <ChevronRight size={18} className="text-muted-foreground shrink-0" />
              </div>
            </button>

            <button
              onClick={() => onNavigate('support')}
              className="w-full py-4 rounded-xl border transition-all text-left px-4 hover:border-accent/50"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--card)',
              }}
            >
              <div className="flex justify-between items-center">
                <span>{translate('profile.helpSupport')}</span>
                <ChevronRight size={18} className="text-muted-foreground shrink-0" />
              </div>
            </button>

            <button
              onClick={() => setShowContactsSupport(true)}
              className="w-full py-4 rounded-xl border transition-all text-left px-4 hover:border-accent/50"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--card)',
              }}
            >
              <div className="flex justify-between items-center">
                <span>{translate('profile.contactsSupport')}</span>
                <ChevronRight size={18} className="text-muted-foreground shrink-0" />
              </div>
            </button>

            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className="w-full py-4 rounded-xl border transition-all text-left px-4 hover:border-accent/50"
                style={{
                  borderColor: 'var(--accent-border)',
                  backgroundColor: 'var(--card)',
                }}
              >
                <div className="flex justify-between items-center">
                  <span>{translate('profile.adminMode')}</span>
                  <ChevronRight size={18} className="text-muted-foreground shrink-0" />
                </div>
              </button>
            )}
          </div>

          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className="w-full py-4 rounded-xl border transition-all mt-8"
            style={{
              borderColor: 'var(--destructive-border-strong)',
              color: 'var(--destructive)',
            }}
          >
            {logoutLoading ? translate('profile.loggingOut') : translate('profile.logout')}
          </button>
        </div>
      </div>
    </div>
  );
}
