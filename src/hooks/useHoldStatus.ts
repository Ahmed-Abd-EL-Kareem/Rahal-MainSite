import { useQuery } from '@tanstack/react-query';
import { bookingsApi } from '@/lib/api/bookings';
import { Booking } from '@/types/booking';

export function useHoldStatus(holdId?: string, options?: { enabled?: boolean }) {
  return useQuery<Booking>({
    queryKey: ['hold-status', holdId],
    queryFn: () => bookingsApi.getHoldStatus(holdId!).then((res) => res.data),
    enabled: Boolean(holdId) && (options?.enabled ?? true),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'confirmed' || status === 'expired' || status === 'cancelled') {
        return false;
      }
      return 2000;
    },
    refetchIntervalInBackground: true,
  });
}