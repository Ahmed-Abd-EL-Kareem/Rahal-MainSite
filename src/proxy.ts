import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'never',
});

export const config = {
  // Match all pathnames except for:
  // - API routes (/api)
  // - Static assets (_next/static, _next/image, public images, icons, etc.)
  // - Files with extensions (e.g., .svg, .png, .jpg, etc.)
  matcher: [
    '/((?!api|_next/static|_next/image|images|favicon.ico|design-reference|.*\\..*).*)'
  ]
};
