'use client';

import React, { use, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { 
  ArrowLeft, Calendar, Users, ShieldCheck, CreditCard, 
  MapPin, AlertTriangle, Loader2, Bed, 
  FileText, Sparkles, Download, Mail, Phone, 
  MessageSquare, CheckCircle2, XCircle, Check
} from 'lucide-react';
import { useBookingDetailsQuery, useCancelBookingMutation, useCreateCheckoutMutation } from '@/hooks/useBookings';
import { getLocalized, type LocalizedString } from '@/lib/utils/localized';

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default function BookingStatusPage({ params }: PageProps) {
  const { id } = use(params);
  const locale = useLocale();
  const t = useTranslations('bookings');

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info'>('info');
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

  const { data: response, isLoading, isError, refetch } = useBookingDetailsQuery(id);
  const booking = response?.data;

  const cancelMutation = useCancelBookingMutation();
  const checkoutMutation = useCreateCheckoutMutation();

  const isAr = locale === 'ar';

  // Toast trigger helper
  const triggerToast = (msg: string, type: 'success' | 'info' = 'info') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMsg(prev => prev === msg ? null : prev);
    }, 3500);
  };

  // Format date helper
  const formatDate = (dateStr?: string, includeWeekday = true) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(locale, {
        ...(includeWeekday && { weekday: 'short' }),
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Format price helper
  const formatPrice = (price?: number, currencyCode?: string) => {
    if (price === undefined) return '';
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode || 'USD',
        maximumFractionDigits: 2,
      }).format(price);
    } catch {
      return `${currencyCode || '$'} ${price}`;
    }
  };

  // Calculate nights count
  const getNightsCount = () => {
    if (!booking?.checkIn || !booking?.checkOut) return 0;
    try {
      const inDate = new Date(booking.checkIn);
      const outDate = new Date(booking.checkOut);
      const diffTime = Math.abs(outDate.getTime() - inDate.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  const nights = getNightsCount();

  // Cancel booking action
  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(id);
      setShowCancelConfirm(false);
      triggerToast(isAr ? 'تم إلغاء الحجز بنجاح.' : 'Reservation successfully cancelled.', 'success');
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    }
  };

  // Pay Now Stripe checkout action
  const handlePayNow = async () => {
    try {
      await checkoutMutation.mutateAsync(id);
    } catch (err) {
      console.error('Failed to initiate payment:', err);
    }
  };

  // Action Triggers for Status Page
  const handleDownloadReceipt = () => {
    triggerToast(t('statusPage.toast.receiptDownloading'), 'info');
    setTimeout(() => {
      window.print();
    }, 1000);
  };

  const handleEmailConfirmation = () => {
    triggerToast(t('statusPage.toast.emailSent'), 'success');
  };

  const handleStartChat = () => {
    triggerToast(isAr ? 'جاري بدء محادثة الذكاء الاصطناعي...' : 'Starting AI Chat...', 'info');
  };

  // Loading state shimmer
  if (isLoading || !mounted) {
    return (
      <div className="pt-32 pb-20 px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto w-full animate-pulse">
        <div className="h-6 w-32 bg-surface-container rounded mb-8"></div>
        <div className="h-10 w-1/3 bg-surface-container rounded mb-4"></div>
        <div className="h-4 w-1/2 bg-surface-container rounded mb-12"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-80 bg-surface-container rounded-xl"></div>
            <div className="h-48 bg-surface-container rounded-xl"></div>
            <div className="h-64 bg-surface-container rounded-xl"></div>
          </div>
          <div className="lg:col-span-4 h-96 bg-surface-container rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !booking) {
    return (
      <div className="pt-32 pb-20 px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto w-full flex-1 flex flex-col justify-center items-center">
        <div className="bg-error/10 p-4 rounded-full text-error mb-4">
          <AlertTriangle size={32} />
        </div>
        <h3 className="font-display font-bold text-xl text-on-surface mb-2">
          {t('errorStateTitle')}
        </h3>
        <p className="text-on-surface-variant text-sm mb-6 text-center max-w-sm">
          {t('errorStateSubtitle')}
        </p>
        <div className="flex gap-4">
          <Link 
            href="/bookings"
            className="px-6 py-2.5 bg-surface border border-outline-variant rounded-lg text-on-surface font-semibold text-sm hover:bg-surface-container transition-all"
          >
            {t('statusPage.returnToBookings')}
          </Link>
          <button
            onClick={() => refetch()}
            className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 cursor-pointer shadow-sm animate-none"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  const hotelObj = typeof booking.hotel === 'object' ? booking.hotel : null;
  const hotelName = hotelObj
    ? (locale === 'ar' ? hotelObj.name.ar : hotelObj.name.en)
    : 'Hotel';
  const hotelAddress = getLocalized(hotelObj?.address as LocalizedString, locale) || 'Cairo, Egypt';
  const coverImage = hotelObj?.coverImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcW6zabnz89JakVv5tJpTIym0oQM78RY6SoYtGrhmUNswL26nCek7IYwkLkcG4qdRMixni_LrE_bRTauUSsRcEsILaimAT4IafrOoOpQwnJTDYiGirKuWJWbljpuUCSDz-WBR6h0g61zZbghCYGwZGWytjh7toWMiKIb3f5v2Jg_V7ZmgGZOT2VfLePp9q3GZk-uFjS1U1I6y_fi3GWsAU8Ufx7TYrJc4rVfSrJxdPpwCOnzjSZX53OR_VbnVt9pZI31H-wLaz95A';

  const checkInDate = new Date(booking.checkIn);
  const isFutureBooking = checkInDate > new Date();
  const canCancel = (booking.status === 'pending' || booking.status === 'confirmed') && isFutureBooking;
  const needsPayment = booking.paymentStatus === 'pending' && booking.status !== 'canceled';

  // Dynamic Timeline logic:
  const isCanceled = booking.status === 'canceled';
  const isConfirmed = booking.status === 'confirmed' || booking.status === 'completed';
  const isCompleted = booking.status === 'completed' || new Date(booking.checkOut) < new Date();

  let activeWidth = '0%';
  if (isCanceled) {
    activeWidth = '0%';
  } else if (isCompleted) {
    activeWidth = '100%';
  } else if (isConfirmed) {
    activeWidth = '50%';
  }

  // Pricing math: Total price is split into Base Price (totalPrice / 1.15), 10% Service Charge, and 5% Tourism Tax.
  const totalPrice = booking.totalPrice || 0;
  const basePrice = totalPrice / 1.15;
  const serviceCharge = basePrice * 0.10;
  const tourismTax = basePrice * 0.05;
  const nightlyRate = basePrice / (nights || 1);

  // Format payment date (fallback to updatedAt or checkIn minus 30 days)
  const paymentDate = booking.updatedAt ? formatDate(booking.updatedAt, false) : formatDate(booking.createdAt, false);

  return (
    <main className="pt-32 pb-20 px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto w-full flex-1 flex flex-col relative">
      {/* Dynamic Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 max-w-sm w-full px-4 print:hidden">
          <div className={`p-4 rounded-xl shadow-xl border flex items-center gap-3 ${
            toastType === 'success' 
              ? 'bg-success text-white border-success-container' 
              : 'bg-[#141008] text-white border-primary/20'
          }`}>
            {toastType === 'success' ? (
              <Check size={18} className="shrink-0 bg-white/20 p-0.5 rounded-full text-white" />
            ) : (
              <Sparkles size={18} className="shrink-0 text-primary animate-pulse" />
            )}
            <p className="text-xs font-semibold leading-relaxed">{toastMsg}</p>
          </div>
        </div>
      )}

      {/* Back Action / Header Row */}
      <div className="mb-8 print:hidden">
        <Link 
          href="/bookings"
          className="group inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-all text-sm font-semibold"
        >
          <ArrowLeft size={16} className={`transition-transform ${isAr ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
          <span>{t('statusPage.returnToBookings')}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left Column: Details, Timeline & AI Insights */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Hero cover photo card */}
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-xl overflow-hidden shadow-sm border border-outline-variant/10 group">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
              style={{ backgroundImage: `url('${coverImage}')` }}
              role="img"
              aria-label={hotelName}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141008]/80 via-[#141008]/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white text-left rtl:text-right">
              <span className={`px-3 py-1 rounded-full font-bold text-[10px] tracking-wider mb-3 inline-block border ${
                isCanceled
                  ? 'bg-error text-white border-error/20'
                  : isConfirmed
                  ? 'bg-primary text-white border-primary/20 shadow-[inset_0_0_10px_rgba(200,146,42,0.2),0_4px_12px_rgba(200,146,42,0.12)]'
                  : 'bg-primary/20 text-primary border-primary/30'
              }`}>
                {isCanceled 
                  ? t('status.canceled') 
                  : isConfirmed 
                  ? t('status.confirmed') 
                  : t('status.pending')}
              </span>
              <h1 className="font-display font-bold text-2xl md:text-3xl text-white mb-2 leading-tight">
                {hotelName}
              </h1>
              <p className="flex items-center gap-1.5 opacity-90 text-xs md:text-sm font-medium">
                <MapPin size={15} className="text-primary-fixed-dim shrink-0" />
                <span>{hotelAddress}</span>
              </p>
            </div>
          </div>

          {/* Booking Journey Timeline */}
          <section className="bg-surface-container-low p-6 md:p-8 rounded-xl border border-outline-variant/30 print:hidden">
            <h2 className="font-display font-bold text-lg md:text-xl text-on-surface mb-8">
              {t('statusPage.journeyTitle')}
            </h2>
            <div className="relative flex items-center justify-between w-full">
              {/* Horizontal Timeline Line */}
              <div className="absolute top-6 left-0 w-full h-0.5 bg-surface-variant -translate-y-1/2 z-0" />
              <div 
                className="absolute top-6 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-700 ease-out" 
                style={{ 
                  width: activeWidth, 
                  left: isAr ? 'auto' : '0', 
                  right: isAr ? '0' : 'auto' 
                }} 
              />

              {/* Step 1: Booked */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 border transition-all duration-300 ${
                  isCanceled
                    ? 'bg-surface-variant text-on-surface-variant border-outline-variant/30'
                    : 'bg-primary text-white shadow-[inset_0_0_10px_rgba(200,146,42,0.2),0_4px_12px_rgba(200,146,42,0.12)] border-primary'
                }`}>
                  <Calendar size={18} />
                </div>
                <span className={`font-semibold text-xs md:text-sm ${isCanceled ? 'text-on-surface-variant' : 'text-primary font-bold'}`}>
                  {t('statusPage.journey.booked')}
                </span>
                <span className="text-[9px] md:text-[10px] text-on-surface-variant mt-1.5 font-medium">
                  {formatDate(booking.createdAt, false)}
                </span>
              </div>

              {/* Step 2: Confirmed */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 border transition-all duration-300 ${
                  !isCanceled && isConfirmed 
                    ? 'bg-primary text-white shadow-[inset_0_0_10px_rgba(200,146,42,0.2),0_4px_12px_rgba(200,146,42,0.12)] border-primary' 
                    : 'bg-surface-variant text-on-surface-variant border-outline-variant/30'
                }`}>
                  <CheckCircle2 size={18} className={!isCanceled && isConfirmed ? 'fill-white/10' : ''} />
                </div>
                <span className={`font-semibold text-xs md:text-sm transition-all duration-300 ${!isCanceled && isConfirmed ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                  {t('statusPage.journey.confirmed')}
                </span>
                <span className="text-[9px] md:text-[10px] text-on-surface-variant mt-1.5 font-medium">
                  {!isCanceled && isConfirmed ? paymentDate : '-'}
                </span>
              </div>

              {/* Step 3: Completed */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 border transition-all duration-300 ${
                  !isCanceled && isCompleted 
                    ? 'bg-primary text-white shadow-[inset_0_0_10px_rgba(200,146,42,0.2),0_4px_12px_rgba(200,146,42,0.12)] border-primary' 
                    : 'bg-surface-variant text-on-surface-variant border-outline-variant/30'
                }`}>
                  <Bed size={18} />
                </div>
                <span className={`font-semibold text-xs md:text-sm transition-all duration-300 ${!isCanceled && isCompleted ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                  {t('statusPage.journey.completed')}
                </span>
                <span className="text-[9px] md:text-[10px] text-on-surface-variant mt-1.5 font-medium">
                  {!isCanceled && isCompleted ? formatDate(booking.checkOut, false) : (isAr ? 'مستقبلي' : 'Future')}
                </span>
              </div>
            </div>
          </section>

          {/* Reservation Details Bento Box */}
          <section className="bg-surface p-6 md:p-8 rounded-xl border border-outline-variant/30 flex flex-col gap-6">
            <h2 className="font-display font-bold text-lg md:text-xl text-on-surface">
              {t('detail.detailsTitle')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stay Dates */}
              <div className="flex items-start gap-4">
                <div className="bg-secondary/10 p-3 rounded-lg text-secondary shrink-0">
                  <Calendar size={18} />
                </div>
                <div className="text-left rtl:text-right leading-snug">
                  <p className="text-xs uppercase tracking-wider text-on-surface-variant/75 font-bold">
                    {t('detail.datesTitle')}
                  </p>
                  <p className="text-sm font-bold text-on-surface mt-1">
                    {formatDate(booking.checkIn, false)} - {formatDate(booking.checkOut, false)}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {nights} {isAr ? 'ليالٍ إجمالاً' : 'Nights Total'}
                  </p>
                </div>
              </div>

              {/* Guests Breakdown */}
              <div className="flex items-start gap-4">
                <div className="bg-secondary/10 p-3 rounded-lg text-secondary shrink-0">
                  <Users size={18} />
                </div>
                <div className="text-left rtl:text-right leading-snug">
                  <p className="text-xs uppercase tracking-wider text-on-surface-variant/75 font-bold">
                    {t('guests')}
                  </p>
                  <p className="text-sm font-bold text-on-surface mt-1">
                    {t('detail.guestsCount', { guests: booking.guests })}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {t('detail.guestsDetail', { adults: booking.guests, children: 0 })}
                  </p>
                </div>
              </div>

              {/* Confirmation Number */}
              <div className="flex items-start gap-4">
                <div className="bg-secondary/10 p-3 rounded-lg text-secondary shrink-0">
                  <FileText size={18} />
                </div>
                <div className="text-left rtl:text-right leading-snug">
                  <p className="text-xs uppercase tracking-wider text-on-surface-variant/75 font-bold">
                    {t('statusPage.confirmationNum')}
                  </p>
                  <p className="text-sm font-bold text-on-surface mt-1">
                    RH-{booking._id.slice(-6).toUpperCase()}-ASW
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {t('statusPage.confirmationNote')}
                  </p>
                </div>
              </div>

              {/* Policies */}
              <div className="flex items-start gap-4">
                <div className="bg-secondary/10 p-3 rounded-lg text-secondary shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div className="text-left rtl:text-right leading-snug">
                  <p className="text-xs uppercase tracking-wider text-on-surface-variant/75 font-bold">
                    {t('statusPage.policiesTitle')}
                  </p>
                  <p className="text-sm font-bold text-on-surface mt-1">
                    {t('statusPage.policiesDesc').split('|')[0].trim()}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {t('statusPage.policiesDesc').split('|')[1]?.trim() || '3:00 PM Arrival'}
                  </p>
                </div>
              </div>
            </div>

            {/* Nile-themed AI Insight Chip */}
            <div className="mt-4 bg-secondary/5 border border-secondary/10 p-4 rounded-lg flex items-center gap-3 text-left rtl:text-right">
              <Sparkles size={18} className="text-secondary shrink-0 fill-secondary/10 animate-pulse" />
              <p className="text-xs md:text-sm text-secondary leading-relaxed">
                <span className="font-bold">{t('detail.rahalInsightTitle') || 'Rahal Insight'}: </span>
                {t('statusPage.aiInsight')}
              </p>
            </div>
          </section>

        </div>

        {/* Right Column: Payment & Support Contact Info */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Payment breakdown invoice card */}
          <section className="bg-surface-container-lowest p-6 md:p-8 rounded-xl border border-outline-variant/30 shadow-sm hover:border-outline/20 transition-all sticky top-28 print:border-none print:shadow-none print:p-0">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/20">
              <h3 className="font-display font-bold text-lg text-on-surface">
                {t('detail.paymentSummary')}
              </h3>
              <span className={`font-bold text-[10px] px-2.5 py-1 rounded-full border ${
                booking.paymentStatus === 'succeeded'
                  ? 'bg-success/10 text-success border-success/20'
                  : 'bg-primary/10 text-primary border-primary/20'
              }`}>
                {booking.paymentStatus === 'succeeded' 
                  ? t('statusPage.paidBadge') 
                  : t('statusPage.unpaidBadge')}
              </span>
            </div>

            {/* Dynamic Math Price Items */}
            <div className="space-y-4 mb-6 text-xs md:text-sm leading-relaxed">
              <div className="flex justify-between text-on-surface-variant">
                <span>
                  {t('statusPage.breakdown.nights', { 
                    nights, 
                    price: formatPrice(nightlyRate, booking.currency) 
                  })}
                </span>
                <span className="font-bold text-on-surface">{formatPrice(basePrice, booking.currency)}</span>
              </div>

              <div className="flex justify-between text-on-surface-variant">
                <span>{t('statusPage.breakdown.service')}</span>
                <span className="font-bold text-on-surface">{formatPrice(serviceCharge, booking.currency)}</span>
              </div>

              <div className="flex justify-between text-on-surface-variant">
                <span>{t('statusPage.breakdown.tax')}</span>
                <span className="font-bold text-on-surface">{formatPrice(tourismTax, booking.currency)}</span>
              </div>

              <div className="pt-4 border-t border-outline-variant/20 flex justify-between items-center">
                <span className="font-bold text-on-surface text-sm md:text-base">{t('detail.totalPaid')}</span>
                <span className="font-display font-bold text-primary text-xl md:text-2xl">
                  {formatPrice(totalPrice, booking.currency)}
                </span>
              </div>
            </div>

            {/* Stripe Card details display if Paid */}
            {booking.paymentStatus === 'succeeded' && (
              <div className="bg-surface p-3.5 rounded-xl border border-outline-variant/20 flex items-center gap-3.5 mb-6 text-left rtl:text-right">
                <div className="w-11 h-7 bg-on-surface text-white rounded flex items-center justify-center text-[9px] font-extrabold tracking-widest shrink-0 shadow-sm">
                  VISA
                </div>
                <div className="leading-snug">
                  <p className="font-bold text-xs text-on-surface">
                    {t('detail.visaCard', { last4: '4421' })}
                  </p>
                  <p className="text-on-surface-variant text-[10px]">
                    {t('detail.paidOn', { date: paymentDate })}
                  </p>
                </div>
              </div>
            )}

            {/* Action CTAs */}
            <div className="flex flex-col gap-3 print:hidden">
              {needsPayment ? (
                <button 
                  onClick={handlePayNow}
                  disabled={checkoutMutation.isPending}
                  className="w-full py-3.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all font-bold active:scale-95 shadow-md hover:shadow flex items-center justify-center gap-2 text-sm cursor-pointer border border-primary/20"
                >
                  {checkoutMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CreditCard size={16} />
                  )}
                  <span>{t('payNow')}</span>
                </button>
              ) : (
                <>
                  <button 
                    onClick={handleDownloadReceipt}
                    className="w-full py-3.5 rounded-lg bg-primary text-white hover:bg-primary/95 transition-all font-bold active:scale-95 shadow-md hover:shadow flex items-center justify-center gap-2 text-sm cursor-pointer border border-primary/20 shadow-primary/10"
                  >
                    <Download size={16} />
                    <span>{t('statusPage.downloadReceipt')}</span>
                  </button>
                  <button 
                    onClick={handleEmailConfirmation}
                    className="w-full py-3.5 border-2 border-secondary text-secondary hover:bg-secondary/5 rounded-lg font-bold flex items-center justify-center gap-2 text-sm transition-all cursor-pointer"
                  >
                    <Mail size={16} />
                    <span>{t('statusPage.emailConfirmation')}</span>
                  </button>
                </>
              )}

              {/* Danger Zone Cancellation Trigger inside Payment Box */}
              {!isCanceled && (
                <div className="mt-2 border-t border-outline-variant/20 pt-4 w-full">
                  {showCancelConfirm ? (
                    <div className="flex flex-col gap-3 p-3 bg-error/5 border border-error/20 rounded-xl">
                      <p className="text-xs font-bold text-error text-center">{t('detail.cancelConfirmTitle')}</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={handleCancel}
                          disabled={cancelMutation.isPending}
                          className="flex-1 py-2 bg-error text-white text-xs font-semibold rounded hover:bg-error/90 transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          {cancelMutation.isPending && <Loader2 size={12} className="animate-spin" />}
                          {isAr ? 'نعم، إلغاء' : 'Yes, Cancel'}
                        </button>
                        <button 
                          onClick={() => setShowCancelConfirm(false)}
                          disabled={cancelMutation.isPending}
                          className="flex-1 py-2 bg-surface text-on-surface text-xs font-semibold rounded border border-outline-variant hover:bg-surface-container transition-all cursor-pointer"
                        >
                          {isAr ? 'تراجع' : 'No'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    canCancel && (
                      <button 
                        onClick={() => setShowCancelConfirm(true)}
                        className="w-full py-2.5 rounded-lg text-error hover:bg-error/5 font-semibold active:scale-95 transition-all text-xs cursor-pointer flex items-center justify-center gap-1.5 border border-transparent hover:border-error/20"
                      >
                        <XCircle size={14} />
                        <span>{t('cancelBooking')}</span>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Dynamic Cancellation Policy Note */}
            {!isCanceled && (
              <p className="mt-4 text-[10px] text-center text-on-surface-variant leading-relaxed italic print:hidden">
                {isAr 
                  ? 'سياسة الإلغاء: إلغاء مجاني حتى 48 ساعة قبل يوم الوصول. بعد ذلك، تطبق رسوم قدرها 50٪.'
                  : 'Cancellation policy: Free cancellation until 48 hours prior to check-in. After this, a 50% fee applies.'}
              </p>
            )}
          </section>

          {/* 24/7 Support Desk Block */}
          <section className="bg-[#141008] text-white p-6 rounded-xl border border-primary/10 shadow-md flex flex-col gap-4 print:hidden">
            <h4 className="font-display font-bold text-lg text-primary">
              {t('statusPage.helpTitle')}
            </h4>
            <p className="text-xs opacity-80 leading-relaxed font-medium text-left rtl:text-right">
              {t('statusPage.helpDesc')}
            </p>
            <div className="flex flex-col gap-2.5 mt-2">
              <a 
                href="tel:+20123456789"
                className="flex items-center gap-3 text-primary hover:text-primary-fixed hover:underline transition-all text-xs font-bold"
              >
                <Phone size={15} className="shrink-0" />
                <span>+20 (0) 123 456 789</span>
              </a>
              <button 
                onClick={handleStartChat}
                className="flex items-center gap-3 text-primary hover:text-primary-fixed hover:underline transition-all text-xs font-bold self-start cursor-pointer border-none bg-transparent p-0 animate-none"
              >
                <MessageSquare size={15} className="shrink-0" />
                <span>{t('statusPage.startChat')}</span>
              </button>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
