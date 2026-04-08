import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { SwipeableScreen } from './SwipeableScreen';
import { LANGUAGES, getLanguageMeta, type LanguageCode } from '../constants/languages';
import { getStoredLanguage, setStoredLanguage } from '../../lib/language';

export function LanguageScreen({
  onNavigate,
}: {
  onNavigate: (screen: string, data?: any) => void;
}) {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(getStoredLanguage());

  const currentLanguage = useMemo(() => {
    return getLanguageMeta(selectedLanguage);
  }, [selectedLanguage]);

  const handleSelectLanguage = (language: LanguageCode) => {
    setSelectedLanguage(language);
    setStoredLanguage(language);
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
            ← Back
          </motion.button>

          <h2>Language</h2>

          <div className="w-14"></div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-sm mx-auto space-y-4">
            <div
              className="rounded-2xl p-4 border"
              style={{
                backgroundColor: '#1A1A1A',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <p className="text-sm text-muted-foreground mb-2">Selected language</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currentLanguage.emoji}</span>
                <span>{currentLanguage.label}</span>
              </div>
            </div>

            <div className="space-y-3">
              {LANGUAGES.map((language) => {
                const isActive = selectedLanguage === language.value;

                return (
                  <motion.button
                    key={language.value}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectLanguage(language.value)}
                    className="w-full p-4 rounded-xl border text-left transition-all"
                    style={{
                      backgroundColor: '#1A1A1A',
                      borderColor: isActive
                        ? 'rgba(212, 175, 55, 0.5)'
                        : 'rgba(255, 255, 255, 0.1)',
                      boxShadow: isActive
                        ? '0 0 0 1px rgba(212, 175, 55, 0.12)'
                        : 'none',
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{language.emoji}</span>
                        <span>{language.label}</span>
                      </div>

                      <span
                        className="text-sm"
                        style={{ color: isActive ? '#D4AF37' : 'rgba(255,255,255,0.35)' }}
                      >
                        {isActive ? '✓' : ''}
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