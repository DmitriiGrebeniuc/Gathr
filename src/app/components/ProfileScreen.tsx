import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
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

        setUser({
          id: authUser.id,
          email: authUser.email ?? null,
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
  const currentPlanLabel = hasProPlan
    ? translate('profile.planProStatus')
    : translate('profile.planFreeStatus');

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
