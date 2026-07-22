export interface RoomSelection {
  room: string;
  quantity: number;
  guests: {
    adults: number;
    children: number;
  };
}

export interface CreateHoldPayload {
  hotel: string;
  checkIn: string;
  checkOut: string;
  rooms: RoomSelection[];
}

export interface CreateBookingPayload {
  hotel: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: RoomSelection[];
  trip?: string;
  specialRequests?: string;
}

export interface HoldResponse {
  holdId: string;
  expiresAt: string;
  totalPrice: number;
}

export interface CheckoutSessionResponse {
  checkoutUrl: string;
}

export type BookingStatus = 'held' | 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'expired';

export interface Booking {
  _id: string;
  hotel: string | {
    _id: string;
    name: { en: string; ar: string };
    city: string | { en: string; ar: string };
    address?: string | { en: string; ar: string };
    averagePricePerNight: number;
    stars: number;
    currency: string;
    coverImage: string;
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: Array<RoomSelection & { roomType: string; pricePerNight: number }>;
  totalPrice: number;
  currency: string;
  status: BookingStatus;
  paymentStatus: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
  specialRequests?: string;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingDetail {
  _id: string;
  user: string | { name: string; email: string };
  hotel: string | {
    _id: string;
    name: { en: string; ar: string };
    city: string | { en: string; ar: string };
    address?: string | { en: string; ar: string };
    averagePricePerNight: number;
    stars: number;
    currency: string;
    coverImage: string;
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  trip?: string | { title: string; destination: string; days?: any[] };
  specialRequests?: string;
  totalPrice: number;
  currency: string;
  status: BookingStatus;
  paymentStatus: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}