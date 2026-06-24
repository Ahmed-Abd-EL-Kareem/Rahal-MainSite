'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Compass, Sparkles, CalendarCheck } from 'lucide-react';
import Heading from '../ui/Heading';
import Text from '../ui/Text';
import Card from '../ui/Card';

export default function HowItWorks() {
  const t = useTranslations('home.experience');

  const steps = [
    {
      icon: <Compass className="w-8 h-8 text-primary" />,
      title: t('step1.title'),
      desc: t('step1.desc'),
    },
    {
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      title: t('step2.title'),
      desc: t('step2.desc'),
    },
    {
      icon: <CalendarCheck className="w-8 h-8 text-primary" />,
      title: t('step3.title'),
      desc: t('step3.desc'),
    },
  ];

  return (
    <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container mx-auto">
      <div className="text-center mb-16">
        <Text variant="label-md" className="text-primary font-bold tracking-widest">
          {t('subtitle')}
        </Text>
        <Heading level={2} variant="headline-md" className="mt-2 text-on-surface">
          {t('title')}
        </Heading>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-gutter">
        {steps.map((step, idx) => (
          <Card
            key={idx}
            className="group flex flex-col items-start hover:bg-surface-container transition-colors duration-500"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              {step.icon}
            </div>
            <Heading level={3} variant="headline-sm" className="mb-4">
              {step.title}
            </Heading>
            <Text variant="body-md">
              {step.desc}
            </Text>
          </Card>
        ))}
      </div>
    </section>
  );
}
