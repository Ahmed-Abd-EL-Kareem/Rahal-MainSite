import { client } from './client';
import { SuccessResponse } from '@/types/api';
import type { HotelSearchRequest, HotelRecommendationRequest, HotelSearchResponse, HotelRecommendationResponse } from '@/types/ai';

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

export const aiApi = {
  chat: (messages: Array<{ role: 'user' | 'assistant'; content: string }>) =>
    client.post<SuccessResponse<{ reply: string; tokensUsed: number }>>('/ai/chat', { messages }),

  hotelSearch: (payload: HotelSearchRequest) =>
    client.post<SuccessResponse<HotelSearchResponse>>('/ai/hotels/search', payload),

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

  hotelRecommendations: (params?: HotelRecommendationRequest) =>
    client.get<SuccessResponse<HotelRecommendationResponse>>(
      `/ai/hotels/recommendations${serializeParams(params)}`
    ),
};