import type { Metadata } from 'next';
import { generateHotelMetadata } from '@/lib/seo/metadata';
import { hotelsApi } from '@/lib/api/hotels';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const response = await hotelsApi.getHotelBySlug(slug);
    const hotel = response?.data;
    
    if (!hotel) {
      return generateHotelMetadata({
        hotelName: 'Hotel Not Found',
        hotelDescription: 'The requested hotel could not be found.',
        locale,
        slug,
      });
    }
    
    const hotelName = hotel.name[locale as 'en' | 'ar'] || hotel.name.en;
    const hotelDesc = hotel.description?.[locale as 'en' | 'ar'] || hotel.description?.en || '';
    
    return generateHotelMetadata({
      hotelName,
      hotelDescription: hotelDesc,
      locale,
      slug,
      price: hotel.averagePricePerNight,
      currency: hotel.currency,
      images: hotel.images,
      rating: hotel.stars,
      address: `${hotel.city}, Egypt`,
    });
  } catch {
    return generateHotelMetadata({
      hotelName: 'Hotel Not Found',
      hotelDescription: 'The requested hotel could not be found.',
      locale,
      slug,
    });
  }
}