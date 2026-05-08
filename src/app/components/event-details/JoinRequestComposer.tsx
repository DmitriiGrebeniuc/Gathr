import { motion } from 'motion/react';
import { TouchButton } from '../TouchButton';
import { INPUT_LIMITS, limitText } from '../../constants/inputLimits';

type JoinRequestComposerProps = {
  message: string;
  submitting: boolean;
  translate: (key: any) => string;
  onMessageChange: (message: string) => void;
  onSubmit: () => void;
  onClose: () => void;
};

export function JoinRequestComposer({
  message,
  submitting,
  translate,
  onMessageChange,
  onSubmit,
  onClose,
}: JoinRequestComposerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-40 flex items-end bg-black/55 px-4 pb-4"
      style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
      onClick={() => {
        if (!submitting) {
          onClose();
        }
      }}
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
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p style={{ color: 'var(--accent)' }}>{translate('details.joinRequestButton')}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {translate('details.joinRequestMessageLabel')}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-full px-2 py-1 text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {translate('common.cancel')}
          </button>
        </div>

        <textarea
          rows={4}
          value={message}
          onChange={(event) =>
            onMessageChange(limitText(event.target.value, INPUT_LIMITS.eventJoinRequestMessage))
          }
          maxLength={INPUT_LIMITS.eventJoinRequestMessage}
          placeholder={translate('details.joinRequestMessagePlaceholder')}
          className="w-full rounded-2xl border px-3 py-3 text-sm outline-none resize-none transition-colors"
          style={{
            backgroundColor: 'var(--surface-strong)',
            borderColor: 'var(--border-subtle)',
            color: 'var(--foreground-strong)',
          }}
        />

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {message.length}/{INPUT_LIMITS.eventJoinRequestMessage}
          </span>

          <div className="flex gap-3">
            <TouchButton
              variant="ghost"
              onClick={onClose}
              disabled={submitting}
              style={{
                borderColor: 'var(--accent-border-muted)',
                color: 'var(--accent)',
              }}
            >
              {translate('common.cancel')}
            </TouchButton>

            <TouchButton variant="primary" onClick={onSubmit} disabled={submitting}>
              {submitting
                ? translate('details.joinRequestSubmitting')
                : translate('details.joinRequestSubmit')}
            </TouchButton>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
