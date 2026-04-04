import { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type NotificationSettings = {
  notify_upcoming_events: boolean;
  notify_new_participants: boolean;
};

export function NotificationSettingsScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [settings, setSettings] = useState<NotificationSettings>({
    notify_upcoming_events: true,
    notify_new_participants: true,
  });
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<'notify_upcoming_events' | 'notify_new_participants' | null>(null);

  const loadSettings = async () => {
    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Ошибка получения пользователя:', userError);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('notification_settings')
        .select('notify_upcoming_events, notify_new_participants')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Ошибка загрузки notification settings:', error);
        setLoading(false);
        return;
      }

      if (data) {
        setSettings({
          notify_upcoming_events: data.notify_upcoming_events,
          notify_new_participants: data.notify_new_participants,
        });
      }
    } catch (error) {
      console.error('Unexpected notification settings load error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateSetting = async (
    key: 'notify_upcoming_events' | 'notify_new_participants',
    value: boolean
  ) => {
    const previousSettings = settings;
    const nextSettings = {
      ...settings,
      [key]: value,
    };

    setSettings(nextSettings);
    setSavingKey(key);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Ошибка получения пользователя:', userError);
        setSettings(previousSettings);
        setSavingKey(null);
        return;
      }

      const { error } = await supabase
        .from('notification_settings')
        .upsert(
          {
            user_id: user.id,
            notify_upcoming_events: nextSettings.notify_upcoming_events,
            notify_new_participants: nextSettings.notify_new_participants,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          }
        );

      if (error) {
        console.error('Ошибка сохранения notification settings:', error);
        setSettings(previousSettings);
      }
    } catch (error) {
      console.error('Unexpected notification settings save error:', error);
      setSettings(previousSettings);
    } finally {
      setSavingKey(null);
    }
  };

  const ToggleSwitch = ({
    checked,
    onChange,
    disabled = false,
  }: {
    checked: boolean;
    onChange: (val: boolean) => void;
    disabled?: boolean;
  }) => (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className="relative w-12 h-6 rounded-full transition-all disabled:opacity-60"
      style={{ backgroundColor: checked ? '#D4AF37' : '#3A3A3A' }}
    >
      <div
        className="absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all"
        style={{ left: checked ? '26px' : '2px' }}
      />
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-6 py-4 border-b border-border flex items-center gap-3">
        <button
          onClick={() => onNavigate('profile')}
          className="p-2 -ml-2 hover:opacity-70 transition-opacity"
        >
          <ChevronLeft size={24} />
        </button>
        <h1>Notification Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-sm mx-auto space-y-6">
          <div>
            <h3 className="mb-4 text-sm text-muted-foreground">NOTIFICATIONS</h3>

            {loading && (
              <div className="text-sm text-muted-foreground">
                Loading settings...
              </div>
            )}

            {!loading && (
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="mb-1">Upcoming Events</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified before events start
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.notify_upcoming_events}
                    disabled={savingKey === 'notify_upcoming_events'}
                    onChange={(value) => updateSetting('notify_upcoming_events', value)}
                  />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="mb-1">New Participants</p>
                    <p className="text-sm text-muted-foreground">
                      When someone joins your event
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.notify_new_participants}
                    disabled={savingKey === 'notify_new_participants'}
                    onChange={(value) => updateSetting('notify_new_participants', value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}