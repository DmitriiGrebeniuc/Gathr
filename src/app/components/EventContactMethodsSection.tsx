import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Instagram, Phone, Send, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  type EventContactDraft,
  type EventContactMethods,
  getInstagramHandleLabel,
  getPhoneLabel,
  getTelegramHandleLabel,
  hasAnyEventContactMethods,
} from '../lib/eventContacts';
import { TouchButton } from './TouchButton';

type ContactKind = 'instagram' | 'telegram' | 'phone';

const CONTACT_KIND_ORDER: ContactKind[] = ['instagram', 'telegram', 'phone'];

function getContactMeta(
  kind: ContactKind,
  translate: (key: any) => string
): {
  label: string;
  title: string;
  description: string;
  placeholder: string;
  icon: typeof Instagram;
} {
  if (kind === 'instagram') {
    return {
      label: translate('eventContacts.instagram'),
      title: translate('eventContacts.modalTitleInstagram'),
      description: translate('eventContacts.modalDescriptionInstagram'),
      placeholder: translate('eventContacts.instagramPlaceholder'),
      icon: Instagram,
    };
  }

  if (kind === 'telegram') {
    return {
      label: translate('eventContacts.telegram'),
      title: translate('eventContacts.modalTitleTelegram'),
      description: translate('eventContacts.modalDescriptionTelegram'),
      placeholder: translate('eventContacts.telegramPlaceholder'),
      icon: Send,
    };
  }

  return {
    label: translate('eventContacts.phone'),
    title: translate('eventContacts.modalTitlePhone'),
    description: translate('eventContacts.modalDescriptionPhone'),
    placeholder: translate('eventContacts.phonePlaceholder'),
    icon: Phone,
  };
}

