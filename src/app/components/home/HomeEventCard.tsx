import { motion } from 'motion/react';
import { getActivityTypeMeta } from '../../constants/activityTypes';
import type { LanguageCode } from '../../constants/languages';
import type { HomeEventItem } from './types';

type HomeEventCardProps = {
  event: HomeEventItem;
  currentUserId: string | null;
  joinedEventIds: string[];
  isAdmin: boolean;
  variant?: 'default' | 'featured' | 'muted';
  badgeLabel?: string | null;
  language: LanguageCode;
  translate: (key: any) => string;
  isPastEvent: (eventOrDate?: HomeEventItem | string | null) => boolean;
  formatEventDate: (dateString?: string | null) => string;
  onOpen: (event: HomeEventItem) => void;
};

export function HomeEventCard({
  event,
  currentUserId,
  joinedEventIds,
  isAdmin,
  variant = 'default',
  badgeLabel,
  language,
  translate,
  isPastEvent,
  formatEventDate,
  onOpen,
}: HomeEventCardProps) {
  const past = isPastEvent(event);
  const activityMeta = getActivityTypeMeta(event.activity_type, language);
  const isRequestMode = event.join_mode === 'request';
  const canViewClosedPreview =
    !isRequestMode ||
    event.creator_id === currentUserId ||
    joinedEventIds.includes(event.id) ||
    isAdmin;
  const dateLabel =
    isRequestMode && !canViewClosedPreview
      ? translate('home.closedDateHidden')
      : formatEventDate(event.date_time);
  const locationLabel =
    isRequestMode && !canViewClosedPreview
      ? translate('home.closedLocationHidden')
      : event.location || translate('details.locationNotSpecified');

  return (
    <motion.div
      layout="position"
      transition={{
        layout: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
      }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onOpen(event)}
      className="rounded-xl p-4 border border-border cursor-pointer transition-all active:opacity-90"
      style={{
        backgroundColor: variant === 'featured' ? 'var(--accent-soft-muted)' : 'var(--card)',
        borderColor: isRequestMode ? 'var(--accent-border-strong)' : 'var(--border)',
        boxShadow:
          variant === 'featured'
            ? '0 8px 22px rgba(212, 175, 55, 0.16)'
            : '0 4px 12px rgba(0, 0, 0, 0.3)',
        opacity: past || variant === 'muted' ? 0.72 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3>{event.title}</h3>

        <div className="flex items-center gap-2">
          {isRequestMode && (
            <span
              className="text-[10px] px-2 py-1 rounded-full border whitespace-nowrap"
              style={{
                borderColor: 'var(--accent-border-strong)',
                color: 'var(--accent)',
                backgroundColor: 'var(--accent-soft-muted)',
              }}
            >
              {translate('home.closedBadge')}
            </span>
          )}

          {past && (
            <span
              className="text-[10px] px-2 py-1 rounded-full border whitespace-nowrap"
              style={{
                borderColor: 'var(--accent-border-muted)',
                color: 'var(--accent)',
                backgroundColor: 'var(--accent-soft-muted)',
              }}
            >
              {badgeLabel || translate('home.past')}
            </span>
          )}

          {!past && badgeLabel && (
            <span
              className="text-[10px] px-2 py-1 rounded-full border whitespace-nowrap"
              style={{
                borderColor: 'var(--accent-border-muted)',
                color: 'var(--accent)',
                backgroundColor: 'var(--accent-soft-muted)',
              }}
            >
              {badgeLabel}
            </span>
          )}
        </div>
      </div>

      <div className="mb-2">
        <span
          className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border"
          style={{
            borderColor: 'rgba(212, 175, 55, 0.22)',
            color: 'var(--accent)',
            backgroundColor: 'rgba(212, 175, 55, 0.06)',
          }}
        >
          <span>{activityMeta.emoji}</span>
          <span>{activityMeta.label}</span>
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-2">{dateLabel}</p>

      <p className="text-sm text-muted-foreground mb-3">{locationLabel}</p>

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          {translate('home.createdBy')}{' '}
          {event.creator_id === currentUserId
            ? translate('home.you')
            : event.creatorName || translate('common.unknown')}
        </span>

        <span className="text-xs text-muted-foreground">
          {event.participantCount}{' '}
          {event.participantCount === 1
            ? translate('home.participant')
            : translate('home.participants')}
        </span>
      </div>
    </motion.div>
  );
}
