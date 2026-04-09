import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { TouchButton } from './TouchButton';
import { useLanguage } from '../context/LanguageContext';

export function SecurityScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { translate } = useLanguage();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (!newPassword) {
      alert(translate('security.enterPassword'));
      return;
    }

    if (!confirmPassword) {
      alert(translate('security.enterConfirmPassword'));
      return;
    }

    if (newPassword.length < 6) {
      alert(translate('security.passwordTooShort'));
      return;
    }

    if (newPassword !== confirmPassword) {
      alert(translate('security.passwordsDoNotMatch'));
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Failed to change password:', error);
        alert(translate('security.passwordChangeFailed'));
        setSaving(false);
        return;
      }

      setNewPassword('');
      setConfirmPassword('');
      alert(translate('security.passwordChanged'));
    } catch (error) {
      console.error('Unexpected password change error:', error);
      alert(translate('security.passwordChangeUnexpectedError'));
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
        >
          <ChevronLeft size={24} />
        </button>
        <h1>{translate('security.title')}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-sm mx-auto space-y-6">
          <div
            className="rounded-xl border p-5"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.1)',
              backgroundColor: '#1A1A1A',
            }}
          >
            <h3 className="mb-2">{translate('security.changePasswordTitle')}</h3>
            <p className="text-sm text-muted-foreground mb-5">
              {translate('security.changePasswordDescription')}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm text-muted-foreground">
                  {translate('security.newPassword')}
                </label>
                <input
                  type="password"
                  placeholder={translate('security.newPasswordPlaceholder')}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors"
                  style={{
                    backgroundColor: '#111111',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-muted-foreground">
                  {translate('security.confirmPassword')}
                </label>
                <input
                  type="password"
                  placeholder={translate('security.confirmPasswordPlaceholder')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors"
                  style={{
                    backgroundColor: '#111111',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                  disabled={saving}
                />
              </div>

              <TouchButton onClick={handleChangePassword} variant="primary" fullWidth>
                {saving
                  ? translate('security.savingPassword')
                  : translate('security.savePassword')}
              </TouchButton>
            </div>
          </div>

          <div
            className="rounded-xl border p-5"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.1)',
              backgroundColor: '#1A1A1A',
            }}
          >
            <h3 className="mb-2">{translate('security.comingSoonTitle')}</h3>
            <p className="text-sm text-muted-foreground">
              {translate('security.comingSoonDescription')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}