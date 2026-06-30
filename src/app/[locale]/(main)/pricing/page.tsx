'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Sparkles,
  Check,
  Minus,
  // ChevronDown,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  // MessageSquare,
  BadgeCheck
} from 'lucide-react';
import { subscriptionsApi } from '@/lib/api/subscriptions';

export default function PricingPlansPage() {
  const t = useTranslations('pricing');
  const locale = useLocale();
  const router = useRouter();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  // const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const tokenMatch = document.cookie.match(/(^|;\s*)token\s*=\s*([^;]*)/);
    const token = tokenMatch ? tokenMatch[2] : null;
    setIsLoggedIn(!!token);
    if (token) {
      try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        setUserId(decoded.id || decoded._id || decoded.sub || null);
      } catch (err) {
        setUserId(null);
      }
    }
  }, []);

  // Fetch current user subscription
  const { data: subResponse } = useQuery({
    queryKey: ['mySubscription'],
    queryFn: () => subscriptionsApi.getMySubscription(),
    enabled: isLoggedIn,
    staleTime: 5 * 60 * 1000,
  });

  const activePlanName = subResponse?.data?.planName || 'free';

  // Fetch all available plans
  const { data: plansResponse, isLoading: isPlansLoading, isError: isPlansError } = useQuery({
    queryKey: ['plans'],
    queryFn: () => subscriptionsApi.getPlans(),
    staleTime: 10 * 60 * 1000,
  });

  const availablePlans = plansResponse?.data || [];
  const freePlan = availablePlans.find(p => p.name === 'free');
  const proPlan = availablePlans.find(p => p.name === 'pro');

  // Upgrade mutation
  const upgradeMutation = useMutation({
    mutationFn: () => subscriptionsApi.upgrade('pro'),
    onSuccess: (response) => {
      if (response && response.data?.url) {
        window.location.href = response.data.url;
      } else {
        setErrorMsg(locale === 'ar' ? 'فشل بدء عملية الترقية.' : 'Failed to initialize upgrade.');
      }
    },
    onError: (err: any) => {
      console.error('Upgrade error:', err);
      setErrorMsg(err.message || (locale === 'ar' ? 'حدث خطأ أثناء الاتصال بالدفع.' : 'Stripe checkout initialization failed.'));
    }
  });

  const isPro = activePlanName === 'pro';

  const handleProAction = () => {
    if (!isLoggedIn) {
      router.push(`/${locale}/signup?redirect=pricing`);
      return;
    }
    if (isPro) return; // already pro
    upgradeMutation.mutate();
  };

  const handleFreeAction = () => {
    if (!isLoggedIn) {
      router.push(`/${locale}/signup`);
    } else {
      router.push(`/${locale}/account`);
    }
  };

  // const toggleFaq = (index: number) => {
  //   setOpenFaq(openFaq === index ? null : index);
  // };

  const isAr = locale === 'ar';

  // Helper to translate features dynamically
  const getLocalizedFeature = (feature: string) => {
    const mapping: Record<string, string> = {
      // Free features
      "3 AI trip plans per month": isAr ? "3 مسارات سفر بالذكاء الاصطناعي شهرياً" : "3 AI trip plans per month",
      "Browse destinations & hotels": isAr ? "تصفح الوجهات السياحية والفنادق" : "Browse destinations & hotels",
      "Basic AI chatbot": isAr ? "مساعد ذكاء اصطناعي أساسي" : "Basic AI chatbot",

      // Pro features
      "Unlimited AI trip plans": isAr ? "تخطيط رحلات غير محدود بالذكاء الاصطناعي" : "Unlimited AI trip plans",
      "RAG-powered travel knowledge": isAr ? "معلومات سياحية متقدمة مدعومة بالذكاء الاصطناعي" : "RAG-powered travel knowledge",
      "Priority AI chatbot": isAr ? "مساعد ذكاء اصطناعي ذو أولوية" : "Priority AI chatbot",
      "Hotel booking requests": isAr ? "طلبات حجز فنادق حصرية" : "Hotel booking requests",
      "Save unlimited trips": isAr ? "حفظ عدد غير محدود من الرحلات" : "Save unlimited trips"
    };
    return mapping[feature] || feature;
  };

  if (isPlansLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-on-surface-variant">
        <Loader2 className="animate-spin text-primary mb-4" size={32} />
        <p className="font-body text-sm">
          {isAr ? 'جاري تحميل خطط الأسعار...' : 'Loading pricing plans...'}
        </p>
      </div>
    );
  }

  // Calculate dynamic price
  const proMonthlyVal = proPlan?.price?.monthly || 20;
  const proAnnualVal = Math.round(proMonthlyVal * 0.8); // 20% discount
  const proBilledAnnuallyVal = proAnnualVal * 12;

  return (
    <main className="min-h-screen bg-background text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-nile-blue/10 text-nile-blue dark:bg-nile-blue/20 dark:text-secondary-fixed-dim mb-6">
            <Sparkles size={16} className="text-pharaoh-gold animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t('badge')}
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-on-background mb-6 max-w-4xl mx-auto leading-tight">
            {t('title')}
          </h1>

          <p className="text-base md:text-lg text-on-surface-variant max-w-3xl mx-auto mb-12 leading-relaxed">
            {t('subtitle')}
          </p>

          {/* Pricing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span
              className={`text-sm font-semibold transition-colors duration-300 ${billingCycle === 'monthly' ? 'text-on-surface' : 'text-on-surface-variant'
                }`}
            >
              {t('monthly')}
            </span>

            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="relative w-14 h-8 bg-surface-container-highest dark:bg-surface-container-high rounded-full p-1 transition-all duration-300 focus:outline-none cursor-pointer"
              aria-label="Toggle billing cycle"
            >
              <div
                className={`w-6 h-6 bg-pharaoh-gold rounded-full shadow-md transition-transform duration-300 transform ${billingCycle === 'annual'
                  ? (isAr ? '-translate-x-6' : 'translate-x-6')
                  : 'translate-x-0'
                  }`}
              />
            </button>

            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-semibold transition-colors duration-300 ${billingCycle === 'annual' ? 'text-on-surface' : 'text-on-surface-variant'
                  }`}
              >
                {t('annual')}
              </span>
              <span className="px-2 py-0.5 bg-papyrus-green/10 text-papyrus-green dark:bg-papyrus-green/20 dark:text-success text-[10px] font-bold rounded uppercase tracking-wider">
                {t('save20')}
              </span>
            </div>
          </div>

          {/* Error Alert Box */}
          {errorMsg && (
            <div className="max-w-md mx-auto mb-8 p-4 bg-error/10 border border-error/20 text-error text-xs rounded-xl flex items-center justify-between animate-shake">
              <span className="flex items-center gap-1.5">
                <AlertCircle size={14} />
                {errorMsg}
              </span>
              <button onClick={() => setErrorMsg(null)} className="opacity-60 hover:opacity-100">✕</button>
            </div>
          )}
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="pb-24 px-6 md:px-12 -mt-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

            {/* Wanderer / Free Plan Card */}
            <div className="bg-surface-container-lowest border border-outline-variant/35 p-8 md:p-10 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:shadow-card-hover group relative">
              <div>
                <div className="mb-6">
                  <h3 className="font-display text-2xl font-bold text-on-surface mb-2">
                    {freePlan?.displayName || t('wanderer.title')}
                  </h3>
                  <p className="text-sm text-on-surface-variant">
                    {freePlan?.description || t('wanderer.desc')}
                  </p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-5xl font-bold text-on-surface">
                      ${freePlan?.price?.monthly ?? 0}
                    </span>
                    <span className="text-sm text-on-surface-variant">
                      {t('wanderer.cycle')}
                    </span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {(freePlan?.features || []).map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check size={18} className="text-papyrus-green stroke-[3px]" />
                      <span className="text-sm text-on-surface">
                        {getLocalizedFeature(feature)}
                      </span>
                    </li>
                  ))}
                  {/* mockup values for missing items to ensure visual parity */}
                  {(!freePlan || freePlan.features.length < 4) && (
                    <>
                      <li className="flex items-center gap-3 text-on-surface-variant/40">
                        <Minus size={18} className="stroke-[2.5px]" />
                        <span className="text-sm line-through decoration-on-surface-variant/20">
                          {t('wanderer.features.2')}
                        </span>
                      </li>
                      <li className="flex items-center gap-3 text-on-surface-variant/40">
                        <Minus size={18} className="stroke-[2.5px]" />
                        <span className="text-sm line-through decoration-on-surface-variant/20">
                          {t('wanderer.features.3')}
                        </span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <button
                onClick={handleFreeAction}
                disabled={isLoggedIn && activePlanName === 'free'}
                className="w-full py-3.5 border border-outline hover:bg-surface-container disabled:bg-surface-container-low disabled:text-on-surface-variant/50 disabled:border-transparent text-on-surface font-semibold rounded-xl transition-all duration-300 cursor-pointer text-sm"
              >
                {isLoggedIn && activePlanName === 'free' ? (isAr ? 'باقتك الحالية' : 'Your Current Plan') : t('wanderer.cta')}
              </button>
            </div>

            {/* Traveler Pro Plan Card */}
            <div className="relative bg-surface-container-lowest border-2 border-pharaoh-gold p-8 md:p-10 rounded-2xl flex flex-col justify-between shadow-lg transition-all duration-300 group overflow-hidden md:scale-105 scale-100 z-10">
              {/* Popular Badge */}
              <div className="absolute top-0 right-0">
                <div className="bg-pharaoh-gold text-white text-[10px] font-bold px-8 py-2 transform rotate-45 translate-x-8 translate-y-3 shadow-sm uppercase tracking-widest text-center">
                  {t('pro.badge')}
                </div>
              </div>

              <div>
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-display text-2xl font-bold text-on-surface">
                      {proPlan?.displayName ? `${proPlan.displayName} Pro` : t('pro.title')}
                    </h3>
                    <BadgeCheck size={20} className="text-pharaoh-gold fill-pharaoh-gold/10" />
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    {proPlan?.description || t('pro.desc')}
                  </p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-5xl font-bold text-on-surface">
                      ${billingCycle === 'monthly' ? proMonthlyVal : proAnnualVal}
                    </span>
                    <span className="text-sm text-on-surface-variant">
                      {t('pro.cycle')}
                    </span>
                  </div>
                  {billingCycle === 'annual' && (
                    <p className="text-xs text-papyrus-green font-semibold mt-1">
                      {isAr
                        ? `يُدفع سنوياً ($${proBilledAnnuallyVal}/سنة)`
                        : `Billed annually ($${proBilledAnnuallyVal}/yr)`}
                    </p>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <Sparkles size={18} className="text-pharaoh-gold fill-pharaoh-gold/20 stroke-[2px]" />
                    <span className="text-sm font-semibold italic text-on-surface">
                      {isAr ? "تخطيط رحلات غير محدود بالذكاء الاصطناعي" : "Unlimited AI trip plans"}
                    </span>
                  </li>
                  {(proPlan?.features || []).filter(f => f !== "Unlimited AI trip plans").map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check size={18} className="text-papyrus-green stroke-[3px]" />
                      <span className="text-sm text-on-surface">
                        {getLocalizedFeature(feature)}
                      </span>
                    </li>
                  ))}
                  {/* mockup fallback if database list is empty */}
                  {(!proPlan || proPlan.features.length === 0) && (
                    <>
                      <li className="flex items-center gap-3">
                        <Check size={18} className="text-papyrus-green stroke-[3px]" />
                        <span className="text-sm text-on-surface">{t('pro.features.1')}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check size={18} className="text-papyrus-green stroke-[3px]" />
                        <span className="text-sm text-on-surface">{t('pro.features.2')}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check size={18} className="text-papyrus-green stroke-[3px]" />
                        <span className="text-sm text-on-surface">{t('pro.features.3')}</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <button
                onClick={handleProAction}
                disabled={upgradeMutation.isPending || (isLoggedIn && isPro)}
                className="w-full py-4 bg-pharaoh-gold hover:brightness-110 disabled:bg-surface-container-high disabled:text-on-surface-variant/40 disabled:border-transparent text-white font-bold rounded-xl shadow-lg transition-all duration-300 relative overflow-hidden flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {upgradeMutation.isPending ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <ArrowUpRight size={18} />
                )}
                <span>
                  {isLoggedIn && isPro ? (isAr ? 'باقتك الحالية' : 'Your Current Plan') : t('pro.cta')}
                </span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-24 bg-surface-container-low px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-on-surface mb-4">
              {t('compare.title')}
            </h2>
            <div className="w-20 h-1 bg-pharaoh-gold mx-auto rounded-full" />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-outline-variant/35 shadow-sm">
            <table className="w-full text-start border-collapse bg-surface-container-lowest">
              <thead>
                <tr className="border-b border-outline-variant/35 bg-surface-container-high/40">
                  <th className="p-6 text-sm font-semibold text-on-surface-variant uppercase tracking-wider w-1/2 text-start">
                    {t('compare.featureCol')}
                  </th>
                  <th className="p-6 text-sm font-semibold text-on-surface-variant uppercase tracking-wider text-center">
                    {freePlan?.displayName || t('compare.wandererCol')}
                  </th>
                  <th className="p-6 text-sm font-semibold text-pharaoh-gold uppercase tracking-wider text-center bg-pharaoh-gold/5">
                    {proPlan?.displayName ? `${proPlan.displayName} Pro` : t('compare.proCol')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15 text-sm">
                <tr>
                  <td className="p-6 text-start">
                    <div className="font-semibold text-on-surface">
                      {t('compare.features.itinerary.title')}
                    </div>
                    <div className="text-xs text-on-surface-variant mt-1 text-start">
                      {t('compare.features.itinerary.desc')}
                    </div>
                  </td>
                  <td className="p-6 text-center text-on-surface-variant font-medium">
                    {freePlan?.limits?.tripsPerMonth
                      ? `${freePlan.limits.tripsPerMonth} ${isAr ? 'رحلات شهرياً' : 'trips/month'}`
                      : t('compare.features.itinerary.wanderer')}
                  </td>
                  <td className="p-6 text-center font-bold text-on-surface bg-pharaoh-gold/5">
                    {proPlan?.limits?.tripsPerMonth === null
                      ? (isAr ? 'غير محدود' : 'Unlimited')
                      : t('compare.features.itinerary.pro')}
                  </td>
                </tr>
                <tr>
                  <td className="p-6 text-start">
                    <div className="font-semibold text-on-surface">
                      {t('compare.features.experiences.title')}
                    </div>
                    <div className="text-xs text-on-surface-variant mt-1 text-start">
                      {t('compare.features.experiences.desc')}
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <Minus className="text-outline-variant inline-block stroke-[2.5px]" size={18} />
                  </td>
                  <td className="p-6 text-center bg-pharaoh-gold/5">
                    <Check className="text-pharaoh-gold inline-block stroke-[3px]" size={18} />
                  </td>
                </tr>
                <tr>
                  <td className="p-6 text-start">
                    <div className="font-semibold text-on-surface">
                      {t('compare.features.logistics.title')}
                    </div>
                    <div className="text-xs text-on-surface-variant mt-1 text-start">
                      {t('compare.features.logistics.desc')}
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <Minus className="text-outline-variant inline-block stroke-[2.5px]" size={18} />
                  </td>
                  <td className="p-6 text-center bg-pharaoh-gold/5">
                    <Check className="text-pharaoh-gold inline-block stroke-[3px]" size={18} />
                  </td>
                </tr>
                <tr>
                  <td className="p-6 text-start">
                    <div className="font-semibold text-on-surface">
                      {t('compare.features.collaborative.title')}
                    </div>
                    <div className="text-xs text-on-surface-variant mt-1 text-start">
                      {t('compare.features.collaborative.desc')}
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <Check className="text-papyrus-green inline-block stroke-[3px]" size={18} />
                  </td>
                  <td className="p-6 text-center bg-pharaoh-gold/5">
                    <Check className="text-pharaoh-gold inline-block stroke-[3px]" size={18} />
                  </td>
                </tr>
                <tr>
                  <td className="p-6 text-start">
                    <div className="font-semibold text-on-surface">
                      {t('compare.features.offline.title')}
                    </div>
                    <div className="text-xs text-on-surface-variant mt-1 text-start">
                      {t('compare.features.offline.desc')}
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <Minus className="text-outline-variant inline-block stroke-[2.5px]" size={18} />
                  </td>
                  <td className="p-6 text-center bg-pharaoh-gold/5">
                    <Check className="text-pharaoh-gold inline-block stroke-[3px]" size={18} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      {/* <section className="py-24 px-6 md:px-12 bg-background">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center text-on-surface mb-12">
            {t('faq.title')}
          </h2>

          <div className="space-y-4">
            {[1, 2, 3].map((num) => (
              <div 
                key={num} 
                className="border border-outline-variant/35 rounded-xl overflow-hidden bg-surface-container-lowest transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(num)}
                  className="w-full flex justify-between items-center p-6 text-start cursor-pointer hover:bg-surface-container-low/50 transition-colors"
                >
                  <span className="font-semibold text-on-surface text-base text-start font-body">
                    {t(`faq.q${num}`)}
                  </span>
                  <ChevronDown 
                    className={`transition-transform duration-300 text-on-surface-variant ${
                      openFaq === num ? 'rotate-180 text-pharaoh-gold' : ''
                    }`} 
                    size={20}
                  />
                </button>
                <div 
                  className={`transition-all duration-300 overflow-hidden ${
                    openFaq === num ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-6 pt-0 text-sm text-on-surface-variant leading-relaxed text-start font-body">
                    {t(`faq.a${num}`)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Final CTA Section */}
      {/* <section className="py-24 relative overflow-hidden bg-obsidian">
       Pyramid overlay background 
        <div className="absolute inset-0 opacity-20 dark:opacity-30">
          <img
            className="w-full h-full object-cover mix-blend-overlay scale-105"
            alt="pyramids"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmgdvvCmQa6xfpDDGyctl5GkSb9GC7AMiZw8tLpxPlUqyPJ69vtZSnsLUG-hdy6NNRYlX8AO6CQu_jNcw3zufTfbdRns7ShJ0ifpHdYIpvAuiPO2Ij8CAnBXj0aYJ6nBy9n0Z7Gr9pHMoPf9d0JoKfIhdMLr9MoVbZZHJtp_bBjGJdRz8GpWw14xCJrfH-fPsDQZmha8Nf65Z9m0_c7KJrzabAJ68SOpuYAZuMB9lry2tlSpUti98aKfMYg66gGIYvNYBzMLn1RjY"
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center relative z-10 text-white">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-pharaoh-gold font-bold mb-6 animate-fade-in">
            {t('cta.title')}
          </h2>
          <p className="text-base md:text-lg text-white/80 max-w-xl mx-auto mb-10 leading-relaxed font-body">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={handleProAction}
              disabled={upgradeMutation.isPending || (isLoggedIn && isPro)}
              className="px-8 py-4 bg-pharaoh-gold text-white font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-95 disabled:bg-white/10 disabled:text-white/40 disabled:scale-100 transition-all cursor-pointer flex items-center gap-2 text-sm font-body"
            >
              {upgradeMutation.isPending && <Loader2 className="animate-spin" size={16} />}
              <span>{t('cta.buttonTrial')}</span>
            </button>
            <Link
              href={`/${locale}/planner`}
              className="px-8 py-4 border border-pharaoh-gold/40 text-pharaoh-gold font-semibold rounded-xl hover:bg-white/5 transition-all flex items-center gap-2 text-sm font-body"
            >
              <MessageSquare size={16} />
              <span>{t('cta.buttonAgent')}</span>
            </Link>
          </div>
        </div>
      </section> */}
    </main>
  );
}
