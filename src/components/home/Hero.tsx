'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Heading from '../ui/Heading';
import Text from '../ui/Text';
import Button from '../ui/Button';

export default function Hero() {
  const t = useTranslations('home.hero');

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-background z-10" />
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCscfy6hbUXhbtsRDhClXwVL6_PPXRBnnw-GWr89KHkejbXQCX6ml8b28nCs-80tLPY9UWFCfA0WHPuU6QKnIXn7ALwEbd6-tPWieGmE06GQKG5Lbl8rZxeaa-sn-KLKtnBo05zh2nRW2ptrjE8AG-vK4YZEW7YzJ2SSFE4LppHbCdxGUgY-EkkqWumbVfazrnArZINO42NdheSELcM_T0Tk3NvtocguTGiXXnXtKFFv8_qJtbZeV2aullOTOhWOTOfZFRSY47hDz0"
          alt="Great Pyramids of Giza during golden hour"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-20 text-center px-margin-mobile max-w-4xl flex flex-col items-center">
        <Heading level={1} variant="display-lg" className="text-white mb-6 text-shadow-sm drop-shadow-md">
          {t('title')}
        </Heading>
        <Text variant="body-lg" className="text-white/95 mb-10 max-w-2xl mx-auto text-shadow-sm">
          {t('subtitle')}
        </Text>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button variant="primary" pill className="w-full text-lg py-4 px-10">
              {t('ctaPrimary')}
            </Button>
          </Link>
          <a href="#" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              pill
              className="w-full text-lg py-4 px-10 border-white text-white hover:bg-white/10 backdrop-blur-sm"
            >
              {t('ctaSecondary')}
            </Button>
          </a>
        </div>
      </div>

      {/* Floating Stats (desktop only) */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 w-full max-w-container px-margin-desktop hidden lg:block">
        <div className="grid grid-cols-3 gap-gutter bg-surface-container-lowest/80 backdrop-blur-md p-8 rounded-xl shadow-card-hover border border-outline-variant/20">
          <div className="text-center border-r border-outline-variant/30">
            <div className="text-primary font-display text-3xl font-bold">500+</div>
            <div className="text-on-surface-variant font-body text-xs font-semibold uppercase tracking-widest mt-1">
              {t('statDestinations')}
            </div>
          </div>
          <div className="text-center border-r border-outline-variant/30">
            <div className="text-primary font-display text-3xl font-bold">1200+</div>
            <div className="text-on-surface-variant font-body text-xs font-semibold uppercase tracking-widest mt-1">
              {t('statHotels')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-primary font-display text-3xl font-bold">AI-Powered</div>
            <div className="text-on-surface-variant font-body text-xs font-semibold uppercase tracking-widest mt-1">
              {t('statEngine')}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
