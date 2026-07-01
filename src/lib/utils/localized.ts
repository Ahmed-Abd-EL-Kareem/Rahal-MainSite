export type LocalizedString =
  | string
  | { en: string; ar: string }
  | undefined
  | null;

/** Resolve API fields that may be a plain string or { en, ar }. */
export function getLocalized(value: LocalizedString, locale: string): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return locale === 'ar' ? value.ar || value.en : value.en || value.ar;
}
