'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Compass, Sparkles } from 'lucide-react';

export default function LoadingPage() {
  const t = useTranslations('errors');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center bg-background px-margin-mobile md:px-margin-desktop py-20 overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="relative z-10 max-w-md w-full text-center space-y-8 bg-surface-container-low/50 backdrop-blur-md border border-outline-variant/15 p-8 md:p-12 rounded-3xl shadow-lg">
        {/* Animated Egyptian-themed Compass & Sparkles */}
        <div className="relative mx-auto w-20 h-20 bg-primary/10 border border-primary/15 rounded-full flex items-center justify-center text-primary shadow-inner">
          <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '3s' }} />
          <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-secondary animate-bounce" />
        </div>

        {/* Localized Message */}
        <div className="space-y-3">
          <h2 className={`font-display text-2xl font-bold text-on-surface ${isAr ? 'font-arabic-display' : ''}`}>
            {t('loadingTitle')}
          </h2>
          <p className={`font-body text-sm text-on-surface-variant max-w-xs mx-auto leading-relaxed ${isAr ? 'font-arabic-body' : ''}`}>
            {t('loadingSubtitle')}
          </p>
        </div>

        {/* Beautiful Custom Shimmer Progress Line */}
        <div className="w-48 h-1.5 bg-surface-container-high rounded-full mx-auto overflow-hidden relative border border-outline-variant/10">
          <div 
            className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-primary via-secondary to-primary rounded-full" 
            style={{
              animationName: 'shimmer',
              animationDuration: '1.5s',
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear'
            }} 
          />
        </div>
      </div>

      {/* CSS Animation Keyframes */}
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
}
