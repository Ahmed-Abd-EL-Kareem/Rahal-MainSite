'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, MapPin, Sparkles, Loader2, Plus, Trash2, ArrowRight, Hotel, Wallet, Calendar, Users, Clock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { tripsApi } from '@/lib/api/trips';
import { Trip } from '@/types/trip';
import { getLocaleQueryKey } from '@/lib/hooks/useLocaleQuery';

const ITEMS_PER_PAGE = 12;

function localize(value: unknown, locale: 'en' | 'ar'): string {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'object') {
    const obj = value as Record<string, string>;
    return obj[locale] ?? obj.en ?? Object.values(obj)[0] ?? '';
  }
  return String(value);
}

const BUDGETS: { value: 'budget' | 'mid-range' | 'luxury'; variant: 'success' | 'primary' | 'tertiary' }[] = [
  { value: 'budget', variant: 'success' },
  { value: 'mid-range', variant: 'primary' },
  { value: 'luxury', variant: 'tertiary' },
];

const TripCard = ({
  trip,
  locale,
  t,
  onDelete,
}: {
  trip: Trip;
  locale: 'en' | 'ar';
  t: any;
  onDelete: (id: string) => void;
}) => {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await tripsApi.deleteTrip(trip._id);
      onDelete(trip._id);
    } finally {
      setDeleting(false);
    }
  };

  const title = localize(trip.title, locale);
  const destination = localize(trip.destination, locale);
  const summary = localize(trip.summary, locale);
  const budgetKey = (typeof trip.budget === 'string' ? trip.budget : localize(trip.budget, 'en'));
  const budgetInfo = BUDGETS.find(b => b.value === budgetKey) ?? BUDGETS[1];

  return (
    <div
      className="group bg-surface-container-lowest rounded-2xl border border-outline-variant/25 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full min-w-0 cursor-pointer"
      onClick={() => router.push(`/${locale}/trips/${trip._id}`)}
    >
      {/* Image - 16:9 aspect ratio */}
      <div className="relative aspect-video overflow-hidden rounded-t-2xl">
        {trip.imageUrl ? (
          <Image
            src={trip.imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-tertiary/10 flex items-center justify-center">
            <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-primary/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        {trip.isAIGenerated && (
          <span className="absolute top-3 left-3 flex items-center gap-1 bg-primary text-on-primary text-[9px] font-bold px-2 py-0.5 rounded-full">
            <Sparkles size={10} />
            {t('aiGenerated')}
          </span>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDelete();
          }}
          disabled={deleting}
          aria-label="Delete trip"
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 space-y-3">
        {/* Destination + Title */}
        <div className="flex items-start gap-2">
          <MapPin className="text-primary shrink-0 mt-0.5" size={14} />
          <h3 className="font-display text-base font-bold text-on-surface line-clamp-1 flex-1 min-w-0">{title}</h3>
        </div>
        <p className="text-sm text-on-surface-variant line-clamp-1">{destination}</p>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-container text-on-surface-variant rounded-md border border-outline-variant/20 text-[10px] font-semibold">
            <Clock size={10} className="text-primary shrink-0" />
            {trip.duration} {t('nights')}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-container text-on-surface-variant rounded-md border border-outline-variant/20 text-[10px] font-semibold">
            <Users size={10} className="text-primary shrink-0" />
            {trip.travelers} {t('travelers')}
          </span>
          <span className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border',
            budgetInfo.variant === 'success' && 'bg-success/10 text-success border-success/20',
            budgetInfo.variant === 'primary' && 'bg-primary/10 text-primary border-primary/20',
            budgetInfo.variant === 'tertiary' && 'bg-tertiary/10 text-tertiary border-tertiary/20',
          )}>
            {t('budget.' + budgetKey) ?? budgetKey}
          </span>
        </div>

        {/* Summary */}
        {summary && (
          <p className="text-xs text-on-surface-variant line-clamp-2 flex-1">{summary}</p>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/15 mt-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/${locale}/trips/${trip._id}`);
            }}
            className={cn(
              'w-full flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors border-none bg-transparent cursor-pointer whitespace-nowrap',
              'bg-primary/5 hover:bg-primary/10 rounded-lg py-2 px-3'
            )}
          >
            <span>{t('details')}</span>
            <ArrowRight size={14} className="shrink-0" />
          </button>

          <button
            onClick={() => router.push(`/${locale}/hotels/recommendations?tripId=${trip._id}`)}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-tertiary bg-tertiary/10 hover:bg-tertiary/20 border border-tertiary/20 transition-colors rounded-lg py-2 cursor-pointer"
          >
            <Hotel size={12} className="shrink-0" />
            <span>{t('aiHotels')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Skeleton for loading state
function TripCardSkeleton() {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/25 overflow-hidden shadow-sm flex flex-col h-full animate-pulse">
      <div className="aspect-video bg-surface-container-highest" />
      <div className="flex-1 flex flex-col p-4 space-y-3">
        <div className="h-4 bg-surface-container-highest rounded w-3/4" />
        <div className="h-3 bg-surface-container-highest rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-5 bg-surface-container-highest rounded-full px-3 w-20" />
          <div className="h-5 bg-surface-container-highest rounded-full px-3 w-24" />
          <div className="h-5 bg-surface-container-highest rounded-full px-3 w-24" />
        </div>
        <div className="h-8 bg-surface-container-highest rounded flex-1" />
        <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/15 mt-auto">
          <div className="h-10 bg-primary/10 rounded-lg" />
          <div className="h-10 bg-tertiary/10 rounded-lg border border-tertiary/20" />
        </div>
      </div>
    </div>
  );
}

// Empty State
const EmptyState = ({ locale, t }: { locale: 'en' | 'ar'; t: any }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 gap-4 text-center px-4">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-surface-container border border-outline-variant/30 flex items-center justify-center">
        <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-outline" />
      </div>
      <p className="text-sm text-on-surface-variant">{t('empty')}</p>
      <Link href={`/${locale}/trips/generate`}>
        <button className="bg-primary text-on-primary hover:bg-primary/90 transition-colors flex items-center gap-2 px-5 py-2.5 text-sm rounded-xl">
          <Plus size={15} />
          {t('newTrip')}
        </button>
      </Link>
    </div>
  );
};

// Error State
const ErrorState = ({ error, onRetry, t }: { error: string; onRetry: () => void; t: any }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 gap-3 text-center px-4">
      <p className="text-sm text-error">{error}</p>
      <button
        onClick={onRetry}
        className="bg-primary text-on-primary hover:bg-primary/90 transition-colors px-4 py-2 text-sm rounded-xl"
      >
        {t('retry')}
      </button>
    </div>
  );
};

export default function MyTripsPage() {
  const locale = useLocale() as 'en' | 'ar';
  const router = useRouter();
  const t = useTranslations('trips');
  const isRtl = locale === 'ar';

  const [page, setPage] = useState(1);

  const { data: tripsQueryResponse, isLoading, error, refetch } = useQuery({
    queryKey: getLocaleQueryKey(['trips', { page, limit: ITEMS_PER_PAGE }], locale),
    queryFn: () => tripsApi.getTrips({ page, limit: ITEMS_PER_PAGE }),
    placeholderData: (previousData) => previousData,
  });

  const rawTrips = tripsQueryResponse?.data ?? [];
  const trips = rawTrips;
  const totalCount = tripsQueryResponse?.pagination?.total ?? rawTrips.length;
  const totalPages = tripsQueryResponse?.pagination?.totalPages ?? 1;

  const handleDelete = useCallback((id: string) => {
    refetch();
  }, [refetch]);

  React.useEffect(() => {
    if (!isLoading && trips.length === 0 && page > 1) {
      setPage(1);
    }
  }, [trips, isLoading, page]);

  return (
    <main
      className="flex-1 w-full bg-background text-on-surface pt-28 pb-20 min-h-screen"
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
    >
      {/* Compact Hero Banner - matching hotels page */}
      <section className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop mb-8">
        <div className="relative rounded-xl bg-surface-container-low border border-outline-variant/20 overflow-hidden p-4 md:p-6 shadow-md">
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
            <h1 className="font-display text-xl md:text-2xl font-semibold text-on-surface leading-tight">
              {t('title')}
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {t('subtitle')}
            </p>
            <Link href={`/${locale}/trips/generate`} className="inline-flex items-center gap-2 mt-4 mx-auto px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm hover:shadow">
              <Plus size={16} />
              {t('newTrip')}
            </Link>
          </div>
        </div>
      </section>

      {/* Trips Grid */}
      <section className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
              <TripCardSkeleton key={i} />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <EmptyState locale={locale} t={t} />
        ) : error ? (
          <ErrorState error={error.message} onRetry={() => refetch()} t={t} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {trips.map((trip) => (
                <TripCard
                  key={trip._id}
                  trip={trip}
                  locale={locale}
                  t={t}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={t('previous') ?? 'Previous'}
                >
                  <ChevronLeft size={20} className={isRtl ? 'rotate-180' : ''} />
                </button>
                <span className="text-sm font-medium text-on-surface-variant min-w-[80px] text-center">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={t('next') ?? 'Next'}
                >
                  <ChevronRight size={20} className={isRtl ? 'rotate-180' : ''} />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}