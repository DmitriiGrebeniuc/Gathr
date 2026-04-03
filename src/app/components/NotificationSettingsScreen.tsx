import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

export function NotificationSettingsScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [eventReminders, setEventReminders] = useState(true);
  const [newParticipants, setNewParticipants] = useState(true);
  const [eventUpdates, setEventUpdates] = useState(true);
  const [messages, setMessages] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className="relative w-12 h-6 rounded-full transition-all"
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
            <h3 className="mb-4 text-sm text-muted-foreground">NOTIFICATION TYPES</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="mb-1">Event Reminders</p>
                  <p className="text-sm text-muted-foreground">Get notified before events start</p>
                </div>
                <ToggleSwitch checked={eventReminders} onChange={setEventReminders} />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="mb-1">New Participants</p>
                  <p className="text-sm text-muted-foreground">When someone joins your event</p>
                </div>
                <ToggleSwitch checked={newParticipants} onChange={setNewParticipants} />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="mb-1">Event Updates</p>
                  <p className="text-sm text-muted-foreground">Changes to event details</p>
                </div>
                <ToggleSwitch checked={eventUpdates} onChange={setEventUpdates} />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="mb-1">Messages</p>
                  <p className="text-sm text-muted-foreground">Direct messages from participants</p>
                </div>
                <ToggleSwitch checked={messages} onChange={setMessages} />
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="mb-4 text-sm text-muted-foreground">DELIVERY METHOD</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="mb-1">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive push notifications</p>
                </div>
                <ToggleSwitch checked={pushNotifications} onChange={setPushNotifications} />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="mb-1">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <ToggleSwitch checked={emailNotifications} onChange={setEmailNotifications} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
