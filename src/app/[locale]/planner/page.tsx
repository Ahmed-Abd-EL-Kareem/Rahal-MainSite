// 'use client';

// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useLocale } from 'next-intl';
// import {
//   MapPin,
//   Wallet,
//   Sparkles,
//   Crown,
//   Users,
//   Moon,
//   Landmark,
//   UtensilsCrossed,
//   Mountain,
//   Camera,
//   Music,
//   Loader2,
//   ChevronLeft,
// } from 'lucide-react';
// import { tripsApi } from '@/lib/api/trips';
// import { cn } from '@/lib/utils/cn';

// // ─── Types ──────────────────────────────────────────────────────────────────

// type Budget = 'budget' | 'mid-range' | 'luxury';
// type InterestKey = 'history' | 'foodie' | 'adventure' | 'photography' | 'nightlife';

// interface WizardState {
//   destination: string;
//   duration: number;
//   travelers: number;
//   budget: Budget;
//   interests: InterestKey[];
// }

// // ─── Localization ─────────────────────────────────────────────────────────────

// const dict = {
//   en: {
//     heading: 'Create Your Oasis',
//     subheading: "Let Rahal's AI design an itinerary tailored to your soul.",
//     steps: ['Destination', 'Travelers', 'Budget', 'Interests'],

//     destLabel: 'Where do you want to wander?',
//     destPlaceholder: 'Cairo, Alexandria, Luxor...',

//     travelersLabel: 'How many nights, and how many travelers?',
//     nightsLabel: 'Nights',
//     travelersCountLabel: 'Travelers',

//     budgetLabel: 'Select your comfort level',
//     budgetOptions: {
//       budget: { name: 'Budget', desc: 'Smart spending, full experience' },
//       'mid-range': { name: 'Mid', desc: 'Balanced comfort and value' },
//       luxury: { name: 'Luxury', desc: 'Premium stays and service' },
//     },

//     interestsLabel: 'Travel Interests',
//     interestOptions: {
//       history: 'History',
//       foodie: 'Foodie',
//       adventure: 'Adventure',
//       photography: 'Photography',
//       nightlife: 'Nightlife',
//     },

//     previous: 'Previous',
//     next: 'Next',
//     generate: 'Generate My Trip',
//     generating: 'Crafting your journey...',

//     errDestination: 'Tell us where you want to go.',
//     errInterests: 'Pick at least one interest.',
//     errGenerate: 'Could not generate your trip. Please try again.',
//   },
//   ar: {
//     heading: 'اصنع جنّتك',
//     subheading: 'اترك ذكاء رحّال يصمم لك رحلة تناسب روحك.',
//     steps: ['الوجهة', 'المسافرون', 'الميزانية', 'الاهتمامات'],

//     destLabel: 'إلى أين تريد أن تجوب؟',
//     destPlaceholder: 'القاهرة، الإسكندرية، الأقصر...',

//     travelersLabel: 'كام ليلة، وكام مسافر؟',
//     nightsLabel: 'الليالي',
//     travelersCountLabel: 'المسافرون',

//     budgetLabel: 'اختر مستوى الراحة',
//     budgetOptions: {
//       budget: { name: 'اقتصادية', desc: 'إنفاق ذكي، تجربة كاملة' },
//       'mid-range': { name: 'متوسطة', desc: 'توازن بين الراحة والتكلفة' },
//       luxury: { name: 'فاخرة', desc: 'إقامة وخدمة مميزة' },
//     },

//     interestsLabel: 'اهتماماتك في السفر',
//     interestOptions: {
//       history: 'تاريخ',
//       foodie: 'مأكولات',
//       adventure: 'مغامرة',
//       photography: 'تصوير',
//       nightlife: 'سهر',
//     },

//     previous: 'السابق',
//     next: 'التالي',
//     generate: 'أنشئ رحلتي',
//     generating: 'جاري تجهيز رحلتك...',

//     errDestination: 'من فضلك اكتب وجهتك.',
//     errInterests: 'اختر اهتمامًا واحدًا على الأقل.',
//     errGenerate: 'تعذر إنشاء الرحلة. حاول مرة أخرى.',
//   },
// };

// const INTEREST_ICONS: Record<InterestKey, React.ElementType> = {
//   history: Landmark,
//   foodie: UtensilsCrossed,
//   adventure: Mountain,
//   photography: Camera,
//   nightlife: Music,
// };

