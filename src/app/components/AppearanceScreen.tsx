import { useMemo } from 'react';
import { motion } from 'motion/react';
import { SwipeableScreen } from './SwipeableScreen';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import type { ThemeMode } from '../../lib/theme';

export function AppearanceScreen({
  onNavigate,
}: {
  onNavigate: (screen: string, data?: any) => void;
}) {
  const { themeMode, systemTheme, setThemeMode } = useTheme();
  const { translate } = useLanguage();

  const options = useMemo(
    () =>
      [
        {
          value: 'system' as const,
          label: translate('appearance.system'),
          hint:
            systemTheme === 'dark'
              ? translate('appearance.currentSystemDark')
              : translate('appearance.currentSystemLight'),
        },
        {
          value: 'dark' as const,
          label: translate('appearance.dark'),
          hint: null,
        },
        {
          value: 'light' as const,
          label: translate('appearance.light'),
          hint: null,
        },
      ] satisfies Array<{ value: ThemeMode; label: string; hint: string | null }>,
    [systemTheme, translate]
  );

  return (
    <SwipeableScreen onSwipeBack={() => onNavigate('profile')}>
      <div className="h-full flex flex-col bg-background">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('profile')}
            className="text-muted-foreground"
          >
            {'< '} {translate('language.back')}
          </motion.button>

          <h2>{translate('appearance.title')}</h2>

          <div className="w-14" />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-sm mx-auto space-y-4">
            <div
              className="rounded-2xl p-4 border"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <p className="text-sm text-muted-foreground leading-6">
                {translate('appearance.description')}
              </p>
            </div>

            <div className="space-y-3">
              {options.map((option) => {
                const isActive = themeMode === option.value;

                return (
                  <motion.button
                    key={option.value}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setThemeMode(option.value)}
                    className="w-full p-4 rounded-xl border text-left transition-all"
                    style={{
                      backgroundColor: 'var(--card)',
                      borderColor: isActive
                        ? 'var(--accent-border-strong)'
                        : 'var(--border)',
                      boxShadow: isActive ? 'var(--accent-outline-soft)' : 'none',
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p
                          style={{
                            color: isActive ? 'var(--accent)' : 'var(--foreground)',
                          }}
                        >
                          {option.label}
                        </p>
                        {option.hint && (
                          <p className="mt-1 text-sm text-muted-foreground">{option.hint}</p>
                        )}
                      </div>

                      <span
                        className="text-sm"
                        style={{
                          color: isActive ? 'var(--accent)' : 'var(--muted-foreground)',
                        }}
                      >
                        {isActive ? '[x]' : ''}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </SwipeableScreen>
  );
}
