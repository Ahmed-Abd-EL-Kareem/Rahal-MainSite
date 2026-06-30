import type { ChatMessage } from './types';

const STORAGE_KEY = 'rahal_chat_messages';

function migrateMessage(raw: unknown): ChatMessage | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  if (record.role !== 'user' && record.role !== 'assistant') return null;

  if (typeof record.content === 'string') {
    return { role: record.role, content: { en: record.content } };
  }

  if (record.content && typeof record.content === 'object') {
    const c = record.content as Record<string, string>;
    return {
      role: record.role,
      content: { en: c.en, ar: c.ar },
    };
  }

  return null;
}

export function loadChatMessages(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(migrateMessage).filter((m): m is ChatMessage => m !== null);
  } catch {
    return [];
  }
}

export function saveChatMessages(messages: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  try {
    if (messages.length === 0) {
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  } catch {
    // sessionStorage may be unavailable
  }
}

export function clearChatMessages(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