// const BUDGET_ICONS: Record<Budget, React.ElementType> = {
//   budget: Wallet,
//   'mid-range': Sparkles,
//   luxury: Crown,
// };

// const TOTAL_STEPS = 4;

// // ─── Page ─────────────────────────────────────────────────────────────────────

// export default function TripPlannerPage() {
//   const locale = useLocale() as 'en' | 'ar';
//   const router = useRouter();
//   const t = dict[locale] ?? dict.en;
//   const isRtl = locale === 'ar';

//   const [step, setStep] = useState(1);
//   const [submitting, setSubmitting] = useState(false);
//   const [formError, setFormError] = useState<string | null>(null);

//   const [form, setForm] = useState<WizardState>({
//     destination: '',
//     duration: 3,
//     travelers: 2,
//     budget: 'mid-range',
//     interests: [],
//   });

//   const update = <K extends keyof WizardState>(key: K, value: WizardState[K]) => {
//     setForm((prev) => ({ ...prev, [key]: value }));
//   };

//   const toggleInterest = (key: InterestKey) => {
//     setForm((prev) => ({
//       ...prev,
//       interests: prev.interests.includes(key)
//         ? prev.interests.filter((i) => i !== key)
//         : [...prev.interests, key],
//     }));
//   };

//   const validateStep = (current: number): boolean => {
//     setFormError(null);
//     if (current === 1 && !form.destination.trim()) {
//       setFormError(t.errDestination);
//       return false;
//     }
//     if (current === 4 && form.interests.length === 0) {
//       setFormError(t.errInterests);
//       return false;
//     }
//     return true;
//   };

//   const goNext = () => {
//     if (!validateStep(step)) return;
//     setStep((s) => Math.min(s + 1, TOTAL_STEPS));
//   };

//   const goPrevious = () => {
//     setFormError(null);
//     setStep((s) => Math.max(s - 1, 1));
//   };

//   const handleGenerate = async () => {
//     if (!validateStep(4)) return;
//     setSubmitting(true);
//     setFormError(null);
//     try {
//       const res = await tripsApi.generateTrip({
//         destination: form.destination.trim(),
//         duration: form.duration,
//         travelers: form.travelers,
//         budget: form.budget,
//         interests: form.interests,
//         language: locale,
//       });
//       const trip = res?.data?.trip;
//       if (trip && trip._id) {
//         router.push(`/trips/${trip._id}`);
//       } else {
//         setFormError(t.errGenerate);
//       }
//     } catch {
//       setFormError(t.errGenerate);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <main
//       className="flex-1 w-full bg-bg text-ink1 pt-28 pb-20 px-4 md:px-8 max-w-[1280px] mx-auto"
//       style={{ direction: isRtl ? 'rtl' : 'ltr' }}
//     >
//       {/* Header */}
//       <div className="text-center mb-10">
//         <h1 className="font-display text-3xl md:text-4xl font-extrabold text-ink1">
//           {t.heading}
//         </h1>
//         <p className="mt-2 text-sm md:text-base text-ink2">{t.subheading}</p>
//       </div>

//       {/* Stepper */}
//       <div className="flex items-center justify-center gap-2 md:gap-4 mb-8 max-w-lg mx-auto">
//         {t.steps.map((label, i) => {
//           const idx = i + 1;
//           const active = idx === step;
//           const done = idx < step;
//           return (
//             <React.Fragment key={label}>
//               <div className="flex flex-col items-center gap-1.5">
//                 <div
//                   className={cn(
//                     'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
//                     active && 'bg-brand text-bg',
//                     done && 'bg-brand/20 text-brand',
//                     !active && !done && 'bg-surface2 text-ink3'
//                   )}
//                 >
//                   {idx}
//                 </div>
//                 <span
//                   className={cn(
//                     'text-[11px] font-medium whitespace-nowrap',
//                     active ? 'text-brand' : 'text-ink3'
//                   )}
//                 >
//                   {label}
//                 </span>
//               </div>
//               {idx !== TOTAL_STEPS && (
//                 <div className="h-px flex-1 bg-border mb-5" />
//               )}
//             </React.Fragment>
//           );
//         })}
//       </div>

