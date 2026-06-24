export interface TranslatedText {
  en: string;
  ar: string;
}

export interface Attraction {
  name: TranslatedText;
  type: string;
  entryFee: number;
}

export interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Destination {
  _id: string;
  name: TranslatedText;
  slug: string;
  city: string;
  region: 'Upper Egypt' | 'Lower Egypt' | 'Sinai' | 'Red Sea' | 'Western Desert' | 'Delta' | 'Mediterranean' | string;
  category: 'historical' | 'beach' | 'adventure' | 'cultural' | 'religious' | 'nature' | 'other' | 'landmark' | string;
  description: TranslatedText;
  attractions: Attraction[];
  bestMonths: string[];
  averageBudgetPerDay: number;
  currency: string;
  location: Location;
  images: string[];
  coverImage: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
