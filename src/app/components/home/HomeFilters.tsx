import { AnimatePresence, motion } from 'motion/react';
import {
  BookOpen,
  Coffee,
  Dumbbell,
  Gamepad2,
  Laptop,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trees,
  UsersRound,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import {
  ACTIVITY_TYPES,
  type ActivityType,
  getActivityTypeMeta,
} from '../../constants/activityTypes';
import type { LanguageCode } from '../../constants/languages';
import { INPUT_LIMITS, limitText } from '../../constants/inputLimits';
import type { HomeTab } from './types';

type HomeFiltersProps = {
  homeTabs: Array<{ key: HomeTab; label: string }>;
  activeTab: HomeTab;
  setActiveTab: Dispatch<SetStateAction<HomeTab>>;
  tabTransition: {
    duration: number;
    ease: readonly [number, number, number, number];
  };
  selectedActivityType: ActivityType | 'all';
  setSelectedActivityType: Dispatch<SetStateAction<ActivityType | 'all'>>;
  language: LanguageCode;
  isEventSearchOpen: boolean;
  toggleEventSearch: () => void;
  eventSearchQuery: string;
  setEventSearchQuery: Dispatch<SetStateAction<string>>;
  translate: (key: any) => string;
};

const activityIconMap: Record<ActivityType, LucideIcon> = {
  sports: Dumbbell,
  networking: UsersRound,
  study: BookOpen,
  entertainment: Gamepad2,
  food_drinks: Coffee,
  outdoors: Trees,
  tech: Laptop,
  other: Sparkles,
};

export function HomeFilters({
  homeTabs,
  activeTab,
  setActiveTab,
  tabTransition,
  selectedActivityType,
  setSelectedActivityType,
  language,
  isEventSearchOpen,
  toggleEventSearch,
  eventSearchQuery,
  setEventSearchQuery,
  translate,
}: HomeFiltersProps) {
  return (
    <>
      <div className="border-b border-border px-4 py-2">
        <div
          className="flex gap-2 overflow-x-auto no-scrollbar"
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorX: 'contain',
            scrollPaddingLeft: '1rem',
            scrollPaddingRight: '1rem',
          }}
        >
          {homeTabs.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <motion.button
                key={tab.key}
                type="button"
                whileTap={{ scale: 0.96 }}
                transition={tabTransition}
                onClick={() => setActiveTab(tab.key)}
                className="relative shrink-0 rounded-full border px-4 py-2 text-sm transition-all"
                style={{
                  backgroundColor: isActive ? 'var(--accent-soft)' : 'rgba(255, 255, 255, 0.03)',
                  borderColor: isActive ? 'var(--accent-border-strong)' : 'var(--border-subtle)',
                  color: isActive ? 'var(--accent)' : 'var(--muted-foreground)',
                  boxShadow: isActive ? 'var(--accent-outline-soft)' : 'none',
                  transform: isActive ? 'translateY(0)' : 'translateY(1px) scale(0.96)',
                }}
              >
                {tab.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <div
            className="flex min-w-0 flex-1 gap-2 overflow-x-auto no-scrollbar"
            style={{
              scrollPaddingLeft: '0.25rem',
              scrollPaddingRight: '0.25rem',
              WebkitOverflowScrolling: 'touch',
              overscrollBehaviorX: 'contain',
              paddingLeft: '0.125rem',
              paddingRight: '0.125rem',
            }}
          >
            <motion.button
              type="button"
              onClick={() => setSelectedActivityType('all')}
              whileTap={{ scale: 0.96 }}
              className="flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all"
              style={{
                backgroundColor:
                  selectedActivityType === 'all' ? 'var(--accent-soft)' : 'var(--card)',
                borderColor:
                  selectedActivityType === 'all' ? 'var(--accent-border-strong)' : 'var(--border)',
                color: selectedActivityType === 'all' ? 'var(--accent)' : 'var(--foreground-strong)',
                boxShadow: selectedActivityType === 'all' ? 'var(--accent-outline-soft)' : 'none',
              }}
            >
              <SlidersHorizontal size={14} strokeWidth={2.1} />
              <span>{translate('home.all')}</span>
            </motion.button>

            {ACTIVITY_TYPES.map((type) => {
              const isActive = selectedActivityType === type.value;
              const activityMeta = getActivityTypeMeta(type.value, language);
              const ActivityIcon = activityIconMap[type.value];

              return (
                <motion.button
                  key={type.value}
                  type="button"
                  onClick={() => setSelectedActivityType(type.value)}
                  whileTap={{ scale: 0.96 }}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all"
                  style={{
                    backgroundColor: isActive ? 'var(--accent-soft)' : 'var(--card)',
                    borderColor: isActive ? 'var(--accent-border-strong)' : 'var(--border)',
                    color: isActive ? 'var(--accent)' : 'var(--foreground-strong)',
                    boxShadow: isActive ? 'var(--accent-outline-soft)' : 'none',
                  }}
                >
                  <ActivityIcon size={14} strokeWidth={2.05} />
                  <span>{activityMeta.label}</span>
                </motion.button>
              );
            })}
          </div>

          <motion.button
            type="button"
            onClick={toggleEventSearch}
            whileTap={{ scale: 0.96 }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all"
            style={{
              backgroundColor: isEventSearchOpen
                ? 'var(--accent-soft-muted)'
                : 'rgba(255, 255, 255, 0.03)',
              borderColor: isEventSearchOpen ? 'var(--accent-border)' : 'var(--border-subtle)',
              color: isEventSearchOpen ? 'var(--accent)' : 'var(--foreground-strong)',
            }}
            aria-label={translate('home.searchButton')}
            title={translate('home.searchButton')}
          >
            <Search size={17} strokeWidth={2.1} />
          </motion.button>
        </div>

        <AnimatePresence initial={false}>
          {isEventSearchOpen && (
            <motion.div
              key="home-event-search"
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div
                className="mt-2 flex items-center gap-2 rounded-xl border px-3 py-2"
                style={{
                  backgroundColor: 'var(--surface-overlay)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <Search size={16} className="shrink-0 text-muted-foreground" strokeWidth={2} />
                <input
                  type="text"
                  value={eventSearchQuery}
                  onChange={(event) =>
                    setEventSearchQuery(limitText(event.target.value, INPUT_LIMITS.search))
                  }
                  maxLength={INPUT_LIMITS.search}
                  placeholder={translate('home.searchPlaceholder')}
                  autoComplete="off"
                  className="w-full bg-transparent text-sm outline-none"
                  style={{ color: 'var(--foreground-strong)' }}
                />
                {eventSearchQuery.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setEventSearchQuery('')}
                    className="shrink-0 text-muted-foreground transition-opacity hover:opacity-70"
                    aria-label={translate('home.clearFilters')}
                    title={translate('home.clearFilters')}
                  >
                    <X size={16} strokeWidth={2} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
