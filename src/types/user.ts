export interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  provider: 'local' | 'google' | string;
  role: 'user' | 'admin' | string;
  preferredLanguage: 'en' | 'ar';
  preferredCurrency: string;
  subscription: string;
  savedTrips: string[];
  createdAt: string;
  updatedAt: string;
}
