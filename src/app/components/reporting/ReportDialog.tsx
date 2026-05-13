import { useMemo, useState } from 'react';
import { createReport, hasRecentReport, type ReportTargetType } from '../../lib/reporting';
import { feedback } from '../../lib/feedback';
import { useLanguage } from '../../context/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

const eventReasons = ['spam', 'unsafe', 'misleading', 'inappropriate', 'other'] as const;
const userReasons = ['spam', 'harassment', 'fake_profile', 'inappropriate', 'other'] as const;

const labels = {
  en: {
    report: 'Report',
    reason: 'Reason',
    describe: 'Describe the issue',
    submit: 'Submit report',
    cancel: 'Cancel',
    submitted: 'Report submitted',
    failed: 'Could not submit report',
    recent: 'You already submitted a report recently',
    selectReason: 'Select a reason',
    optionalDetails: 'Optional details',
    titleEvent: 'Report event',
    titleUser: 'Report user',
    description: 'Reports help moderators review unsafe or misleading activity.',
    reasons: {
      spam: 'Spam',
      unsafe: 'Unsafe',
      misleading: 'Misleading',
      inappropriate: 'Inappropriate',
      harassment: 'Harassment',
      fake_profile: 'Fake profile',
      other: 'Other',
    },
  },
  ru: {
    report: 'Пожаловаться',
    reason: 'Причина',
    describe: 'Опишите проблему',
    submit: 'Отправить жалобу',
    cancel: 'Отмена',
    submitted: 'Жалоба отправлена',
    failed: 'Не удалось отправить жалобу',
    recent: 'Вы уже отправляли жалобу недавно',
    selectReason: 'Выберите причину',
    optionalDetails: 'Дополнительные детали',
    titleEvent: 'Пожаловаться на событие',
    titleUser: 'Пожаловаться на пользователя',
    description: 'Жалобы помогают модераторам проверять небезопасную или вводящую в заблуждение активность.',
    reasons: {
      spam: 'Спам',
      unsafe: 'Небезопасно',
      misleading: 'Вводит в заблуждение',
      inappropriate: 'Неприемлемый контент',
      harassment: 'Оскорбления или травля',
      fake_profile: 'Фейковый профиль',
      other: 'Другое',
    },
  },
} as const;

export function ReportDialog({
  targetType,
  targetId,
  targetTitle,
  open,
  onOpenChange,
  onSubmitted,
}: {
  targetType: ReportTargetType;
  targetId: string;
  targetTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: () => void;
}) {
  const { language } = useLanguage();
  const text = language === 'ru' ? labels.ru : labels.en;
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reasons = useMemo(
    () => (targetType === 'event' ? eventReasons : userReasons),
    [targetType]
  );

  const handleSubmit = async () => {
    if (!reason || !targetId) {
      feedback.warning(text.selectReason);
      return;
    }

    setSubmitting(true);

    try {
      const alreadyReported = await hasRecentReport(targetType, targetId);

      if (alreadyReported) {
        feedback.info(text.recent);
        return;
      }

      await createReport({
        target_type: targetType,
        target_id: targetId,
        reason,
        details,
      });

      feedback.success(text.submitted);
      setReason('');
      setDetails('');
      onOpenChange(false);
      onSubmitted?.();
    } catch (error) {
      console.error('Failed to submit report:', error);
      feedback.error(text.failed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-border bg-card text-foreground">
        <DialogHeader>
          <DialogTitle>{targetType === 'event' ? text.titleEvent : text.titleUser}</DialogTitle>
          <DialogDescription>
            {targetTitle ? `${targetTitle}. ` : ''}
            {text.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <label className="block space-y-2 text-sm">
            <span className="text-muted-foreground">{text.reason}</span>
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-3 outline-none"
            >
              <option value="">{text.selectReason}</option>
              {reasons.map((item) => (
                <option key={item} value={item}>
                  {text.reasons[item]}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2 text-sm">
            <span className="text-muted-foreground">{text.describe}</span>
            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value.slice(0, 1000))}
              placeholder={text.optionalDetails}
              rows={5}
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-3 outline-none"
            />
            <span className="block text-right text-xs text-muted-foreground">
              {details.length}/1000
            </span>
          </label>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="rounded-xl border border-border px-4 py-2 text-sm disabled:opacity-60"
          >
            {text.cancel}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !reason}
            className="rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-60"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-foreground)',
            }}
          >
            {submitting ? '...' : text.submit}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
