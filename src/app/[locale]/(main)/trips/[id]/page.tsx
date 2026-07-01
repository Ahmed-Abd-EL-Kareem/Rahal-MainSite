'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  MapPin, Clock, Users, Wallet, Sparkles, ArrowLeft, Loader2,
  Utensils, Bed, Lightbulb, ChevronDown, ChevronUp, Calendar,
  Hotel,
} from 'lucide-react';
import { tripsApi } from '@/lib/api/trips';
import { Trip, TripDay } from '@/types/trip';
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

export default function TripDetailPage() {
  const router = useRouter();
  const params = useParams();
  const locale = useLocale() as 'en' | 'ar';
  const isRtl = locale === 'ar';

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<number>(1);

  useEffect(() => {
    const id = params?.id as string;
    if (!id) return;
    tripsApi.getTripById(id)
      .then((res) => {
        setTrip((res as any).data ?? null);
      })
      .catch(() => setError('Failed to load trip.'))
      .finally(() => setLoading(false));
  }, [params?.id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <div className="flex flex-col items-center gap-3 text-on-surface-variant">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm">Loading trip...</span>
      </div>
    </div>
  );

  if (error || !trip) return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-error">{error ?? 'Trip not found.'}</p>
        <button
          onClick={() => router.push('/trips')}
          className="bg-primary text-on-primary hover:bg-primary/90 transition-colors px-4 py-2 text-sm rounded-xl"
        >
          Back to My Trips
        </button>
      </div>
    </div>
  );

  // استخراج آمن للنصوص اللي ممكن تكون object {en, ar}
  const title = localize(trip.title, locale);
  const destination = localize(trip.destination, locale);
  const summary = localize(trip.summary, locale);
  const budget = localize(trip.budget, locale) || (typeof trip.budget === 'string' ? trip.budget : '');

  return (
    <main
      className="flex-1 w-full bg-background text-on-surface pt-20 sm:pt-24 pb-16 sm:pb-20"
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
    >
      {/* Hero */}
      <div className="relative w-full h-52 sm:h-64 md:h-80 bg-surface-container overflow-hidden">
        {trip.imageUrl ? (
          <img src={trip.imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center">
            <MapPin className="w-12 h-12 sm:w-16 sm:h-16 text-primary/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => router.push('/trips')}
          className="absolute top-3 sm:top-4 left-3 sm:left-4 flex items-center gap-2 bg-black/40 hover:bg-black/60 text-white text-xs font-semibold px-3 py-2 rounded-lg backdrop-blur-sm transition-colors border-none cursor-pointer"
        >
          <ArrowLeft size={14} />
          {locale === 'ar' ? 'رجوع' : 'Back'}
        </button>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
          {trip.isAIGenerated && (
            <span className="inline-flex items-center gap-1 bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full mb-2">
              <Sparkles size={10} />
              AI Generated
            </span>
          )}
          <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight">
            {title}
          </h1>
          <p className="text-white/70 text-sm mt-1 flex items-center gap-1">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{destination}</span>
          </p>
        </div>
      </div>

      <div className="max-w-[1080px] mx-auto px-4 sm:px-6 md:px-8 mt-6 sm:mt-8 flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">

        {/* Left: Days */}
        <div className="flex-1 min-w-0 w-full">
          {summary && (
            <div className="bg-surface border border-outline-variant/25 rounded-2xl shadow-sm p-4 sm:p-5 mb-6">
              <p className="text-sm text-on-surface-variant leading-relaxed">{summary}</p>
            </div>
          )}

          {/* زرار توصيات الفنادق بالذكاء الاصطناعي - نسخة موبايل فوق الأيام */}
          <button
            onClick={() => router.push(`/hotels/recommendations?tripId=${trip._id}`)}
            className="lg:hidden w-full flex items-center justify-center gap-2 text-sm font-bold text-on-primary bg-primary hover:bg-primary/90 transition-colors rounded-xl py-3 mb-6 cursor-pointer"
          >
            <Hotel size={16} />
            {locale === 'ar' ? 'توصيات فنادق بالذكاء الاصطناعي' : 'AI Hotel Recommendations'}
          </button>

          <h2 className="font-display text-lg font-bold text-on-surface mb-4">
            {locale === 'ar' ? 'خطة الرحلة' : 'Itinerary'}
          </h2>

          <div className="flex flex-col gap-3">
            {trip.days.map((day: TripDay) => {
              const dayTitle = localize(day.title, locale);
              const dayAccommodation = localize(day.accommodation, locale);
              const dayTips = localize(day.tips, locale);

              return (
                <div
                  key={day.day}
                  className="bg-surface border border-outline-variant/25 rounded-2xl shadow-sm overflow-hidden"
                >
                  {/* Day header */}
                  <button
                    onClick={() => setExpandedDay(expandedDay === day.day ? 0 : day.day)}
                    className="w-full flex items-center justify-between gap-2 p-4 sm:p-5 text-left cursor-pointer border-none bg-transparent hover:bg-surface-container/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm shrink-0">
                        {day.day}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs text-outline font-semibold">
                          {locale === 'ar' ? `اليوم ${day.day}` : `Day ${day.day}`}
                        </span>
                        <p className="text-sm font-bold text-on-surface truncate">{dayTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      {day.estimatedCost > 0 && (
                        <span className="hidden sm:inline text-xs font-bold text-primary whitespace-nowrap">
                          {trip.currency} {day.estimatedCost.toLocaleString()}
                        </span>
                      )}
                      {expandedDay === day.day
                        ? <ChevronUp size={16} className="text-outline" />
                        : <ChevronDown size={16} className="text-outline" />
                      }
                    </div>
                  </button>

                  {/* Day content */}
                  {expandedDay === day.day && (
                    <div className="px-4 sm:px-5 pb-5 flex flex-col gap-4 border-t border-outline-variant/20">

                      {day.estimatedCost > 0 && (
                        <span className="sm:hidden text-xs font-bold text-primary mt-4">
                          {trip.currency} {day.estimatedCost.toLocaleString()}
                        </span>
                      )}

                      {/* Activities */}
                      {day.activities?.length > 0 && (
                        <div className={cn(day.estimatedCost > 0 ? 'sm:mt-4' : 'mt-4')}>
                          <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-2">
                            {locale === 'ar' ? 'الأنشطة' : 'Activities'}
                          </h4>
                          <ul className="flex flex-col gap-2">
                            {day.activities.map((act, i) => (
                              <li key={i} className="flex gap-2 text-sm text-on-surface-variant">
                                <span className="text-primary shrink-0 mt-0.5">•</span>
                                {localize(act, locale)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Meals */}
                      {day.meals?.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Utensils size={11} />
                            {locale === 'ar' ? 'الوجبات' : 'Meals'}
                          </h4>
                          <ul className="flex flex-col gap-1">
                            {day.meals.map((meal, i) => (
                              <li key={i} className="text-xs text-on-surface-variant">{localize(meal, locale)}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Accommodation */}
                      {dayAccommodation && (
                        <div>
                          <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Bed size={11} />
                            {locale === 'ar' ? 'الإقامة' : 'Accommodation'}
                          </h4>
                          <p className="text-xs text-on-surface-variant">{dayAccommodation}</p>
                        </div>
                      )}

                      {/* Tips */}
                      {dayTips && (
                        <div className="bg-tertiary/5 border border-tertiary/15 rounded-lg p-3">
                          <h4 className="text-xs font-bold text-tertiary mb-1 flex items-center gap-1">
                            <Lightbulb size={11} />
                            {locale === 'ar' ? 'نصيحة' : 'Tip'}
                          </h4>
                          <p className="text-xs text-on-surface-variant">{dayTips}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Summary card */}
        <div className="w-full lg:w-72 shrink-0 lg:sticky lg:top-24 flex flex-col gap-4">
          <div className="bg-surface border border-outline-variant/25 rounded-2xl shadow-sm p-4 sm:p-5 flex flex-col gap-4">
            <h3 className="font-display text-base font-bold text-on-surface border-b border-outline-variant/20 pb-3">
              {locale === 'ar' ? 'ملخص الرحلة' : 'Trip Summary'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 text-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-surface-container border border-outline-variant/25 flex items-center justify-center shrink-0">
                  <MapPin size={14} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-outline font-bold uppercase block">
                    {locale === 'ar' ? 'الوجهة' : 'Destination'}
                  </span>
                  <span className="text-on-surface font-semibold truncate block">{destination}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-surface-container border border-outline-variant/25 flex items-center justify-center shrink-0">
                  <Clock size={14} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-outline font-bold uppercase block">
                    {locale === 'ar' ? 'المدة' : 'Duration'}
                  </span>
                  <span className="text-on-surface font-semibold">
                    {trip.duration} {locale === 'ar' ? 'ليالي' : 'nights'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-surface-container border border-outline-variant/25 flex items-center justify-center shrink-0">
                  <Users size={14} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-outline font-bold uppercase block">
                    {locale === 'ar' ? 'المسافرون' : 'Travelers'}
                  </span>
                  <span className="text-on-surface font-semibold">{trip.travelers}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-surface-container border border-outline-variant/25 flex items-center justify-center shrink-0">
                  <Wallet size={14} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-outline font-bold uppercase block">
                    {locale === 'ar' ? 'الميزانية' : 'Budget'}
                  </span>
                  <span className="text-on-surface font-semibold capitalize">{budget}</span>
                </div>
              </div>
            </div>

            {trip.estimatedTotalCost > 0 && (
              <div className="border-t border-outline-variant/20 pt-4 flex flex-wrap justify-between items-baseline gap-1">
                <span className="text-sm font-bold text-on-surface">
                  {locale === 'ar' ? 'التكلفة التقديرية' : 'Est. Total Cost'}
                </span>
                <span className="font-display text-lg sm:text-xl font-extrabold text-primary whitespace-nowrap">
                  {trip.currency} {trip.estimatedTotalCost.toLocaleString()}
                </span>
              </div>
            )}

            {trip.interests?.length > 0 && (
              <div className="border-t border-outline-variant/20 pt-4">
                <span className="text-[10px] text-outline font-bold uppercase block mb-2">
                  {locale === 'ar' ? 'الاهتمامات' : 'Interests'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {trip.interests.map((i, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-1 bg-surface-container border border-outline-variant/25 rounded-full text-on-surface-variant capitalize whitespace-nowrap">
                      {localize(i, locale)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* زرار توصيات الفنادق بالذكاء الاصطناعي - نسخة ديسكتوب */}
          <button
            onClick={() => router.push(`/hotels/recommendations?tripId=${trip._id}`)}
            className="hidden lg:flex items-center justify-center gap-2 text-sm font-bold text-on-primary bg-primary hover:bg-primary/90 transition-colors rounded-xl py-3 cursor-pointer"
          >
            <Hotel size={16} />
            {locale === 'ar' ? 'توصيات فنادق بالذكاء الاصطناعي' : 'AI Hotel Recommendations'}
          </button>
        </div>
      </div>
    </main>
  );
}