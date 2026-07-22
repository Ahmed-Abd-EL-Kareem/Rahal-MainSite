'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Compass, Search, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import Heading from '../ui/Heading';
import Text from '../ui/Text';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function FeatureGrid() {
  const t = useTranslations('home.features');
  const calloutT = useTranslations('home.plannerCallout');

  const features = [
    {
      icon: <Compass className="w-6 h-6 text-primary" />,
      title: t('f1Title'),
      desc: t('f1Desc'),
    },
    {
      icon: <Search className="w-6 h-6 text-primary" />,
      title: t('f2Title'),
      desc: t('f2Desc'),
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-primary" />,
      title: t('f3Title'),
      desc: t('f3Desc'),
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-primary" />,
      title: t('f4Title'),
      desc: t('f4Desc'),
    },
  ];

  return (
    <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <Text variant="label-md" className="text-primary font-bold tracking-widest">
          {t('subtitle')}
        </Text>
        <Heading level={2} variant="headline-md" className="mt-2 text-on-background">
          {t('title')}
        </Heading>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        {features.map((feature, idx) => (
          <Card key={idx} className="flex flex-col h-full bg-surface-container-lowest hover:shadow-card-hover border border-outline-variant/35">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                {feature.icon}
              </div>
              {/* Nile-Blue "Rahal Insight" chip */}
              <Badge variant="secondary" className="bg-secondary text-white font-semibold py-1 px-2.5 rounded-full text-[10px] flex items-center gap-1">
                <Sparkles size={10} className="fill-white" />
                <span>{t('insight')}</span>
              </Badge>
            </div>
            <Heading level={3} variant="headline-sm" className="text-lg md:text-xl font-semibold text-on-surface mb-3">
              {feature.title}
            </Heading>
            <Text variant="body-md" className="flex-1">
              {feature.desc}
            </Text>
          </Card>
        ))}
      </div>

      {/* Papyrus double-border CTA banner */}
      <div className="relative border-4 border-double border-primary bg-surface-container rounded-2xl p-8 md:p-16 overflow-hidden shadow-card-hover mt-12">
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-5 text-primary pointer-events-none">
          <Sparkles className="w-[300px] h-[300px]" />
        </div>
        <div className="relative z-10 max-w-2xl flex flex-col items-start gap-6">
          <Heading level={2} variant="headline-md" className="text-on-surface">
            {calloutT('title')}
          </Heading>
          <Text variant="body-lg" className="text-on-surface-variant">
            {calloutT('desc')}
          </Text>
          <Link href="/trips">
            <Button variant="primary" pill className="bg-secondary text-white hover:bg-secondary-container hover:text-on-secondary-container shadow-md">
              {calloutT('cta')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
