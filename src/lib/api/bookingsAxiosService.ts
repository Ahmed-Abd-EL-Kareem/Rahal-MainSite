// import { axiosClient } from './axiosClient';
// import { Booking } from '@/types/booking';

// export interface BookingsResponse {
//   status: string;
//   message?: string;
//   results?: number;
//   data: Booking[];
//   pagination?: Record<string, unknown>;
// }

// export interface BookingDetailResponse {
//   status: string;
//   data: Booking;
// }

// export interface CheckoutResponse {
//   status: string;
//   message?: string;
//   data: {
//     url: string;
//     sessionId: string;
//     amount: number;
//     currency: string;
//     bookingId: string;
//   };
// }

// export interface PaymentStatusResponse {
//   status: string;
//   message?: string;
//   data: {
//     bookingId: string;
//     paymentStatus: 'pending' | 'succeeded' | 'failed' | string;
//     amountPaid: number;
//     currency: string;
//     paidAt: string;
//     failureReason: string | null;
//     bookingStatus: 'pending' | 'confirmed' | 'canceled' | 'completed' | string;
//   };
// }

// export const bookingsAxiosService = {
//   // GET /bookings - List own bookings (API_ROUTES.md line 872)
//   getMyBookings: async (): Promise<BookingsResponse> => {
//     const response = await axiosClient.get<BookingsResponse>('/bookings');
//     return response.data;
//   },

//   // GET /bookings/:id - Owner only booking details (API_ROUTES.md line 886)
//   getBookingDetails: async (id: string): Promise<BookingDetailResponse> => {
//     const response = await axiosClient.get<BookingDetailResponse>(`/bookings/${id}`);
//     return response.data;
//   },

//   // PATCH /bookings/:id/cancel - Owner only cancel booking (API_ROUTES.md line 895)
//   cancelBooking: async (id: string): Promise<BookingDetailResponse> => {
//     const response = await axiosClient.patch<BookingDetailResponse>(`/bookings/${id}/cancel`);
//     return response.data;
//   },

//   // POST /payments/booking/pay/checkout - Create Stripe Checkout session (API_ROUTES.md line 1294)
//   createCheckoutSession: async (bookingId: string): Promise<CheckoutResponse> => {
//     const response = await axiosClient.post<CheckoutResponse>('/payments/booking/pay/checkout', {
//       bookingId,
//     });
//     return response.data;
//   },

//   // GET /payments/booking/status/:bookingId - Get booking payment status (API_ROUTES.md line 1322)
//   getPaymentStatus: async (bookingId: string): Promise<PaymentStatusResponse> => {
//     const response = await axiosClient.get<PaymentStatusResponse>(`/payments/booking/status/${bookingId}`);
//     return response.data;
//   },
// };
import { axiosClient } from './axiosClient';
import { Booking } from '@/types/booking';

export interface BookingsResponse {
  status: string;
  message?: string;
  results?: number;
  data: Booking[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetMyBookingsParams {
  page?: number;
  limit?: number;
  sort?: string;
  status?: string;
  upcoming?: boolean;
  search?: string;
}

export interface BookingDetailResponse {
  status: string;
  data: Booking;
}

export interface CheckoutResponse {
  status: string;
  message?: string;
  data: {
    url: string;
    sessionId: string;
    amount: number;
    currency: string;
    bookingId: string;
  };
}

export interface PaymentStatusResponse {
  status: string;
  message?: string;
  data: {
    bookingId: string;
    paymentStatus: 'pending' | 'succeeded' | 'failed' | string;
    amountPaid: number;
    currency: string;
    paidAt: string;
    failureReason: string | null;
    bookingStatus:
      | 'pending'
      | 'confirmed'
      | 'canceled'
      | 'completed'
      | string;
  };
}

export const bookingsAxiosService = {
  // GET /bookings
  getMyBookings: async (params?: GetMyBookingsParams): Promise<BookingsResponse> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          searchParams.set(key, String(val));
        }
      });
    }
    const queryString = searchParams.toString();
    const response = await axiosClient.get<BookingsResponse>(
      `/bookings${queryString ? '?' + queryString : ''}`
    );
    return response.data;
  },

  // GET /bookings/:id
  getBookingDetails: async (
    id: string
  ): Promise<BookingDetailResponse> => {
    const response = await axiosClient.get<BookingDetailResponse>(
      `/bookings/${id}`
    );
    return response.data;
  },

  // PATCH /bookings/:id/cancel
  cancelBooking: async (
    id: string
  ): Promise<BookingDetailResponse> => {
    const response = await axiosClient.patch<BookingDetailResponse>(
      `/bookings/${id}/cancel`
    );
    return response.data;
  },

  // POST /payments/pay/checkout
  createCheckoutSession: async (
    bookingId: string
  ): Promise<CheckoutResponse> => {
    const response = await axiosClient.post<CheckoutResponse>(
      '/payments/pay/checkout',
      {
        bookingId,
      }
    );

    return response.data;
  },

  // GET /payments/status/:bookingId
  getPaymentStatus: async (
    bookingId: string
  ): Promise<PaymentStatusResponse> => {
    const response = await axiosClient.get<PaymentStatusResponse>(
      `/payments/status/${bookingId}`
    );

    return response.data;
  },
};