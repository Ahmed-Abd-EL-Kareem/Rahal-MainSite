'use client';

import { useTranslations, useLocale } from 'next-intl';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import AuthLayout from '@/components/layout/AuthLayout';

export default function ResetPasswordPage() {
  const t = useTranslations('auth.resetPassword');
  const locale = useLocale();

  return (
    <AuthLayout locale={locale}>
      <main className="mx-auto max-w-container px-margin-mobile py-32 md:px-margin-desktop">
        <Heading level={1} variant="headline-md" className="text-on-surface">
          {t('title')}
        </Heading>
        <Text variant="body-md" className="mt-4 text-on-surface-variant">
          {t('comingSoon')}
        </Text>
      </main>
    </AuthLayout>
  );
}