'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Star, MapPin, Sparkles, Wifi, Shield, ShieldCheck, Dumbbell, Utensils, 
  Tv, Compass, Calendar, Users, Calculator, ArrowRight, AlertCircle, CheckCircle2,
  Heart
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { hotelsApi } from '@/lib/api/hotels';
import { Hotel, Room, RoomAvailability } from '@/types/hotel';
import { getLocaleQueryKey } from '@/lib/hooks/useLocaleQuery';
import { DateRangePicker } from '@/components/hotel/DateRangePicker';
import { RoomCard } from '@/components/hotel/RoomCard';
import { RoomSelectionSummary } from '@/components/hotel/RoomSelectionSummary';
import { useRoomsAvailability } from '@/hooks/useRoomsAvailability';
import { useCreateHoldMutation, useCreateCheckoutSessionFromHoldMutation, useCreateBookingMutation } from '@/hooks/useBookings';
import { RoomSelection } from '@/types/booking';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useAuth } from '@/components/providers/AuthProvider';
import { staggerContainer, slideUpFade, kenBurns, fadeIn } from '@/lib/animations/variants';

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
  const roomT = useTranslations('hotels.room');
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const reduceMotion = useReducedMotion();
  const { isAuthenticated } = useAuth();

  // Fetch hotel details using TanStack Query
  const { data: hotel, isLoading: loading, error: queryError } = useQuery({
    queryKey: getLocaleQueryKey(['hotel', slug], locale),
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
  const [selections, setSelections] = useState<Record<string, RoomSelection>>({});
  const [specialRequests, setSpecialRequests] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Mutations
  const createHold = useCreateHoldMutation();
  const createCheckoutSession = useCreateCheckoutSessionFromHoldMutation();
  const createBooking = useCreateBookingMutation();

  // Filter active rooms (defensive, backend already filters)
  const activeRooms = hotel?.rooms.filter(r => r.isActive) ?? [];

  // Fetch room availability
  const { data: availabilities, isLoading: availabilityLoading, refetch: refetchAvailability } = useRoomsAvailability(
    hotel?._id,
    checkIn,
    checkOut,
    activeRooms
  );

  // Refetch availability when dates change
  useEffect(() => {
    if (hotel?._id && checkIn && checkOut) {
      refetchAvailability();
    }
  }, [checkIn, checkOut, hotel?._id, refetchAvailability]);

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

  // Calculate pricing
  const checkNightsCount = () => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return isNaN(diffDays) ? 1 : diffDays;
  };

  const nights = checkNightsCount();

  const handleQuantityChange = (roomId: string, quantity: number) => {
    setSelections(prev => {
      if (quantity <= 0) {
        const { [roomId]: removed, ...rest } = prev;
        return rest;
      }
      const existing = prev[roomId];
      return {
        ...prev,
        [roomId]: {
          room: roomId,
          quantity,
          guests: existing?.guests ?? { adults: 1, children: 0 },
        },
      };
    });
  };

  const handleGuestsChange = (roomId: string, guests: { adults: number; children: number }) => {
    setSelections(prev => {
      const existing = prev[roomId];
      if (!existing) return prev;
      return {
        ...prev,
        [roomId]: { ...existing, guests },
      };
    });
  };

  const handleRemoveRoom = (roomId: string) => {
    setSelections(prev => {
      const { [roomId]: removed, ...rest } = prev;
      return rest;
    });
  };

  const handleBook = async () => {
    if (!isAuthenticated) {
      setBookingError(roomT('loginRequired'));
      setTimeout(() => router.push(`/${locale}/login`), 1500);
      return;
    }
    if (!hotel) return;

    setBookingError(null);

    try {
      const roomsPayload = Object.entries(selections).map(([roomId, selection]) => ({
        room: roomId,
        quantity: selection.quantity,
        guests: selection.guests,
      }));

      const totalGuests = roomsPayload.reduce(
        (sum, r) => sum + r.guests.adults + r.guests.children,
        0
      );

      const payload = {
        hotel: hotel._id,
        checkIn,
        checkOut,
        guests: totalGuests,
        rooms: roomsPayload,
        specialRequests,
      };

      const bookingResponse = await createBooking.mutateAsync(payload);
      
      if (bookingResponse?._id) {
        router.push(`/${locale}/bookings/${bookingResponse._id}`);
      }
    } catch (err: any) {
      console.error('Failed to create booking:', err);
      const message = err.response?.data?.message || err.message || roomT('roomNoLongerAvailable');
      setBookingError(message);
      refetchAvailability();
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
          <motion.div
            className="md:col-span-3 h-full relative group overflow-hidden rounded-2xl cursor-pointer"
            initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
            className="absolute inset-0"
            animate={reduceMotion ? {} : { scale: 1 }}
            transition={reduceMotion ? {} : { duration: 20, ease: 'linear' }}
            initial={reduceMotion ? {} : { scale: 1.08 }}
            style={{ overflow: 'hidden' }}
          >
            <img 
              src={getPhotoSrc(0)}
              alt={hotelName}
              onError={() => handleImageError(0)}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent group-hover:from-black/40 transition-all duration-700"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white text-left rtl:text-right">
              <span className="px-3 py-1 rounded-full font-bold text-[10px] tracking-wider mb-3 inline-block border border-primary/30 bg-primary/20 backdrop-blur-sm">
                {hotel.stars}\u2605 Luxury Landmark
              </span>
              <h1 className="font-display font-bold text-2xl md:text-4xl text-white mb-2 leading-tight">
                {hotelName}
              </h1>
              <p className="flex items-center gap-1.5 opacity-90 text-sm md:text-base font-medium">
                <MapPin size={18} className="text-primary shrink-0" />
                <span>{hotel.city}, Egypt</span>
              </p>
            </div>
          </motion.div>
          
          {/* Side Thumbnail List */}
          <motion.div
            className="hidden md:grid grid-rows-3 gap-4 h-full"
            initial={reduceMotion ? {} : { opacity: 0, x: 20 }}
            animate={reduceMotion ? {} : { opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            {[1, 2, 3].map((idx) => (
              <motion.div
                key={idx}
                className="relative overflow-hidden rounded-2xl cursor-pointer group"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Page Layout Content */}
      <section className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop mt-12 grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        
        {/* Left Side details */}
        <motion.div
          className="lg:col-span-8 space-y-12"
          initial={reduceMotion ? {} : { opacity: 0, x: -30 }}
          animate={reduceMotion ? {} : { opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          
          {/* Header Info details */}
          <motion.div
            initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            <div className="flex items-center gap-1 text-primary mb-3">
              {Array.from({ length: hotel.stars }).map((_, i) => (
                <Star key={i} className="fill-primary" size={16} />
              ))}
              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider ms-2">
                {t('luxuryLandmark')}
              </span>
            </div>
            <div className="flex justify-between items-start gap-4 flex-wrap sm:flex-nowrap">
              <h1 className="font-display text-3xl md:text-5xl font-bold text-on-background mb-3 tracking-[-0.02em] text-wrap-balance">
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
          </motion.div>

          {/* AI Insight banner */}
          <motion.div
            className="bg-secondary/5 rounded-2xl p-6 border border-secondary/10 flex gap-4 shadow-sm"
            initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-on-secondary-container rounded-full flex items-center justify-center flex-shrink-0 text-white shadow">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="font-display text-base font-bold text-secondary mb-1">
                {t('aiInsight')}
              </h4>
              <p className="text-on-surface-variant text-sm font-medium italic leading-relaxed">
                {t('aiInsightText')}
              </p>
            </div>
          </motion.div>

          {/* About description */}
          {hotelDesc && (
            <motion.div
              className="space-y-4"
              initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            >
              <h3 className="font-display text-xl md:text-2xl font-bold text-on-surface border-b border-outline-variant/30 pb-3">
                {t('about')}
              </h3>
              <p className="font-body text-sm md:text-base text-on-surface-variant leading-relaxed max-w-prose">
                {hotelDesc}
              </p>
            </motion.div>
          )}

          {/* Amenities grid */}
          <motion.div
            className="space-y-6"
            initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
          >
            <h3 className="font-display text-xl md:text-2xl font-bold text-on-surface border-b border-outline-variant/30 pb-3">
              {t('amenities')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {hotel.amenities.map((amenity, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: idx * 0.05 }}
                >
                  <div className="w-10 h-10 bg-surface-container flex items-center justify-center rounded-xl text-primary border border-outline-variant/10">
                    {getAmenityIcon(amenity)}
                  </div>
                  <span className="text-sm font-bold text-on-surface">
                    {amenity}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Room types with availability */}
          <motion.div
            className="space-y-6"
            initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl md:text-2xl font-bold text-on-surface">
                {t('roomTypes')}
              </h3>
              <DateRangePicker
                checkIn={checkIn}
                checkOut={checkOut}
                onCheckInChange={setCheckIn}
                onCheckOutChange={setCheckOut}
                minDate={getTodayDateString(0)}
                className="w-auto"
              />
            </div>

            {availabilityLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-surface-container rounded-xl h-48 border border-outline-variant/20" />
                ))}
              </div>
            ) : activeRooms && activeRooms.length > 0 ? (
              <motion.div
                className="space-y-4"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                custom={0}
              >
                {activeRooms.map((room, index) => {
                  const availability = availabilities?.find((a) => a.roomId === room._id);
                  const selection = selections[room._id] || null;
                  return (
                    <RoomCard
                      key={room._id}
                      room={room}
                      availability={availability}
                      selection={selection}
                      onChange={(newSelection) => {
                        if (newSelection) {
                          setSelections((prev) => ({
                            ...prev,
                            [room._id]: newSelection,
                          }));
                        } else {
                          handleRemoveRoom(room._id);
                        }
                      }}
                      index={index}
                    />
                  );
                })}
              </motion.div>
            ) : (
              <div className="text-center py-12 text-on-surface-variant">
                <p>{t('noRoomsAvailable')}</p>
              </div>
            )}
          </motion.div>

          {/* Location Map with Leaflet */}
          <motion.div
            className="space-y-6"
            initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.7 }}
          >
            <h3 className="font-display text-xl md:text-2xl font-bold text-on-surface border-b border-outline-variant/30 pb-3">
              {t('location')}
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
          </motion.div>
        </motion.div>

        {/* Right Sticky Sidebar - Room Selection Summary */}
        <motion.div
          className="lg:col-span-4 sticky top-24 z-20"
          initial={reduceMotion ? {} : { opacity: 0, x: 30 }}
          animate={reduceMotion ? {} : { opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
        >
          {bookingError && (
            <motion.div
              className="p-4 bg-error/10 border border-error/20 rounded-xl flex items-start gap-3 text-error mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
              <span className="text-xs font-semibold leading-relaxed">{bookingError}</span>
            </motion.div>
          )}
          <RoomSelectionSummary
            selections={selections}
            rooms={activeRooms}
            availabilities={availabilities || []}
            checkIn={checkIn}
            checkOut={checkOut}
            nights={nights}
            currency={hotel.currency || 'EGP'}
            onUpdateQuantity={handleQuantityChange}
            onUpdateGuests={handleGuestsChange}
            onRemove={handleRemoveRoom}
            onBook={handleBook}
            isBooking={createHold.isPending || createCheckoutSession.isPending || createBooking.isPending}
          />
        </motion.div>

      </section>
    </main>
  );
}