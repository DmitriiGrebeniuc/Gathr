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
  title: string;
  translate: (key: any) => string;
};

type HomeTrendingCreator = {
  id: string;
  name: string;
  initials: string;
  eventCount: number;
  totalParticipants: number;
};

type HomeActivityPulseItem = {
  id: string;
  text: string;
};

type HomeTemplateIdea = {
  id: string;
  label: string;
  activityType: ActivityType;
};

type HomeTrendingCreatorsProps = {
  creators: HomeTrendingCreator[];
  translate: (key: any) => string;
};

type HomeCityPulseProps = {
  items: HomeActivityPulseItem[];
  translate: (key: any) => string;
};

type HomeTemplateIdeasProps = {
  ideas: HomeTemplateIdea[];
  translate: (key: any) => string;
  onSelectTemplate: (idea: HomeTemplateIdea) => void;
};

type HomeDiscoverHistoryNudgeProps = {
  translate: (key: any) => string;
  onCreateEvent: () => void;
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

export function HomeTemplateIdeas({
  ideas,
  translate,
  onSelectTemplate,
}: HomeTemplateIdeasProps) {
  if (ideas.length === 0) {
    return null;
  }

  return (
    <HomeFeedSection
      title={translate('home.templateIdeasTitle')}
      subtitle={translate('home.templateIdeasSubtitle')}
    >
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {ideas.map((idea) => {
          const activityMeta = getActivityTypeMeta(idea.activityType);

          return (
            <motion.button
              key={idea.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectTemplate(idea)}
              className="shrink-0 rounded-full border px-3 py-2 text-left text-xs transition-all"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <span className="mr-1.5">{activityMeta.emoji}</span>
              <span style={{ color: 'var(--foreground-strong)' }}>
                {idea.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </HomeFeedSection>
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

export function HomeTrendingCreators({ creators, translate }: HomeTrendingCreatorsProps) {
  if (creators.length === 0) {
    return null;
  }

  return (
    <HomeFeedSection
      title={translate('home.trendingCreatorsTitle')}
      subtitle={translate('home.trendingCreatorsSubtitle')}
    >
      <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
        {creators.map((creator) => (
          <div
            key={creator.id}
            className="min-w-[7.5rem] rounded-xl border p-3 text-center"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div
              className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border text-sm"
              style={{
                backgroundColor: 'var(--accent-soft-muted)',
                borderColor: 'var(--accent-border-muted)',
                color: 'var(--accent)',
              }}
            >
              {creator.initials}
            </div>

            <p className="mt-2 truncate text-sm" style={{ color: 'var(--foreground-strong)' }}>
              {creator.name}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {creator.eventCount} {translate('home.hostedEventsLabel')}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {creator.totalParticipants} {translate('home.socialProofParticipants')}
            </p>
          </div>
        ))}
      </div>
    </HomeFeedSection>
  );
}

export function HomeCityPulse({ items, translate }: HomeCityPulseProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <HomeFeedSection
      title={translate('home.cityPulseTitle')}
      subtitle={translate('home.cityPulseSubtitle')}
    >
      <div
        className="rounded-xl border p-3"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="space-y-2">
          {items.map((item) => (
            <p key={item.id} className="text-sm text-muted-foreground">
              <span style={{ color: 'var(--accent)' }}>•</span> {item.text}
            </p>
          ))}
        </div>
      </div>
    </HomeFeedSection>
  );
}

export function HomeDiscoverHistoryNudge({
  translate,
  onCreateEvent,
}: HomeDiscoverHistoryNudgeProps) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
      }}
    >
      <h3 className="text-sm" style={{ color: 'var(--foreground-strong)' }}>
        {translate('home.noUpcomingButPastTitle')}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        {translate('home.noUpcomingButPastDescription')}
      </p>
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={onCreateEvent}
        className="mt-3 rounded-lg px-3 py-2 text-xs"
        style={{
          backgroundColor: 'var(--accent)',
          color: 'var(--accent-foreground)',
        }}
      >
        {translate('home.createEventCta')}
      </motion.button>
    </div>
  );
}

export function HomeSocialProofSummary({
  eventsCount,
  totalParticipants,
  citiesCount,
  title,
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
      className="rounded-xl border p-4"
      style={{
        background:
          'linear-gradient(135deg, var(--card), rgba(212, 175, 55, 0.08))',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <h2 className="text-base" style={{ color: 'var(--foreground-strong)' }}>
        {title}
      </h2>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {stats.map((stat) => (
          <div key={stat.label} className="min-w-0">
            <p className="text-base" style={{ color: 'var(--accent)' }}>
              {stat.value}
            </p>
            <p className="mt-1 truncate text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
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
