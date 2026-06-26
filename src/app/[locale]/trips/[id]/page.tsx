'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  MapPin, Clock, Users, Wallet, Sparkles, ArrowLeft, Loader2,
  Utensils, Bed, Lightbulb, ChevronDown, ChevronUp, Calendar,
} from 'lucide-react';
import { tripsApi } from '@/lib/api/trips';
import { Trip, TripDay } from '@/types/trip';
import { cn } from '@/lib/utils/cn';

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
    <div className="flex items-center justify-center min-h-screen bg-bg px-4">
      <div className="flex flex-col items-center gap-3 text-ink2">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
        <span className="text-sm">Loading trip...</span>
      </div>
    </div>
  );

  if (error || !trip) return (
    <div className="flex items-center justify-center min-h-screen bg-bg px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-error">{error ?? 'Trip not found.'}</p>
        <button onClick={() => router.push('/trips')} className="btn-primary px-4 py-2 text-sm">
          Back to My Trips
        </button>
      </div>
    </div>
  );

  return (
    <main
      className="flex-1 w-full bg-bg text-ink1 pt-20 sm:pt-24 pb-16 sm:pb-20"
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
    >
      {/* Hero */}
      <div className="relative w-full h-52 sm:h-64 md:h-80 bg-surface2 overflow-hidden">
        {trip.imageUrl ? (
          <img src={trip.imageUrl} alt={trip.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand/20 to-accent/20 flex items-center justify-center">
            <MapPin className="w-12 h-12 sm:w-16 sm:h-16 text-brand/30" />
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
            <span className="inline-flex items-center gap-1 bg-brand text-bg text-[10px] font-bold px-2 py-0.5 rounded-full mb-2">
              <Sparkles size={10} />
              AI Generated
            </span>
          )}
          <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight">
            {trip.title}
          </h1>
          <p className="text-white/70 text-sm mt-1 flex items-center gap-1">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{trip.destination}</span>
          </p>
        </div>
      </div>

      <div className="max-w-[1080px] mx-auto px-4 sm:px-6 md:px-8 mt-6 sm:mt-8 flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">

        {/* Left: Days */}
        <div className="flex-1 min-w-0 w-full">
          {trip.summary && (
            <div className="card bg-surface1 border border-border p-4 sm:p-5 mb-6">
              <p className="text-sm text-ink2 leading-relaxed">{trip.summary}</p>
            </div>
          )}

          <h2 className="font-display text-lg font-bold text-ink1 mb-4">
            {locale === 'ar' ? 'خطة الرحلة' : 'Itinerary'}
          </h2>

          <div className="flex flex-col gap-3">
            {trip.days.map((day: TripDay) => (
              <div
                key={day.day}
                className="card bg-surface1 border border-border overflow-hidden"
              >
                {/* Day header */}
                <button
                  onClick={() => setExpandedDay(expandedDay === day.day ? 0 : day.day)}
                  className="w-full flex items-center justify-between gap-2 p-4 sm:p-5 text-left cursor-pointer border-none bg-transparent hover:bg-surface2/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-brand text-bg flex items-center justify-center font-bold text-sm shrink-0">
                      {day.day}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs text-ink3 font-semibold">
                        {locale === 'ar' ? `اليوم ${day.day}` : `Day ${day.day}`}
                      </span>
                      <p className="text-sm font-bold text-ink1 truncate">{day.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {day.estimatedCost > 0 && (
                      <span className="hidden sm:inline text-xs font-bold text-brand whitespace-nowrap">
                        {trip.currency} {day.estimatedCost.toLocaleString()}
                      </span>
                    )}
                    {expandedDay === day.day
                      ? <ChevronUp size={16} className="text-ink3" />
                      : <ChevronDown size={16} className="text-ink3" />
                    }
                  </div>
                </button>

                {/* Day content */}
                {expandedDay === day.day && (
                  <div className="px-4 sm:px-5 pb-5 flex flex-col gap-4 border-t border-border">

                    {/* Cost shown here on mobile since the header hides it */}
                    {day.estimatedCost > 0 && (
                      <span className="sm:hidden text-xs font-bold text-brand mt-4">
                        {trip.currency} {day.estimatedCost.toLocaleString()}
                      </span>
                    )}

                    {/* Activities */}
                    {day.activities.length > 0 && (
                      <div className={cn(day.estimatedCost > 0 ? 'sm:mt-4' : 'mt-4')}>
                        <h4 className="text-xs font-bold text-ink3 uppercase tracking-wider mb-2">
                          {locale === 'ar' ? 'الأنشطة' : 'Activities'}
                        </h4>
                        <ul className="flex flex-col gap-2">
                          {day.activities.map((act, i) => (
                            <li key={i} className="flex gap-2 text-sm text-ink2">
                              <span className="text-brand shrink-0 mt-0.5">•</span>
                              {act}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Meals */}
                    {day.meals.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-ink3 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Utensils size={11} />
                          {locale === 'ar' ? 'الوجبات' : 'Meals'}
                        </h4>
                        <ul className="flex flex-col gap-1">
                          {day.meals.map((meal, i) => (
                            <li key={i} className="text-xs text-ink2">{meal}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Accommodation */}
                    {day.accommodation && (
                      <div>
                        <h4 className="text-xs font-bold text-ink3 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Bed size={11} />
                          {locale === 'ar' ? 'الإقامة' : 'Accommodation'}
                        </h4>
                        <p className="text-xs text-ink2">{day.accommodation}</p>
                      </div>
                    )}

                    {/* Tips */}
                    {day.tips && (
                      <div className="bg-accent/5 border border-accent/15 rounded-lg p-3">
                        <h4 className="text-xs font-bold text-accent mb-1 flex items-center gap-1">
                          <Lightbulb size={11} />
                          {locale === 'ar' ? 'نصيحة' : 'Tip'}
                        </h4>
                        <p className="text-xs text-ink2">{day.tips}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Summary card */}
        <div className="w-full lg:w-72 shrink-0 lg:sticky lg:top-24">
          <div className="card bg-surface1 border border-border p-4 sm:p-5 flex flex-col gap-4">
            <h3 className="font-display text-base font-bold text-ink1 border-b border-border pb-3">
              {locale === 'ar' ? 'ملخص الرحلة' : 'Trip Summary'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 text-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-surface2 border border-border flex items-center justify-center shrink-0">
                  <MapPin size={14} className="text-brand" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-ink3 font-bold uppercase block">
                    {locale === 'ar' ? 'الوجهة' : 'Destination'}
                  </span>
                  <span className="text-ink1 font-semibold truncate block">{trip.destination}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-surface2 border border-border flex items-center justify-center shrink-0">
                  <Clock size={14} className="text-brand" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-ink3 font-bold uppercase block">
                    {locale === 'ar' ? 'المدة' : 'Duration'}
                  </span>
                  <span className="text-ink1 font-semibold">
                    {trip.duration} {locale === 'ar' ? 'ليالي' : 'nights'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-surface2 border border-border flex items-center justify-center shrink-0">
                  <Users size={14} className="text-brand" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-ink3 font-bold uppercase block">
                    {locale === 'ar' ? 'المسافرون' : 'Travelers'}
                  </span>
                  <span className="text-ink1 font-semibold">{trip.travelers}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-surface2 border border-border flex items-center justify-center shrink-0">
                  <Wallet size={14} className="text-brand" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-ink3 font-bold uppercase block">
                    {locale === 'ar' ? 'الميزانية' : 'Budget'}
                  </span>
                  <span className="text-ink1 font-semibold capitalize">{trip.budget}</span>
                </div>
              </div>
            </div>

            {trip.estimatedTotalCost > 0 && (
              <div className="border-t border-border pt-4 flex flex-wrap justify-between items-baseline gap-1">
                <span className="text-sm font-bold text-ink1">
                  {locale === 'ar' ? 'التكلفة التقديرية' : 'Est. Total Cost'}
                </span>
                <span className="font-display text-lg sm:text-xl font-extrabold text-brand whitespace-nowrap">
                  {trip.currency} {trip.estimatedTotalCost.toLocaleString()}
                </span>
              </div>
            )}

            {trip.interests.length > 0 && (
              <div className="border-t border-border pt-4">
                <span className="text-[10px] text-ink3 font-bold uppercase block mb-2">
                  {locale === 'ar' ? 'الاهتمامات' : 'Interests'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {trip.interests.map((i) => (
                    <span key={i} className="text-[10px] px-2 py-1 bg-surface2 border border-border rounded-full text-ink2 capitalize whitespace-nowrap">
                      {i}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}