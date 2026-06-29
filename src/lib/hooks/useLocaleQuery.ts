'use client';

import { useLocale } from 'next-intl';
import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query';

export function createLocaleQueryKey(...parts: (string | number | object)[]): QueryKey {
  const locale = typeof window !== 'undefined' 
    ? document.documentElement.lang || 'en' 
    : 'en';
  return [locale, ...parts];
}

export function useLocaleQuery<TQueryFnData = unknown, TError = Error, TData = TQueryFnData>(
  baseKey: QueryKey,
  options: Omit<UseQueryOptions<TQueryFnData, TError, TData, QueryKey>, 'queryKey'>
) {
  const locale = useLocale();
  const localeKey = [locale, ...baseKey] as QueryKey;

  return useQuery({
    queryKey: localeKey,
    ...options,
  });
}

export function getLocaleQueryKey(baseKey: QueryKey, locale: string): QueryKey {
  return [locale, ...baseKey] as QueryKey;
}