'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { ExternalLink } from 'lucide-react';
import Heading from '../ui/Heading';
import Text from '../ui/Text';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { hotelsApi } from '@/lib/api/hotels';
import { Hotel } from '@/types/hotel';

export default function PopularHotels() {
  const t = useTranslations('home.hotels');
  const locale = useLocale();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHotels() {
      try {
        const response = await hotelsApi.getHotels({ limit: 3 });
        if (response && response.data && response.data.length > 0) {
          setHotels(response.data);
        } else {
          // If response data is empty, use fallbacks
          setHotels(getFallbackHotels());
        }
      } catch (error) {
        console.error('Error fetching popular hotels from backend:', error);
        setHotels(getFallbackHotels());
      } finally {
        setLoading(false);
      }
    }
    fetchHotels();
  }, []);

  function getFallbackHotels(): Hotel[] {
    return [
      {
        _id: 'fallback-1',
        name: {
          en: 'The Ritz-Carlton, Cairo',
          ar: 'الريتز كارلتون، القاهرة'
        },
        slug: 'the-ritz-carlton-cairo',
        city: 'Cairo',
        stars: 5,
        amenities: ['Pool', 'Free WiFi', 'Nile View'],
        rooms: [],
        averagePricePerNight: 320,
        currency: 'USD',
        location: { type: 'Point', coordinates: [31.23, 30.04] },
        coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBjrBeuAL7wGXAFWZXqa22emTir8ULHhHQAk_Ed0i6_9jXPcyZtZ1S249bsuqzhifjiQt_Xyipxki5GMjeJb9AxPYQYtZYh6RmTLudqSELGmC_s3kAFBafCF0eC_pJuvU_vVKXZSwksn0G6B50qo_P3sV4DJL0M29Kkvt1G68tRvjuPkpvJ10LivZ7EjYfoBvpxxIzEHjjhNLG9dE-TCNcIvRUs6ytt4KLFTSIRRHR2-ASed6RSuh70W2DRnBd386R5jZnirAxiP5M",
        images: [],
        isActive: true,
        description: {
          en: 'Iconic views of the Egyptian Museum and the Nile.',
          ar: 'إطلالات أيقونية على المتحف المصري والنيل.'
        }
      },
      {
        _id: 'fallback-2',
        name: {
          en: 'Old Cataract Hotel',
          ar: 'فندق أولد كتاركت'
        },
        slug: 'old-cataract-hotel',
        city: 'Aswan',
        stars: 5,
        amenities: ['Spa', 'Pool', 'River Views'],
        rooms: [],
        averagePricePerNight: 450,
        currency: 'USD',
        location: { type: 'Point', coordinates: [32.89, 24.09] },
        coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuCZwKmd43EKRJWnh42H8H8If7vI2DawM4Ixv4CHfOATWdBUZCjihjQ9y3i6akbgrMCt_BbPvP5p4DB1g62dQAjsGVg0hEz7gS4jqTyPbEB0os0lKwvyt-0W7i3pIrxkOH_IuOBq2OKpnxSAZWMPYY6Hb6eW1q_6YC3o-fvGNMYs3psLncMhqLGm_zUiwqzPSgDYLNaqudXv6hQKOPqazPFChJ_DUkjd7D20SK2KlEnxy_gByOsGvyFcUfZHfx9LKUaxLChqL8bJKDA",
        images: [],
        isActive: true,
        description: {
          en: 'Historical elegance where Agatha Christie wrote her classics.',
          ar: 'الأناقة التاريخية حيث كتبت أجاثا كريستي رواياتها الكلاسيكية.'
        }
      },
      {
        _id: 'fallback-3',
        name: {
          en: 'Four Seasons Sharm',
          ar: 'فور سيزونز شرم الشيخ'
        },
        slug: 'four-seasons-sharm',
        city: 'Sharm El Sheikh',
        stars: 5,
        amenities: ['Beach Access', 'Diving', 'Pool'],
        rooms: [],
        averagePricePerNight: 580,
        currency: 'USD',
        location: { type: 'Point', coordinates: [34.33, 27.85] },
        coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlrJqN_wvIsh_C9F1PJulR4kEjvzUytqUmb_APYDXi9MqjIXmJhHwA4IjYS0AI3gxDldNGvYITKzKbMPtCwgGNc4URFeAv25qUugA-csxO-6rCPf78D4GoUI44FfGzavHZ09EIcRrzGpnrqSlDXdns55Q8jJbvLiWPN8Ng6WOjppBBD_94zy8Dr_WO_rN6nwOG2-dmaD1CPU2KURyhS0g5EafgD3N0SZKOWdzMwdcjQ_cPFXaapzBoVHLRilUwc8X9mzfimR-QlV4",
        images: [],
        isActive: true,
        description: {
          en: 'Pristine reef access and ultra-modern amenities.',
          ar: 'وصول مباشر للشعاب المرجانية البكر ومرافق عصرية فاخرة.'
        }
      }
    ];
  }

  if (loading) {
    return (
      <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container mx-auto">
        <div className="text-center mb-16">
          <div className="h-4 bg-primary/20 rounded w-24 mx-auto animate-pulse"></div>
          <div className="h-8 bg-on-background/20 rounded w-48 mx-auto mt-4 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-gutter">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="h-96 bg-surface-container-low border border-outline-variant/30 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container mx-auto">
      <div className="text-center mb-16">
        <Text variant="label-md" className="text-primary font-bold tracking-widest">
          {t('subtitle')}
        </Text>
        <Heading level={2} variant="headline-md" className="mt-2 text-on-background">
          {t('title')}
        </Heading>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-gutter">
        {hotels.map((hotel) => {
          const hotelName = hotel.name[locale as 'en' | 'ar'] || hotel.name.en;
          const hotelDesc = hotel.description?.[locale as 'en' | 'ar'] || hotel.description?.en || '';
          
          return (
            <Card key={hotel._id} className="flex flex-col overflow-hidden p-0 bg-surface-container-lowest border border-outline-variant/30 shadow-card-rest hover:shadow-card-hover rounded-xl group">
              {/* Image section */}
              <div className="h-64 relative w-full">
                <Image
                  src={hotel.coverImage || hotel.images[0]}
                  alt={hotelName}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {hotel.stars === 5 && (
                  <Badge variant="primary" className="absolute top-4 right-4 bg-primary text-white font-bold px-3 py-1 rounded-full uppercase tracking-wider text-[10px]">
                    {t('topPick')}
                  </Badge>
                )}
              </div>

              {/* Content section */}
              <div className="p-6 flex flex-col flex-1">
                <Heading level={4} variant="headline-sm" className="text-lg md:text-xl font-semibold mb-2">
                  {hotelName}
                </Heading>
                <Text variant="body-md" className="mb-6 flex-grow text-on-surface-variant">
                  {hotelDesc}
                </Text>
                
                <div className="flex justify-between items-center mt-auto border-t border-outline-variant/20 pt-4">
                  <span className="text-primary font-bold text-sm md:text-base">
                    {t('pricePerNight', { price: hotel.averagePricePerNight, currency: hotel.currency })}
                  </span>
                  <Link
                    href={`/hotels/${hotel.slug}`}
                    className="flex items-center gap-1 text-secondary text-sm font-semibold hover:underline"
                  >
                    <span>{t('explore')}</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
