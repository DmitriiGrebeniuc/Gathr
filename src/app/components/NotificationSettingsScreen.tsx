import { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../context/LanguageContext';

type NotificationSettings = {
  notify_upcoming_events: boolean;
  notify_new_participants: boolean;
  notify_event_invitations: boolean;
  notify_event_join_requests: boolean;
};

type NotificationSettingKey =
  | 'notify_upcoming_events'
  | 'notify_new_participants'
  | 'notify_event_invitations'
  | 'notify_event_join_requests';

export function NotificationSettingsScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [settings, setSettings] = useState<NotificationSettings>({
    notify_upcoming_events: true,
    notify_new_participants: true,
    notify_event_invitations: true,
    notify_event_join_requests: true,
  });
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<NotificationSettingKey | null>(null);

  const { translate } = useLanguage();

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
        .select(
          'notify_upcoming_events, notify_new_participants, notify_event_invitations, notify_event_join_requests'
        )
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Ошибка загрузки notification settings:', error);
        setLoading(false);
        return;
      }

      if (data) {
        setSettings({
          notify_upcoming_events: data.notify_upcoming_events ?? true,
          notify_new_participants: data.notify_new_participants ?? true,
          notify_event_invitations: data.notify_event_invitations ?? true,
          notify_event_join_requests: data.notify_event_join_requests ?? true,
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

  const updateSetting = async (key: NotificationSettingKey, value: boolean) => {
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
            notify_event_invitations: nextSettings.notify_event_invitations,
            notify_event_join_requests: nextSettings.notify_event_join_requests,
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
      className="relative w-14 h-8 rounded-full transition-all disabled:opacity-60"
      style={{ backgroundColor: checked ? 'var(--accent)' : 'var(--primary)' }}
    >
      <div
        className="absolute w-6 h-6 bg-white rounded-full top-1 transition-all"
        style={{ left: checked ? '30px' : '4px' }}
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
        <h1>{translate('notificationSettings.title')}</h1>
      </div>

      <div
        className="flex-1 overflow-y-auto px-6 py-6"
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="max-w-sm mx-auto space-y-6">
          <div>
            <h3 className="mb-4 text-sm text-muted-foreground">
              {translate('notificationSettings.sectionTitle')}
            </h3>

            {loading && (
              <div className="text-sm text-muted-foreground">
                {translate('common.loadingSettings')}
              </div>
            )}

            {!loading && (
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 gap-4">
                  <div>
                    <p className="mb-1">{translate('notificationSettings.upcomingEvents')}</p>
                    <p className="text-sm text-muted-foreground">
                      {translate('notificationSettings.upcomingEventsDescription')}
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.notify_upcoming_events}
                    disabled={savingKey === 'notify_upcoming_events'}
                    onChange={(value) => updateSetting('notify_upcoming_events', value)}
                  />
                </div>

                <div className="flex items-center justify-between py-3 gap-4">
                  <div>
                    <p className="mb-1">{translate('notificationSettings.newParticipants')}</p>
                    <p className="text-sm text-muted-foreground">
                      {translate('notificationSettings.newParticipantsDescription')}
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.notify_new_participants}
                    disabled={savingKey === 'notify_new_participants'}
                    onChange={(value) => updateSetting('notify_new_participants', value)}
                  />
                </div>

                <div className="flex items-center justify-between py-3 gap-4">
                  <div>
                    <p className="mb-1">{translate('notificationSettings.eventInvitations')}</p>
                    <p className="text-sm text-muted-foreground">
                      {translate('notificationSettings.eventInvitationsDescription')}
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.notify_event_invitations}
                    disabled={savingKey === 'notify_event_invitations'}
                    onChange={(value) => updateSetting('notify_event_invitations', value)}
                  />
                </div>

                <div className="flex items-center justify-between py-3 gap-4">
                  <div>
                    <p className="mb-1">{translate('notificationSettings.eventJoinRequests')}</p>
                    <p className="text-sm text-muted-foreground">
                      {translate('notificationSettings.eventJoinRequestsDescription')}
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.notify_event_join_requests}
                    disabled={savingKey === 'notify_event_join_requests'}
                    onChange={(value) => updateSetting('notify_event_join_requests', value)}
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
