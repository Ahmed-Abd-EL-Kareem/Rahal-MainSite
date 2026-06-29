'use client';

import { useLocale } from 'next-intl';

export interface FormatOptions {
  locale?: string;
}

export function useFormatter() {
  const locale = useLocale();

  const formatCurrency = (amount: number, currency = 'EGP', options?: FormatOptions): string => {
    const targetLocale = options?.locale || locale;
    return new Intl.NumberFormat(targetLocale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number, options?: FormatOptions): string => {
    const targetLocale = options?.locale || locale;
    return new Intl.NumberFormat(targetLocale).format(num);
  };

  const formatCompactNumber = (num: number, options?: FormatOptions): string => {
    const targetLocale = options?.locale || locale;
    return new Intl.NumberFormat(targetLocale, {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(num);
  };

  const formatDate = (
    date: Date | string,
    options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
    formatOptions?: FormatOptions
  ): string => {
    const targetLocale = formatOptions?.locale || locale;
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(targetLocale, options).format(dateObj);
  };

  const formatRelativeTime = (
    date: Date | string,
    unit: Intl.RelativeTimeFormatUnit = 'day',
    options?: FormatOptions
  ): string => {
    const targetLocale = options?.locale || locale;
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const diffMs = dateObj.getTime() - Date.now();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    const rtf = new Intl.RelativeTimeFormat(targetLocale, { numeric: 'auto' });
    return rtf.format(diffDays, unit);
  };

  const formatPercent = (value: number, options?: FormatOptions): string => {
    const targetLocale = options?.locale || locale;
    return new Intl.NumberFormat(targetLocale, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value);
  };

  return {
    formatCurrency,
    formatNumber,
    formatCompactNumber,
    formatDate,
    formatRelativeTime,
    formatPercent,
  };
}

// Server-side formatters (for use in Server Components)
export function formatCurrencyServer(
  amount: number,
  currency = 'EGP',
  locale = 'en'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumberServer(num: number, locale = 'en'): string {
  return new Intl.NumberFormat(locale).format(num);
}

export function formatDateServer(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
  locale = 'en'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

export function formatRelativeTimeServer(
  date: Date | string,
  unit: Intl.RelativeTimeFormatUnit = 'day',
  locale = 'en'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const diffMs = dateObj.getTime() - Date.now();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  return rtf.format(diffDays, unit);
}