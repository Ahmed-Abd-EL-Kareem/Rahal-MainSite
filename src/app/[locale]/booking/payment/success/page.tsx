'use client';

import React, { useEffect, useState, use, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Check, Sparkles, MapPin, Calendar, Users, ArrowLeft } from 'lucide-react';
import { useBookingDetailsQuery } from '@/hooks/useBookings';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { getLocalized, type LocalizedString } from '@/lib/utils/localized';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function PaymentSuccessPage({ params }: PageProps) {
  const { locale } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('bookings');

  const bookingId = searchParams.get('booking_id') || '';
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { data: response, isLoading, isError } = useBookingDetailsQuery(bookingId);
  const booking = response?.data;

  // Particle Canvas Confetti Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const activeCanvas = canvas;
    const ctx = activeCanvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: any[] = [];

    const resize = () => {
      if (activeCanvas) {
        activeCanvas.width = window.innerWidth;
        activeCanvas.height = window.innerHeight;
      }
    };

    class Particle {
      x: number = 0;
      y: number = 0;
      size: number = 0;
      speedY: number = 0;
      speedX: number = 0;
      rotation: number = 0;
      rotationSpeed: number = 0;
      color: string = '';
      opacity: number = 0;

      constructor() {
        this.reset();
        this.y = Math.random() * activeCanvas.height;
      }

      reset() {
        this.x = Math.random() * activeCanvas.width;
        this.y = Math.random() * -activeCanvas.height;
        this.size = Math.random() * 8 + 4;
        this.speedY = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 2 - 1;
        this.color = ['#C8922A', '#1B4B6E', '#2D7A4F', '#7e5700'][Math.floor(Math.random() * 4)];
        this.opacity = Math.random() * 0.5 + 0.3;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
        if (this.y > activeCanvas.height) {
          this.reset();
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
      }
    }

    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 40; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, activeCanvas.width, activeCanvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

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

  const isAr = locale === 'ar';

  if (isLoading) {
    return (
      <main className="container mx-auto px-margin-mobile py-32 flex flex-col items-center justify-center min-h-[60vh] z-10">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-on-surface-variant font-medium text-sm">
            {t('loading')}
          </p>
        </div>
      </main>
    );
  }

  if (isError || !booking) {
    return (
      <main className="container mx-auto px-margin-mobile py-32 flex flex-col items-center justify-center min-h-[60vh] z-10 text-center">
        <p className="text-error font-semibold mb-4">{t('errorStateTitle')}</p>
        <Link href="/bookings">
          <Button variant="primary">{t('statusPage.returnToBookings')}</Button>
        </Link>
      </main>
    );
  }

  const hotelObj = typeof booking.hotel === 'object' ? booking.hotel : null;
  const hotelName = hotelObj ? (locale === 'ar' ? hotelObj.name.ar : hotelObj.name.en) : 'Hotel';
  const hotelCity = getLocalized(hotelObj?.city as LocalizedString, locale);
  const coverImage = hotelObj?.coverImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcW6zabnz89JakVv5tJpTIym0oQM78RY6SoYtGrhmUNswL26nCek7IYwkLkcG4qdRMixni_LrE_bRTauUSsRcEsILaimAT4IafrOoOpQwnJTDYiGirKuWJWbljpuUCSDz-WBR6h0g61zZbghCYGwZGWytjh7toWMiKIb3f5v2Jg_V7ZmgGZOT2VfLePp9q3GZk-uFjS1U1I6y_fi3GWsAU8Ufx7TYrJc4rVfSrJxdPpwCOnzjSZX53OR_VbnVt9pZI31H-wLaz95A';

  return (
    <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-margin-mobile relative overflow-hidden bg-background text-on-background min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes drawCheck {
            0% { stroke-dashoffset: 48; opacity: 0; }
            100% { stroke-dashoffset: 0; opacity: 1; }
        }
        .check-animate {
            stroke-dasharray: 48;
            stroke-dashoffset: 48;
            animation: drawCheck 0.8s cubic-bezier(0.65, 0, 0.45, 1) forwards;
            animation-delay: 0.2s;
        }
        .card-shadow {
            box-shadow: 0 12px 24px -4px rgba(200, 146, 42, 0.12);
        }
        .dark .card-shadow {
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
        }
      `}} />

      {/* Confetti Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      <div className="max-w-xl w-full flex flex-col items-center text-center z-10 px-4">
        {/* Animated Success Icon */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="absolute w-24 h-24 bg-success/10 rounded-full scale-125 animate-pulse"></div>
          <svg className="w-24 h-24 text-success" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
            <path className="check-animate" d="M20 6L9 17L4 12"></path>
          </svg>
        </div>

        <h1 className="font-display font-bold text-3xl md:text-4xl text-on-background mb-4">
          {t('paymentSuccess.title')}
        </h1>
        <p className="text-sm md:text-base text-on-surface-variant mb-10 max-w-md mx-auto leading-relaxed">
          {t('paymentSuccess.subtitle')}
        </p>

        {/* Booking Summary Card */}
        <div className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl card-shadow p-6 md:p-8 mb-10 text-left rtl:text-right">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                {t('paymentSuccess.bookingReference')}
              </span>
              <span className="font-display font-bold text-xl text-secondary">
                RAH-{booking._id.slice(-6).toUpperCase()}
              </span>
            </div>
            <div className="bg-success/15 text-success px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {t('paymentSuccess.paid')}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 items-center">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-outline-variant/20">
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${coverImage}')` }} />
              </div>
              <div className="text-left rtl:text-right leading-tight">
                <h3 className="font-display font-bold text-lg text-on-background">
                  {hotelName}
                </h3>
                <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                  <MapPin size={13} className="shrink-0" />
                  <span>{hotelCity}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-outline-variant/20">
              <div className="text-left rtl:text-right">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                  {t('paymentSuccess.dates')}
                </span>
                <span className="text-xs md:text-sm font-bold text-on-surface">
                  {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}
                </span>
              </div>
              <div className="text-right rtl:text-left">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                  {t('paymentSuccess.totalGuests')}
                </span>
                <span className="text-xs md:text-sm font-bold text-on-surface">
                  {t('paymentSuccess.guestsCount', { count: booking.guests })}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs md:text-sm font-medium text-on-background">
                {t('paymentSuccess.amountPaid')}
              </span>
              <span className="font-display font-bold text-lg md:text-xl text-primary">
                {formatPrice(booking.totalPrice, booking.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link href={`/bookings/${booking._id}/status`} className="flex-grow">
            <Button variant="primary" fullWidth className="py-3.5 rounded-xl font-bold text-sm shadow-md">
              {t('paymentSuccess.viewBooking')}
            </Button>
          </Link>
          <Link href="/" className="flex-grow">
            <Button variant="secondary" fullWidth className="py-3.5 rounded-xl font-bold text-sm">
              {t('paymentSuccess.backToHome')}
            </Button>
          </Link>
        </div>

        {/* AI Insight Chip */}
        <div className="mt-12 flex items-center gap-3 bg-secondary/5 px-4 py-3 rounded-full border border-secondary/15">
          <Sparkles size={16} className="text-secondary shrink-0 fill-secondary/10 animate-pulse" />
          <p className="text-xs text-secondary leading-relaxed font-semibold italic">
            "{t('paymentSuccess.aiInsight')}"
          </p>
        </div>
      </div>
    </main>
  );
}
