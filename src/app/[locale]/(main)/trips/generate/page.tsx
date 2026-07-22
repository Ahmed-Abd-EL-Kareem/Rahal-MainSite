'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  MapPin, Clock, Users, Wallet, Sparkles, ArrowRight, Loader2, Plus,
} from 'lucide-react';
import { tripsApi } from '@/lib/api/trips';
import { cn } from '@/lib/utils/cn';

export default function GenerateTripPage() {
  const router = useRouter();
  const locale = useLocale() as 'en' | 'ar';
  const isRtl = locale === 'ar';
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const t = useTranslations('generateTrip');
  const commonT = useTranslations('common');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isAuthenticated, authLoading, router, locale]);

  if (authLoading || !isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(4);
  const [travelers, setTravelers] = useState(1);
  const [budget, setBudget] = useState('mid-range');
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const INTERESTS = ['history', 'food', 'nature', 'adventure', 'culture', 'beach', 'shopping', 'wellness'];

  const BUDGETS = [
    { value: 'budget', label: t('budget.budget'), desc: t('budgetDescs.budget') },
    { value: 'mid-range', label: t('budget.mid-range'), desc: t('budgetDescs.mid-range') },
    { value: 'luxury', label: t('budget.luxury'), desc: t('budgetDescs.luxury') },
  ];

  const EGYPT_CITIES = locale === 'ar'
    ? ["القاهرة", "الأقصر", "أسوان", "الغردقة", "شرم الشيخ", "الإسكندرية", "مرسى علم", "دهب"]
    : ["Cairo", "Luxor", "Aswan", "Hurghada", "Sharm El Sheikh", "Alexandria", "Marsa Alam", "Dahab"];

  const toggleInterest = (interest: string) =>
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );

  const handleDurationChange = (next: number) => {
    setDuration(Math.max(1, Math.min(30, next)));
  };

  const handleSubmit = async () => {
    if (!destination.trim() || duration < 1) return;
    setLoading(true);
    setError(null);

    try {
      const res = await tripsApi.generateTrip({
        destination,
        duration,
        budget,
        travelers,
        interests,
        language: locale,
      });
      const trip = (res as any).data?.trip;
      if (trip?._id) router.push(`/trips/${trip._id}`);
    } catch (err: any) {
      setError(err.message ?? 'Failed to generate trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="flex-1 w-full bg-background text-on-surface pt-24 sm:pt-28 pb-16 sm:pb-20 px-4 sm:px-6 md:px-8 max-w-[860px] mx-auto"
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
    >
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-primary" />
          </div>
          <span className="text-xs font-bold text-primary tracking-widest uppercase">AI Trip Generator</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-on-surface leading-tight">
          {t('title')}
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          {t('subtitle')}
        </p>
      </div>

      <div className="flex flex-col gap-5 sm:gap-6">

        {/* Destination */}
        <div className="bg-surface border border-outline-variant/25 rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col gap-4">
          <label className="flex items-center gap-2 text-sm font-bold text-on-surface">
            <MapPin size={16} className="text-primary shrink-0" />
            {t('destination')}
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder={t('destinationPlaceholder')}
            className="w-full bg-surface-container rounded-lg border border-outline-variant/30 px-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50 transition-colors"
          />
          <div className="flex flex-wrap gap-2">
            {EGYPT_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => setDestination(city)}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer font-medium whitespace-nowrap',
                  destination === city
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container text-on-surface-variant border-outline-variant/30 hover:border-primary hover:text-on-surface'
                )}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Duration & Travelers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-surface border border-outline-variant/25 rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col gap-4">
<label className="flex items-center gap-2 text-sm font-bold text-on-surface">
              <Clock size={16} className="text-primary shrink-0" />
              {t('duration')}
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleDurationChange(duration - 1)}
                className="w-10 h-10 rounded-lg bg-surface-container border border-outline-variant/30 flex items-center justify-center text-on-surface font-bold text-lg hover:border-primary transition-colors cursor-pointer shrink-0"
              >
                −
              </button>
              <span className="font-display text-2xl font-extrabold text-on-surface min-w-[2rem] text-center">{duration}</span>
              <button
                onClick={() => handleDurationChange(duration + 1)}
                className="w-10 h-10 rounded-lg bg-surface-container border border-outline-variant/30 flex items-center justify-center text-on-surface font-bold text-lg hover:border-primary transition-colors cursor-pointer shrink-0"
              >
                +
              </button>
            </div>
          </div>

          <div className="bg-surface border border-outline-variant/25 rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col gap-4">
<label className="flex items-center gap-2 text-sm font-bold text-on-surface">
              <Users size={16} className="text-primary shrink-0" />
              {t('travelers')}
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setTravelers((t) => Math.max(1, t - 1))}
                className="w-10 h-10 rounded-lg bg-surface-container border border-outline-variant/30 flex items-center justify-center text-on-surface font-bold text-lg hover:border-primary transition-colors cursor-pointer shrink-0"
              >
                −
              </button>
              <span className="font-display text-2xl font-extrabold text-on-surface min-w-[2rem] text-center">{travelers}</span>
              <button
                onClick={() => setTravelers((t) => Math.min(20, t + 1))}
                className="w-10 h-10 rounded-lg bg-surface-container border border-outline-variant/30 flex items-center justify-center text-on-surface font-bold text-lg hover:border-primary transition-colors cursor-pointer shrink-0"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="bg-surface border border-outline-variant/25 rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col gap-4">
<label className="flex items-center gap-2 text-sm font-bold text-on-surface">
            <Wallet size={16} className="text-primary shrink-0" />
            {t('budget')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {BUDGETS.map((b) => (
              <button
                key={b.value}
                onClick={() => setBudget(b.value)}
                className={cn(
                  'p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1',
                  budget === b.value
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-outline-variant/25 bg-surface-container hover:border-primary/40'
                )}
              >
                <span className="text-sm font-bold text-on-surface">{b.label}</span>
                <span className="text-[11px] text-outline">{b.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="bg-surface border border-outline-variant/25 rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col gap-4">
          <label className="text-sm font-bold text-on-surface">
            {t('interests')}
          </label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer font-medium capitalize whitespace-nowrap',
                  interests.includes(interest)
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container text-on-surface-variant border-outline-variant/30 hover:border-primary hover:text-on-surface'
                )}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-error/10 border border-error/25 text-error rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!destination.trim() || loading}
          className={cn(
            'bg-primary text-on-primary hover:bg-primary/90 transition-colors rounded-xl w-full py-4 flex items-center justify-center gap-2 text-sm sm:text-base font-bold text-center shadow-sm',
            (!destination.trim() || loading) && 'opacity-50 cursor-not-allowed'
          )}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin shrink-0" />
              <span className="truncate">{t('generating')}</span>
            </>
          ) : (
            <>
              <Sparkles size={18} className="shrink-0" />
              {t('generateBtn')}
              <ArrowRight size={18} className="shrink-0" />
            </>
          )}
        </button>

      </div>
    </main>
  );
}