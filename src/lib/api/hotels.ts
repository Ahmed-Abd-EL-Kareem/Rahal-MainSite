import { client } from './client';
import { Hotel, RoomAvailability } from '@/types/hotel';
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

export const hotelsApi = {
  getHotels: (params?: any) =>
    client.get<SuccessResponse<Hotel[]>>(`/hotels${serializeParams(params)}`),

  getNearbyHotels: (params: { lng: number; lat: number; maxKm?: number; limit?: number }) =>
    client.get<SuccessResponse<Hotel[]>>(`/hotels/nearby${serializeParams(params)}`),

  getHotelBySlug: (slug: string) =>
    client.get<SuccessResponse<Hotel>>(`/hotels/slug/${slug}`),

  getHotelById: (id: string) =>
    client.get<SuccessResponse<Hotel>>(`/hotels/${id}`),

  getHotelMeta: () =>
    client.get<SuccessResponse<{
      cities: string[];
      regions: string[];
      amenities: string[];
      roomTypes: string[];
      currencies: string[];
    }>>('/hotels/meta'),

  getRoomsAvailability: (hotelId: string, checkIn: string, checkOut: string) =>
    client.get<SuccessResponse<RoomAvailability[]>>(
      `/hotels/${hotelId}/rooms/availability${serializeParams({ checkIn, checkOut })}`
    ),

  getRoomAvailability: (
    hotelId: string,
    roomId: string,
    checkIn: string,
    checkOut: string,
    quantity: number
  ) =>
    client.get<SuccessResponse<RoomAvailability>>(
      `/hotels/${hotelId}/rooms/${roomId}/availability${serializeParams({ checkIn, checkOut, quantity })}`
    ),
};