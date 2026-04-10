import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { feedback } from '../lib/feedback';

type CurrentUser = {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
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
          console.error('Ошибка получения пользователя:', authError);
          setUser(null);
          setLoading(false);
          return;
        }

        const { data: rawProfile, error: profileError } = await supabase
          .rpc('get_my_profile_access')
          .maybeSingle();

        const profile = rawProfile as MyProfileAccess | null;


        if (profileError) {
          console.error('Ошибка получения профиля:', profileError);
        }

        setUser({
          id: authUser.id,
          email: authUser.email ?? null,
          name: profile?.name ?? null,
          role: profile?.role ?? null,
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
        console.error('Ошибка выхода:', error);
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

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-6 py-4 border-b border-border">
        <h1>{translate('profile.title')}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-sm mx-auto space-y-6">
          <div className="flex flex-col items-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: '#3A3A3A' }}
            >
              <span className="text-3xl">{loading ? '...' : getInitials()}</span>
            </div>

            <h2 className="mb-1">
              {loading ? translate('profile.loading') : getDisplayName()}
            </h2>

            <p className="text-muted-foreground">
              {loading ? translate('profile.loadingEmail') : user?.email || translate('profile.noEmail')}
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <button
              onClick={() => onNavigate('edit-profile')}
              className="w-full py-4 rounded-xl border transition-all text-left px-4 hover:border-accent/50"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.1)',
                backgroundColor: '#1A1A1A',
              }}
            >
              <div className="flex justify-between items-center">
                <span>{translate('profile.editProfile')}</span>
                <span className="text-muted-foreground">→</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('notification-settings')}
              className="w-full py-4 rounded-xl border transition-all text-left px-4 hover:border-accent/50"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.1)',
                backgroundColor: '#1A1A1A',
              }}
            >
              <div className="flex justify-between items-center">
                <span>{translate('profile.notificationSettings')}</span>
                <span className="text-muted-foreground">→</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('language')}
              className="w-full py-4 rounded-xl border transition-all text-left px-4 hover:border-accent/50"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.1)',
                backgroundColor: '#1A1A1A',
              }}
            >
              <div className="flex justify-between items-center">
                <span>{translate('profile.language')}</span>
                <span className="text-muted-foreground">→</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('security')}
              className="w-full py-4 rounded-xl border transition-all text-left px-4 hover:border-accent/50"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.1)',
                backgroundColor: '#1A1A1A',
              }}
            >
              <div className="flex justify-between items-center">
                <span>{translate('profile.privacySecurity')}</span>
                <span className="text-muted-foreground">→</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('support')}
              className="w-full py-4 rounded-xl border transition-all text-left px-4 hover:border-accent/50"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.1)',
                backgroundColor: '#1A1A1A',
              }}
            >
              <div className="flex justify-between items-center">
                <span>{translate('profile.helpSupport')}</span>
                <span className="text-muted-foreground">→</span>
              </div>
            </button>

            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className="w-full py-4 rounded-xl border transition-all text-left px-4 hover:border-accent/50"
                style={{
                  borderColor: 'rgba(212, 175, 55, 0.35)',
                  backgroundColor: '#1A1A1A',
                }}
              >
                <div className="flex justify-between items-center">
                  <span>{translate('profile.adminMode')}</span>
                  <span className="text-muted-foreground">→</span>
                </div>
              </button>
            )}
          </div>

          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className="w-full py-4 rounded-xl border transition-all mt-8"
            style={{
              borderColor: 'rgba(212, 47, 61, 0.5)',
              color: '#d4183d',
            }}
          >
            {logoutLoading ? translate('profile.loggingOut') : translate('profile.logout')}
          </button>
        </div>
      </div>
    </div>
  );
}
