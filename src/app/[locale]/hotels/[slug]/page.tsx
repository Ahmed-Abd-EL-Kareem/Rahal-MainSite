'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { 
  Star, MapPin, Sparkles, Wifi, Shield, ShieldCheck, Dumbbell, Utensils, 
  Tv, Compass, Calendar, Users, Calculator, ArrowRight, AlertCircle, CheckCircle2,
  Heart
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { hotelsApi } from '@/lib/api/hotels';
import { bookingsApi } from '@/lib/api/bookings';
import { Hotel } from '@/types/hotel';

// Dynamically import Leaflet Map component with SSR disabled to prevent window is not defined exception
const HotelMap = dynamic(() => import('@/components/hotel/HotelMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-surface-container flex items-center justify-center border border-outline-variant/20 min-h-[320px] rounded-2xl">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  ),
});

export default function HotelDetailsPage() {
  const t = useTranslations('hotelDetail');
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // Booking Form States
  // const getTodayDateString = (offsetDays = 0) => {
    //   const d = new Date();
  //   d.setDate(d.getDate() + offsetDays);
  //   return d.toISOString().split('T')[0];
  // };

    // Fetch hotel details using TanStack Query
  const { data: hotel, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['hotel', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Invalid hotel slug');
      const response = await hotelsApi.getHotelBySlug(slug);
      if (!response || !response.data) throw new Error('Hotel not found');
      return response.data;
    },
    enabled: !!slug,
  });
  
  const error = queryError ? (queryError as Error).message || 'Hotel not found' : null;
  const getTodayDateString = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };
  
  const [checkIn, setCheckIn] = useState(getTodayDateString(1));
  const [checkOut, setCheckOut] = useState(getTodayDateString(4));
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  
  // Submit states
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rahal_favorites');
      if (saved) {
        try {
          setFavorites(JSON.parse(saved));
        } catch (e) {
          setFavorites([]);
        }
      }
    }
  }, []);

  const isFavorite = hotel ? favorites.includes(hotel._id) : false;

  const toggleFavorite = () => {
    if (!hotel) return;
    const next = isFavorite
      ? favorites.filter(id => id !== hotel._id)
      : [...favorites, hotel._id];
    setFavorites(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rahal_favorites', JSON.stringify(next));
    }
  };


  // Check login state on mount
  useEffect(() => {
    const tokenMatch = document.cookie.match(/(^|;\s*)token\s*=\s*([^;]*)/);
    setIsLoggedIn(!!tokenMatch);
  }, []);

  // Calculate pricing
  const checkNightsCount = () => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return isNaN(diffDays) ? 1 : diffDays;
  };

  const nights = checkNightsCount();
  const basePrice = hotel ? hotel.averagePricePerNight * nights * rooms : 0;
  const aiDiscount = Math.round(basePrice * 0.05); // 5% discount
  const taxes = Math.round(basePrice * 0.10); // 10% taxes
  const grandTotal = basePrice - aiDiscount + taxes;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setBookingError(t('loginRequired'));
      // Redirect to login after a brief pause
      setTimeout(() => {
        router.push('/login');
      }, 1500);
      return;
    }

    if (!hotel) return;

    setBookingLoading(true);
    setBookingError(null);
    setBookingSuccess(null);

    try {
      const body = {
        hotel: hotel._id,
        checkIn,
        checkOut,
        guests,
        rooms,
        specialRequests
      };

      const response = await bookingsApi.createBooking(body);
      if (response && response.data) {
        setBookingSuccess(t('successMessage', { id: response.data._id }));
        router.push(`/bookings/${response.data._id}/status`);
      }
    } catch (err: any) {
      console.error('Failed to submit booking:', err);
      setBookingError(err.message || t('errorMessage'));
    } finally {
      setBookingLoading(false);
    }
  };

  const getAmenityIcon = (amenityName: string) => {
    const name = amenityName.toLowerCase();
    if (name.includes('pool')) return <Compass size={16} />;
    if (name.includes('wifi') || name.includes('internet')) return <Wifi size={16} />;
    if (name.includes('spa') || name.includes('massage')) return <Shield size={16} />;
    if (name.includes('gym') || name.includes('fitness')) return <Dumbbell size={16} />;
    if (name.includes('restaurant') || name.includes('dining')) return <Utensils size={16} />;
    if (name.includes('bar') || name.includes('lounge')) return <Tv size={16} />;
    return <ShieldCheck size={16} />;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <main className="mx-auto max-w-container px-margin-mobile py-32 md:px-margin-desktop min-h-screen text-center">
        <AlertCircle className="mx-auto text-error" size={48} />
        <h1 className="font-display text-2xl font-bold mt-4 text-on-surface">Sanctuary Not Found</h1>
        <p className="text-on-surface-variant mt-2">The requested hotel details could not be retrieved.</p>
        <Link href="/hotels" className="inline-block mt-6">
          <Button variant="primary">Return to Hotels</Button>
        </Link>
      </main>
    );
  }

  const hotelName = hotel.name[locale as 'en' | 'ar'] || hotel.name.en;
  const hotelDesc = hotel.description?.[locale as 'en' | 'ar'] || hotel.description?.en || '';
  
  // Track image loading errors to fallback gracefully
  // const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const handleImageError = (idx: number) => {
    setImageErrors(prev => ({ ...prev, [idx]: true }));
  };

  const getPhotoSrc = (idx: number) => {
    const fallbacks = [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4db85b?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80"
    ];

    if (imageErrors[idx]) {
      return fallbacks[idx] || fallbacks[0];
    }

    const rawSrc = idx === 0 
      ? (hotel.coverImage || hotel.images[0]) 
      : hotel.images[idx];

    return rawSrc || fallbacks[idx] || fallbacks[0];
  };

  return (
    <main className="pt-28 pb-20 bg-background">
      {/* Hero Image Gallery Grid */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 aspect-[2.39/1] md:aspect-auto md:h-[550px]">
          {/* Main Large Image */}
          <div className="md:col-span-3 h-full relative group overflow-hidden rounded-2xl cursor-pointer">
            <img 
              src={getPhotoSrc(0)}
              alt={hotelName}
              onError={() => handleImageError(0)}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-300"></div>
          </div>
          
          {/* Side Thumbnail List */}
          <div className="hidden md:grid grid-rows-3 gap-4 h-full">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="relative overflow-hidden rounded-2xl cursor-pointer group">
                <img 
                  src={getPhotoSrc(idx)}
                  alt={`${hotelName} - view ${idx}`}
                  onError={() => handleImageError(idx)}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {idx === 3 && hotel.images.length > 4 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-semibold text-sm z-10 pointer-events-none">
                    + {hotel.images.length - 4} more
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Page Layout Content */}
      <section className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop mt-12 grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        
        {/* Left Side details */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Header Info details */}
          <div>
            <div className="flex items-center gap-1 text-primary mb-3">
              {Array.from({ length: hotel.stars }).map((_, i) => (
                <Star key={i} className="fill-primary" size={16} />
              ))}
              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider ml-2">
                {t('luxuryLandmark')}
              </span>
            </div>
            <div className="flex justify-between items-start gap-4 flex-wrap sm:flex-nowrap">
              <h1 className="font-display text-3xl md:text-5xl font-bold text-on-background mb-3">
                {hotelName}
              </h1>
              <button 
                onClick={toggleFavorite}
                className={`p-3 rounded-full border transition-all cursor-pointer ${
                  isFavorite 
                    ? 'bg-primary/10 border-primary text-primary shadow-sm'
                    : 'bg-white border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary shadow-sm'
                }`}
                aria-label="Add to favorites"
              >
                <Heart size={20} className={isFavorite ? "fill-primary" : ""} />
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-on-surface-variant font-medium text-sm">
              <MapPin className="text-primary shrink-0" size={16} />
              <p>{hotel.city}, Egypt</p>
            </div>
          </div>

          {/* AI Insight banner */}
          <div className="bg-secondary/5 rounded-2xl p-6 border border-secondary/10 flex gap-4 shadow-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-on-secondary-container rounded-full flex items-center justify-center flex-shrink-0 text-white shadow">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="font-display text-base font-bold text-secondary mb-1">
                {t('aiInsight')}
              </h4>
              <p className="text-on-surface-variant text-sm font-medium italic leading-relaxed">
                {locale === 'ar' 
                  ? `"غالباً ما يفضل المسافرون الغرف في الطوابق العليا للحصول على إطلالة نيلية غير محجوبة. تشير تحليلاتنا إلى حجز الجولات النهرية قبل 48 ساعة على الأقل."`
                  : `"Travelers often prefer rooms on upper floors for the most unobstructed views. Our data suggests booking local excursions at least 48 hours in advance for best accommodations."`}
              </p>
            </div>
          </div>

          {/* About description */}
          {hotelDesc && (
            <div className="space-y-4">
              <h3 className="font-display text-xl md:text-2xl font-bold text-on-surface border-b border-outline-variant/30 pb-3">
                {t('about')}
              </h3>
              <p className="font-body text-sm md:text-base text-on-surface-variant leading-relaxed">
                {hotelDesc}
              </p>
            </div>
          )}

          {/* Amenities grid */}
          <div className="space-y-6">
            <h3 className="font-display text-xl md:text-2xl font-bold text-on-surface border-b border-outline-variant/30 pb-3">
              {t('amenities')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {hotel.amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-container flex items-center justify-center rounded-xl text-primary border border-outline-variant/10">
                    {getAmenityIcon(amenity)}
                  </div>
                  <span className="text-sm font-bold text-on-surface">
                    {amenity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Room types table */}
          {hotel.rooms && hotel.rooms.length > 0 && (
            <div className="space-y-6">
              <h3 className="font-display text-xl md:text-2xl font-bold text-on-surface border-b border-outline-variant/30 pb-3">
                {t('roomTypes')}
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-outline-variant/20 shadow-sm">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-left">
                      <th className="p-4 text-xs font-bold text-outline uppercase tracking-wider border-b border-outline-variant/20">{t('roomTypeHeader')}</th>
                      <th className="p-4 text-xs font-bold text-outline uppercase tracking-wider border-b border-outline-variant/20">{t('sleepsHeader')}</th>
                      <th className="p-4 text-xs font-bold text-outline uppercase tracking-wider border-b border-outline-variant/20">{t('featuresHeader')}</th>
                      <th className="p-4 text-xs font-bold text-outline uppercase tracking-wider border-b border-outline-variant/20 text-right">{t('priceHeader')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {hotel.rooms.map((room, idx) => (
                      <tr key={idx} className="hover:bg-surface-container/30 transition-colors">
                        <td className="p-4">
                          <span className="font-bold text-on-surface block">{room.type}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-0.5 text-on-surface-variant">
                            {Array.from({ length: room.capacity }).map((_, i) => (
                              <Users key={i} size={14} />
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            <span className="text-[10px] font-bold bg-surface-container text-on-surface-variant px-2.5 py-0.5 rounded-md">
                              {room.capacity > 2 ? 'Family size' : 'Premium'}
                            </span>
                            <span className="text-[10px] font-bold bg-surface-container text-on-surface-variant px-2.5 py-0.5 rounded-md">
                              AC / Wi-Fi
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-right font-bold text-primary">
                          {room.pricePerNight.toLocaleString()} {hotel.currency || 'EGP'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Location Map with Leaflet */}
          <div className="space-y-6">
            <h3 className="font-display text-xl md:text-2xl font-bold text-on-surface border-b border-outline-variant/30 pb-3">
              {locale === 'ar' ? 'الموقع' : 'Location'}
            </h3>
            <div className="w-full h-80 rounded-2xl overflow-hidden relative border border-outline-variant/20 shadow-sm">
              {hotel.location?.coordinates && hotel.location.coordinates.length === 2 ? (
                <HotelMap 
                  latitude={hotel.location.coordinates[1]} 
                  longitude={hotel.location.coordinates[0]} 
                  hotelName={hotelName} 
                />
              ) : (
                <div className="w-full h-full bg-surface-container flex items-center justify-center">
                  <span className="text-sm text-on-surface-variant font-medium">No Location Coordinates Available</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sticky Sidebar form */}
        <div className="lg:col-span-4 sticky top-24 z-20">
          <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 md:p-8 shadow-lg space-y-6">
            
            {/* Header cost details */}
            <div className="flex justify-between items-end border-b border-outline-variant/20 pb-4">
              <div>
                <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block">
                  {t('startingFrom')}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-3xl font-bold text-on-background">
                    {hotel.averagePricePerNight.toLocaleString()}
                  </span>
                  <span className="text-xs text-on-surface-variant">{hotel.currency || 'EGP'} / night</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-secondary text-xs font-semibold">
                <Calculator size={14} />
                <span>{t('aiBestPrice')}</span>
              </div>
            </div>

            {/* Notification alert states */}
            {bookingSuccess && (
              <div className="p-4 bg-success/10 border border-success/20 rounded-xl flex items-start gap-3 text-success">
                <CheckCircle2 className="flex-shrink-0 mt-0.5" size={18} />
                <span className="text-xs font-semibold leading-relaxed">{bookingSuccess}</span>
              </div>
            )}

            {bookingError && (
              <div className="p-4 bg-error-container/20 border border-error-container/30 rounded-xl flex items-start gap-3 text-error">
                <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
                <span className="text-xs font-semibold leading-relaxed">{bookingError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleBookingSubmit} className="space-y-6">
              
              {/* Checkin / Checkout date pickers */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant block uppercase tracking-wider">
                    {t('checkIn')}
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-surface-container rounded-xl border border-transparent focus-within:border-secondary focus-within:bg-white transition-all">
                    <Calendar size={14} className="text-secondary shrink-0" />
                    <input 
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="bg-transparent border-none p-0 focus:ring-0 text-on-surface w-full text-xs font-bold"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant block uppercase tracking-wider">
                    {t('checkOut')}
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-surface-container rounded-xl border border-transparent focus-within:border-secondary focus-within:bg-white transition-all">
                    <Calendar size={14} className="text-secondary shrink-0" />
                    <input 
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="bg-transparent border-none p-0 focus:ring-0 text-on-surface w-full text-xs font-bold"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Guests Count Steppers */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant block uppercase tracking-wider">
                    {locale === 'ar' ? 'الضيوف' : 'Guests'}
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-surface-container rounded-xl border border-transparent focus-within:border-secondary focus-within:bg-white transition-all">
                    <Users size={14} className="text-secondary shrink-0" />
                    <input 
                      type="number"
                      min="1"
                      max="10"
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="bg-transparent border-none p-0 focus:ring-0 text-on-surface w-full text-xs font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant block uppercase tracking-wider">
                    {locale === 'ar' ? 'الغرف' : 'Rooms'}
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-surface-container rounded-xl border border-transparent focus-within:border-secondary focus-within:bg-white transition-all">
                    <Compass size={14} className="text-secondary shrink-0" />
                    <input 
                      type="number"
                      min="1"
                      max="5"
                      value={rooms}
                      onChange={(e) => setRooms(Number(e.target.value))}
                      className="bg-transparent border-none p-0 focus:ring-0 text-on-surface w-full text-xs font-bold"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Special request field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-on-surface-variant block uppercase tracking-wider">
                  {locale === 'ar' ? 'طلبات خاصة' : 'Special Requests'}
                </label>
                <textarea 
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder={locale === 'ar' ? 'مثال: سرير إضافي، وصول متأخر...' : 'e.g. late arrival, extra bed...'}
                  rows={2}
                  className="w-full p-3 bg-surface-container border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all text-xs font-medium text-on-surface"
                />
              </div>

              {/* Price Breakdown details */}
              <div className="pt-4 border-t border-outline-variant/20 space-y-3 text-sm">
                <div className="flex justify-between text-on-surface-variant">
                  <span className="font-medium text-xs">{t('priceNights', { price: `${hotel.averagePricePerNight.toLocaleString()} ${hotel.currency || 'EGP'}`, nights })}</span>
                  <span className="font-bold text-xs">{basePrice.toLocaleString()} {hotel.currency || 'EGP'}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span className="font-medium text-xs">{t('serviceFee')}</span>
                  <span className="font-bold text-xs text-success">-{aiDiscount.toLocaleString()} {hotel.currency || 'EGP'}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant border-b border-outline-variant/10 pb-3">
                  <span className="font-medium text-xs">{t('taxesAndFees')}</span>
                  <span className="font-bold text-xs">{taxes.toLocaleString()} {hotel.currency || 'EGP'}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-display text-base font-bold text-on-background">{t('total')}</span>
                  <span className="font-display text-lg font-bold text-on-background">{grandTotal.toLocaleString()} {hotel.currency || 'EGP'}</span>
                </div>
              </div>

              {/* Book Button */}
              <Button 
                type="submit" 
                variant="primary" 
                fullWidth
                disabled={bookingLoading}
                className="py-4 rounded-xl flex items-center justify-center gap-2 font-semibold shadow-md active:scale-95 transition-transform"
              >
                {bookingLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                    <span>{locale === 'ar' ? 'جاري الإرسال...' : 'Booking...'}</span>
                  </span>
                ) : (
                  <>
                    <span>{t('bookNow')}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
              <p className="text-center text-[10px] text-on-surface-variant font-medium">
                {t('disclaimer')}
              </p>
            </form>

          </div>
        </div>

      </section>
    </main>
  );
}
