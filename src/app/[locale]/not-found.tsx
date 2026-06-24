'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Compass, HelpCircle, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFoundPage() {
  const t = useTranslations('errors');
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center bg-background px-margin-mobile md:px-margin-desktop py-20 overflow-hidden">
      {/* Dynamic/Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 max-w-2xl w-full text-center space-y-8 bg-surface-container-low/60 backdrop-blur-md border border-outline-variant/20 p-8 md:p-16 rounded-3xl shadow-xl">
        {/* Egyptian-themed Compass / Lost Indicator */}
        <div className="relative mx-auto w-24 h-24 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary shadow-lg shadow-primary/5 animate-pulse">
          <Compass className="w-12 h-12 rotate-45 transition-transform duration-1000" />
          <HelpCircle className="absolute -top-1 -right-1 w-6 h-6 text-secondary bg-surface rounded-full p-0.5 border border-outline-variant/30" />
        </div>

        {/* Localized Message */}
        <div className="space-y-4">
          <h1 className={`font-display text-4xl md:text-5xl font-bold text-on-surface ${isAr ? 'font-arabic-display' : ''}`}>
            {t('notFoundTitle')}
          </h1>
          <p className={`font-body text-base md:text-lg text-on-surface-variant max-w-md mx-auto leading-relaxed ${isAr ? 'font-arabic-body' : ''}`}>
            {t('notFoundSubtitle')}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <Link href="/">
            <Button
              variant="primary"
              pill
              className={`px-8 py-3.5 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all font-semibold inline-flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}
            >
              <ArrowLeft className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
              <span className={isAr ? 'font-arabic-body' : ''}>{t('notFoundBtn')}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Decorative Egyptian-style Hieroglyphic background borders */}
      <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-primary/30 via-secondary/35 to-primary/30" />
    </div>
  );
}