//       {/* Card */}
//       <div className="card bg-surface1 border border-border shadow-card max-w-lg mx-auto p-6 md:p-8">
//         {/* Step 1: Destination */}
//         {step === 1 && (
//           <div className="flex flex-col gap-2">
//             <label className="text-sm font-semibold text-ink1">{t.destLabel}</label>
//             <div className="relative">
//               <MapPin
//                 size={16}
//                 className="absolute left-3 top-1/2 -translate-y-1/2 text-ink3"
//               />
//               <input
//                 type="text"
//                 value={form.destination}
//                 onChange={(e) => update('destination', e.target.value)}
//                 placeholder={t.destPlaceholder}
//                 autoFocus
//                 className="input w-full pl-9 text-sm bg-surface2"
//               />
//             </div>
//           </div>
//         )}

//         {/* Step 2: Travelers (duration + travelers) */}
//         {step === 2 && (
//           <div className="flex flex-col gap-5">
//             <label className="text-sm font-semibold text-ink1">{t.travelersLabel}</label>

//             <div className="grid grid-cols-2 gap-4">
//               <div className="flex flex-col gap-2">
//                 <span className="text-xs text-ink3 flex items-center gap-1.5">
//                   <Moon size={13} />
//                   {t.nightsLabel}
//                 </span>
//                 <input
//                   type="number"
//                   min={1}
//                   max={30}
//                   value={form.duration}
//                   onChange={(e) =>
//                     update('duration', Math.max(1, Number(e.target.value) || 1))
//                   }
//                   className="input w-full text-sm bg-surface2"
//                 />
//               </div>

//               <div className="flex flex-col gap-2">
//                 <span className="text-xs text-ink3 flex items-center gap-1.5">
//                   <Users size={13} />
//                   {t.travelersCountLabel}
//                 </span>
//                 <input
//                   type="number"
//                   min={1}
//                   max={20}
//                   value={form.travelers}
//                   onChange={(e) =>
//                     update('travelers', Math.max(1, Number(e.target.value) || 1))
//                   }
//                   className="input w-full text-sm bg-surface2"
//                 />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Step 3: Budget */}
//         {step === 3 && (
//           <div className="flex flex-col gap-3">
//             <label className="text-sm font-semibold text-ink1">{t.budgetLabel}</label>
//             <div className="grid grid-cols-3 gap-2.5">
//               {(['budget', 'mid-range', 'luxury'] as Budget[]).map((key) => {
//                 const Icon = BUDGET_ICONS[key];
//                 const active = form.budget === key;
//                 return (
//                   <button
//                     key={key}
//                     type="button"
//                     onClick={() => update('budget', key)}
//                     className={cn(
//                       'flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-colors cursor-pointer',
//                       active
//                         ? 'border-brand bg-brand/10 text-brand'
//                         : 'border-border bg-surface2 text-ink2 hover:border-brand/40'
//                     )}
//                   >
//                     <Icon size={18} />
//                     <span className="text-xs font-semibold">
//                       {t.budgetOptions[key].name}
//                     </span>
//                   </button>
//                 );
//               })}
//             </div>
//             <p className="text-xs text-ink3 text-center mt-1">
//               {t.budgetOptions[form.budget].desc}
//             </p>
//           </div>
//         )}

//         {/* Step 4: Interests */}
//         {step === 4 && (
//           <div className="flex flex-col gap-3">
//             <label className="text-sm font-semibold text-ink1">{t.interestsLabel}</label>
//             <div className="flex flex-wrap gap-2">
//               {(Object.keys(t.interestOptions) as InterestKey[]).map((key) => {
//                 const Icon = INTEREST_ICONS[key];
//                 const active = form.interests.includes(key);
//                 return (
//                   <button
//                     key={key}
//                     type="button"
//                     onClick={() => toggleInterest(key)}
//                     className={cn(
//                       'flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer',
//                       active
//                         ? 'border-brand bg-brand text-bg'
//                         : 'border-border bg-surface2 text-ink2 hover:border-brand/40'
//                     )}
//                   >
//                     <Icon size={13} />
//                     {t.interestOptions[key]}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {/* Error */}
//         {formError && (
//           <p className="text-xs text-error mt-4" role="alert">
//             {formError}
//           </p>
//         )}

//         {/* Footer actions */}
//         <div className="flex items-center justify-between gap-3 mt-7 pt-5 border-t border-border/60">
//           <button
//             type="button"
//             onClick={goPrevious}
//             disabled={step === 1 || submitting}
//             className={cn(
//               'flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors border-none cursor-pointer',
//               'bg-surface2 text-ink2 hover:bg-surface2/80 disabled:opacity-40 disabled:cursor-not-allowed'
//             )}
//           >
//             <ChevronLeft size={15} className={isRtl ? 'rotate-180' : ''} />
//             {t.previous}
//           </button>

