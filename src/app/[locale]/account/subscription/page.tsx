'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '@/lib/api/subscriptions';
import { tripsApi } from '@/lib/api/trips';
import { bookingsApi } from '@/lib/api/bookings';
import Button from '@/components/ui/Button';
import {
  Check,
  Sparkles,
  AlertCircle,
  Calendar,
  ShieldCheck,
  Loader2,
  Award,
  ArrowUpRight,
  Flame,
  Map,
  Globe,
  CheckCircle2,
  X,
  CreditCard,
  History
} from 'lucide-react';

export default function SubscriptionSettingsPage() {
  const t = useTranslations('account');
  const locale = useLocale();
  const queryClient = useQueryClient();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

  // 1. Fetch user subscription details
  const { data: subResponse, isLoading: isSubLoading, isError: isSubError } = useQuery({
    queryKey: ['mySubscription'],
    queryFn: () => subscriptionsApi.getMySubscription(),
    staleTime: 5 * 60 * 1000,
  });

  // 2. Fetch all available plans
  const { data: plansResponse } = useQuery({
    queryKey: ['plans'],
    queryFn: () => subscriptionsApi.getPlans(),
    staleTime: 10 * 60 * 1000,
  });

  // 3. Fetch recent trips for activity log
  const { data: tripsResponse } = useQuery({
    queryKey: ['myTrips'],
    queryFn: () => tripsApi.getTrips({ limit: 3 }),
    staleTime: 5 * 60 * 1000,
  });

  // 4. Fetch recent bookings for activity log
  const { data: bookingsResponse } = useQuery({
    queryKey: ['myBookings'],
    queryFn: () => bookingsApi.getBookings({ limit: 3 }),
    staleTime: 5 * 60 * 1000,
  });

  // Upgrade Plan Mutation
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
      console.error('Upgrade plan error:', err);
      setErrorMsg(err.message || (locale === 'ar' ? 'فشل بدء عملية الترقية.' : 'Failed to initialize upgrade.'));
    },
  });

  // Cancel Subscription Mutation
  const cancelMutation = useMutation({
    mutationFn: () => subscriptionsApi.cancelSubscription(),
    onSuccess: () => {
      setSuccessMsg(t('cancelSuccess'));
      setIsConfirmingCancel(false);
      queryClient.invalidateQueries({ queryKey: ['mySubscription'] });

      setTimeout(() => {
        setSuccessMsg(null);
      }, 5000);
    },
    onError: (err: any) => {
      console.error('Cancel subscription error:', err);
      setErrorMsg(err.message || (locale === 'ar' ? 'فشل إلغاء الاشتراك.' : 'Failed to cancel subscription.'));
      setIsConfirmingCancel(false);
    },
  });

  if (isSubLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-background text-on-surface-variant">
        <Loader2 className="animate-spin text-primary mb-4" size={32} />
        <p className="font-body text-sm">
          {locale === 'ar' ? 'جاري تحميل تفاصيل الاشتراك...' : 'Loading subscription details...'}
        </p>
      </div>
    );
  }

  if (isSubError || !subResponse?.data) {
    return (
      <div className="p-8 bg-error/10 border border-error/20 rounded-3xl text-error text-center flex flex-col items-center gap-4">
        <AlertCircle size={40} />
        <h2 className="font-display font-semibold text-lg">
          {locale === 'ar' ? 'خطأ في تحميل تفاصيل الاشتراك' : 'Error Loading Subscription'}
        </h2>
        <p className="font-body text-sm max-w-md">
          {locale === 'ar'
            ? 'فشل الاتصال بخادم قاعدة البيانات. يرجى محاولة إعادة تحميل الصفحة.'
            : 'Failed to communicate with database server. Please try reloading the page.'}
        </p>
      </div>
    );
  }

  const subscription = subResponse.data;
  const { plan, usage, status, endDate, planName } = subscription;
  const availablePlans = plansResponse?.data || [];

  const isPro = planName === 'pro';
  const isCanceled = status === 'canceled';

  const getPercentage = (used: number, limit: number | null) => {
    if (!limit) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  // Compile real activity log from trips, bookings and subscription date
  const activitiesList: Array<{
    type: 'trip' | 'booking' | 'sub';
    title: string;
    desc: string;
    timestamp: number;
    color: string;
  }> = [];

  const trips = tripsResponse?.data || [];
  const bookings = bookingsResponse?.data || [];

  trips.forEach((trip) => {
    if (trip.createdAt) {
      activitiesList.push({
        type: 'trip',
        title: locale === 'ar' ? `إنشاء مسار: "${trip.title}"` : `Itinerary: "${trip.title}"`,
        desc: locale === 'ar'
          ? `تم إنشاؤه إلى ${trip.destination}`
          : `Generated to ${trip.destination}`,
        timestamp: new Date(trip.createdAt).getTime(),
        color: 'bg-success',
      });
    }
  });

  bookings.forEach((booking) => {
    if (booking.createdAt) {
      const hotel = booking.hotel;
      const hotelName = (hotel && typeof hotel !== 'string')
        ? (hotel.name[locale as 'en' | 'ar'] || hotel.name.en)
        : 'Hotel';

      activitiesList.push({
        type: 'booking',
        title: locale === 'ar' ? `حجز فندق: ${hotelName}` : `Booking: ${hotelName}`,
        desc: locale === 'ar'
          ? `حالة الحجز: ${booking.status}`
          : `Booking status: ${booking.status}`,
        timestamp: new Date(booking.createdAt).getTime(),
        color: 'bg-secondary',
      });
    }
  });

  if (subscription.startDate) {
    activitiesList.push({
      type: 'sub',
      title: locale === 'ar' ? `تفعيل اشتراك ${plan.displayName}` : `Activated Plan: ${plan.displayName}`,
      desc: locale === 'ar' ? 'تم تنشيط الحساب بنجاح' : 'Account activated successfully',
      timestamp: new Date(subscription.startDate).getTime(),
      color: 'bg-primary',
    });
  }

  // Sort activities by date and take the top 3
  const sortedActivities = activitiesList
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 3);

  return (
    <div className="space-y-8 text-left">
      {/* Header Title */}
      <header className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-on-surface mb-2">
          {t('subscriptionTitle')}
        </h1>
        <p className="font-body text-sm text-on-surface-variant opacity-70">
          {locale === 'ar'
            ? 'إدارة الوصول إلى كونسيرج السفر الرقمي وتتبع مقاييس المساعدة الذكية.'
            : 'Manage your digital travel concierge access and track your smart assistance metrics.'}
        </p>
      </header>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-success/15 border border-success/20 rounded-xl flex items-start gap-3 text-success">
          <CheckCircle2 className="flex-shrink-0 mt-0.5" size={18} />
          <span className="text-sm font-semibold font-body">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-error/15 border border-error/20 rounded-xl flex items-start gap-3 text-error">
          <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
          <span className="text-sm font-semibold font-body">{errorMsg}</span>
        </div>
      )}

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left Column: Plan & Usage Dashboard */}
        <div className="lg:col-span-8 space-y-gutter">
          {/* Plan Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden group">
            {/* Background Icon Overlay */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <Award size={120} className="text-primary" />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-body text-[10px] font-bold uppercase tracking-wider">
                    {locale === 'ar' ? 'الباقة الحالية' : 'Current Plan'}
                  </span>
                </div>
                <h2 className="font-display font-semibold text-2xl text-primary">
                  {plan.displayName}
                </h2>

                {isCanceled ? (
                  <p className="text-error font-body text-xs flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span>
                      {locale === 'ar'
                        ? `ينتهي الاشتراك في ${new Date(endDate!).toLocaleDateString()}`
                        : `Subscription ends on ${new Date(endDate!).toLocaleDateString()}`}
                    </span>
                  </p>
                ) : (
                  <p className="text-on-surface-variant font-body text-xs flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span>
                      {locale === 'ar'
                        ? `دورة الفوترة القادمة تبدأ في ${new Date(endDate || Date.now()).toLocaleDateString()}`
                        : `Your next billing cycle starts on ${new Date(endDate || Date.now()).toLocaleDateString()}.`}
                    </span>
                  </p>
                )}
              </div>

              {/* Action buttons inside plan card */}
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                {!isPro && (
                  <Button
                    variant="primary"
                    onClick={() => upgradeMutation.mutate()}
                    disabled={upgradeMutation.isPending}
                    className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold font-body text-xs shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    {upgradeMutation.isPending ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <Sparkles size={14} />
                    )}
                    <span>{t('upgradeBtn')}</span>
                  </Button>
                )}

                {isPro && !isCanceled && (
                  <>
                    {isConfirmingCancel ? (
                      <div className="flex items-center gap-2 bg-surface p-2 border border-outline-variant/30 rounded-xl">
                        <span className="text-[10px] text-error font-semibold font-body animate-pulse">
                          {locale === 'ar' ? 'تأكيد الإلغاء؟' : 'Confirm cancel?'}
                        </span>
                        <Button
                          variant="ghost"
                          onClick={() => setIsConfirmingCancel(false)}
                          className="px-2.5 py-1 text-[10px] hover:bg-surface-container rounded-lg"
                        >
                          {t('cancel')}
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => cancelMutation.mutate()}
                          disabled={cancelMutation.isPending}
                          className="px-3 py-1 text-[10px] bg-error hover:bg-error/95 text-white rounded-lg flex items-center gap-1"
                        >
                          {cancelMutation.isPending && <Loader2 className="animate-spin" size={10} />}
                          <span>{locale === 'ar' ? 'نعم' : 'Yes'}</span>
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        onClick={() => setIsConfirmingCancel(true)}
                        className="px-4 py-2.5 rounded-xl font-body text-xs font-semibold text-error hover:bg-error/5 border border-error/15"
                      >
                        {t('cancelBtn')}
                      </Button>
                    )}
                  </>
                )}

                {/* <Button
                  variant="secondary"
                  onClick={() => window.open('/pricing', '_blank')}
                  className="px-5 py-2.5 rounded-xl border-secondary text-secondary hover:bg-secondary/5 font-semibold text-xs transition-all"
                >
                  {locale === 'ar' ? 'تفاصيل الفوترة' : 'Manage Billing'}
                </Button> */}
              </div>
            </div>
          </div>

          {/* Usage Meters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {/* Daily AI Requests */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
                    <Flame size={20} />
                  </div>
                  <h3 className="font-body text-sm font-bold text-on-surface">
                    {locale === 'ar' ? 'الطلبات اليومية للذكاء الاصطناعي' : 'Daily AI Requests'}
                  </h3>
                </div>
                <span className="text-on-surface-variant font-body text-[10px] opacity-75">
                  {locale === 'ar' ? 'يتجدد يومياً' : 'Resets daily'}
                </span>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-body text-lg font-bold text-on-surface">
                    {usage.requestsToday} <span className="text-on-surface-variant font-normal text-sm">/ {plan.limits.requestsPerDay ?? '∞'}</span>
                  </span>
                  <span className="text-tertiary font-body text-xs font-semibold">
                    {plan.limits.requestsPerDay
                      ? `${getPercentage(usage.requestsToday, plan.limits.requestsPerDay).toFixed(0)}%`
                      : '0%'}
                  </span>
                </div>
                <div className="h-2 w-full bg-surface-container-low rounded-full overflow-hidden">
                  <div
                    className="h-full bg-tertiary rounded-full transition-all duration-500"
                    style={{ width: `${getPercentage(usage.requestsToday, plan.limits.requestsPerDay)}%` }}
                  />
                </div>
              </div>
              <p className="text-on-surface-variant font-body text-xs opacity-75 leading-relaxed">
                {locale === 'ar'
                  ? 'الحصة اليومية لترجمات السفر الفورية وتعديلات مسار الرحلة بالذكاء الاصطناعي.'
                  : 'Daily quota for real-time travel translations and AI itinerary modifications.'}
              </p>
            </div>

            {/* Monthly Trip Plans */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Map size={20} />
                  </div>
                  <h3 className="font-body text-sm font-bold text-on-surface">
                    {locale === 'ar' ? 'خطط الرحلات الشهرية' : 'Monthly Trip Plans'}
                  </h3>
                </div>
                <span className="text-on-surface-variant font-body text-[10px] opacity-75">
                  {locale === 'ar' ? 'تتجدد شهرياً' : 'Resets monthly'}
                </span>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-body text-lg font-bold text-on-surface">
                    {usage.tripsThisMonth} <span className="text-on-surface-variant font-normal text-sm">/ {plan.limits.tripsPerMonth ?? '∞'}</span>
                  </span>
                  <span className="text-primary font-body text-xs font-semibold">
                    {plan.limits.tripsPerMonth
                      ? `${getPercentage(usage.tripsThisMonth, plan.limits.tripsPerMonth).toFixed(0)}%`
                      : '0%'}
                  </span>
                </div>
                <div className="h-2 w-full bg-surface-container-low rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${getPercentage(usage.tripsThisMonth, plan.limits.tripsPerMonth)}%` }}
                  />
                </div>
              </div>
              <p className="text-on-surface-variant font-body text-xs opacity-75 leading-relaxed">
                {locale === 'ar'
                  ? 'عدد مسارات الرحلات الكاملة التي قمت بإنشائها عبر ذكاء رحال الاصطناعي هذا الشهر.'
                  : 'Comprehensive end-to-end itineraries generated by Rahal AI this month.'}
              </p>
            </div>
          </div>

          {/* Dynamic Comparison Grid */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-outline-variant/10">
              <h3 className="font-display font-semibold text-lg text-on-surface">
                {locale === 'ar' ? 'مقارنة باقات الاشتراك' : 'Plan Comparison'}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className="p-4 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      {locale === 'ar' ? 'الميزة' : 'Feature'}
                    </th>
                    {availablePlans.map((p) => (
                      <th
                        key={p._id}
                        className={`p-4 font-body text-xs font-bold uppercase tracking-wider ${p.name === planName
                          ? 'text-primary bg-primary/5'
                          : 'text-on-surface-variant'
                          }`}
                      >
                        {p.displayName} {p.name === planName && (locale === 'ar' ? '(الحالية)' : '(Current)')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 font-body text-sm">
                  {/* Monthly Trip Plans Row */}
                  <tr>
                    <td className="p-4 text-on-surface font-medium">
                      {locale === 'ar' ? 'خطط الرحلات الشهرية' : 'Monthly Trips'}
                    </td>
                    {availablePlans.map((p) => (
                      <td
                        key={p._id}
                        className={`p-4 ${p.name === planName ? 'bg-primary/5 font-semibold text-primary' : 'text-on-surface-variant'}`}
                      >
                        {p.limits.tripsPerMonth ?? (locale === 'ar' ? 'لا محدود' : 'Unlimited')}
                      </td>
                    ))}
                  </tr>

                  {/* Daily AI Requests Row */}
                  <tr>
                    <td className="p-4 text-on-surface font-medium">
                      {locale === 'ar' ? 'الطلبات اليومية للذكاء الاصطناعي' : 'Daily AI Requests'}
                    </td>
                    {availablePlans.map((p) => (
                      <td
                        key={p._id}
                        className={`p-4 ${p.name === planName ? 'bg-primary/5 font-semibold text-primary' : 'text-on-surface-variant'}`}
                      >
                        {p.limits.requestsPerDay ?? (locale === 'ar' ? 'لا محدود' : 'Unlimited')}
                      </td>
                    ))}
                  </tr>

                  {/* Monthly Tokens Row */}
                  <tr>
                    <td className="p-4 text-on-surface font-medium">
                      {locale === 'ar' ? 'الرموز الشهرية (مخرجات الذكاء الاصطناعي)' : 'Monthly AI Tokens'}
                    </td>
                    {availablePlans.map((p) => (
                      <td
                        key={p._id}
                        className={`p-4 ${p.name === planName ? 'bg-primary/5 font-semibold text-primary' : 'text-on-surface-variant'}`}
                      >
                        {p.limits.tokensPerMonth ? p.limits.tokensPerMonth.toLocaleString() : (locale === 'ar' ? 'لا محدود' : 'Unlimited')}
                      </td>
                    ))}
                  </tr>

                  {/* Price Row */}
                  <tr>
                    <td className="p-4 text-on-surface font-medium">
                      {locale === 'ar' ? 'السعر' : 'Price'}
                    </td>
                    {availablePlans.map((p) => (
                      <td
                        key={p._id}
                        className={`p-4 ${p.name === planName ? 'bg-primary/5 font-bold text-primary' : 'text-on-surface-variant font-medium'}`}
                      >
                        {p.price.monthly === 0
                          ? (locale === 'ar' ? 'مجاني' : 'Free')
                          : `$${p.price.monthly} / ${locale === 'ar' ? 'شهر' : 'mo'}`}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Upgrade Prompt & Activity Log */}
        <div className="lg:col-span-4 space-y-gutter font-body">
          {/* Upgrade Prompt Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 md:p-8 relative overflow-hidden group shadow-lg text-on-surface">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-20 dark:opacity-40 pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="text-white" size={24} />
              </div>
              <div>

                <h3 className="font-display font-semibold text-lg text-primary mb-2">
                  {locale === 'ar' ? 'الارتقاء إلى كونسيرج محترف' : 'Ascend to Voyager Pro'}
                </h3>

                <p className="text-on-surface/70 text-xs leading-relaxed">
                  {locale === 'ar'
                    ? 'أطلق العنان للقوة الكاملة لذكاء رحال مع توليد عدد غير محدود من مسارات السفر، والدعم الفوري على مدار الساعة، وخصومات الفنادق الحصرية.'
                    : 'Unlock the full power of Rahal AI with unlimited travel generation, priority concierge chatbot support, and exclusive luxury hotel booking rates.'}
                </p>
              </div>

              <ul className="space-y-3 text-xs text-on-surface/80 font-medium">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-primary" />
                  <span>{locale === 'ar' ? 'خطط رحلات ذكاء اصطناعي غير محدودة' : 'Unlimited AI Itineraries'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-primary" />
                  <span>{locale === 'ar' ? 'أولوية المحادثة الفورية مع كونسيرج' : 'Priority Concierge Assistance'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-primary" />
                  <span>{locale === 'ar' ? 'خرائط بدون اتصال ومقالات تاريخية' : 'Offline Access & Historical Guides'}</span>
                </li>
              </ul>

              {!isPro && (
                <button
                  onClick={() => upgradeMutation.mutate()}
                  disabled={upgradeMutation.isPending}
                  className="w-full py-3.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {upgradeMutation.isPending ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <ArrowUpRight size={14} />
                  )}
                  <span>{locale === 'ar' ? 'الترقية للمحترفين – $20/شهر' : 'Go Pro – $20/mo'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-body text-sm font-bold text-on-surface mb-6 flex items-center gap-2">
                <History size={16} className="text-primary" />
                <span>{locale === 'ar' ? 'آخر الأنشطة' : 'Recent Activity'}</span>
              </h3>

              {sortedActivities.length === 0 ? (
                <div className="text-center py-8 text-on-surface-variant/60 text-xs">
                  {locale === 'ar' ? 'لا توجد أنشطة مؤخراً.' : 'No recent activity.'}
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedActivities.map((act, index) => (
                    <div key={index} className="flex gap-3 text-left">
                      <div className="mt-1 flex-shrink-0">
                        <div className={`w-2.5 h-2.5 rounded-full ${act.color}`} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-on-surface leading-tight">
                          {act.title}
                        </p>
                        <p className="text-[10px] text-on-surface-variant opacity-75">
                          {act.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => window.location.href = '/trips'}
              className="w-full mt-8 text-primary font-body text-xs font-bold flex items-center justify-center gap-1.5 hover:underline bg-transparent border-none cursor-pointer"
            >
              <span>{locale === 'ar' ? 'عرض السجل الكامل' : 'View Full History'}</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
