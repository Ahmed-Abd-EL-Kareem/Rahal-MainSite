import { Metadata } from 'next';

export interface GenerateMetadataOptions {
  title: string;
  description: string;
  locale: string;
  path?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

export function generateMetadata({
  title,
  description,
  locale,
  path = '',
  ogTitle,
  ogDescription,
  ogImage = '/images/og-default.png',
  noIndex = false,
  noFollow = false,
}: GenerateMetadataOptions): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rahal.app';
  const fullUrl = `${baseUrl}/${locale}${path}`;
  const otherLocale = locale === 'en' ? 'ar' : 'en';
  const otherUrl = `${baseUrl}/${otherLocale}${path}`;

  return {
    title: `${title} | Rahal`,
    description,
    robots: {
      index: !noIndex,
      follow: !noFollow,
    },
    alternates: {
      canonical: fullUrl,
      languages: {
        en: `${baseUrl}/en${path}`,
        ar: `${baseUrl}/ar${path}`,
      },
    },
    openGraph: {
      title: ogTitle || title,
      description: ogDescription || description,
      url: fullUrl,
      siteName: 'Rahal',
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
      alternateLocale: locale === 'ar' ? 'en_US' : 'ar_EG',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle || title,
      description: ogDescription || description,
      images: [ogImage],
    },
    other: {
      'hreflang': `en="${baseUrl}/en${path}", ar="${baseUrl}/ar${path}"`,
    },
  };
}

export function generateArticleMetadata({
  title,
  description,
  locale,
  path,
  publishedTime,
  modifiedTime,
  authors,
  tags,
  ogImage,
}: {
  title: string;
  description: string;
  locale: string;
  path: string;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
  ogImage?: string;
}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rahal.app';
  const fullUrl = `${baseUrl}/${locale}${path}`;

  return {
    title: `${title} | Rahal`,
    description,
    alternates: {
      canonical: fullUrl,
      languages: {
        en: `${baseUrl}/en${path}`,
        ar: `${baseUrl}/ar${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: 'Rahal',
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
      alternateLocale: locale === 'ar' ? 'en_US' : 'ar_EG',
      type: 'article',
      publishedTime,
      modifiedTime,
      authors,
      tags,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export function generateHotelMetadata({
  hotelName,
  hotelDescription,
  locale,
  slug,
  price,
  currency,
  images,
  rating,
  address,
}: {
  hotelName: string;
  hotelDescription: string;
  locale: string;
  slug: string;
  price?: number;
  currency?: string;
  images?: string[];
  rating?: number;
  address?: string;
}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rahal.app';
  const path = `/hotels/${slug}`;
  const fullUrl = `${baseUrl}/${locale}${path}`;

  const ogImages = images?.length ? images : ['/images/og-default.png'];

  return {
    title: `${hotelName} | Rahal`,
    description: hotelDescription,
    alternates: {
      canonical: fullUrl,
      languages: {
        en: `${baseUrl}/en${path}`,
        ar: `${baseUrl}/ar${path}`,
      },
    },
    openGraph: {
      title: hotelName,
      description: hotelDescription,
      url: fullUrl,
      siteName: 'Rahal',
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
      alternateLocale: locale === 'ar' ? 'en_US' : 'ar_EG',
      type: 'website',
      images: ogImages.map((img, i) => ({
        url: img,
        width: 1200,
        height: 630,
        alt: `${hotelName} - Image ${i + 1}`,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title: hotelName,
      description: hotelDescription,
      images: ogImages,
    },
    other: {
      'product:price:amount': price?.toString() || '',
      'product:price:currency': currency || 'EGP',
      'product:rating': rating?.toString() || '',
      'product:location': address || '',
    },
  };
}

export function generateDestinationMetadata({
  destinationName,
  destinationDescription,
  locale,
  slug,
  images,
}: {
  destinationName: string;
  destinationDescription: string;
  locale: string;
  slug: string;
  images?: string[];
}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rahal.app';
  const path = `/destinations/${slug}`;
  const fullUrl = `${baseUrl}/${locale}${path}`;

  const ogImages = images?.length ? images : ['/images/og-default.png'];

  return {
    title: `${destinationName} | Rahal`,
    description: destinationDescription,
    alternates: {
      canonical: fullUrl,
      languages: {
        en: `${baseUrl}/en${path}`,
        ar: `${baseUrl}/ar${path}`,
      },
    },
    openGraph: {
      title: destinationName,
      description: destinationDescription,
      url: fullUrl,
      siteName: 'Rahal',
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
      alternateLocale: locale === 'ar' ? 'en_US' : 'ar_EG',
      type: 'website',
      images: ogImages.map((img, i) => ({
        url: img,
        width: 1200,
        height: 630,
        alt: `${destinationName} - Image ${i + 1}`,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title: destinationName,
      description: destinationDescription,
      images: ogImages,
    },
  };
}