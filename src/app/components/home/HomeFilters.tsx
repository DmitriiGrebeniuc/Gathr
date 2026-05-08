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
      {/* Compact tabs */}
      <div className="flex" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
        {homeTabs.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <motion.button
              key={tab.key}
              whileTap={{ scale: 0.985 }}
              transition={tabTransition}
              onClick={() => setActiveTab(tab.key)}
              className="relative flex-1 py-2.5 text-xs font-medium transition-colors"
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

      {/* Compact filter bar */}
      <div className="px-4 py-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
        {/* Activity chips - more compact */}
        <div
          className="flex gap-1.5 overflow-x-auto no-scrollbar"
          style={{
            scrollPaddingLeft: '0.125rem',
            scrollPaddingRight: '0.125rem',
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorX: 'contain',
          }}
        >
          <motion.button
            type="button"
            onClick={() => setSelectedActivityType('all')}
            whileTap={{ scale: 0.96 }}
            className="shrink-0 px-2.5 py-1 rounded-full text-[11px] transition-all"
            style={{
              backgroundColor:
                selectedActivityType === 'all' ? 'rgba(212, 175, 55, 0.12)' : 'rgba(255, 255, 255, 0.04)',
              color: selectedActivityType === 'all' ? 'var(--accent)' : 'var(--muted-foreground)',
              border: selectedActivityType === 'all' ? '1px solid rgba(212, 175, 55, 0.25)' : '1px solid transparent',
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
                className="shrink-0 px-2.5 py-1 rounded-full text-[11px] transition-all"
                style={{
                  backgroundColor: isActive ? 'rgba(212, 175, 55, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                  color: isActive ? 'var(--accent)' : 'var(--muted-foreground)',
                  border: isActive ? '1px solid rgba(212, 175, 55, 0.25)' : '1px solid transparent',
                }}
              >
                <span className="mr-1">{activityMeta.emoji}</span>
                <span>{activityMeta.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* City and Search row - more compact */}
        <div className="mt-2 flex items-center gap-2">
          <motion.button
            type="button"
            onClick={toggleCityPicker}
            whileTap={{ scale: 0.98 }}
            className="flex-1 rounded-lg px-3 py-1.5 text-left transition-all"
            style={{
              backgroundColor: isCityPickerOpen
                ? 'rgba(212, 175, 55, 0.08)'
                : 'rgba(255, 255, 255, 0.03)',
              border: isCityPickerOpen ? '1px solid rgba(212, 175, 55, 0.2)' : '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {translate('home.cityFilterLabel')}
                </span>
                <span
                  className="truncate text-xs"
                  style={{
                    color: selectedCity === 'all' ? 'var(--foreground-strong)' : 'var(--accent)',
                  }}
                >
                  {selectedCityLabel}
                </span>
              </div>
              <span
                className="shrink-0 text-[10px] text-muted-foreground transition-transform"
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
            className="shrink-0 rounded-lg px-2.5 py-1.5 flex items-center justify-center transition-all"
            style={{
              backgroundColor: isEventSearchOpen
                ? 'rgba(212, 175, 55, 0.08)'
                : 'rgba(255, 255, 255, 0.03)',
              border: isEventSearchOpen ? '1px solid rgba(212, 175, 55, 0.2)' : '1px solid rgba(255, 255, 255, 0.06)',
              color: isEventSearchOpen ? 'var(--accent)' : 'var(--muted-foreground)',
            }}
            aria-label={translate('home.searchButton')}
            title={translate('home.searchButton')}
          >
            <Search size={16} strokeWidth={2} />
          </motion.button>
        </div>

        <AnimatePresence initial={false}>
            {isEventSearchOpen && (
              <motion.div
                key="home-event-search"
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div
                  className="mt-2 flex items-center gap-2 rounded-lg px-3 py-1.5"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <Search size={14} className="shrink-0 text-muted-foreground" strokeWidth={2} />
                  <input
                    type="text"
                    value={eventSearchQuery}
                    onChange={(event) =>
                      setEventSearchQuery(limitText(event.target.value, INPUT_LIMITS.search))
                    }
                    maxLength={INPUT_LIMITS.search}
                    placeholder={translate('home.searchPlaceholder')}
                    autoComplete="off"
                    className="w-full bg-transparent text-xs outline-none"
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
                      <X size={14} strokeWidth={2} />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isCityPickerOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.14 }}
              className="mt-2 rounded-lg overflow-hidden"
              style={{
                backgroundColor: 'rgba(18, 18, 18, 0.98)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <input
                  type="text"
                  value={citySearchQuery}
                  onChange={(event) =>
                    setCitySearchQuery(limitText(event.target.value, INPUT_LIMITS.search))
                  }
                  maxLength={INPUT_LIMITS.search}
                  placeholder={translate('home.citySearchPlaceholder')}
                  autoComplete="off"
                  className="w-full rounded-md px-2.5 py-1.5 text-xs outline-none transition-colors"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    color: 'var(--foreground-strong)',
                  }}
                />
              </div>

              <div className="max-h-40 overflow-y-auto no-scrollbar py-1">
                <button
                  type="button"
                  onClick={() => handleSelectCity('all')}
                  className="w-full px-3 py-1.5 text-left text-xs transition-colors"
                  style={{
                    color: selectedCity === 'all' ? 'var(--accent)' : 'var(--foreground-strong)',
                    backgroundColor:
                      selectedCity === 'all' ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
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
                      className="w-full px-3 py-1.5 text-left text-xs transition-colors"
                      style={{
                        color: isActive ? 'var(--accent)' : 'var(--foreground-strong)',
                        backgroundColor: isActive ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
                      }}
                    >
                      {cityOption.city}
                    </button>
                  );
                })}

                {filteredCityOptions.length === 0 && (
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    {translate('home.noCitiesFound')}
                  </div>
                )}
              </div>
            </motion.div>
          )}
      </div>
    </>
  );
}