//           {step < TOTAL_STEPS ? (
//             <button
//               type="button"
//               onClick={goNext}
//               className="btn-primary px-6 py-2.5 text-sm font-semibold"
//             >
//               {t.next}
//             </button>
//           ) : (
//             <button
//               type="button"
//               onClick={handleGenerate}
//               disabled={submitting}
//               className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
//             >
//               {submitting ? (
//                 <>
//                   <Loader2 size={15} className="animate-spin" />
//                   {t.generating}
//                 </>
//               ) : (
//                 <>
//                   <Sparkles size={15} />
//                   {t.generate}
//                 </>
//               )}
//             </button>
//           )}
//         </div>
//       </div>
//     </main>
//   );
// }
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  MapPin, Wallet, Sparkles, Crown, Users, Moon,
  Landmark, UtensilsCrossed, Mountain, Camera, Music,
  Loader2, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { tripsApi } from '@/lib/api/trips';
import { cn } from '@/lib/utils/cn';

type Budget = 'budget' | 'mid-range' | 'luxury';
type InterestKey = 'history' | 'foodie' | 'adventure' | 'photography' | 'nightlife';

interface WizardState {
  destination: string;
  duration: number;
  travelers: number;
  budget: Budget;
  interests: InterestKey[];
}

const dict = {
  en: {
    heading: 'Create Your Oasis',
    subheading: "Let Rahal's AI design an itinerary tailored to your soul.",
    steps: ['Destination', 'Travelers', 'Budget', 'Interests'],
    destLabel: 'Where do you want to wander?',
    destPlaceholder: 'Cairo, Alexandria, Luxor...',
    travelersLabel: 'How many nights, and how many travelers?',
    nightsLabel: 'Nights',
    travelersCountLabel: 'Travelers',
    budgetLabel: 'Select your comfort level',
    budgetOptions: {
      budget: { name: 'Budget', desc: 'Smart spending, full experience' },
      'mid-range': { name: 'Mid', desc: 'Balanced comfort and value' },
      luxury: { name: 'Luxury', desc: 'Premium stays and service' },
    },
    interestsLabel: 'Travel Interests',
    interestOptions: {
      history: 'History', foodie: 'Foodie', adventure: 'Adventure',
      photography: 'Photography', nightlife: 'Nightlife',
    },
    previous: 'Previous',
    next: 'Next',
    generate: 'Generate My Trip',
    generating: 'Crafting your journey...',
    errDestination: 'Tell us where you want to go.',
    errInterests: 'Pick at least one interest.',
    errGenerate: 'Could not generate your trip. Please try again.',
  },
  ar: {
    heading: 'اصنع جنّتك',
    subheading: 'اترك ذكاء رحّال يصمم لك رحلة تناسب روحك.',
    steps: ['الوجهة', 'المسافرون', 'الميزانية', 'الاهتمامات'],
    destLabel: 'إلى أين تريد أن تجوب؟',
    destPlaceholder: 'القاهرة، الإسكندرية، الأقصر...',
    travelersLabel: 'كام ليلة، وكام مسافر؟',
    nightsLabel: 'الليالي',
    travelersCountLabel: 'المسافرون',
    budgetLabel: 'اختر مستوى الراحة',
    budgetOptions: {
      budget: { name: 'اقتصادية', desc: 'إنفاق ذكي، تجربة كاملة' },
      'mid-range': { name: 'متوسطة', desc: 'توازن بين الراحة والتكلفة' },
      luxury: { name: 'فاخرة', desc: 'إقامة وخدمة مميزة' },
    },
    interestsLabel: 'اهتماماتك في السفر',
    interestOptions: {
      history: 'تاريخ', foodie: 'مأكولات', adventure: 'مغامرة',
      photography: 'تصوير', nightlife: 'سهر',
    },
    previous: 'السابق',
    next: 'التالي',
    generate: 'أنشئ رحلتي',
    generating: 'جاري تجهيز رحلتك...',
    errDestination: 'من فضلك اكتب وجهتك.',
    errInterests: 'اختر اهتمامًا واحدًا على الأقل.',
    errGenerate: 'تعذر إنشاء الرحلة. حاول مرة أخرى.',
  },
};

