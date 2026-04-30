type TelegramOpenLinkBrowser =
  | 'chrome'
  | 'google-chrome'
  | 'firefox'
  | 'mozilla-firefox'
  | 'edge'
  | 'microsoft-edge'
  | 'brave'
  | 'brave-browser';

type TelegramWebApp = {
  initData?: string;
  initDataUnsafe?: {
    user?: {
      language_code?: string;
    };
  };
  openLink?: (
    url: string,
    options?: {
      try_instant_view?: boolean;
      try_browser?: TelegramOpenLinkBrowser;
    }
  ) => void;
  ready?: () => void;
  expand?: () => void;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

type BrowserFallbackLocale = 'en' | 'ru' | 'ro' | 'uk' | 'de';

const TELEGRAM_BROWSER_FALLBACK_COPY: Record<
  BrowserFallbackLocale,
  {
    button: string;
    title: string;
    description: string;
  }
> = {
  en: {
    button: 'Open in browser',
    title: 'Open Gathr in your browser',
    description:
      'Telegram login and some map features may work incorrectly inside the Telegram mini app. Open Gathr in your browser for the smoothest experience.',
  },
  ru: {
    button: 'Открыть в браузере',
    title: 'Лучше открыть Gathr в браузере',
    description:
      'Внутри Telegram Mini App вход через Telegram и некоторые карты могут работать нестабильно. Для лучшего опыта открой Gathr в обычном браузере.',
  },
  ro: {
    button: 'Deschide în browser',
    title: 'Mai bine deschizi Gathr în browser',
    description:
      'În Telegram Mini App, autentificarea prin Telegram și unele funcții de hartă pot merge instabil. Pentru o experiență mai bună, deschide Gathr în browser.',
  },
  uk: {
    button: 'Відкрити в браузері',
    title: 'Краще відкрий Gathr у браузері',
    description:
      'Усередині Telegram Mini App вхід через Telegram і деякі функції карт можуть працювати нестабільно. Для кращого досвіду відкрий Gathr у звичайному браузері.',
  },
  de: {
    button: 'Im Browser öffnen',
    title: 'Öffne Gathr lieber im Browser',
    description:
      'Innerhalb der Telegram Mini App können der Telegram-Login und einige Kartenfunktionen unzuverlässig sein. Für die beste Erfahrung öffne Gathr im Browser.',
  },
};

export function isTelegramMiniApp() {
  if (typeof window === 'undefined') {
    return false;
  }

  const webApp = window.Telegram?.WebApp;
  return Boolean(webApp?.initData || webApp?.initDataUnsafe?.user);
}

export function getTelegramMiniAppInitData() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.Telegram?.WebApp?.initData?.trim() ?? '';
}

export function initTelegramMiniApp() {
  if (typeof window === 'undefined') {
    return;
  }

  const webApp = window.Telegram?.WebApp;

  if (!webApp) {
    return;
  }

  try {
    webApp.ready?.();
    webApp.expand?.();
  } catch (error) {
    console.error('Failed to initialize Telegram Mini App runtime:', error);
  }
}

export function isTelegramInAppBrowser() {
  if (typeof window === 'undefined') {
    return false;
  }

  const userAgent = window.navigator.userAgent || '';
  return /Telegram/i.test(userAgent);
}

export function isTelegramAppContext() {
  return isTelegramMiniApp() || isTelegramInAppBrowser();
}

export function shouldUseTelegramBrowserFallback() {
  return isTelegramInAppBrowser() && !isTelegramMiniApp();
}

export function openInExternalBrowser(url: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const webApp = window.Telegram?.WebApp;

  if (webApp?.openLink) {
    webApp.openLink(url, {
      try_browser: 'chrome',
      try_instant_view: false,
    });
    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}

export function getTelegramMiniAppBrowserFallbackCopy(language: string) {
  const normalized = language.toLowerCase().split('-')[0] as BrowserFallbackLocale;
  return TELEGRAM_BROWSER_FALLBACK_COPY[normalized] ?? TELEGRAM_BROWSER_FALLBACK_COPY.en;
}
