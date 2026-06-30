import { client } from './client';
import { SuccessResponse } from '@/types/api';

export const paymentsApi = {
  bookingCheckout: (bookingId: string, currency?: string) =>
    client.post<SuccessResponse<{
      url: string;
      sessionId: string;
      amount: number;
      currency: string;
      bookingId: string;
    }>>('/payments/pay/checkout', { bookingId, currency }),

  getBookingPaymentStatus: (bookingId: string) =>
    client.get<SuccessResponse<{
      bookingId: string;
      paymentStatus: 'pending' | 'succeeded' | 'failed' | string;
      amountPaid: number;
      currency: string;
      paidAt: string;
      failureReason: string | null;
      bookingStatus: string;
    }>>(`/payments/status/${bookingId}`),
};
