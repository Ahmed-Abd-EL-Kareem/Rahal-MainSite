export interface Plan {
  _id: string;
  name: 'free' | 'pro' | string;
  displayName: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  currency: string;
  limits: {
    tokensPerMonth: number | null;
    requestsPerDay: number | null;
    tripsPerMonth: number | null;
    maxFileUploads: number;
    maxFileSizeMB: number;
    allowedModels: string[];
  };
  features: string[];
  isActive: boolean;
  sortOrder: number;
}

export interface Subscription {
  _id: string;
  user: string | { name: string; email: string };
  planName: string;
  status: 'active' | 'canceled' | 'free' | 'past_due' | string;
  startDate: string;
  endDate: string | null;
  plan: Plan;
  usage: {
    tokensUsedThisMonth: number;
    requestsToday: number;
    tripsThisMonth: number;
    lastRequestDate: string;
    lastResetDate: string;
  };
  history: Array<{
    fromPlan: string | null;
    toPlan: string;
    changedAt: string;
    reason: string;
  }>;
}
