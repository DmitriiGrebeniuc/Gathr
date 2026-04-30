type InlineKeyboardMarkup = {
  inline_keyboard: Array<
    Array<
      | {
          text: string;
          callback_data: string;
        }
      | {
          text: string;
          url: string;
        }
      | {
          text: string;
          web_app: {
            url: string;
          };
        }
    >
  >;
};

type BotMessagePayload = {
  text: string;
  reply_markup?: InlineKeyboardMarkup;
  disable_web_page_preview?: boolean;
};

type BotCopy = {
  start: BotMessagePayload;
  about: BotMessagePayload;
  support: BotMessagePayload;
};

type SupportedLocale = 'en' | 'ru' | 'ro' | 'de';

type BotLocaleCopy = {
  openApp: string;
  openSupport: string;
  whatItDoes: string;
  support: string;
  back: string;
  startText: string;
  aboutText: string;
  supportText: string;
};

const BOT_COPY: Record<SupportedLocale, BotLocaleCopy> = {
  en: {
    openApp: 'Open Gathr',
    openSupport: 'Open support',
    whatItDoes: 'What it does',
    support: 'Support',
    back: 'Back',
    startText:
      'Gathr helps people quickly find and create real-life meetups nearby.\n\n' +
      'Use it for walks, coffee plans, sports, networking, open events and closed events by request.',
    aboutText:
      'What you can do in Gathr:\n' +
      '- discover nearby meetups\n' +
      '- create your own events\n' +
      '- join closed events by request\n' +
      '- invite people and manage participation',
    supportText:
      'Need help?\n\n' +
      'Open Gathr and go to Profile -> Help & Support so we can receive your request in the right place.',
  },
  ru: {
    openApp: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c Gathr',
    openSupport: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0443',
    whatItDoes: '\u0427\u0442\u043e \u0443\u043c\u0435\u0435\u0442 Gathr',
    support: '\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430',
    back: '\u041d\u0430\u0437\u0430\u0434',
    startText:
      'Gathr \u043f\u043e\u043c\u043e\u0433\u0430\u0435\u0442 \u0431\u044b\u0441\u0442\u0440\u043e \u043d\u0430\u0445\u043e\u0434\u0438\u0442\u044c \u0438 \u0441\u043e\u0437\u0434\u0430\u0432\u0430\u0442\u044c \u0436\u0438\u0432\u044b\u0435 \u0432\u0441\u0442\u0440\u0435\u0447\u0438 \u0440\u044f\u0434\u043e\u043c.\n\n' +
      '\u0418\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0439\u0442\u0435 \u0435\u0433\u043e \u0434\u043b\u044f \u043f\u0440\u043e\u0433\u0443\u043b\u043e\u043a, \u043a\u043e\u0444\u0435, \u0441\u043f\u043e\u0440\u0442\u0430, \u043d\u0435\u0442\u0432\u043e\u0440\u043a\u0438\u043d\u0433\u0430, \u043e\u0442\u043a\u0440\u044b\u0442\u044b\u0445 \u0441\u043e\u0431\u044b\u0442\u0438\u0439 \u0438 \u0437\u0430\u043a\u0440\u044b\u0442\u044b\u0445 \u0432\u0441\u0442\u0440\u0435\u0447 \u043f\u043e \u0437\u0430\u044f\u0432\u043a\u0435.',
    aboutText:
      '\u0427\u0442\u043e \u043c\u043e\u0436\u043d\u043e \u0434\u0435\u043b\u0430\u0442\u044c \u0432 Gathr:\n' +
      '- \u043d\u0430\u0445\u043e\u0434\u0438\u0442\u044c \u0432\u0441\u0442\u0440\u0435\u0447\u0438 \u0440\u044f\u0434\u043e\u043c\n' +
      '- \u0441\u043e\u0437\u0434\u0430\u0432\u0430\u0442\u044c \u0441\u0432\u043e\u0438 \u0441\u043e\u0431\u044b\u0442\u0438\u044f\n' +
      '- \u0432\u0441\u0442\u0443\u043f\u0430\u0442\u044c \u0432 \u0437\u0430\u043a\u0440\u044b\u0442\u044b\u0435 \u0441\u043e\u0431\u044b\u0442\u0438\u044f \u043f\u043e \u0437\u0430\u044f\u0432\u043a\u0435\n' +
      '- \u043f\u0440\u0438\u0433\u043b\u0430\u0448\u0430\u0442\u044c \u043b\u044e\u0434\u0435\u0439 \u0438 \u0443\u043f\u0440\u0430\u0432\u043b\u044f\u0442\u044c \u0443\u0447\u0430\u0441\u0442\u0438\u0435\u043c',
    supportText:
      '\u041d\u0443\u0436\u043d\u0430 \u043f\u043e\u043c\u043e\u0449\u044c?\n\n' +
      '\u041e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 Gathr \u0438 \u043f\u0435\u0440\u0435\u0439\u0434\u0438\u0442\u0435 \u0432 \u041f\u0440\u043e\u0444\u0438\u043b\u044c -> \u041f\u043e\u043c\u043e\u0449\u044c \u0438 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430, \u0447\u0442\u043e\u0431\u044b \u043c\u044b \u043f\u043e\u043b\u0443\u0447\u0438\u043b\u0438 \u0432\u0430\u0448 \u0437\u0430\u043f\u0440\u043e\u0441 \u0432 \u043d\u0443\u0436\u043d\u043e\u043c \u043c\u0435\u0441\u0442\u0435.',
  },
  ro: {
    openApp: 'Deschide Gathr',
    openSupport: 'Deschide suportul',
    whatItDoes: 'Ce face Gathr',
    support: 'Suport',
    back: '\u00cenapoi',
    startText:
      'Gathr te ajut\u0103 s\u0103 g\u0103se\u0219ti \u0219i s\u0103 creezi rapid \u00eent\u00e2lniri reale \u00een apropiere.\n\n' +
      'Folose\u0219te-l pentru plimb\u0103ri, cafea, sport, networking, evenimente deschise \u0219i \u00eent\u00e2lniri \u00eenchise pe baz\u0103 de cerere.',
    aboutText:
      'Ce po\u021bi face \u00een Gathr:\n' +
      '- descoperi \u00eent\u00e2lniri din apropiere\n' +
      '- creezi propriile evenimente\n' +
      '- intri \u00een evenimente \u00eenchise prin cerere\n' +
      '- invi\u021bi oameni \u0219i gestionezi participarea',
    supportText:
      'Ai nevoie de ajutor?\n\n' +
      'Deschide Gathr \u0219i mergi la Profil -> Ajutor \u0219i suport, ca s\u0103 primim cererea ta \u00een locul potrivit.',
  },
  de: {
    openApp: 'Gathr \u00f6ffnen',
    openSupport: 'Support \u00f6ffnen',
    whatItDoes: 'Was Gathr kann',
    support: 'Support',
    back: 'Zur\u00fcck',
    startText:
      'Gathr hilft dir dabei, schnell echte Treffen in deiner N\u00e4he zu finden und zu erstellen.\n\n' +
      'Nutze es f\u00fcr Spazierg\u00e4nge, Kaffee, Sport, Networking, offene Events und geschlossene Treffen auf Anfrage.',
    aboutText:
      'Was du in Gathr machen kannst:\n' +
      '- Treffen in deiner N\u00e4he entdecken\n' +
      '- eigene Events erstellen\n' +
      '- geschlossenen Events per Anfrage beitreten\n' +
      '- Leute einladen und Teilnahmen verwalten',
    supportText:
      'Brauchst du Hilfe?\n\n' +
      '\u00d6ffne Gathr und gehe zu Profil -> Hilfe & Support, damit wir deine Anfrage am richtigen Ort erhalten.',
  },
};

