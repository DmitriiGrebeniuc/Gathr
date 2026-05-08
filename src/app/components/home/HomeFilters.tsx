import { AnimatePresence, motion } from 'motion/react';
import { Search, X } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import {
  ACTIVITY_TYPES,
  type ActivityType,
  getActivityTypeMeta,
} from '../../constants/activityTypes';
import type { LanguageCode } from '../../constants/languages';
import { INPUT_LIMITS, limitText } from '../../constants/inputLimits';
import type { CityFilterOption, HomeTab } from './types';

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
  selectedCity: string;
  selectedCityLabel: string;
  isCityPickerOpen: boolean;
  toggleCityPicker: () => void;
  citySearchQuery: string;
  setCitySearchQuery: Dispatch<SetStateAction<string>>;
  filteredCityOptions: CityFilterOption[];
  handleSelectCity: (nextCity: string) => void;
  isEventSearchOpen: boolean;
  toggleEventSearch: () => void;
  eventSearchQuery: string;
  setEventSearchQuery: Dispatch<SetStateAction<string>>;
  translate: (key: any) => string;
};

export function HomeFilters({
  homeTabs,
  activeTab,
  setActiveTab,
  tabTransition,
  selectedActivityType,
  setSelectedActivityType,
  language,
  selectedCity,
  selectedCityLabel,
  isCityPickerOpen,
  toggleCityPicker,
  citySearchQuery,
  setCitySearchQuery,
  filteredCityOptions,
  handleSelectCity,
  isEventSearchOpen,
  toggleEventSearch,
  eventSearchQuery,
  setEventSearchQuery,
  translate,
}: HomeFiltersProps) {
  return (
    <>
      <div className="flex border-b border-border">
        {homeTabs.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <motion.button
              key={tab.key}
              whileTap={{ scale: 0.985 }}
              transition={tabTransition}
              onClick={() => setActiveTab(tab.key)}
              className="relative flex-1 py-3 text-muted-foreground transition-colors"
              style={{
                color: isActive ? 'var(--accent)' : 'var(--muted-foreground)',
              }}
            >
              <span className="relative z-10">{tab.label}</span>
              {isActive && (
                <motion.span
                  layoutId="home-top-tab-indicator"
                  className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--accent)' }}
                  transition={tabTransition}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="border-b border-border px-4 py-2">
        <div
          className="flex gap-2 overflow-x-auto no-scrollbar"
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
            className="shrink-0 px-3 py-1.5 rounded-full text-xs border transition-all"
            style={{
              backgroundColor:
                selectedActivityType === 'all' ? 'var(--accent-soft)' : 'var(--card)',
              borderColor:
                selectedActivityType === 'all' ? 'var(--accent-border-strong)' : 'var(--border)',
              color: selectedActivityType === 'all' ? 'var(--accent)' : 'var(--foreground-strong)',
              boxShadow: selectedActivityType === 'all' ? 'var(--accent-outline-soft)' : 'none',
            }}
          >
            {translate('home.all')}
          </motion.button>

          {ACTIVITY_TYPES.map((type) => {
            const isActive = selectedActivityType === type.value;
            const activityMeta = getActivityTypeMeta(type.value, language);

            return (
              <motion.button
                key={type.value}
                type="button"
                onClick={() => setSelectedActivityType(type.value)}
                whileTap={{ scale: 0.96 }}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs border transition-all"
                style={{
                  backgroundColor: isActive ? 'var(--accent-soft)' : 'var(--card)',
                  borderColor: isActive ? 'var(--accent-border-strong)' : 'var(--border)',
                  color: isActive ? 'var(--accent)' : 'var(--foreground-strong)',
                  boxShadow: isActive ? 'var(--accent-outline-soft)' : 'none',
                }}
              >
                <span className="mr-1.5">{activityMeta.emoji}</span>
                <span>{activityMeta.label}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-2">
          <div className="flex items-stretch gap-2">
            <motion.button
              type="button"
              onClick={toggleCityPicker}
              whileTap={{ scale: 0.98 }}
              className="flex-1 rounded-xl border px-3 py-2 text-left transition-all"
              style={{
                backgroundColor: isCityPickerOpen
                  ? 'var(--accent-soft-muted)'
                  : 'rgba(255, 255, 255, 0.03)',
                borderColor: isCityPickerOpen ? 'var(--accent-border)' : 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {translate('home.cityFilterLabel')}
                  </p>
                  <p
                    className="truncate text-sm"
                    style={{
                      color: selectedCity === 'all' ? 'var(--foreground-strong)' : 'var(--accent)',
                    }}
                  >
                    {selectedCityLabel}
                  </p>
                </div>
                <span
                  className="shrink-0 text-xs text-muted-foreground transition-transform"
                  style={{
                    transform: isCityPickerOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  ▼
                </span>
              </div>
            </motion.button>

            <motion.button
              type="button"
              onClick={toggleEventSearch}
              whileTap={{ scale: 0.96 }}
              className="shrink-0 rounded-xl border px-3 flex items-center justify-center transition-all"
              style={{
                width: 48,
                backgroundColor: isEventSearchOpen
                  ? 'var(--accent-soft-muted)'
                  : 'rgba(255, 255, 255, 0.03)',
                borderColor: isEventSearchOpen ? 'var(--accent-border)' : 'var(--border-subtle)',
                color: isEventSearchOpen ? 'var(--accent)' : 'var(--foreground-strong)',
              }}
              aria-label={translate('home.searchButton')}
              title={translate('home.searchButton')}
            >
              <Search size={18} strokeWidth={2.1} />
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
                      aria-label="Clear search"
                      title="Clear search"
                    >
                      <X size={16} strokeWidth={2} />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isCityPickerOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16 }}
              className="mt-2 rounded-xl border overflow-hidden"
              style={{
                backgroundColor: 'var(--surface-overlay)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="border-b border-border px-3 py-2">
                <input
                  type="text"
                  value={citySearchQuery}
                  onChange={(event) =>
                    setCitySearchQuery(limitText(event.target.value, INPUT_LIMITS.search))
                  }
                  maxLength={INPUT_LIMITS.search}
                  placeholder={translate('home.citySearchPlaceholder')}
                  autoComplete="off"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--foreground-strong)',
                  }}
                />
              </div>

              <div className="max-h-48 overflow-y-auto no-scrollbar py-1">
                <button
                  type="button"
                  onClick={() => handleSelectCity('all')}
                  className="w-full px-3 py-2 text-left text-sm transition-colors"
                  style={{
                    color: selectedCity === 'all' ? 'var(--accent)' : 'var(--foreground-strong)',
                    backgroundColor:
                      selectedCity === 'all' ? 'var(--accent-soft-muted)' : 'transparent',
                  }}
                >
                  {translate('home.allCities')}
                </button>

                {filteredCityOptions.map((cityOption) => {
                  const isActive = selectedCity === cityOption.cityNormalized;

                  return (
                    <button
                      key={cityOption.cityNormalized}
                      type="button"
                      onClick={() => handleSelectCity(cityOption.cityNormalized)}
                      className="w-full px-3 py-2 text-left text-sm transition-colors"
                      style={{
                        color: isActive ? 'var(--accent)' : 'var(--foreground-strong)',
                        backgroundColor: isActive ? 'var(--accent-soft-muted)' : 'transparent',
                      }}
                    >
                      {cityOption.city}
                    </button>
                  );
                })}

                {filteredCityOptions.length === 0 && (
                  <div className="px-3 py-3 text-sm text-muted-foreground">
                    {translate('home.noCitiesFound')}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
