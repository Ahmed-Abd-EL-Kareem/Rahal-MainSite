'use client';

import { use } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { bookingsApi } from '@/lib/api/bookings';
import { useCreateCheckoutSessionFromHoldMutation } from '@/hooks/useBookings';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function BookingPaymentCancelPage({ params }: PageProps) {
  const { locale } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('account');
  const holdT = useTranslations('booking.hold');

  const sessionId = searchParams.get('session_id') || '';
  const holdId = searchParams.get('holdId') || '';

  const createCheckoutSession = useCreateCheckoutSessionFromHoldMutation();

  const handleRetryPayment = async () => {
    if (holdId) {
      try {
        const response = await createCheckoutSession.mutateAsync(holdId);
        if (response?.checkoutUrl) {
          window.location.href = response.checkoutUrl;
        } else {
          router.push(`/${locale}/hotels`);
        }
      } catch {
        router.push(`/${locale}/hotels`);
      }
    } else {
      router.push(`/${locale}/hotels`);
    }
  };

  const handleSelectRoomsAgain = () => {
    router.push(`/${locale}/hotels`);
  };

  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="space-y-4">
          <svg className="mx-auto h-16 w-16 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-on-background">
            {t('paymentCancel.title')}
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant max-w-xl">
            {holdId 
              ? holdT('cancelledCheckoutBody') 
              : t('paymentCancel.subtitle')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {holdId && (
            <Button
              variant="primary"
              onClick={handleRetryPayment}
              className="px-8 py-3.5 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2"
            >
              {holdT('retryPayment')}
            </Button>
          )}
          <Link href={`/${locale}/hotels`}>
            <Button variant="secondary" className="px-8 py-3.5 rounded-xl font-bold text-sm w-full">
              {holdId ? holdT('selectAgain') : t('paymentCancel.goToTrips')}
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}