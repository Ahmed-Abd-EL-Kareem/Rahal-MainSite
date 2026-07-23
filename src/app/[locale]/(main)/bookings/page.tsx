'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search, CalendarDays, Sparkles, AlertTriangle, RefreshCw, ArrowRight, 
  ChevronDown, ChevronUp, Filter, X
} from 'lucide-react';
import { useMyBookingsQuery } from '@/hooks/useBookings';
import BookingCard from '@/components/bookings/BookingCard';
import BookingSkeleton from '@/components/bookings/BookingSkeleton';
import Link from 'next/link';
import { getLocalized, type LocalizedString } from '@/lib/utils/localized';
import { Pagination } from '@/components/ui/Pagination';
import { cn } from '@/lib/utils/cn';

const PAGE_SIZE = 10;

const sortOptions = [
  { value: '-createdAt', label: 'sort.newest' },
  { value: 'createdAt', label: 'sort.oldest' },
  { value: 'checkIn', label: 'sort.checkInAsc' },
  { value: '-checkIn', label: 'sort.checkInDesc' },
  { value: 'totalPrice', label: 'sort.priceAsc' },
  { value: '-totalPrice', label: 'sort.priceDesc' },
] as const;

type TabValue = 'all' | 'upcoming' | 'completed' | 'canceled';

function getTabParams(tab: TabValue) {
  switch (tab) {
    case 'upcoming':
      return { status: 'pending' };
    case 'completed':
      return { status: 'completed' };
    case 'canceled':
      return { status: 'cancelled' };
    case 'all':
    default:
      return { status: undefined };
  }
}

export default function MyBookingsPage() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('bookings');
  const isRtl = locale === 'ar';

  // URL-synced state
  const [page, setPage] = useState(() => parseInt(searchParams.get('page') || '1', 10));
  const [sort, setSort] = useState(searchParams.get('sort') || '-createdAt');
  const [statusFilter, setStatusFilter] = useState<TabValue>(
    (searchParams.get('status') as TabValue) || 'all'
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
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

  // Build API params from current state
  const tabParams = getTabParams(statusFilter);
  const apiParams = {
    page,
    limit: PAGE_SIZE,
    sort,
    search: searchQuery || undefined,
    ...tabParams,
  };

  const { data: response, isLoading, isError, refetch } = useMyBookingsQuery(apiParams);
  const bookings = response?.data || [];
  const pagination = response?.pagination;
  
  // Calculate totalPages from total count instead of relying on backend's totalPages
  const totalItems = pagination?.total || bookings.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const totalBookings = totalItems;

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Sync URL when state changes (but not on initial load)
  const [initialized, setInitialized] = useState(false);
  const prevStateRef = useRef({ page, sort, statusFilter, searchQuery });

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      return;
    }

    // Only sync URL if state actually changed
    const prev = prevStateRef.current;
    const current = { page, sort, statusFilter, searchQuery };
    
    if (prev.page !== current.page || prev.sort !== current.sort || 
        prev.statusFilter !== current.statusFilter || prev.searchQuery !== current.searchQuery) {
      prevStateRef.current = current;
      
      const params = new URLSearchParams(searchParams);
      if (page > 1) params.set('page', String(page));
      else params.delete('page');
      
      if (sort !== '-createdAt') params.set('sort', sort);
      else params.delete('sort');
      
      if (statusFilter !== 'all') params.set('status', statusFilter);
      else params.delete('status');
      
      if (searchQuery) params.set('search', searchQuery);
      else params.delete('search');
      
      router.replace(`/bookings?${params.toString()}`, { scroll: false });
    }
  }, [page, sort, statusFilter, searchQuery, router, searchParams, initialized]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [statusFilter, searchQuery, sort]);

  const hasAswanBooking = bookings.some((b) => {
    const hotelObj = typeof b.hotel === 'object' ? b.hotel : null;
    const city = getLocalized(hotelObj?.city as LocalizedString, locale);
    return city.toLowerCase().includes('aswan');
  });

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
  };

  const handleTabChange = (tab: TabValue) => {
    setStatusFilter(tab);
  };

  const handleClearSearch = () => {
    setSearchInput('');
  };

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

      {/* Filter Tabs, Search & Sort */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-outline-variant/30 pb-6">
        {/* Tabs */}
        <div className="flex gap-8 overflow-x-auto no-scrollbar scroll-smooth">
          {(['all', 'upcoming', 'completed', 'canceled'] as const).map((tab) => {
            const isActive = statusFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={cn(
                  'relative pb-4 text-sm font-semibold transition-all duration-200 shrink-0 cursor-pointer',
                  isActive 
                    ? 'text-primary' 
                    : 'text-on-surface-variant hover:text-primary'
                )}
              >
                {t(`tabs.${tab}`)}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="bg-surface-container-low px-10 sm:px-12 py-2.5 rounded-xl border border-outline-variant/30 w-full outline-none text-on-surface placeholder-on-surface-variant/50 focus:ring-0 focus:border-primary transition-all"
            />
            {searchInput && (
              <button
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-error transition-colors"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => document.getElementById('sort-dropdown')?.classList.toggle('hidden')}
              className="flex items-center gap-2 bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/30 text-sm font-medium text-on-surface hover:border-primary transition-all"
              aria-haspopup="listbox"
              aria-expanded={false}
            >
              <Filter size={16} />
              <span>{t(sortOptions.find(o => o.value === sort)?.label || 'sort.newest')}</span>
              <ChevronDown size={16} className="transition-transform" />
            </button>
            <ul 
              id="sort-dropdown"
              className="hidden absolute right-0 mt-2 w-56 bg-surface border border-outline-variant/30 rounded-xl shadow-lg overflow-hidden z-20"
              role="listbox"
            >
              {sortOptions.map((option) => (
                <li key={option.value} role="option" aria-selected={sort === option.value}>
                  <button
                    onClick={() => handleSortChange(option.value)}
                    className={cn(
                      'w-full px-4 py-2.5 text-sm text-left transition-colors',
                      sort === option.value
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-on-surface hover:bg-surface-container-low'
                    )}
                  >
                    {t(option.label)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
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
      ) : bookings.length === 0 ? (
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
            <ArrowRight size={16} className={isRtl ? 'rotate-180' : ''} />
          </Link>
        </div>
      ) : (
        <>
          {/* Bookings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bookings.map((booking) => (
              <BookingCard key={booking._id} booking={booking} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              onPageChange={setPage} 
              className="mt-10"
            />
          )}
        </>
      )}

      {/* AI Insight Chip (Shows conditionally if there are bookings) */}
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