import type { Locale } from '@/i18n/config';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: Partial<Record<Locale, string>>;
}

export function getMessageContent(msg: ChatMessage, locale: Locale): string {
  return msg.content[locale] ?? msg.content.en ?? msg.content.ar ?? '';
}

export function toApiMessages(messages: ChatMessage[], locale: Locale) {
  return messages.map((m) => ({
    role: m.role,
    content: getMessageContent(m, locale),
  }));
}
