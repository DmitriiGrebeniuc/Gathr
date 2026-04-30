import type { VercelRequestLike, VercelResponseLike } from './_lib/vercel.js';
import {
  answerCallbackQuery,
  createBotCopy,
  editBotMessage,
  getBotConfig,
  resolveTelegramLocale,
  sendBotMessage,
} from '../src/telegramBot.js';

type TelegramUser = {
  language_code?: string;
};

type TelegramMessage = {
  chat?: {
    id: number;
  };
  from?: TelegramUser;
  text?: string;
  message_id?: number;
};

type TelegramCallbackQuery = {
  id: string;
  data?: string;
  from?: TelegramUser;
  message?: TelegramMessage;
};

type TelegramUpdate = {
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
};

function matchesCommand(text: string | undefined, command: string) {
  if (!text) {
    return false;
  }

  return text === command || text.startsWith(`${command} `) || text.startsWith(`${command}@`);
}

export default async function handler(req: VercelRequestLike, res: VercelResponseLike) {
  if (req.method === 'GET') {
    res.status(200).json({
      ok: true,
      service: 'telegram-bot-backend',
      webhook: '/api/webhook',
      locales: ['en', 'ru', 'ro', 'de'],
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' });
    return;
  }

  try {
    const config = getBotConfig();
    const secretHeader = req.headers?.['x-telegram-bot-api-secret-token'];
    const secretToken = Array.isArray(secretHeader) ? secretHeader[0] : secretHeader;

    if (
      config.webhookSecret &&
      secretToken !== config.webhookSecret
    ) {
      res.status(401).json({ ok: false, error: 'invalid_webhook_secret' });
      return;
    }

    const update = (req.body || {}) as TelegramUpdate;
    const locale = resolveTelegramLocale(
      update.callback_query?.from?.language_code ?? update.message?.from?.language_code
    );
    const copy = createBotCopy(config.appUrl, config.supportUrl, locale);

    if (update.message?.chat?.id && typeof update.message.text === 'string') {
      const chatId = update.message.chat.id;

      if (matchesCommand(update.message.text, '/start')) {
        await sendBotMessage(config.token, chatId, copy.start);
      } else if (matchesCommand(update.message.text, '/help')) {
        await sendBotMessage(config.token, chatId, copy.about);
      } else if (matchesCommand(update.message.text, '/support')) {
        await sendBotMessage(config.token, chatId, copy.support);
      }
    }

    if (
      update.callback_query?.id &&
      update.callback_query.message?.chat?.id &&
      typeof update.callback_query.message.message_id === 'number'
    ) {
      const callback = update.callback_query;
      const chatId = callback.message!.chat!.id;
      const messageId = callback.message!.message_id!;

      if (callback.data === 'home') {
        await editBotMessage(config.token, chatId, messageId, copy.start);
      } else if (callback.data === 'about') {
        await editBotMessage(config.token, chatId, messageId, copy.about);
      } else if (callback.data === 'support') {
        await editBotMessage(config.token, chatId, messageId, copy.support);
      }

      await answerCallbackQuery(config.token, callback.id);
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    res.status(200).json({ ok: true });
  }
}
