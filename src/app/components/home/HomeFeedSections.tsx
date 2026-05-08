import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import {
  ACTIVITY_TYPES,
  getActivityTypeMeta,
  type ActivityType,
} from '../../constants/activityTypes';
import type { LanguageCode } from '../../constants/languages';
import type { HomeEventItem } from './types';

type HomeFeedSectionProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

type HomeExploreByVibeProps = {
  selectedActivityType: ActivityType | 'all';
  language: LanguageCode;
  translate: (key: any) => string;
  onSelectActivityType: (type: ActivityType) => void;
};

type HomeSocialProofSummaryProps = {
  eventsCount: number;
  totalParticipants: number;
  citiesCount: number;
  translate: (key: any) => string;
};

export function HomeFeedSection({ title, subtitle, children }: HomeFeedSectionProps) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base" style={{ color: 'var(--foreground-strong)' }}>
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  );
}

export function HomeExploreByVibe({
  selectedActivityType,
  language,
  translate,
  onSelectActivityType,
}: HomeExploreByVibeProps) {
  return (
    <HomeFeedSection
      title={translate('home.exploreByVibeTitle')}
      subtitle={translate('home.exploreByVibeSubtitle')}
    >
      <div className="grid grid-cols-2 gap-2">
        {ACTIVITY_TYPES.map((type) => {
          const activityMeta = getActivityTypeMeta(type.value, language);
          const isActive = selectedActivityType === type.value;

          return (
            <motion.button
              key={type.value}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectActivityType(type.value)}
              className="rounded-xl border px-3 py-3 text-left transition-all"
              style={{
                backgroundColor: isActive ? 'var(--accent-soft-muted)' : 'var(--card)',
                borderColor: isActive ? 'var(--accent-border)' : 'var(--border)',
              }}
            >
              <span className="text-lg">{activityMeta.emoji}</span>
              <span
                className="ml-2 text-sm"
                style={{ color: isActive ? 'var(--accent)' : 'var(--foreground-strong)' }}
              >
                {activityMeta.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </HomeFeedSection>
  );
}

export function HomeSocialProofSummary({
  eventsCount,
  totalParticipants,
  citiesCount,
  translate,
}: HomeSocialProofSummaryProps) {
  if (eventsCount === 0) {
    return null;
  }

  const stats = [
    {
      value: eventsCount,
      label: translate('home.socialProofEvents'),
    },
    {
      value: totalParticipants,
      label: translate('home.socialProofParticipants'),
    },
    {
      value: citiesCount,
      label: translate('home.socialProofCities'),
    },
  ];

  return (
    <div
      className="grid grid-cols-3 gap-2 rounded-xl border p-3"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
      }}
    >
      {stats.map((stat) => (
        <div key={stat.label} className="min-w-0 text-center">
          <p className="text-base" style={{ color: 'var(--accent)' }}>
            {stat.value}
          </p>
          <p className="mt-1 truncate text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}

export function getEventTimestamp(event: HomeEventItem) {
  const primaryTime = event.date_time ? new Date(event.date_time).getTime() : Number.NaN;

  if (!Number.isNaN(primaryTime)) {
    return primaryTime;
  }

  const fallbackTime = event.created_at ? new Date(event.created_at).getTime() : Number.NaN;

  return Number.isNaN(fallbackTime) ? 0 : fallbackTime;
}
