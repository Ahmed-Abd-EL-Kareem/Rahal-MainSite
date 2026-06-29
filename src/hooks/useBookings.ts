import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsAxiosService } from '@/lib/api/bookingsAxiosService';

export function useMyBookingsQuery() {
  return useQuery({
    queryKey: ['myBookings'],
    queryFn: () => bookingsAxiosService.getMyBookings(),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useBookingDetailsQuery(id: string) {
  return useQuery({
    queryKey: ['bookingDetails', id],
    queryFn: () => bookingsAxiosService.getBookingDetails(id),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useCancelBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsAxiosService.cancelBooking(id),
    onSuccess: (data, id) => {
      // Invalidate the bookings list and specific booking details cache
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
        // Redirect the user to Stripe Checkout URL (API_ROUTES.md line 1307)
        window.location.href = data.data.url;
      }
    },
  });
}

export function usePaymentStatusQuery(bookingId: string, options = {}) {
  return useQuery({
    queryKey: ['paymentStatus', bookingId],
    queryFn: () => bookingsAxiosService.getPaymentStatus(bookingId),
    enabled: !!bookingId,
    staleTime: 10 * 1000, // 10 seconds
    ...options,
  });
}
