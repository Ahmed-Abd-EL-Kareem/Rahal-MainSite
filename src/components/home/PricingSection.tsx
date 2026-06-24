'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Check, Star } from 'lucide-react';
import Heading from '../ui/Heading';
import Text from '../ui/Text';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export default function PricingSection() {
  const t = useTranslations('home.pricing');

  const freeFeatures = [t('free.f1'), t('free.f2'), t('free.f3')];
  const proFeatures = [t('pro.f1'), t('pro.f2'), t('pro.f3'), t('pro.f4')];

  return (
    <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container mx-auto">
      <div className="text-center mb-16">
        <Heading level={2} variant="headline-md" className="text-on-background">
          {t('title')}
        </Heading>
        <Text variant="body-md" className="max-w-xl mx-auto mt-4">
          {t('subtitle')}
        </Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto items-stretch">
        {/* Free Plan */}
        <Card className="p-8 md:p-10 rounded-2xl border-2 border-outline-variant/30 hover:border-outline-variant/60 bg-surface-container-lowest flex flex-col h-full">
          <Heading level={3} variant="headline-sm" className="mb-2">
            {t('free.title')}
          </Heading>
          <div className="text-4xl font-bold text-on-surface mb-6 flex items-baseline gap-1">
            {t('free.price')}{' '}
            <span className="text-base font-normal text-on-surface-variant">
              {t('free.unit')}
            </span>
          </div>
          <ul className="space-y-4 mb-10 flex-grow">
            {freeFeatures.map((feat, idx) => (
              <li key={idx} className="flex items-center gap-3 text-sm text-on-surface-variant font-medium">
                <Check className="w-5 h-5 text-success flex-shrink-0" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
          <Link href="/signup">
            <Button variant="secondary" pill fullWidth className="py-3.5 border-secondary text-secondary">
              {t('free.cta')}
            </Button>
          </Link>
        </Card>

        {/* Pro Plan */}
        <Card className="p-8 md:p-10 rounded-2xl border-2 border-primary bg-primary/5 relative overflow-hidden flex flex-col h-full">
          <Badge variant="primary" className="absolute top-6 right-6 bg-primary text-white font-bold px-3 py-1 rounded-full uppercase tracking-wider text-[10px]">
            {t('pro.tag')}
          </Badge>
          <Heading level={3} variant="headline-sm" className="mb-2">
            {t('pro.title')}
          </Heading>
          <div className="text-4xl font-bold text-on-surface mb-6 flex items-baseline gap-1">
            {t('pro.price')}{' '}
            <span className="text-base font-normal text-on-surface-variant">
              {t('pro.unit')}
            </span>
          </div>
          <ul className="space-y-4 mb-10 flex-grow">
            {proFeatures.map((feat, idx) => (
              <li key={idx} className="flex items-center gap-3 text-sm text-on-surface-variant font-medium">
                <Star className="w-5 h-5 text-primary fill-primary flex-shrink-0" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
          <Link href="/signup">
            <Button variant="primary" pill fullWidth className="py-3.5 shadow-lg">
              {t('pro.cta')}
            </Button>
          </Link>
        </Card>
      </div>
    </section>
  );
}
