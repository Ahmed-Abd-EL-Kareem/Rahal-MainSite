'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  MapPin, Clock, Users, Wallet, Sparkles, ArrowRight, Loader2, Check,
  PenLine, Plus, Trash2, ChevronDown, ChevronUp, DollarSign,
} from 'lucide-react';
import { tripsApi } from '@/lib/api/trips';
import { cn } from '@/lib/utils/cn';

// ─── constants ────────────────────────────────────────────────────────────────
const INTERESTS = ['history', 'food', 'nature', 'adventure', 'culture', 'beach', 'shopping', 'wellness'];

const BUDGETS = [
  { value: 'budget',    label: 'Budget',    labelAr: 'اقتصادية', desc: 'Affordable stays & local eats',      descAr: 'إقامة اقتصادية ومطاعم محلية' },
  { value: 'mid-range', label: 'Mid-range', labelAr: 'متوسطة',   desc: 'Comfort without excess',             descAr: 'راحة بدون إسراف' },
  { value: 'luxury',    label: 'Luxury',    labelAr: 'فاخرة',    desc: 'Premium hotels & experiences',       descAr: 'فنادق وتجارب فاخرة' },
];

const EGYPT_CITIES = ['Cairo', 'Luxor', 'Aswan', 'Hurghada', 'Sharm El Sheikh', 'Alexandria', 'Marsa Alam', 'Dahab'];

// ─── types ────────────────────────────────────────────────────────────────────
type Mode = 'ai' | 'manual';

interface DayForm {
  day: number;
  title: string;
  activities: string;   // comma-separated → split on submit
  meals: string;        // comma-separated → split on submit
  accommodation: string;
  tips: string;
  estimatedCost: number;
  expanded: boolean;
}

const emptyDay = (dayNumber: number): DayForm => ({
  day: dayNumber,
  title: '',
  activities: '',
  meals: '',
  accommodation: '',
  tips: '',
  estimatedCost: 0,
  expanded: true,
});

