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

export function createBotCopy(appUrl: string, supportUrl: string): BotCopy {
  const openAppButton = {
    text: 'Open Gathr',
    web_app: {
      url: appUrl,
    },
  } as const;

  const supportButton = {
    text: 'Open support',
    url: supportUrl,
  } as const;

  return {
    start: {
      text:
        'Gathr helps people quickly find and create real-life meetups nearby.\n\n' +
        'Use it for walks, coffee plans, sports, networking, open events and closed events by request.',
      reply_markup: {
        inline_keyboard: [
          [openAppButton],
          [
            { text: 'What it does', callback_data: 'about' },
            { text: 'Support', callback_data: 'support' },
          ],
        ],
      },
      disable_web_page_preview: true,
    },
    about: {
      text:
        'What you can do in Gathr:\n' +
        '- discover nearby meetups\n' +
        '- create your own events\n' +
        '- join closed events by request\n' +
        '- invite people and manage participation',
      reply_markup: {
        inline_keyboard: [
          [openAppButton],
          [{ text: 'Back', callback_data: 'home' }],
        ],
      },
      disable_web_page_preview: true,
    },
    support: {
      text:
        'Need help?\n\n' +
        'Open Gathr and go to Profile -> Help & Support so we can receive your request in the right place.',
      reply_markup: {
        inline_keyboard: [
          [supportButton],
          [{ text: 'Back', callback_data: 'home' }],
        ],
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
