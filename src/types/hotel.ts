import { TranslatedText, Location } from './destination';

export interface Room {
  _id: string;
  name: TranslatedText;
  nameAr?: string;
  roomType: 'single' | 'double' | 'twin' | 'triple' | 'suite' | 'family';
  maxAdults: number;
  maxChildren: number;
  maxOccupancy: number;
  totalUnits: number;
  pricePerNight: number;
  amenities: string[];
  images: string[];
  isActive: boolean;
}

export interface RoomAvailability {
  roomId: string;
  totalUnits: number;
  bookedUnits: number;
  availableUnits: number;
  requestedQuantity: number;
  isAvailable: boolean;
}

export interface Hotel {
  _id: string;
  name: TranslatedText;
  slug: string;
  city: string;
  stars: number;
  amenities: string[];
  rooms: Room[];
  averagePricePerNight: number;
  currency: string;
  description?: TranslatedText;
  location: Location;
  images: string[];
  coverImage: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}