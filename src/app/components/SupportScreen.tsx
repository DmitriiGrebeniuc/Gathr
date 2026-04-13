import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { TouchButton } from './TouchButton';
import { useLanguage } from '../context/LanguageContext';
import { feedback } from '../lib/feedback';

export function SupportScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { translate } = useLanguage();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim()) {
      feedback.warning(translate('support.enterSubject'));
      return;
    }

    if (!message.trim()) {
      feedback.warning(translate('support.enterMessage'));
      return;
    }

    setSending(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        feedback.error(translate('support.sendFailed'));
        setSending(false);
        return;
      }

      const { error } = await supabase.from('support_requests').insert([
        {
          user_id: user.id,
          subject: subject.trim(),
          message: message.trim(),
        },
      ]);

      if (error) {
        console.error('Failed to send support request:', error);
        feedback.error(translate('support.sendFailed'));
        setSending(false);
        return;
      }

      setSubject('');
      setMessage('');
      feedback.success(translate('support.sentSuccess'));
    } catch (error) {
      console.error('Unexpected support request error:', error);
      feedback.error(translate('support.sendUnexpectedError'));
    } finally {
      setSending(false);
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
        <h1>{translate('support.title')}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-sm mx-auto space-y-6">
          <div
            className="rounded-xl border p-5"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--card)',
            }}
          >
            <h3 className="mb-2">{translate('support.formTitle')}</h3>
            <p className="text-sm text-muted-foreground mb-5">
              {translate('support.formDescription')}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm text-muted-foreground">
                  {translate('support.subject')}
                </label>
                <input
                  type="text"
                  placeholder={translate('support.subjectPlaceholder')}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--surface-strong)',
                    borderColor: 'var(--border)',
                  }}
                  disabled={sending}
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-muted-foreground">
                  {translate('support.message')}
                </label>
                <textarea
                  rows={6}
                  placeholder={translate('support.messagePlaceholder')}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors resize-none"
                  style={{
                    backgroundColor: 'var(--surface-strong)',
                    borderColor: 'var(--border)',
                  }}
                  disabled={sending}
                />
              </div>

              <TouchButton onClick={handleSubmit} variant="primary" fullWidth>
                {sending ? translate('support.sending') : translate('support.sendButton')}
              </TouchButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
