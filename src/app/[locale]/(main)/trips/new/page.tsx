'use client';

import { useTranslations } from 'next-intl';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';

export default function CreateTripPage() {
  const t = useTranslations('trips.create');

  return (
    <main className="mx-auto max-w-container px-margin-mobile py-32 md:px-margin-desktop">
      <Heading level={1} variant="headline-md" className="text-on-surface">
        {t('title')}
      </Heading>
      <Text variant="body-md" className="mt-4 text-on-surface-variant">
        {t('comingSoon')}
      </Text>
    </main>
  );
}