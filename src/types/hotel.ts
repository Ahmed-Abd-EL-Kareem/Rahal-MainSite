import { TranslatedText, Location } from './destination';

export interface Room {
  type: 'single' | 'double' | 'suite' | 'family' | string;
  pricePerNight: number;
  capacity: number;
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
