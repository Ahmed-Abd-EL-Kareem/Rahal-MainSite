'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils/cn';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  variant?: 'display-lg' | 'headline-md' | 'headline-sm';
}

export default function Heading({
  children,
  level = 2,
  variant = 'headline-md',
  className,
  ...props
}: HeadingProps) {
  const locale = useLocale();
  const isAr = locale === 'ar';

  const fontClass = isAr ? 'font-arabic-display' : 'font-display';

  const variantClasses = {
    'display-lg': cn(
      fontClass,
      'font-bold text-4xl leading-[44px] md:text-5xl md:leading-[56px] -tracking-[0.02em] text-on-surface'
    ),
    'headline-md': cn(
      fontClass,
      'font-semibold text-2xl leading-8 md:text-[32px] md:leading-10 text-on-surface'
    ),
    'headline-sm': cn(
      fontClass,
      'font-semibold text-xl leading-7 md:text-2xl md:leading-8 text-on-surface'
    ),
  };

  const Tag = `h${level}` as React.ElementType;

  return (
    <Tag className={cn(variantClasses[variant], className)} {...props}>
      {children}
    </Tag>
  );
}
