'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/providers/AuthProvider';
import { Loader2 } from 'lucide-react';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';

export default function AITripPlannerPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('planner');
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isAuthenticated, isLoading, router, locale]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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