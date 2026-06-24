'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils/cn';

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'body-lg' | 'body-md' | 'label-md' | 'label-sm';
  as?: 'p' | 'span' | 'div';
}

export default function Text({
  children,
  variant = 'body-md',
  as = 'p',
  className,
  ...props
}: TextProps) {
  const locale = useLocale();
  const isAr = locale === 'ar';

  const fontClass = isAr ? 'font-arabic-body' : 'font-body';

  const variantClasses = {
    'body-lg': cn(fontClass, 'text-base md:text-lg leading-7 text-on-surface-variant'),
    'body-md': cn(fontClass, 'text-sm md:text-base leading-6 text-on-surface-variant'),
    'label-md': cn(
      fontClass,
      'font-medium text-xs md:text-sm leading-5 uppercase tracking-[0.05em] text-on-surface'
    ),
    'label-sm': cn(fontClass, 'font-semibold text-xs leading-4 text-on-surface'),
  };

  const Tag = as as React.ElementType;

  return (
    <Tag className={cn(variantClasses[variant], className)} {...props}>
      {children}
    </Tag>
  );
}
