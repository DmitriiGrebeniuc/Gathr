import { useMemo } from 'react';
import { motion } from 'motion/react';
import { SwipeableScreen } from './SwipeableScreen';
import { LANGUAGES, getLanguageMeta, type LanguageCode } from '../constants/languages';
import { useLanguage } from '../context/LanguageContext';

export function LanguageScreen({
  onNavigate,
}: {
  onNavigate: (screen: string, data?: any) => void;
}) {
  const { language, setLanguage, translate } = useLanguage();

  const currentLanguage = useMemo(() => {
    return getLanguageMeta(language);
  }, [language]);

  const handleSelectLanguage = (nextLanguage: LanguageCode) => {
    setLanguage(nextLanguage);
  };

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

          <h2>{translate('language.title')}</h2>

          <div className="w-14"></div>
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
              <p className="text-sm text-muted-foreground mb-2">
                {translate('language.selectedLanguage')}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currentLanguage.emoji}</span>
                <span>{currentLanguage.label}</span>
              </div>
            </div>

            <div className="space-y-3">
              {LANGUAGES.map((item) => {
                const isActive = language === item.value;

                return (
                  <motion.button
                    key={item.value}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectLanguage(item.value)}
                    className="w-full p-4 rounded-xl border text-left transition-all"
                    style={{
                      backgroundColor: 'var(--card)',
                      borderColor: isActive
                        ? 'var(--accent-border-strong)'
                        : 'var(--border)',
                      boxShadow: isActive ? 'var(--accent-outline-soft)' : 'none',
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.emoji}</span>
                        <span>{item.label}</span>
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