// ─── component ────────────────────────────────────────────────────────────────
export default function CreateTripPage() {
  const router = useRouter();
  const locale  = useLocale() as 'en' | 'ar';
  const isRtl   = locale === 'ar';
  const { isAuthenticated, isLoading: authLoading } = useAuth();

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

  // mode
  const [mode, setMode] = useState<Mode>('ai');

  // shared fields
  const [destination, setDestination] = useState('');
  const [duration,    setDuration]    = useState(4);
  const [travelers,   setTravelers]   = useState(1);
  const [budget,      setBudget]      = useState('mid-range');
  const [interests,   setInterests]   = useState<string[]>([]);

  // manual-only fields
  const [title,              setTitle]              = useState('');
  const [imageUrl,           setImageUrl]           = useState('');
  const [summary,            setSummary]            = useState('');
  const [estimatedTotalCost, setEstimatedTotalCost] = useState(0);
  const [currency,           setCurrency]           = useState<'EGP' | 'USD'>('EGP');
  const [status,             setStatus]             = useState<'draft' | 'saved'>('draft');
  const [days,               setDays]               = useState<DayForm[]>([emptyDay(1)]);

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // ─── helpers ────────────────────────────────────────────────────────────────
  const toggleInterest = (interest: string) =>
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );

  const addDay = () =>
    setDays((prev) => [...prev, emptyDay(prev.length + 1)]);

  const removeDay = (index: number) =>
    setDays((prev) =>
      prev.filter((_, i) => i !== index).map((d, i) => ({ ...d, day: i + 1 }))
    );

  const updateDay = (index: number, field: keyof DayForm, value: any) =>
    setDays((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: value } : d))
    );

  const toggleDayExpanded = (index: number) =>
    updateDay(index, 'expanded', !days[index].expanded);

  // auto-sync duration ↔ days count
  const handleDurationChange = (next: number) => {
    setDuration(next);
    if (mode === 'manual') {
      setDays((prev) => {
        if (next > prev.length) {
          const toAdd = Array.from({ length: next - prev.length }, (_, i) => emptyDay(prev.length + i + 1));
          return [...prev, ...toAdd];
        }
        return prev.slice(0, next).map((d, i) => ({ ...d, day: i + 1 }));
      });
    }
  };

  // ─── submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!destination.trim() || duration < 1) return;
    setLoading(true);
    setError(null);

    try {
      if (mode === 'ai') {
        const res = await tripsApi.generateTrip({
          destination, duration, budget, travelers, interests, language: locale,
        });
        const trip = (res as any).data?.trip;
        if (trip?._id) router.push(`/trips/${trip._id}`);

      } else {
        // serialize days: split comma strings → arrays, drop ui-only `expanded`
        const serializedDays = days.map(({ expanded, activities, meals, ...rest }) => ({
          ...rest,
          activities: activities.split(',').map((s) => s.trim()).filter(Boolean),
          meals:      meals.split(',').map((s) => s.trim()).filter(Boolean),
        }));

        const res = await tripsApi.createTrip({
          title:              title.trim() || destination,
          destination:        destination.trim(),
          duration,
          budget,
          travelers,
          interests,
          language:           locale,
          imageUrl:           imageUrl.trim() || undefined,
          summary:            summary.trim()  || undefined,
          days:               serializedDays,
          estimatedTotalCost,
          currency,
          status,
          isAIGenerated:      false,
        });
        const trip = (res as any).data?.trip;
        if (trip?._id) router.push(`/trips/${trip._id}`);
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── render ─────────────────────────────────────────────────────────────────
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
          <span className="text-xs font-bold text-primary tracking-widest uppercase">Trip Planner</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-on-surface leading-tight">
          {locale === 'ar' ? 'أنشئ رحلتك' : 'Plan Your Journey'}
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          {locale === 'ar' ? 'اختر طريقة إنشاء رحلتك.' : 'Choose how you want to create your trip.'}
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-surface border border-outline-variant/25 rounded-xl mb-6 w-full sm:w-fit overflow-x-auto">
        {(['ai', 'manual'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              'flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap',
              mode === m ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            )}
          >
            {m === 'ai' ? <Sparkles size={14} className="shrink-0" /> : <PenLine size={14} className="shrink-0" />}
            {m === 'ai'
              ? (locale === 'ar' ? 'توليد بالذكاء الاصطناعي' : 'AI Generate')
              : (locale === 'ar' ? 'إنشاء يدوي' : 'Create Manually')}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-5 sm:gap-6">

        {/* ── Manual: Trip Meta ─────────────────────────────────────────────── */}
        {mode === 'manual' && (
          <div className="bg-surface border border-outline-variant/25 rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col gap-4">
            <label className="flex items-center gap-2 text-sm font-bold text-on-surface">
              <PenLine size={16} className="text-primary shrink-0" />
              {locale === 'ar' ? 'تفاصيل الرحلة' : 'Trip Details'}
            </label>

            {/* Title */}
            <Field label={locale === 'ar' ? 'عنوان الرحلة' : 'Trip Title'}>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder={locale === 'ar' ? 'مثال: رحلة أسوان الرائعة' : 'e.g. Amazing Aswan Getaway'}
                className="w-full bg-surface-container rounded-lg border border-outline-variant/30 px-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50 transition-colors" />
            </Field>

            {/* Image URL */}
            <Field label={locale === 'ar' ? 'رابط الصورة (اختياري)' : 'Image URL (optional)'}>
              <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..." className="w-full bg-surface-container rounded-lg border border-outline-variant/30 px-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50 transition-colors" />
            </Field>

            {/* Summary */}
            <Field label={locale === 'ar' ? 'ملخص (اختياري)' : 'Summary (optional)'}>
              <textarea value={summary} onChange={(e) => setSummary(e.target.value)}
                rows={3} placeholder={locale === 'ar' ? 'وصف مختصر...' : 'A short description...'}
                className="w-full bg-surface-container rounded-lg border border-outline-variant/30 px-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50 transition-colors resize-none" />
            </Field>

            {/* Cost + Currency + Status row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label={locale === 'ar' ? 'التكلفة الإجمالية' : 'Est. Total Cost'}>
                <div className="relative">
                  <DollarSign size={14} className="absolute top-1/2 -translate-y-1/2 start-3 text-outline" />
                  <input type="number" min={0} value={estimatedTotalCost}
                    onChange={(e) => setEstimatedTotalCost(Number(e.target.value))}
                    className="w-full bg-surface-container rounded-lg border border-outline-variant/30 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors ps-8" />
                </div>
              </Field>

              <Field label={locale === 'ar' ? 'العملة' : 'Currency'}>
                <select value={currency} onChange={(e) => setCurrency(e.target.value as 'EGP' | 'USD')}
                  className="w-full bg-surface-container rounded-lg border border-outline-variant/30 px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors">
                  <option value="EGP">EGP</option>
                  <option value="USD">USD</option>
                </select>
              </Field>

              <Field label={locale === 'ar' ? 'الحالة' : 'Status'}>
                <select value={status} onChange={(e) => setStatus(e.target.value as 'draft' | 'saved')}
                  className="w-full bg-surface-container rounded-lg border border-outline-variant/30 px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors">
                  <option value="draft">{locale === 'ar' ? 'مسودة' : 'Draft'}</option>
                  <option value="saved">{locale === 'ar' ? 'محفوظة' : 'Saved'}</option>
                </select>
              </Field>
            </div>
          </div>
        )}

        {/* Destination */}
        <div className="bg-surface border border-outline-variant/25 rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col gap-4">
          <label className="flex items-center gap-2 text-sm font-bold text-on-surface">
            <MapPin size={16} className="text-primary shrink-0" />
            {locale === 'ar' ? 'الوجهة' : 'Destination'}
          </label>
          <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)}
            placeholder={locale === 'ar' ? 'مثال: الأقصر، القاهرة...' : 'e.g. Luxor, Cairo...'}
            className="w-full bg-surface-container rounded-lg border border-outline-variant/30 px-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50 transition-colors" />
          <div className="flex flex-wrap gap-2">
            {EGYPT_CITIES.map((city) => (
              <button key={city} onClick={() => setDestination(city)}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer font-medium whitespace-nowrap',
                  destination === city
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container text-on-surface-variant border-outline-variant/30 hover:border-primary hover:text-on-surface'
                )}>
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
              {locale === 'ar' ? 'المدة (ليالي)' : 'Duration (nights)'}
            </label>
            <div className="flex items-center gap-4">
              <StepBtn onClick={() => handleDurationChange(Math.max(1, duration - 1))}>−</StepBtn>
              <span className="font-display text-2xl font-extrabold text-on-surface min-w-[2rem] text-center">{duration}</span>
              <StepBtn onClick={() => handleDurationChange(Math.min(30, duration + 1))}>+</StepBtn>
            </div>
          </div>

          <div className="bg-surface border border-outline-variant/25 rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col gap-4">
            <label className="flex items-center gap-2 text-sm font-bold text-on-surface">
              <Users size={16} className="text-primary shrink-0" />
              {locale === 'ar' ? 'عدد المسافرين' : 'Travelers'}
            </label>
            <div className="flex items-center gap-4">
              <StepBtn onClick={() => setTravelers((t) => Math.max(1, t - 1))}>−</StepBtn>
              <span className="font-display text-2xl font-extrabold text-on-surface min-w-[2rem] text-center">{travelers}</span>
              <StepBtn onClick={() => setTravelers((t) => Math.min(20, t + 1))}>+</StepBtn>
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="bg-surface border border-outline-variant/25 rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col gap-4">
          <label className="flex items-center gap-2 text-sm font-bold text-on-surface">
            <Wallet size={16} className="text-primary shrink-0" />
            {locale === 'ar' ? 'الميزانية' : 'Budget'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {BUDGETS.map((b) => (
              <button key={b.value} onClick={() => setBudget(b.value)}
                className={cn(
                  'p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1',
                  budget === b.value
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-outline-variant/25 bg-surface-container hover:border-primary/40'
                )}>
                <span className="text-sm font-bold text-on-surface">{locale === 'ar' ? b.labelAr : b.label}</span>
                <span className="text-[11px] text-outline">{locale === 'ar' ? b.descAr : b.desc}</span>
                {budget === b.value && <Check size={14} className="text-primary mt-1" />}
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="bg-surface border border-outline-variant/25 rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col gap-4">
          <label className="text-sm font-bold text-on-surface">
            {locale === 'ar' ? 'الاهتمامات (اختياري)' : 'Interests (optional)'}
          </label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => (
              <button key={interest} onClick={() => toggleInterest(interest)}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer font-medium capitalize whitespace-nowrap',
                  interests.includes(interest)
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container text-on-surface-variant border-outline-variant/30 hover:border-primary hover:text-on-surface'
                )}>
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* ── Manual: Days ─────────────────────────────────────────────────── */}
        {mode === 'manual' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-on-surface">
                {locale === 'ar' ? 'أيام الرحلة' : 'Itinerary Days'}
              </h2>
              <button onClick={addDay}
                className="flex items-center gap-1.5 text-xs font-bold text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0">
                <Plus size={13} />
                {locale === 'ar' ? 'إضافة يوم' : 'Add Day'}
              </button>
            </div>

            {days.map((day, index) => (
              <div key={index} className="bg-surface border border-outline-variant/25 rounded-2xl shadow-sm overflow-hidden">

                {/* Day Header */}
                <div className="flex items-center justify-between gap-2 px-4 sm:px-5 py-4 cursor-pointer"
                  onClick={() => toggleDayExpanded(index)}>
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-extrabold shrink-0">
                      {day.day}
                    </div>
                    <span className="text-sm font-bold text-on-surface truncate">
                      {day.title || (locale === 'ar' ? `اليوم ${day.day}` : `Day ${day.day}`)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {day.estimatedCost > 0 && (
                      <span className="hidden sm:inline text-xs font-bold text-primary whitespace-nowrap">
                        {currency} {day.estimatedCost.toLocaleString()}
                      </span>
                    )}
                    {days.length > 1 && (
                      <button onClick={(e) => { e.stopPropagation(); removeDay(index); }}
                        className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error/10 transition-all cursor-pointer">
                        <Trash2 size={14} />
                      </button>
                    )}
                    {day.expanded ? <ChevronUp size={16} className="text-outline" /> : <ChevronDown size={16} className="text-outline" />}
                  </div>
                </div>

                {/* Day Body */}
                {day.expanded && (
                  <div className="px-4 sm:px-5 pb-5 flex flex-col gap-3 border-t border-outline-variant/20 pt-4">

                    <Field label={locale === 'ar' ? 'عنوان اليوم' : 'Day Title'}>
                      <input type="text" value={day.title}
                        onChange={(e) => updateDay(index, 'title', e.target.value)}
                        placeholder={locale === 'ar' ? 'مثال: يوم الوصول' : 'e.g. Arrival Day'}
                        className="w-full bg-surface-container rounded-lg border border-outline-variant/30 px-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50 transition-colors" />
                    </Field>

                    <Field label={locale === 'ar' ? 'الأنشطة (مفصولة بفاصلة)' : 'Activities (comma-separated)'}>
                      <textarea value={day.activities}
                        onChange={(e) => updateDay(index, 'activities', e.target.value)}
                        rows={2} placeholder={locale === 'ar' ? 'مثال: زيارة المعبد، نزهة على النيل' : 'e.g. Visit temple, Nile cruise'}
                        className="w-full bg-surface-container rounded-lg border border-outline-variant/30 px-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50 transition-colors resize-none" />
                    </Field>

                    <Field label={locale === 'ar' ? 'الوجبات (مفصولة بفاصلة)' : 'Meals (comma-separated)'}>
                      <input type="text" value={day.meals}
                        onChange={(e) => updateDay(index, 'meals', e.target.value)}
                        placeholder={locale === 'ar' ? 'مثال: فطار في الفندق، عشاء نيلي' : 'e.g. Hotel breakfast, Nile dinner'}
                        className="w-full bg-surface-container rounded-lg border border-outline-variant/30 px-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50 transition-colors" />
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label={locale === 'ar' ? 'الإقامة' : 'Accommodation'}>
                        <input type="text" value={day.accommodation}
                          onChange={(e) => updateDay(index, 'accommodation', e.target.value)}
                          placeholder={locale === 'ar' ? 'مثال: فندق أولد كتاراكت' : 'e.g. Old Cataract Hotel'}
                          className="w-full bg-surface-container rounded-lg border border-outline-variant/30 px-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50 transition-colors" />
                      </Field>

                      <Field label={locale === 'ar' ? 'التكلفة التقديرية' : 'Est. Cost'}>
                        <div className="relative">
                          <DollarSign size={14} className="absolute top-1/2 -translate-y-1/2 start-3 text-outline" />
                          <input type="number" min={0} value={day.estimatedCost}
                            onChange={(e) => updateDay(index, 'estimatedCost', Number(e.target.value))}
                            className="w-full bg-surface-container rounded-lg border border-outline-variant/30 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors ps-8" />
                        </div>
                      </Field>
                    </div>

                    <Field label={locale === 'ar' ? 'نصائح (اختياري)' : 'Tips (optional)'}>
                      <input type="text" value={day.tips}
                        onChange={(e) => updateDay(index, 'tips', e.target.value)}
                        placeholder={locale === 'ar' ? 'نصيحة مفيدة...' : 'A helpful tip...'}
                        className="w-full bg-surface-container rounded-lg border border-outline-variant/30 px-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50 transition-colors" />
                    </Field>

                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-error/10 border border-error/25 text-error rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <button onClick={handleSubmit}
          disabled={!destination.trim() || loading}
          className={cn(
            'bg-primary text-on-primary hover:bg-primary/90 transition-colors rounded-xl w-full py-4 flex items-center justify-center gap-2 text-sm sm:text-base font-bold text-center shadow-sm',
            (!destination.trim() || loading) && 'opacity-50 cursor-not-allowed'
          )}>
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin shrink-0" />
              <span className="truncate">
                {mode === 'ai'
                  ? (locale === 'ar' ? 'جاري الإنشاء...' : 'Generating your itinerary...')
                  : (locale === 'ar' ? 'جاري الحفظ...' : 'Saving trip...')}
              </span>
            </>
          ) : mode === 'ai' ? (
            <>
              <Sparkles size={18} className="shrink-0" />
              {locale === 'ar' ? 'إنشاء الرحلة' : 'Generate Trip'}
              <ArrowRight size={18} className="shrink-0" />
            </>
          ) : (
            <>
              <PenLine size={18} className="shrink-0" />
              {locale === 'ar' ? 'حفظ الرحلة' : 'Save Trip'}
              <ArrowRight size={18} className="shrink-0" />
            </>
          )}
        </button>

      </div>
    </main>
  );
}

// ─── tiny shared components ───────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-outline font-medium">{label}</span>
      {children}
    </div>
  );
}

function StepBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className="w-10 h-10 rounded-lg bg-surface-container border border-outline-variant/30 flex items-center justify-center text-on-surface font-bold text-lg hover:border-primary transition-colors cursor-pointer shrink-0">
      {children}
    </button>
  );
}