function normalizeBaseUrl(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return fallback;
  }

  return trimmed.replace(/\/+$/, '');
}

export function getBotConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();

  if (!token) {
    throw new Error('Missing TELEGRAM_BOT_TOKEN');
  }

  return {
    token,
    webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET?.trim() || null,
    appUrl: normalizeBaseUrl(process.env.GATHR_WEB_APP_URL, 'https://gathr-app.site'),
    supportUrl: normalizeBaseUrl(process.env.GATHR_SUPPORT_URL, 'https://gathr-app.site'),
  };
}

export function resolveTelegramLocale(languageCode?: string | null): SupportedLocale {
  const normalized = languageCode?.trim().toLowerCase().split('-')[0];

  if (normalized === 'ru' || normalized === 'ro' || normalized === 'de') {
    return normalized;
  }

  return 'en';
}

export function createBotCopy(appUrl: string, supportUrl: string, locale: SupportedLocale): BotCopy {
  const copy = BOT_COPY[locale];

  const openAppButton = {
    text: copy.openApp,
    web_app: {
      url: appUrl,
    },
  } as const;

  const supportButton = {
    text: copy.openSupport,
    url: supportUrl,
  } as const;

  return {
    start: {
      text: copy.startText,
      reply_markup: {
        inline_keyboard: [
          [openAppButton],
          [
            { text: copy.whatItDoes, callback_data: 'about' },
            { text: copy.support, callback_data: 'support' },
          ],
        ],
      },
      disable_web_page_preview: true,
    },
    about: {
      text: copy.aboutText,
      reply_markup: {
        inline_keyboard: [[openAppButton], [{ text: copy.back, callback_data: 'home' }]],
      },
      disable_web_page_preview: true,
    },
    support: {
      text: copy.supportText,
      reply_markup: {
        inline_keyboard: [[supportButton], [{ text: copy.back, callback_data: 'home' }]],
      },
      disable_web_page_preview: true,
    },
  };
}

async function telegramRequest<TResponse>(
  token: string,
  method: string,
  body: Record<string, unknown>
) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as TResponse & {
    ok?: boolean;
    description?: string;
  };

  if (!response.ok || (typeof data === 'object' && data && data.ok === false)) {
    throw new Error(
      `Telegram API ${method} failed: ${
        typeof data === 'object' && data && 'description' in data
          ? data.description
          : response.statusText
      }`
    );
  }

  return data;
}

export async function sendBotMessage(
  token: string,
  chatId: number,
  payload: BotMessagePayload
) {
  return telegramRequest(token, 'sendMessage', {
    chat_id: chatId,
    text: payload.text,
    disable_web_page_preview: payload.disable_web_page_preview ?? true,
    reply_markup: payload.reply_markup,
  });
}

export async function editBotMessage(
  token: string,
  chatId: number,
  messageId: number,
  payload: BotMessagePayload
) {
  return telegramRequest(token, 'editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text: payload.text,
    disable_web_page_preview: payload.disable_web_page_preview ?? true,
    reply_markup: payload.reply_markup,
  });
}

export async function answerCallbackQuery(
  token: string,
  callbackQueryId: string,
  text?: string
) {
  return telegramRequest(token, 'answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text,
  });
}
