import { ai } from './client';
import { SuccessResponse } from '@/types/api';
import type {
  HotelSearchRequest,
  HotelRecommendationRequest,
  HotelSearchResponse,
  HotelRecommendationResponse,
} from '@/types/ai';
import type {
  BookingConversationState,
  SendBookingMessageInput,
  ChatConversation,
  SendChatMessageInput,
} from '@/lib/chat/types';

const serializeParams = (params?: Record<string, unknown> | HotelRecommendationRequest) => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params as Record<string, unknown>).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      searchParams.set(key, String(val));
    }
  });
  const str = searchParams.toString();
  return str ? `?${str}` : '';
};

interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}

interface ChatResponse {
  reply: string;
  tokensUsed: number;
}

interface BookingConversationResponse {
  sessionId: string;
  step: string;
  aiResponse: string;
  isComplete: boolean;
  bookingId: string | null;
  tokensUsed: number;
}

export const aiApi = {
  chat: (messages: ChatRequest['messages']) =>
    ai.post<SuccessResponse<ChatResponse>>('/ai/chat', { messages }),

  hotelSearch: (payload: HotelSearchRequest) =>
    ai.post<SuccessResponse<HotelSearchResponse>>('/ai/hotels/search', payload),

  bookingConversation: (
    message: string,
    sessionId: string | null,
    context?: { tripId?: string }
  ) =>
    ai.post<SuccessResponse<BookingConversationResponse>>('/ai/bookings/conversation', {
      message,
      sessionId,
      context,
    }),

  sendBookingMessage: (input: SendBookingMessageInput) =>
    ai.post<SuccessResponse<BookingConversationState>>('/ai/bookings/conversation', {
      message: input.message,
      sessionId: input.sessionId,
      context: input.context,
    }),

  getBookingConversation: (sessionId: string) =>
    ai.get<SuccessResponse<BookingConversationState>>(`/ai/bookings/conversation/${sessionId}`),

  deleteBookingConversation: (sessionId: string) =>
    ai.delete<SuccessResponse<null>>(`/ai/bookings/conversation/${sessionId}`),

  listBookingConversations: () =>
    ai.get<SuccessResponse<BookingConversationState[]>>('/ai/bookings/conversations'),

  // Chat conversation API (general assistant)
  sendChatMessage: (input: SendChatMessageInput) =>
    ai.post<SuccessResponse<ChatConversation>>('/ai/chat/', {
      message: input.message,
      sessionId: input.sessionId,
    }),

  getChatConversation: (sessionId: string) =>
    ai.get<SuccessResponse<ChatConversation>>(`/ai/chat/${sessionId}`),

  listChatConversations: () =>
    ai.get<SuccessResponse<ChatConversation[]>>('/ai/chat'),

  deleteChatConversation: (sessionId: string) =>
    ai.delete<SuccessResponse<null>>(`/ai/chat/${sessionId}`),

  renameChatConversation: (sessionId: string, title: string) =>
    ai.patch<SuccessResponse<ChatConversation>>(`/ai/chat/${sessionId}`, { title }),

  hotelRecommendations: (params?: HotelRecommendationRequest) =>
    ai.get<SuccessResponse<HotelRecommendationResponse>>(
      `/ai/hotels/recommendations${serializeParams(params)}`
    ),

  getGoogleAuthUrl: () => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
    return `${apiBase}/auth/google`;
  },
};