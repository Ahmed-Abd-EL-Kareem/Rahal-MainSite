'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Heading from '../ui/Heading';
import Text from '../ui/Text';
import Button from '../ui/Button';

export default function CTASection() {
  const t = useTranslations('home.finalCta');

  return (
    <section className="relative py-32 overflow-hidden bg-black text-center flex flex-col items-center">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXF5dB3BoNx74caTSpo70YiPiuES8Y9zEj62t2mLfoovW2zrkJ8vnY2xbPbV3lQgfOMpW3kdchr2tDzlFR-BjcodOoLhO9MFaWwtxbPl4-VkoGF2V9Yr8waqRQl3QZcn3lcC_rwibeL8CSa4pAiEDFLLk9k6rFIWo0IevUln0e4fSM4l2O0TFQEUWuVAhtkYl2-_XVXQ_2MYYaTFtRZ0OpClnk0Wi5NVUM_UXn-pIoP5Wd84Q-u2mtwN_2jh3Wr1FiHoH2Pn72Ak8"
          alt="Silhouette of the Pyramids of Giza against a starry desert night sky"
          fill
          className="object-cover grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-margin-mobile max-w-xl flex flex-col items-center gap-6">
        <Heading level={2} variant="display-lg" className="text-white mb-0 drop-shadow-md">
          {t('title')}
        </Heading>
        <Text variant="body-lg" className="text-white/70 max-w-md mx-auto mb-4">
          {t('subtitle')}
        </Text>
        <Link href="/signup" className="w-full sm:w-auto">
          <Button variant="primary" pill className="w-full text-lg py-4 px-10 shadow-2xl">
            {t('cta')}
          </Button>
        </Link>
      </div>
    </section>
  );
}
