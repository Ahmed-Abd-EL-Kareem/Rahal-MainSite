import { client } from './client';
import { Plan, Subscription } from '@/types/subscription';
import { SuccessResponse } from '@/types/api';

export const subscriptionsApi = {
  getPlans: () =>
    client.get<SuccessResponse<Plan[]>>('/subscriptions/plans'),

  getMySubscription: () =>
    client.get<SuccessResponse<Subscription>>('/subscriptions/my'),

  cancelSubscription: () =>
    client.patch<SuccessResponse<Subscription>>('/subscriptions/cancel'),

  upgrade: (planName: 'pro' | string) =>
    client.post<SuccessResponse<{ url: string; sessionId: string }>>('/subscriptions/pay/upgrade', { planName }),

  getSubscriptionPaymentStatus: (subscriptionId: string) =>
    client.get<SuccessResponse<{
      subscriptionId: string;
      stripeSubscriptionId: string;
      status: string;
      planName: string;
      paymentStatus: string;
    }>>(`/subscriptions/pay/status/${subscriptionId}`),
};
