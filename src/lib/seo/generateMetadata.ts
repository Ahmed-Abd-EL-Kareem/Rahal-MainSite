import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Locale } from '@/i18n/config';

const pageMetadata: Record<string, { title: string; description: string }> = {
  home: {
    title: 'home.meta.title',
    description: 'home.meta.description',
  },
  hotels: {
    title: 'hotelListing.meta.title',
    description: 'hotelListing.meta.description',
  },
  hotelDetail: {
    title: 'hotelDetail.meta.title',
    description: 'hotelDetail.meta.description',
  },
  destinations: {
    title: 'destinations.meta.title',
    description: 'destinations.meta.description',
  },
  about: {
    title: 'about.meta.title',
    description: 'about.meta.description',
  },
  planner: {
    title: 'planner.meta.title',
    description: 'planner.meta.description',
  },
  pricing: {
    title: 'pricing.meta.title',
    description: 'pricing.meta.description',
  },
  trips: {
    title: 'trips.meta.title',
    description: 'trips.meta.description',
  },
  favorites: {
    title: 'favoritesPage.meta.title',
    description: 'favoritesPage.meta.description',
  },
};

export async function generateLocalizedMetadata(
  locale: Locale,
  page: keyof typeof pageMetadata,
  dynamicParams?: Record<string, string>
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: pageMetadata[page]?.title.split('.')[0] || page });
  
  const titleKey = pageMetadata[page]?.title || `${page}.meta.title`;
  const descriptionKey = pageMetadata[page]?.description || `${page}.meta.description`;

  const title = t(titleKey.split('.').pop() || 'title');
  const description = t(descriptionKey.split('.').pop() || 'description');

  // Build alternate URLs for hreflang
  const basePath = dynamicParams 
    ? `/${page}${Object.entries(dynamicParams).map(([k, v]) => `/${v}`).join('')}`
    : `/${page}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
      alternateLocale: locale === 'ar' ? 'en_US' : 'ar_EG',
      type: 'website',
    },
    alternates: {
      languages: {
        en: `/en${basePath}`,
        ar: `/ar${basePath}`,
        'x-default': `/en${basePath}`,
      },
    },
  };
}

export async function generateHotelDetailMetadata(
  locale: Locale,
  slug: string
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'hotelDetail' });
  
  return {
    title: t('meta.title', { hotel: '' }), // Will be filled dynamically
    description: t('meta.description'),
    openGraph: {
      title: t('meta.ogTitle', { hotel: '' }),
      description: t('meta.ogDescription'),
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
      alternateLocale: locale === 'ar' ? 'en_US' : 'ar_EG',
      type: 'website',
    },
    alternates: {
      languages: {
        en: `/en/hotels/${slug}`,
        ar: `/ar/hotels/${slug}`,
        'x-default': `/en/hotels/${slug}`,
      },
    },
  };
}