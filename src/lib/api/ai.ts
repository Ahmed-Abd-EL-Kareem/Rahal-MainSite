import { client } from './client';
import { SuccessResponse } from '@/types/api';

const serializeParams = (params?: Record<string, any>) => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      searchParams.set(key, String(val));
    }
  });
  const str = searchParams.toString();
  return str ? `?${str}` : '';
};

export const aiApi = {
  chat: (messages: Array<{ role: 'user' | 'assistant'; content: string }>) =>
    client.post<SuccessResponse<{ reply: string; tokensUsed: number }>>('/ai/chat', { messages }),

  hotelSearch: (
    query: string,
    context?: {
      tripId?: string;
      checkIn?: string;
      checkOut?: string;
      guests?: number;
      rooms?: number;
      limit?: number;
    }
  ) =>
    client.post<SuccessResponse<{ reply: string; tokensUsed: number }>>('/ai/hotels/search', {
      query,
      context,
    }),

  bookingConversation: (
    message: string,
    sessionId: string | null,
    context?: { tripId?: string }
  ) =>
    client.post<SuccessResponse<{
      sessionId: string;
      step: string;
      aiResponse: string;
      isComplete: boolean;
      bookingId: string | null;
      tokensUsed: number;
    }>>('/ai/bookings/conversation', {
      message,
      sessionId,
      context,
    }),

  hotelRecommendations: (params?: { tripId?: string; limit?: number; context?: string }) =>
    client.get<SuccessResponse<{ reply: string; tokensUsed: number }>>(
      `/ai/hotels/recommendations${serializeParams(params)}`
    ),
};