const INTEREST_ICONS: Record<InterestKey, React.ElementType> = {
  history: Landmark, foodie: UtensilsCrossed, adventure: Mountain,
  photography: Camera, nightlife: Music,
};

const BUDGET_ICONS: Record<Budget, React.ElementType> = {
  budget: Wallet, 'mid-range': Sparkles, luxury: Crown,
};

const TOTAL_STEPS = 4;

export default function TripPlannerPage() {
  const locale = useLocale() as 'en' | 'ar';
  const router = useRouter();
  const t = dict[locale] ?? dict.en;
  const isRtl = locale === 'ar';

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState<WizardState>({
    destination: '',
    duration: 3,
    travelers: 2,
    budget: 'mid-range',
    interests: [],
  });

  const update = <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleInterest = (key: InterestKey) =>
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(key)
        ? prev.interests.filter((i) => i !== key)
        : [...prev.interests, key],
    }));

  const validateStep = (current: number): boolean => {
    setFormError(null);
    if (current === 1 && !form.destination.trim()) { setFormError(t.errDestination); return false; }
    if (current === 4 && form.interests.length === 0) { setFormError(t.errInterests); return false; }
    return true;
  };

  const goNext = () => { if (!validateStep(step)) return; setStep((s) => Math.min(s + 1, TOTAL_STEPS)); };
  const goPrevious = () => { setFormError(null); setStep((s) => Math.max(s - 1, 1)); };

  const handleGenerate = async () => {
    if (!validateStep(4)) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await tripsApi.generateTrip({
        destination: form.destination.trim(),
        duration: form.duration,
        travelers: form.travelers,
        budget: form.budget,
        interests: form.interests,
        language: locale,
      });
      const trip = res?.data?.trip;
      if (trip?._id) router.push(`/trips/${trip._id}`);
      else setFormError(t.errGenerate);
    } catch {
      setFormError(t.errGenerate);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Counter component مشترك ──────────────────────────────────────────────
  const Counter = ({
    label, icon: Icon, value, min, max, onChange,
  }: {
    label: string; icon: React.ElementType; value: number;
    min: number; max: number; onChange: (v: number) => void;
  }) => (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-ink3 flex items-center gap-1.5">
        <Icon size={13} />{label}
      </span>
      {/* على موبايل: stepper بدل input عشان أسهل */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-surface2 border border-border text-ink1 font-bold text-lg flex items-center justify-center hover:border-brand/40 transition-colors cursor-pointer"
        >−</button>
        <span className="flex-1 text-center font-bold text-base text-ink1 tabular-nums">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-surface2 border border-border text-ink1 font-bold text-lg flex items-center justify-center hover:border-brand/40 transition-colors cursor-pointer"
        >+</button>
      </div>
    </div>
  );

  return (
    <main
      className={cn(
        'flex-1 w-full bg-bg text-ink1 min-h-screen',
        // padding أقل على موبايل
        'pt-20 sm:pt-28 pb-10 sm:pb-20 px-4 md:px-8',
        'max-w-[1280px] mx-auto',
        isRtl ? 'font-arabic' : 'font-body'
      )}
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
    >
      {/* Header */}
      <div className="text-center mb-6 sm:mb-10 px-2">
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-ink1 leading-tight">
          {t.heading}
        </h1>
        <p className="mt-2 text-xs sm:text-sm md:text-base text-ink2 max-w-sm mx-auto">
          {t.subheading}
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-4 mb-6 sm:mb-8 max-w-lg mx-auto px-2">
        {t.steps.map((label, i) => {
          const idx = i + 1;
          const active = idx === step;
          const done = idx < step;
          return (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center gap-1">
                <div className={cn(
                  'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold transition-colors',
                  active && 'bg-brand text-bg',
                  done && 'bg-brand/20 text-brand',
                  !active && !done && 'bg-surface2 text-ink3'
                )}>
                  {done ? '✓' : idx}
                </div>
                {/* الـ label بتختفي على موبايل صغير */}
                <span className={cn(
                  'hidden xs:block text-[10px] sm:text-[11px] font-medium whitespace-nowrap',
                  active ? 'text-brand' : 'text-ink3'
                )}>
                  {label}
                </span>
              </div>
              {idx !== TOTAL_STEPS && (
                <div className={cn(
                  'h-px flex-1 mb-3 sm:mb-5 transition-colors',
                  done ? 'bg-brand/40' : 'bg-border'
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Card */}
      <div className="card bg-surface1 border border-border shadow-card w-full max-w-lg mx-auto p-4 sm:p-6 md:p-8">

        {/* Step 1: Destination */}
        {step === 1 && (
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-ink1">{t.destLabel}</label>
            <div className="relative">
              <MapPin size={16} className={cn(
                'absolute top-1/2 -translate-y-1/2 text-ink3',
                isRtl ? 'right-3' : 'left-3'
              )} />
              <input
                type="text"
                value={form.destination}
                onChange={(e) => update('destination', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && goNext()}
                placeholder={t.destPlaceholder}
                autoFocus
                className={cn('input w-full text-sm bg-surface2', isRtl ? 'pr-9' : 'pl-9')}
              />
            </div>
          </div>
        )}

        {/* Step 2: Travelers */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <label className="text-sm font-semibold text-ink1">{t.travelersLabel}</label>
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <Counter
                label={t.nightsLabel}
                icon={Moon}
                value={form.duration}
                min={1} max={30}
                onChange={(v) => update('duration', v)}
              />
              <Counter
                label={t.travelersCountLabel}
                icon={Users}
                value={form.travelers}
                min={1} max={20}
                onChange={(v) => update('travelers', v)}
              />
            </div>
          </div>
        )}

        {/* Step 3: Budget */}
        {step === 3 && (
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-ink1">{t.budgetLabel}</label>
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
              {(['budget', 'mid-range', 'luxury'] as Budget[]).map((key) => {
                const Icon = BUDGET_ICONS[key];
                const active = form.budget === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => update('budget', key)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-xl border p-2.5 sm:p-3 text-center transition-colors cursor-pointer',
                      active
                        ? 'border-brand bg-brand/10 text-brand'
                        : 'border-border bg-surface2 text-ink2 hover:border-brand/40'
                    )}
                  >
                    <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="text-[11px] sm:text-xs font-semibold leading-tight">
                      {t.budgetOptions[key].name}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-ink3 text-center mt-1">
              {t.budgetOptions[form.budget].desc}
            </p>
          </div>
        )}

        {/* Step 4: Interests */}
        {step === 4 && (
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-ink1">{t.interestsLabel}</label>
            {/* grid على موبايل بدل flex عشان ينظم أكتر */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              {(Object.keys(t.interestOptions) as InterestKey[]).map((key) => {
                const Icon = INTEREST_ICONS[key];
                const active = form.interests.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleInterest(key)}
                    className={cn(
                      'flex items-center justify-center sm:justify-start gap-1.5 rounded-full border px-3 py-2.5 sm:py-2 text-xs font-semibold transition-colors cursor-pointer',
                      active
                        ? 'border-brand bg-brand text-bg'
                        : 'border-border bg-surface2 text-ink2 hover:border-brand/40'
                    )}
                  >
                    <Icon size={13} />
                    {t.interestOptions[key]}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Error */}
        {formError && (
          <p className="text-xs text-error mt-4 flex items-center gap-1.5" role="alert">
            ⚠ {formError}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 mt-6 sm:mt-7 pt-4 sm:pt-5 border-t border-border/60">
          <button
            type="button"
            onClick={goPrevious}
            disabled={step === 1 || submitting}
            className={cn(
              'flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors border-none cursor-pointer',
              'bg-surface2 text-ink2 hover:bg-surface2/80 disabled:opacity-40 disabled:cursor-not-allowed'
            )}
          >
            <ChevronLeft size={15} className={isRtl ? 'rotate-180' : ''} />
            <span className="hidden xs:inline">{t.previous}</span>
          </button>

          {/* Progress dots على موبايل */}
          <div className="flex gap-1.5 sm:hidden">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} className={cn(
                'w-1.5 h-1.5 rounded-full transition-colors',
                i + 1 === step ? 'bg-brand' : i + 1 < step ? 'bg-brand/40' : 'bg-border'
              )} />
            ))}
          </div>

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={goNext}
              className="btn-primary flex items-center gap-1 sm:gap-1.5 px-4 sm:px-6 py-2.5 text-sm font-semibold"
            >
              {t.next}
              <ChevronRight size={15} className={isRtl ? 'rotate-180' : ''} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={submitting}
              className="btn-primary flex items-center gap-1.5 px-4 sm:px-6 py-2.5 text-sm font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span className="hidden xs:inline">{t.generating}</span>
                  <span className="xs:hidden">...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  {t.generate}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}