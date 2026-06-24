import { client } from './client';
import { Booking } from '@/types/booking';
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

export const bookingsApi = {
  createBooking: (body: {
    hotel: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    rooms: number;
    trip?: string;
    specialRequests?: string;
  }) =>
    client.post<SuccessResponse<Booking>>('/bookings', body),

  getBookings: (params?: any) =>
    client.get<SuccessResponse<Booking[]>>(`/bookings${serializeParams(params)}`),

  getBookingById: (id: string) =>
    client.get<SuccessResponse<Booking>>(`/bookings/${id}`),

  cancelBooking: (id: string) =>
    client.patch<SuccessResponse<Booking>>(`/bookings/${id}/cancel`),
};
