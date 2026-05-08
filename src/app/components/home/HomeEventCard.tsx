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
      whileTap={{ scale: 0.988 }}
      onClick={() => onOpen(event)}
      className="rounded-lg p-3.5 cursor-pointer transition-all active:opacity-90"
      style={{
        backgroundColor: variant === 'featured' ? 'rgba(212, 175, 55, 0.06)' : 'rgba(255, 255, 255, 0.025)',
        border: variant === 'featured' 
          ? '1px solid rgba(212, 175, 55, 0.18)' 
          : isRequestMode 
            ? '1px solid rgba(212, 175, 55, 0.15)'
            : '1px solid rgba(255, 255, 255, 0.06)',
        opacity: past || variant === 'muted' ? 0.65 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="text-sm font-medium" style={{ color: 'var(--foreground-strong)' }}>{event.title}</h3>

        <div className="flex items-center gap-1.5 shrink-0">
          {isRequestMode && (
            <span
              className="text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap"
              style={{
                color: 'var(--accent)',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
              }}
            >
              {translate('home.closedBadge')}
            </span>
          )}

          {past && (
            <span
              className="text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap"
              style={{
                color: 'var(--muted-foreground)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              }}
            >
              {badgeLabel || translate('home.past')}
            </span>
          )}

          {!past && badgeLabel && variant === 'featured' && (
            <span
              className="text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap"
              style={{
                color: 'var(--accent)',
                backgroundColor: 'rgba(212, 175, 55, 0.12)',
              }}
            >
              {badgeLabel}
            </span>
          )}
        </div>
      </div>

      <div className="mb-2">
        <span
          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded"
          style={{
            color: 'var(--accent)',
            backgroundColor: 'rgba(212, 175, 55, 0.08)',
          }}
        >
          <span>{activityMeta.emoji}</span>
          <span>{activityMeta.label}</span>
        </span>
      </div>

      <p className="text-xs text-muted-foreground mb-1">{dateLabel}</p>

      <p className="text-xs text-muted-foreground mb-2.5">{locationLabel}</p>

      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground">
          {translate('home.createdBy')}{' '}
          <span style={{ color: event.creator_id === currentUserId ? 'var(--accent)' : 'var(--foreground-strong)' }}>
            {event.creator_id === currentUserId
              ? translate('home.you')
              : event.creatorName || translate('common.unknown')}
          </span>
        </span>

        <span className="text-[11px] text-muted-foreground">
          {event.participantCount}{' '}
          {event.participantCount === 1
            ? translate('home.participant')
            : translate('home.participants')}
        </span>
      </div>
    </motion.div>
  );
}
