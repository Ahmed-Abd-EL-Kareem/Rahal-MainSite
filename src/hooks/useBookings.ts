import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsAxiosService } from '@/lib/api/bookingsAxiosService';
import { bookingsApi } from '@/lib/api/bookings';
import { CreateHoldPayload, CreateBookingPayload, HoldResponse, CheckoutSessionResponse, Booking } from '@/types/booking';
import { SuccessResponse } from '@/types/api';

export function useMyBookingsQuery(params?: { 
  page?: number; 
  limit?: number; 
  sort?: string; 
  status?: string; 
  upcoming?: boolean;
  search?: string;
}) {
  return useQuery({
    queryKey: ['myBookings', params],
    queryFn: () => bookingsAxiosService.getMyBookings(params),
    staleTime: 30 * 1000,
  });
}

export function useBookingDetailsQuery(id: string) {
  return useQuery({
    queryKey: ['bookingDetails', id],
    queryFn: () => bookingsAxiosService.getBookingDetails(id),
    enabled: !!id,
    staleTime: 0,
    refetchInterval: (query) => {
      const status = query.state.data?.data?.paymentStatus;
      if (status === 'processing' || status === 'pending') {
        return 3000;
      }
      return false;
    },
    refetchIntervalInBackground: true,
  });
}

export function useCancelBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsAxiosService.cancelBooking(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookingDetails', id] });
    },
  });
}

export function useCreateCheckoutMutation() {
  return useMutation({
    mutationFn: (bookingId: string) => bookingsAxiosService.createCheckoutSession(bookingId),
    onSuccess: (data) => {
      if (data?.data?.url) {
        window.location.href = data.data.url;
      }
    },
  });
}

export function useCreateHoldMutation() {
  const queryClient = useQueryClient();
  return useMutation<HoldResponse, Error, CreateHoldPayload>({
    mutationFn: async (payload) => {
      const response = await bookingsApi.createHold(payload) as SuccessResponse<HoldResponse> | HoldResponse;
      // Try multiple possible response structures
      const data = (response as any).data || response;
      const hold = data?.data || data?.hold || data;
      console.log('createHold response:', response);
      console.log('extracted hold:', hold);
      if (!hold?.holdId) {
        throw new Error('Invalid hold response: missing holdId');
      }
      return hold;
    },
    onSuccess: (data) => {
      console.log('createHold success data:', data);
      queryClient.invalidateQueries({ queryKey: ['rooms-availability'] });
    },
  });
}

export function useCreateCheckoutSessionFromHoldMutation() {
  return useMutation<CheckoutSessionResponse, Error, string>({
    mutationFn: async (holdId) => {
      console.log('createCheckoutSession called with holdId:', holdId);
      const response = await bookingsApi.createCheckoutSession(holdId);
      console.log('createCheckoutSession response:', response);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('createCheckoutSession success:', data);
      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
  });
}

export function usePaymentStatusQuery(bookingId: string, options = {}) {
  return useQuery({
    queryKey: ['paymentStatus', bookingId],
    queryFn: () => bookingsAxiosService.getPaymentStatus(bookingId),
    enabled: !!bookingId,
    staleTime: 10 * 1000,
    ...options,
  });
}

export function useHoldStatusQuery(holdId: string, options = {}) {
  return useQuery({
    queryKey: ['hold-status', holdId],
    queryFn: () => bookingsApi.getHoldStatus(holdId),
    enabled: !!holdId,
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      if (status === 'confirmed' || status === 'expired' || status === 'cancelled') {
        return false;
      }
      return 2000;
    },
    refetchIntervalInBackground: true,
    ...options,
  });
}

export function useCreateBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateBookingPayload) => {
      const response = await bookingsApi.createBooking(body) as SuccessResponse<Booking> | Booking;
      const data = (response as any).data || response;
      const booking = data?.data || data?.booking || data;
      console.log('createBooking response:', response);
      console.log('extracted booking:', booking);
      if (!booking?._id) {
        throw new Error('Invalid booking response: missing booking ID');
      }
      return booking;
    },
    onSuccess: (data) => {
      console.log('createBooking success data:', data);
      queryClient.invalidateQueries({ queryKey: ['rooms-availability'] });
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
    },
  });
}