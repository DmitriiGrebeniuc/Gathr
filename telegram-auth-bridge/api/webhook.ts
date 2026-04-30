import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  answerCallbackQuery,
  createBotCopy,
  editBotMessage,
  getBotConfig,
  sendBotMessage,
} from '../src/telegramBot.js';

type TelegramMessage = {
  chat?: {
    id: number;
  };
  text?: string;
  message_id?: number;
};

type TelegramCallbackQuery = {
  id: string;
  data?: string;
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    res.status(200).json({
      ok: true,
      service: 'telegram-bot-backend',
      webhook: '/api/webhook',
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' });
    return;
  }

  try {
    const config = getBotConfig();

    if (
      config.webhookSecret &&
      req.headers['x-telegram-bot-api-secret-token'] !== config.webhookSecret
    ) {
      res.status(401).json({ ok: false, error: 'invalid_webhook_secret' });
      return;
    }

    const update = (req.body || {}) as TelegramUpdate;
    const copy = createBotCopy(config.appUrl, config.supportUrl);

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
