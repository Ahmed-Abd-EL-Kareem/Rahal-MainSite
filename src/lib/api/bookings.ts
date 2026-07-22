import { client } from './client';
import { Booking, CreateBookingPayload, CreateHoldPayload, HoldResponse, CheckoutSessionResponse, RoomSelection } from '@/types/booking';
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
  return str ? '?' + str : '';
};

export const bookingsApi = {
  createBooking: (body: CreateBookingPayload) =>
    client.post<SuccessResponse<Booking>>('/bookings', body),

  createHold: (payload: CreateHoldPayload) =>
    client.post<SuccessResponse<HoldResponse>>('/bookings/hold', payload),

  createCheckoutSession: (holdId: string) =>
    client.post<SuccessResponse<CheckoutSessionResponse>>('/bookings/hold/' + holdId + '/checkout-session'),

  getHoldStatus: (holdId: string) =>
    client.get<SuccessResponse<Booking>>('/bookings/hold/' + holdId + '/status'),

  getBookings: (params?: any) =>
    client.get<SuccessResponse<Booking[]>>('/bookings' + serializeParams(params)),

  getBookingById: (id: string) =>
    client.get<SuccessResponse<Booking>>('/bookings/' + id),

  cancelBooking: (id: string) =>
    client.patch<SuccessResponse<Booking>>('/bookings/' + id + '/cancel'),
};
