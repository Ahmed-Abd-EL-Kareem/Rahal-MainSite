export interface Booking {
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
  status: 'pending' | 'confirmed' | 'canceled' | 'completed';
  paymentStatus: 'pending' | 'succeeded' | 'failed';
  createdAt?: string;
  updatedAt?: string;
}
