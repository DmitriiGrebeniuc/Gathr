import { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { feedback } from '../lib/feedback';
import { fetchMyProfileAccessSummary, updateMyProfileName } from '../lib/publicData';

export function EditProfileScreen({
  onNavigate,
}: {
  onNavigate: (screen: string) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const { translate } = useLanguage();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.error('Ошибка получения пользователя:', authError);
          setUserId(null);
          setEmail('');
          setName('');
          return;
        }

        setUserId(user.id);
        setEmail(user.email ?? '');

        const profile = await fetchMyProfileAccessSummary();
        setName(profile?.name ?? '');
      } catch (error) {
        console.error('Unexpected edit profile load error:', error);
        setUserId(null);
        setEmail('');
        setName('');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const getInitials = () => {
    const trimmedName = name.trim();

    if (trimmedName) {
      const parts = trimmedName.split(' ').filter(Boolean).slice(0, 2);

      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }

      return trimmedName.slice(0, 2).toUpperCase();
    }

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      return '??';
    }

    const base = trimmedEmail.split('@')[0];

    if (!base) {
      return '??';
    }

    return base.slice(0, 2).toUpperCase();
  };

  const handleSave = async () => {
    const trimmedName = name.trim();

    if (!userId) {
      feedback.error(translate('editProfile.userNotFound'));
      return;
    }

    if (!trimmedName) {
      feedback.warning(translate('editProfile.enterName'));
      return;
    }

    setSaving(true);

    try {
      const { error } = await updateMyProfileName(trimmedName);

      if (error) {
        console.error('Ошибка обновления профиля:', error);
        feedback.error(translate('editProfile.saveFailed'));
        setSaving(false);
        return;
      }

      feedback.success(translate('common.save'));
      onNavigate('profile');
    } catch (error) {
      console.error('Unexpected save profile error:', error);
      feedback.error(translate('editProfile.unexpectedError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-6 py-4 border-b border-border flex items-center gap-3">
        <button
          onClick={() => onNavigate('profile')}
          className="p-2 -ml-2 hover:opacity-70 transition-opacity"
          disabled={saving}
        >
          <ChevronLeft size={24} />
        </button>
        <h1>{translate('editProfile.title')}</h1>
      </div>

      <div
        className="flex-1 overflow-y-auto px-6 py-8"
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="max-w-sm mx-auto space-y-6">
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-3"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <span className="text-3xl">
                {loading ? '...' : getInitials()}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                {translate('editProfile.name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading || saving}
                className="w-full px-4 py-3 rounded-xl border transition-all outline-none focus:border-accent"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--card)',
                  color: 'var(--foreground)',
                }}
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                {translate('editProfile.email')}
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 rounded-xl border transition-all outline-none"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--card)',
                  color: 'var(--muted-foreground)',
                }}
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading || saving}
            className="w-full py-4 rounded-xl transition-all mt-8 disabled:opacity-60"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
          >
            {loading
              ? translate('editProfile.loading')
              : saving
                ? translate('editProfile.saving')
                : translate('editProfile.saveButton')}
          </button>
        </div>
      </div>
    </div>
  );
}
