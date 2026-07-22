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

export interface HotelOption {
  id: string;
  name: string;
  pricePerNight: number;
  location: string;
  image: string;
  badge: 'top-pick' | 'selected' | 'best-value' | null;
  insight: string;
  city: string;
}

export interface ApiHotel {
  _id: string;
  name: { en: string; ar: string };
  city: string;
  averagePricePerNight: number;
  currency: string;
  stars: number;
  coverImage?: string;
  images?: string[];
  amenities?: string[];
}

export interface BookingChatMessage {
  role: 'user' | 'assistant';
  content: string;
  step?: string;
  createdAt?: string;
  hotels?: HotelOption[];
}

export interface BookingConversationSlots {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  rooms?: number;
  budgetPerNight?: number;
  paymentMethod?: string;
  hotelId?: string;
}

export interface BookingConversationState {
  sessionId: string;
  step: string;
  isComplete: boolean;
  bookingId: string | null;
  slots?: BookingConversationSlots;
  messages: BookingChatMessage[];
  aiResponse?: string;
  tokensUsed?: number;
}

export interface SendBookingMessageInput {
  message: string;
  sessionId?: string;
  context?: Record<string, unknown>;
}

// Chat conversation types (general assistant chat)
export interface ChatConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

export interface ChatConversation {
  sessionId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatConversationMessage[];
}

export interface SendChatMessageInput {
  message: string;
  sessionId?: string;
}
