import { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Ошибка загрузки профиля:', profileError);
          setName('');
          return;
        }

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
      alert('Пользователь не найден');
      return;
    }

    if (!trimmedName) {
      alert('Введите имя');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: trimmedName,
        })
        .eq('id', userId);

      if (error) {
        console.error('Ошибка обновления профиля:', error);
        alert('Не удалось сохранить профиль');
        setSaving(false);
        return;
      }

      onNavigate('profile');
    } catch (error) {
      console.error('Unexpected save profile error:', error);
      alert('Произошла ошибка при сохранении профиля');
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
        <h1>Edit Profile</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-sm mx-auto space-y-6">
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-3"
              style={{ backgroundColor: '#3A3A3A' }}
            >
              <span className="text-3xl">
                {loading ? '...' : getInitials()}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading || saving}
                className="w-full px-4 py-3 rounded-xl border transition-all outline-none focus:border-accent"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  backgroundColor: '#1A1A1A',
                  color: '#FFFFFF',
                }}
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 rounded-xl border transition-all outline-none"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  backgroundColor: '#1A1A1A',
                  color: '#777777',
                }}
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading || saving}
            className="w-full py-4 rounded-xl transition-all mt-8"
            style={{ backgroundColor: '#D4AF37', color: '#0F0F0F' }}
          >
            {loading ? 'Loading...' : saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}