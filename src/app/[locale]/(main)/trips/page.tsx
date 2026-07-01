'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  Plus,
  MapPin,
  Calendar,
  Users,
  Sparkles,
  SquarePen,
  Trash2,
  ArrowRight,
  Loader2,
  Search,
  Clock,
  Hotel,
} from 'lucide-react';
import { tripsApi } from '@/lib/api/trips';
import { Trip } from '@/types/trip';
import { cn } from '@/lib/utils/cn';

// ─── Helper: يتعامل مع أي حقل ممكن يرجع من الـ API كـ string أو {en, ar} ─────

function localize(value: unknown, locale: 'en' | 'ar'): string {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'object') {
    const obj = value as Record<string, string>;
    return obj[locale] ?? obj.en ?? Object.values(obj)[0] ?? '';
  }
  return String(value);
}

// ─── Localization ─────────────────────────────────────────────────────────────

const dict = {
  en: {
    title: 'My Journeys',
    subtitle: 'Your AI-assisted itineraries and past explorations.',
    newTrip: 'Generate New Trip',
    search: 'Search trips...',
    empty: "No trips yet. Generate your first AI itinerary!",
    resumePlanning: 'Resume Planning',
    viewDetails: 'View Details',
    aiGenerated: 'AI Planning',
    travelers: 'Travelers',
    nights: 'nights',
    loading: 'Loading your journeys...',
    errorLoad: 'Failed to load trips. Please try again.',
    update: 'Update',
    delete: 'Delete',
    aiHotels: 'AI Hotel Recommendations',
    budget: { budget: 'Budget', 'mid-range': 'Mid-range', luxury: 'Luxury' },
  },
  ar: {
    title: 'رحلاتي',
    subtitle: 'خططك المدعومة بالذكاء الاصطناعي ورحلاتك السابقة.',
    newTrip: 'إنشاء رحلة جديدة',
    search: 'ابحث عن رحلة...',
    empty: 'لا توجد رحلات بعد. أنشئ أول خطة رحلة بالذكاء الاصطناعي!',
    resumePlanning: 'استكمال التخطيط',
    viewDetails: 'عرض التفاصيل',
    aiGenerated: 'ذكاء اصطناعي',
    travelers: 'مسافرون',
    nights: 'ليالي',
    loading: 'جاري تحميل رحلاتك...',
    errorLoad: 'فشل تحميل الرحلات. يرجى المحاولة مرة أخرى.',
    update: 'تعديل',
    delete: 'حذف',
    aiHotels: 'توصيات فنادق بالذكاء الاصطناعي',
    budget: { budget: 'اقتصادية', 'mid-range': 'متوسطة', luxury: 'فاخرة' },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ─── Trip Card ────────────────────────────────────────────────────────────────

function TripCard({
  trip,
  t,
  locale,
  onDelete,
}: {
  trip: Trip;
  t: typeof dict['en'];
  locale: 'en' | 'ar';
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const busy = deleting;

  const handleUpdate = () => {
    router.push(`/trips/${trip._id}/edit`);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await tripsApi.deleteTrip(trip._id);
      onDelete(trip._id);
    } finally {
      setDeleting(false);
    }
  };

  // استخراج آمن للنصوص اللي ممكن تكون object {en, ar}
  const title = localize(trip.title, locale);
  const destination = localize(trip.destination, locale);
  const summary = localize(trip.summary, locale);
  const budgetRaw = localize(trip.budget, locale) || (typeof trip.budget === 'string' ? trip.budget : '');
  // مفتاح الترجمة الثابت لازم يكون بالإنجليزي الأصلي (budget/mid-range/luxury) عشان الـ dict
  const budgetKey = (typeof trip.budget === 'string' ? trip.budget : localize(trip.budget, 'en')) as keyof typeof t.budget;

  return (
    <div className="bg-surface border border-outline-variant/25 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col sm:flex-row group rounded-2xl">
      {/* Image */}
      <div className="relative w-full sm:w-36 md:w-44 lg:w-48 h-36 sm:h-auto shrink-0 bg-surface-container overflow-hidden">
        {trip.imageUrl ? (
          <img
            src={trip.imageUrl}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-tertiary/10">
            <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-primary/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        {trip.isAIGenerated && (
          <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex items-center gap-1 bg-primary text-on-primary text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full">
            <Sparkles size={10} />
            {t.aiGenerated}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 gap-2.5 sm:gap-3 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-sm sm:text-base md:text-lg font-bold text-on-surface line-clamp-1">
              {title}
            </h3>
            <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5 truncate">
              <MapPin size={11} className="text-primary shrink-0" />
              <span className="truncate">{destination}</span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              onClick={handleUpdate}
              disabled={busy}
              title={t.update}
              className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors border-none bg-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SquarePen size={15} />
            </button>
            <button
              onClick={handleDelete}
              disabled={busy}
              title={t.delete}
              className="p-1.5 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors border-none bg-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            </button>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] sm:text-xs text-on-surface-variant">
          <span className="flex items-center gap-1">
            <Clock size={11} className="text-outline shrink-0" />
            {trip.duration} {t.nights}
          </span>
          <span className="flex items-center gap-1">
            <Users size={11} className="text-outline shrink-0" />
            {trip.travelers} {t.travelers}
          </span>
          {trip.createdAt && (
            <span className="flex items-center gap-1">
              <Calendar size={11} className="text-outline shrink-0" />
              {formatDate(trip.createdAt)}
            </span>
          )}
        </div>

        {summary && (
          <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">{summary}</p>
        )}

        {/* Footer */}
        <div className="mt-auto flex flex-col gap-2 pt-2 border-t border-outline-variant/15">
          <div className="flex items-center justify-between gap-2">
            <span className={cn(
              'text-[10px] font-bold px-2 sm:px-2.5 py-1 rounded-full border whitespace-nowrap',
              budgetKey === 'luxury' && 'bg-tertiary/10 text-tertiary border-tertiary/20',
              budgetKey === 'mid-range' && 'bg-primary/10 text-primary border-primary/20',
              budgetKey === 'budget' && 'bg-success/10 text-success border-success/20',
            )}>
              {t.budget[budgetKey] ?? budgetRaw}
            </span>

            <button
              onClick={() => router.push(`/trips/${trip._id}`)}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors border-none bg-transparent cursor-pointer whitespace-nowrap"
            >
              <span>
                {trip.status === 'draft' ? t.resumePlanning : t.viewDetails}
              </span>
              <ArrowRight size={13} className="shrink-0" />
            </button>
          </div>

          {/* زرار توصيات الفنادق بالذكاء الاصطناعي */}
          <button
            onClick={() => router.push(`/hotels/recommendations?tripId=${trip._id}`)}
            className="flex items-center justify-center gap-1.5 text-xs font-semibold text-tertiary bg-tertiary/10 hover:bg-tertiary/20 border border-tertiary/20 transition-colors rounded-lg py-2 cursor-pointer"
          >
            <Hotel size={13} className="shrink-0" />
            <span>{t.aiHotels}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyTripsPage() {
  const locale = useLocale() as 'en' | 'ar';
  const router = useRouter();
  const t = dict[locale] ?? dict.en;
  const isRtl = locale === 'ar';

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await tripsApi.getTrips({ limit: 50 });
      const tripsData = (res as any).data ?? [];
      setTrips(Array.isArray(tripsData) ? tripsData : []);
    } catch {
      setError(t.errorLoad);
    } finally {
      setLoading(false);
    }
  }, [t.errorLoad]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleDelete = (id: string) => {
    setTrips((prev) => prev.filter((tr) => tr._id !== id));
  };

  const filtered = trips.filter((tr) => {
    if (!search) return true;
    const title = localize(tr.title, locale).toLowerCase();
    const destination = localize(tr.destination, locale).toLowerCase();
    const q = search.toLowerCase();
    return title.includes(q) || destination.includes(q);
  });

  return (
    <main
      className="flex-1 w-full bg-background text-on-surface pt-20 sm:pt-24 md:pt-28 pb-16 sm:pb-20 px-4 sm:px-6 md:px-8 max-w-[1280px] mx-auto"
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8 md:mb-10">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-on-surface">
            {t.title}
          </h1>
          <p className="mt-1.5 sm:mt-2 text-sm md:text-base text-on-surface-variant max-w-lg">{t.subtitle}</p>
        </div>
        <button
          onClick={() => router.push('/trips/new')}
          className="bg-primary text-on-primary hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 w-full sm:w-auto shrink-0 rounded-xl shadow-sm"
        >
          <Plus size={18} />
          <span className="font-semibold text-sm">{t.newTrip}</span>
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center justify-stretch sm:justify-end mb-5 sm:mb-6">
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.search}
            className="w-full pl-9 text-sm bg-surface border border-outline-variant/30 rounded-xl py-2.5 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-24 gap-3 text-on-surface-variant">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm text-center">{t.loading}</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-24 gap-3 text-center px-4">
          <p className="text-sm text-error">{error}</p>
          <button
            onClick={fetchTrips}
            className="bg-primary text-on-primary hover:bg-primary/90 transition-colors px-4 py-2 text-sm rounded-xl"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-24 gap-4 text-center px-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-surface-container border border-outline-variant/30 flex items-center justify-center">
            <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-outline" />
          </div>
          <p className="text-sm text-on-surface-variant">{t.empty}</p>
          <button
            onClick={() => router.push('/trips/new')}
            className="bg-primary text-on-primary hover:bg-primary/90 transition-colors flex items-center gap-2 px-5 py-2.5 text-sm rounded-xl"
          >
            <Plus size={15} />
            {t.newTrip}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-4">
          {filtered.map((trip) => (
            <TripCard
              key={trip._id}
              trip={trip}
              t={t}
              locale={locale}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </main>
  );
}