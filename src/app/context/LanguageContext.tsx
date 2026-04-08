import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getStoredLanguage, setStoredLanguage } from '../../lib/language';
import { type LanguageCode } from '../constants/languages';
import { t } from '../constants/translations';

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  translate: (key: Parameters<typeof t>[1]) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(getStoredLanguage());

  useEffect(() => {
    setStoredLanguage(language);
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => {
    return {
      language,
      setLanguage: setLanguageState,
      translate: (key) => t(language, key),
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }

  return context;
}