import { Hotel } from './hotel';

export interface HotelSearchRequest {
  query: string;
  context?: {
    tripId?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    rooms?: number;
    limit?: number;
    maxPrice?: number;
    selectedStars?: number;
    selectedAmenities?: string[];
  };
}

export interface HotelSearchResponse {
  reply: string;
  hotels: Hotel[];
  tokensUsed: number;
}

export interface HotelRecommendationRequest {
  tripId?: string;
  limit?: number;
  context?: string;
}

export interface HotelRecommendationResponse {
  reply: string;
  hotels: Hotel[];
  tokensUsed: number;
}

export interface AIHotelMatch {
  name: string;
  confidence: number;
  reason: string;
}

// Extended hotel with AI metadata from recommendations
export interface AIHotelRecommendation extends Hotel {
  matchScore?: number;
  matchReason?: string;
}