export function isRTL(locale: string): boolean {
  return locale === 'ar';
}

export function getDirection(locale: string): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export function getTextAlign(locale: string): 'left' | 'right' {
  return locale === 'ar' ? 'right' : 'left';
}

export function getFlexDirection(locale: string): 'row' | 'row-reverse' {
  return locale === 'ar' ? 'row-reverse' : 'row';
}

export function getTextAlignClass(locale: string): string {
  return locale === 'ar' ? 'text-end' : 'text-start';
}

export function getMarginStart(locale: string, value: string): string {
  return `ms-${value}`;
}

export function getMarginEnd(locale: string, value: string): string {
  return `me-${value}`;
}

export function getPaddingStart(locale: string, value: string): string {
  return `ps-${value}`;
}

export function getPaddingEnd(locale: string, value: string): string {
  return `pe-${value}`;
}

export function getInsetStart(locale: string, value: string): string {
  return `inset-inline-start-${value}`;
}

export function getInsetEnd(locale: string, value: string): string {
  return `inset-inline-end-${value}`;
}

export function getBorderStart(locale: string, value: string): string {
  return `border-s-${value}`;
}

export function getBorderEnd(locale: string, value: string): string {
  return `border-e-${value}`;
}

export function getRoundedStart(locale: string, value: string): string {
  return `rounded-s-${value}`;
}

export function getRoundedEnd(locale: string, value: string): string {
  return `rounded-e-${value}`;
}

export const rtlClasses = {
  textStart: 'text-start',
  textEnd: 'text-end',
  flexRow: 'flex-row',
  flexRowReverse: 'flex-row-reverse',
  msAuto: 'ms-auto',
  meAuto: 'me-auto',
  ps0: 'ps-0',
  pe0: 'pe-0',
  insetStart0: 'inset-inline-start-0',
  insetEnd0: 'inset-inline-end-0',
} as const;

export function getLocaleAwareClasses(locale: string) {
  const isArabic = locale === 'ar';
  return {
    textAlign: isArabic ? 'text-end' : 'text-start',
    flexDirection: isArabic ? 'flex-row-reverse' : 'flex-row',
    marginStart: 'ms-auto',
    marginEnd: 'me-auto',
    paddingStart: 'ps-0',
    paddingEnd: 'pe-0',
    insetStart: 'inset-inline-start-0',
    insetEnd: 'inset-inline-end-0',
  };
}