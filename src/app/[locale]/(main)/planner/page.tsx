'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';

export default function AITripPlannerPage() {
  const router = useRouter();
  const t = useTranslations('planner');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tokenMatch = document.cookie.match(/(^|;\s*)token\s*=\s*([^;]*)/);
    if (!tokenMatch) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-container px-margin-mobile py-32 md:px-margin-desktop min-h-screen">
      <Heading level={1} variant="headline-md" className="text-on-surface">
        {t('title')}
      </Heading>
      <Text variant="body-md" className="mt-4 text-on-surface-variant">
        {t('subtitle')}
      </Text>
    </main>
  );
}