'use client';

import React, { useState, useEffect, use } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Check, X, Clock, Info, Calendar, Compass, 
  ArrowLeft, Share2, Download, RefreshCw, AlertTriangle, 
  Loader2, CreditCard, Landmark, CheckCircle2
} from 'lucide-react';
import { useBookingDetailsQuery } from '@/hooks/useBookings';
import Button from '@/components/ui/Button';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function BookingStatusPage({ params }: PageProps) {
  const unwrappedParams = use(params);
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const t = useTranslations('bookings');

  const bookingId = searchParams.get('bookingId') || '';
  const statusParam = searchParams.get('status') || 'success';

  const [simulatedLoading, setSimulatedLoading] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info'>('info');

  const isAr = locale === 'ar';

  // Fetch Booking Details
  const { data: response, isLoading: apiLoading, isError, refetch } = useBookingDetailsQuery(bookingId);
  const booking = response?.data;

  // Toast trigger helper
  const triggerToast = (msg: string, type: 'success' | 'info' = 'info') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMsg(prev => prev === msg ? null : prev);
    }, 3500);
  };

  // Countdown timer for Canceled/Failed state
  useEffect(() => {
    if (statusParam === 'failed') {
      const timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [statusParam]);

  // Confetti trigger for Success state
  useEffect(() => {
    if (statusParam === 'success' && !simulatedLoading && !apiLoading && booking) {
      createConfetti();
    }
  }, [statusParam, simulatedLoading, apiLoading, booking]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Confetti Animation Logic
  const createConfetti = () => {
    const container = document.getElementById('confetti-container');
    if (!container) return;
    container.innerHTML = '';
    const colors = ['#C8922A', '#1B4B6E', '#E8543A', '#2D7A4F'];
    
    for (let i = 0; i < 60; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.top = '-10px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      
      container.appendChild(confetti);

      const animation = confetti.animate([
        { transform: `translate3d(0,0,0) rotate(0deg)`, opacity: 1 },
        { transform: `translate3d(${(Math.random() - 0.5) * 200}px, ${window.innerHeight}px, 0) rotate(${Math.random() * 1000}deg)`, opacity: 0 }
      ], {
        duration: Math.random() * 3000 + 2000,
        easing: 'cubic-bezier(0, .9, .57, 1)',
        delay: Math.random() * 500
      });

      animation.onfinish = () => confetti.remove();
    }
  };

  // Share booking details action
  const handleShare = () => {
    const bookingUrl = `${window.location.origin}/bookings/${bookingId}`;
    if (navigator.share) {
      navigator.share({
        title: t('statusPage.successTitle'),
        text: `My Egyptian travel booking confirmation.`,
        url: bookingUrl,
      }).catch(err => console.log('Share canceled', err));
    } else {
      navigator.clipboard.writeText(bookingUrl);
      triggerToast(t('statusPage.shareSuccessToast'), 'success');
    }
  };

  // Download Receipt (mock)
  const handleDownloadReceipt = () => {
    triggerToast(t('statusPage.toast.receiptDownloading'), 'info');
    // Simulate simple printable receipt
    setTimeout(() => {
      window.print();
    }, 1000);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr || '';
    }
  };

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

  // Render Loader if details are fetching
  if ((apiLoading || !booking) && statusParam !== 'loading') {
    return (
      <main className="container mx-auto px-margin-mobile md:px-margin-desktop py-24 flex flex-col items-center justify-center min-h-[60vh] z-10">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-on-surface-variant font-medium text-sm">
            {t('loading')}
          </p>
        </div>
      </main>
    );
  }

  const hotelObj = typeof booking?.hotel === 'object' ? booking.hotel : null;
  const hotelName = hotelObj ? (locale === 'ar' ? hotelObj.name.ar : hotelObj.name.en) : 'Hotel';

  // Render Loading / Payment Simulation State
  if (simulatedLoading) {
    return (
      <main className="container mx-auto px-margin-mobile md:px-margin-desktop py-24 flex flex-col items-center justify-center min-h-[70vh] z-10">
        <style dangerouslySetInnerHTML={{ __html: `
          .payment-card-pulse {
            animation: card-pulse 1.8s infinite ease-in-out;
          }
          @keyframes card-pulse {
            0%, 100% { transform: scale(1); opacity: 0.95; }
            50% { transform: scale(1.02); opacity: 1; box-shadow: 0 20px 40px -5px rgba(200, 146, 42, 0.2); }
          }
        `}} />
        <div className="w-full max-w-md p-8 md:p-12 text-center bg-surface/80 backdrop-blur-xl border border-primary/10 rounded-2xl shadow-xl payment-card-pulse">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <CreditCard className="w-10 h-10 text-primary animate-bounce" />
              </div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <h1 className="font-display font-bold text-2xl text-primary mb-3">
            {t('statusPage.simulatingPayment')}
          </h1>
          <p className="text-sm text-on-surface-variant max-w-xs mx-auto leading-relaxed">
            {t('statusPage.doNotRefresh')}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-margin-mobile md:px-margin-desktop py-20 flex flex-col items-center justify-center min-h-[80vh] z-10 relative">
      <style dangerouslySetInnerHTML={{ __html: `
        .success-checkmark-anim {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: dash 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
          animation-delay: 0.2s;
        }
        .success-circle-anim {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 2;
          stroke-miterlimit: 10;
          stroke: #2D7A4F;
          fill: none;
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        @keyframes stroke { 100% { stroke-dashoffset: 0; } }
        @keyframes dash { 100% { stroke-dashoffset: 0; } }
        
        .confetti-piece {
          position: absolute;
          width: 8px;
          height: 8px;
          opacity: 0;
          pointer-events: none;
        }

        .glass-card {
          background: rgba(252, 249, 244, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(200, 146, 42, 0.1);
        }
        .dark .glass-card {
          background: rgba(22, 20, 15, 0.8);
          border: 1px solid rgba(248, 188, 81, 0.15);
        }

        .shadow-warm-gold {
          box-shadow: 0 10px 30px -5px rgba(200, 146, 42, 0.12);
        }
        .dark .shadow-warm-gold {
          box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.5);
        }
      `}} />

      {/* Dynamic Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 max-w-sm w-full px-4 print:hidden">
          <div className={`p-4 rounded-xl shadow-xl border flex items-center gap-3 ${
            toastType === 'success' 
              ? 'bg-success text-white border-success-container' 
              : 'bg-[#141008] text-white border-primary/20'
          }`}>
            <Check size={18} className="shrink-0 bg-white/20 p-0.5 rounded-full text-white" />
            <p className="text-xs font-semibold leading-relaxed">{toastMsg}</p>
          </div>
        </div>
      )}

      {/* Confetti Container */}
      <div className="fixed inset-0 pointer-events-none z-0" id="confetti-container"></div>

      {/* Success View */}
      {statusParam === 'success' && booking && (
        <section className="w-full max-w-2xl animate-in fade-in zoom-in duration-700 z-10">
          <div className="glass-card rounded-2xl shadow-warm-gold p-8 md:p-12 text-center relative overflow-hidden">
            {/* Checkmark Animation */}
            <div className="mb-8 flex justify-center">
              <svg className="w-24 h-24" viewBox="0 0 52 52">
                <circle className="success-circle-anim" cx="26" cy="26" fill="none" r="25"></circle>
                <path className="success-checkmark-anim" d="M14.1 27.2l7.1 7.2 16.7-16.8" fill="none" stroke="#2D7A4F" strokeWidth="3"></path>
              </svg>
            </div>
            
            <h1 className="font-display font-bold text-3xl md:text-4xl mb-4 text-primary">
              {t('statusPage.successTitle')}
            </h1>
            
            <p className="text-base md:text-lg text-on-surface-variant mb-10 max-w-md mx-auto leading-relaxed">
              {t('statusPage.successDescription')}
            </p>

            {/* Summary Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left rtl:text-right mb-8">
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                <span className="block text-[10px] uppercase tracking-wider text-on-surface-variant/70 font-bold mb-1">
                  {t('statusPage.sanctuary')}
                </span>
                <span className="font-display font-semibold text-lg text-secondary">
                  {hotelName}
                </span>
              </div>
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                <span className="block text-[10px] uppercase tracking-wider text-on-surface-variant/70 font-bold mb-1">
                  {t('statusPage.timeHorizon')}
                </span>
                <span className="font-semibold text-sm text-secondary">
                  {formatDate(booking.checkIn)} — {formatDate(booking.checkOut)}
                </span>
              </div>
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                <span className="block text-[10px] uppercase tracking-wider text-on-surface-variant/70 font-bold mb-1">
                  {t('statusPage.exchange')}
                </span>
                <span className="font-display font-bold text-lg text-primary">
                  {formatPrice(booking.totalPrice, booking.currency)}
                </span>
              </div>
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                <span className="block text-[10px] uppercase tracking-wider text-on-surface-variant/70 font-bold mb-1">
                  {t('statusPage.edictId')}
                </span>
                <span className="font-mono font-bold text-base text-secondary">
                  #RH-{booking._id.slice(-6).toUpperCase()}-XC
                </span>
              </div>
            </div>

            {/* Mocked Transaction Card */}
            <div className="mb-10 p-5 bg-surface-container rounded-xl border border-outline-variant/20 text-left rtl:text-right">
              <h3 className="font-display font-bold text-sm text-on-surface mb-3 uppercase tracking-wider">
                {t('statusPage.confirmationNote')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                <div>
                  <p className="text-on-surface-variant/70 mb-1">{t('statusPage.transactionIdLabel')}</p>
                  <p className="text-on-surface select-all font-mono">TX-{booking._id.slice(-4).toUpperCase()}-{Math.floor(Math.random() * 89999) + 10000}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant/70 mb-1">{t('statusPage.paymentDateLabel')}</p>
                  <p className="text-on-surface">{booking.updatedAt ? formatDate(booking.updatedAt) : formatDate(new Date().toISOString())}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant/70 mb-1">{t('statusPage.amountPaidLabel')}</p>
                  <p className="text-primary font-bold">{formatPrice(booking.totalPrice, booking.currency)}</p>
                </div>
              </div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href={`/bookings/${bookingId}`}>
                <Button variant="primary" fullWidth className="py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md">
                  <Compass size={18} />
                  <span>{t('statusPage.viewBooking')}</span>
                </Button>
              </Link>

              <Link href="/bookings">
                <Button variant="secondary" fullWidth className="py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm">
                  <Calendar size={18} />
                  <span>{t('statusPage.backToMyBookings')}</span>
                </Button>
              </Link>

              <Button onClick={handleDownloadReceipt} variant="ghost" fullWidth className="py-3.5 rounded-xl border border-outline-variant/40 flex items-center justify-center gap-2 text-sm hover:bg-surface-container">
                <Download size={18} className="text-on-surface-variant" />
                <span>{t('statusPage.downloadReceiptButton')}</span>
              </Button>

              <Button onClick={handleShare} variant="ghost" fullWidth className="py-3.5 rounded-xl border border-outline-variant/40 flex items-center justify-center gap-2 text-sm hover:bg-surface-container">
                <Share2 size={18} className="text-on-surface-variant" />
                <span>{t('statusPage.shareBooking')}</span>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Failed / Transaction Paused View */}
      {statusParam === 'failed' && (
        <section className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 z-10">
          <div className="bg-surface border border-error/20 rounded-2xl shadow-xl p-8 md:p-12 text-center">
            {/* Cancel Icon */}
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center border border-error/20">
                <X className="text-error w-10 h-10" />
              </div>
            </div>

            <h1 className="font-display font-bold text-3xl md:text-4xl mb-4 text-error">
              {t('statusPage.failedTitle')}
            </h1>
            
            <p className="text-base md:text-lg text-on-surface-variant mb-6 leading-relaxed max-w-md mx-auto">
              {t('statusPage.failedDescription')}
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-error/10 text-error border border-error/20 rounded-full text-xs font-bold mb-10">
              <Clock size={14} />
              <span>{t('statusPage.holdingText', { time: formatCountdown(countdown) })}</span>
            </div>

            {/* Info Card */}
            <div className="p-6 bg-surface-container rounded-xl text-left rtl:text-right mb-10 border border-outline-variant/20 flex gap-4">
              <Info className="text-primary shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-secondary mb-1">
                  {t('statusPage.warningTitle')}
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed font-semibold">
                  {t('statusPage.warningDescription')}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/booking-status?status=loading&bookingId=${bookingId}`} className="flex-1">
                <Button variant="primary" fullWidth className="py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md">
                  <RefreshCw size={16} />
                  <span>{t('statusPage.tryAgain')}</span>
                </Button>
              </Link>
              <Link href={`/bookings/${bookingId}`} className="flex-1">
                <Button variant="secondary" fullWidth className="py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm">
                  <ArrowLeft size={16} className={isAr ? 'rotate-180' : ''} />
                  <span>{t('statusPage.goBack')}</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Pending State View */}
      {statusParam === 'pending' && (
        <section className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 z-10">
          <div className="bg-surface border border-amber-500/20 rounded-2xl shadow-xl p-8 md:p-12 text-center">
            {/* Pending Clock Icon */}
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20">
                <Clock className="text-amber-500 w-10 h-10 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
            </div>

            <h1 className="font-display font-bold text-3xl md:text-4xl mb-4 text-amber-600 dark:text-amber-400">
              {t('statusPage.pendingTitle')}
            </h1>
            
            <p className="text-base md:text-lg text-on-surface-variant mb-10 leading-relaxed max-w-md mx-auto">
              {t('statusPage.pendingDescription')}
            </p>

            {/* Info Card */}
            <div className="p-6 bg-surface-container rounded-xl text-left rtl:text-right mb-10 border border-outline-variant/20 flex gap-4">
              <Info className="text-amber-500 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-secondary mb-1">
                  {t('statusPage.warningTitle')}
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed font-semibold">
                  {t('statusPage.warningDescription')}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/bookings/${bookingId}`} className="flex-1">
                <Button variant="primary" fullWidth className="py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md">
                  <Compass size={18} />
                  <span>{t('statusPage.viewBooking')}</span>
                </Button>
              </Link>
              <Link href="/bookings" className="flex-1">
                <Button variant="secondary" fullWidth className="py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm">
                  <Calendar size={18} />
                  <span>{t('statusPage.backToMyBookings')}</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Decorative blur elements matching original Stitch style */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px]"></div>
      </div>
    </main>
  );
}