export function EventContactMethodsEditor({
  draft,
  onDraftChange,
  disabled = false,
}: {
  draft: EventContactDraft;
  onDraftChange: (nextDraft: EventContactDraft) => void;
  disabled?: boolean;
}) {
  const { translate } = useLanguage();
  const [activeKind, setActiveKind] = useState<ContactKind | null>(null);
  const [editorValue, setEditorValue] = useState('');

  const activeMeta = activeKind ? getContactMeta(activeKind, translate) : null;

  const openEditor = (kind: ContactKind) => {
    if (disabled) {
      return;
    }

    setActiveKind(kind);
    setEditorValue(draft[kind] || '');
  };

  const closeEditor = () => {
    setActiveKind(null);
    setEditorValue('');
  };

  const commitEditor = () => {
    if (!activeKind) {
      return;
    }

    onDraftChange({
      ...draft,
      [activeKind]: editorValue.trim(),
    });
    closeEditor();
  };

  const clearEditor = () => {
    if (!activeKind) {
      return;
    }

    onDraftChange({
      ...draft,
      [activeKind]: '',
    });
    closeEditor();
  };

  return (
    <>
      <div
        className="rounded-2xl border px-4 py-4"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="mb-4">
          <p>{translate('eventContacts.sectionTitle')}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {translate('eventContacts.sectionDescription')}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {CONTACT_KIND_ORDER.map((kind) => {
            const meta = getContactMeta(kind, translate);
            const Icon = meta.icon;
            const isFilled = !!draft[kind]?.trim();

            return (
              <button
                key={kind}
                type="button"
                onClick={() => openEditor(kind)}
                disabled={disabled}
                className="rounded-2xl border px-3 py-3 text-left transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isFilled ? 'var(--accent-soft)' : 'var(--surface-strong)',
                  borderColor: isFilled ? 'var(--accent-border-strong)' : 'var(--border)',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: isFilled ? 'var(--accent-soft-muted)' : 'var(--card)',
                      color: isFilled ? 'var(--accent)' : 'var(--foreground-strong)',
                    }}
                  >
                    <Icon size={16} />
                  </span>

                  {isFilled && (
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full border"
                      style={{
                        borderColor: 'var(--accent-border-strong)',
                        color: 'var(--accent)',
                        backgroundColor: 'var(--card)',
                      }}
                    >
                      <Check size={12} />
                    </span>
                  )}
                </div>

                <p className="mt-3 text-sm">{meta.label}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {isFilled ? translate('eventContacts.added') : translate('eventContacts.add')}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {activeKind && activeMeta && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-40 flex items-end bg-black/55 px-4 pb-4"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
          onClick={closeEditor}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="mx-auto w-full max-w-sm rounded-[28px] border px-5 py-5 shadow-2xl"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--accent-border-muted)',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4">
              <p style={{ color: 'var(--accent)' }}>{activeMeta.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{activeMeta.description}</p>
            </div>

            <input
              type={activeKind === 'phone' ? 'tel' : 'text'}
              value={editorValue}
              onChange={(event) => setEditorValue(event.target.value)}
              placeholder={activeMeta.placeholder}
              className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors"
              style={{
                backgroundColor: 'var(--surface-strong)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--foreground-strong)',
              }}
              autoFocus
            />

            <div className="mt-4 flex items-center justify-between gap-3">
              {draft[activeKind]?.trim() ? (
                <button
                  type="button"
                  onClick={clearEditor}
                  className="text-sm transition-opacity hover:opacity-80"
                  style={{ color: 'var(--destructive)' }}
                >
                  {translate('eventContacts.remove')}
                </button>
              ) : (
                <div />
              )}

              <div className="flex gap-3">
                <TouchButton
                  variant="ghost"
                  onClick={closeEditor}
                  style={{
                    borderColor: 'var(--accent-border-muted)',
                    color: 'var(--accent)',
                  }}
                >
                  {translate('common.cancel')}
                </TouchButton>

                <TouchButton variant="primary" onClick={commitEditor}>
                  {translate('eventContacts.save')}
                </TouchButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

export function EventContactMethodsDisplay({
  contacts,
}: {
  contacts: EventContactMethods | null;
}) {
  const { translate } = useLanguage();

  const items = useMemo(() => {
    if (!contacts) {
      return [];
    }

    return [
      contacts.instagram_url
        ? {
            kind: 'instagram' as const,
            href: contacts.instagram_url,
            label: getInstagramHandleLabel(contacts.instagram_url),
            title: translate('eventContacts.openInstagram'),
            icon: Instagram,
          }
        : null,
      contacts.telegram_url
        ? {
            kind: 'telegram' as const,
            href: contacts.telegram_url,
            label: getTelegramHandleLabel(contacts.telegram_url),
            title: translate('eventContacts.openTelegram'),
            icon: Send,
          }
        : null,
      contacts.phone_number
        ? {
            kind: 'phone' as const,
            href: `tel:${contacts.phone_number}`,
            label: getPhoneLabel(contacts.phone_number),
            title: translate('eventContacts.callPhone'),
            icon: Phone,
          }
        : null,
    ].filter(Boolean);
  }, [contacts, translate]);

  if (!contacts || !hasAnyEventContactMethods(contacts) || items.length === 0) {
    return null;
  }

  return (
    <div
      className="rounded-2xl border px-4 py-4"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="mb-4">
        <p>{translate('eventContacts.detailsTitle')}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {translate('eventContacts.detailsDescription')}
        </p>
      </div>

      <div className="grid gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          const isPhone = item.kind === 'phone';

          return (
            <a
              key={item.kind}
              href={item.href}
              target={isPhone ? undefined : '_blank'}
              rel={isPhone ? undefined : 'noopener noreferrer'}
              className="flex items-center gap-3 rounded-2xl border px-4 py-3 transition-opacity hover:opacity-90 active:opacity-70"
              style={{
                backgroundColor: 'var(--surface-strong)',
                borderColor: 'var(--accent-border-muted)',
              }}
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{
                  backgroundColor: 'var(--accent-soft-muted)',
                  color: 'var(--accent)',
                }}
              >
                <Icon size={18} />
              </span>

              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{item.title}</p>
                <p className="truncate">{item.label}</p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
