export interface TripDay {
  day: number;
  title: string;
  activities: string[];
  meals: string[];
  accommodation: string;
  tips: string;
  estimatedCost: number;
}

export interface Trip {
  _id: string;
  user: string | { name: string; email: string };
  title: string;
  destination: string;
  duration: number;
  budget: 'budget' | 'mid-range' | 'luxury' | string;
  travelers: number;
  interests: string[];
  days: TripDay[];
  summary: string;
  estimatedTotalCost: number;
  currency: string;
  language: 'en' | 'ar';
  status: 'draft' | 'saved' | string;
  isAIGenerated: boolean;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
