'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Search, CalendarDays, Sparkles, AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react';
import { useMyBookingsQuery } from '@/hooks/useBookings';
import BookingCard from '@/components/bookings/BookingCard';
import BookingSkeleton from '@/components/bookings/BookingSkeleton';
import Link from 'next/link';
import { getLocalized, type LocalizedString } from '@/lib/utils/localized';

export default function MyBookingsPage() {
  const locale = useLocale();
  const t = useTranslations('bookings');
  
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'completed' | 'canceled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    let active = true;
    requestAnimationFrame(() => {
      if (active) setMounted(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const { data: response, isLoading, isError, refetch } = useMyBookingsQuery();
  const bookings = response?.data || [];

  const now = new Date();

  // Client-side filtering logic matching check-in dates and status
  const filteredBookings = bookings.filter((booking) => {
    // 1. Search filter (by hotel name or city)
    const hotelObj = typeof booking.hotel === 'object' ? booking.hotel : null;
    const hotelName = hotelObj ? (locale === 'ar' ? hotelObj.name.ar : hotelObj.name.en) : '';
    const hotelCity = getLocalized(hotelObj?.city as LocalizedString, locale);
    
    const matchesSearch = 
      hotelName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      hotelCity.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (!matchesSearch) return false;

    // 2. Tab filter
    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);

    switch (activeTab) {
      case 'upcoming':
        // Booking is confirmed/pending and check-in is in the future
        return booking.status !== 'canceled' && checkInDate > now;
      case 'completed':
        // Booking is completed, or check-out is in the past
        return booking.status === 'completed' || (booking.status !== 'canceled' && checkOutDate < now);
      case 'canceled':
        // Booking is explicitly canceled
        return booking.status === 'canceled';
      case 'all':
      default:
        return true;
    }
  });

  const hasAswanBooking = bookings.some((b) => {
    const hotelObj = typeof b.hotel === 'object' ? b.hotel : null;
    const city = getLocalized(hotelObj?.city as LocalizedString, locale);
    return city.toLowerCase().includes('aswan');
  });

  return (
    <main className="pt-32 pb-20 px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto w-full flex-1 flex flex-col">
      {/* Header Section */}
      <header className="mb-12">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface mb-4">
          {t('title')}
        </h1>
        <p className="text-on-surface-variant max-w-2xl text-base md:text-lg font-body leading-relaxed">
          {t('subtitle')}
        </p>
      </header>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-outline-variant/30">
        {/* Tabs */}
        <div className="flex gap-8 overflow-x-auto no-scrollbar scroll-smooth">
          {(['all', 'upcoming', 'completed', 'canceled'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative pb-4 text-sm font-semibold transition-all duration-200 shrink-0 cursor-pointer ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {t(`tabs.${tab}`)}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/30 w-full md:w-80 mb-4 md:mb-0 shadow-sm focus-within:border-primary transition-all">
          <Search size={18} className="text-on-surface-variant" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-sm w-full outline-none text-on-surface placeholder-on-surface-variant/50 focus:ring-0"
          />
        </div>
      </div>

      {/* Bookings Content State Machine */}
      {!mounted || isLoading ? (
        // Loading State: Shimmer Grid
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BookingSkeleton />
          <BookingSkeleton />
          <BookingSkeleton />
          <BookingSkeleton />
        </div>
      ) : isError ? (
        // Error State
        <div className="flex flex-col items-center justify-center text-center p-12 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl my-8 max-w-lg mx-auto shadow-sm">
          <div className="bg-error/10 p-4 rounded-full text-error mb-4">
            <AlertTriangle size={32} />
          </div>
          <h3 className="font-display font-bold text-xl text-on-surface mb-2">
            {t('errorStateTitle')}
          </h3>
          <p className="text-on-surface-variant text-sm mb-6 max-w-sm">
            {t('errorStateSubtitle')}
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
          >
            <RefreshCw size={16} />
            {t('retry')}
          </button>
        </div>
      ) : filteredBookings.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center justify-center text-center p-12 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl my-8 max-w-lg mx-auto shadow-sm">
          <div className="bg-primary/10 p-4 rounded-full text-primary mb-4">
            <CalendarDays size={32} />
          </div>
          <h3 className="font-display font-bold text-xl text-on-surface mb-2">
            {t('emptyStateTitle')}
          </h3>
          <p className="text-on-surface-variant text-sm mb-6 max-w-sm">
            {t('emptyStateSubtitle')}
          </p>
          <Link
            href={`/${locale}/hotels`}
            className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-2"
          >
            {t('exploreHotels')}
            <ArrowRight size={16} className={locale === 'ar' ? 'rotate-180' : ''} />
          </Link>
        </div>
      ) : (
        // Bookings Grid
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBookings.map((booking) => (
            <BookingCard key={booking._id} booking={booking} />
          ))}
        </div>
      )}

      {/* AI Insight Chip (Shows conditionally if there are bookings, or always for premium feel) */}
      {!isLoading && !isError && bookings.length > 0 && (
        <div className="mt-16 bg-secondary text-on-secondary p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6 relative overflow-hidden shadow-lg border border-secondary/20">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="bg-primary text-on-primary p-3 rounded-xl shrink-0 shadow-md">
            <Sparkles size={24} className="fill-current" />
          </div>
          
          <div className="flex-1 text-center md:text-left rtl:md:text-right">
            <h4 className="font-display font-bold text-lg mb-1 text-white">
              {t('aiAssistant.title')}
            </h4>
            <p className="text-sm text-white/80 leading-relaxed">
              {hasAswanBooking 
                ? t('aiAssistant.recommendation') 
                : (locale === 'ar' 
                    ? 'بناءً على تاريخ حجزك القادم، هل ترغب في أن أخطط لك جولة إرشادية مميزة لاستكشاف المعالم الأثرية المحيطة؟' 
                    : 'Based on your upcoming stays, would you like me to curate a customized guided tour to explore the historical sights nearby?')}
            </p>
          </div>
          
          <Link
            href={`/${locale}/trips/new`}
            className="w-full md:w-auto px-6 py-3 bg-white text-secondary hover:bg-white/90 font-semibold rounded-lg text-sm text-center shadow-md transition-all active:scale-95 whitespace-nowrap"
          >
            {t('aiAssistant.cta')}
          </Link>
        </div>
      )}
    </main>
  );
}
