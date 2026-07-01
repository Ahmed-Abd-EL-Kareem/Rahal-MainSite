'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { MapPin, Calendar, Users, Loader2 } from 'lucide-react';
import { Booking } from '@/types/booking';
import { useCancelBookingMutation, useCreateCheckoutMutation } from '@/hooks/useBookings';
import { getLocalized, type LocalizedString } from '@/lib/utils/localized';

interface BookingCardProps {
  booking: Booking;
}

export default function BookingCard({ booking }: BookingCardProps) {
  const locale = useLocale();
  const t = useTranslations('bookings');
  const td = useTranslations('bookings.detail');
  
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const cancelMutation = useCancelBookingMutation();
  const checkoutMutation = useCreateCheckoutMutation();

  const hotelObj = typeof booking.hotel === 'object' ? booking.hotel : null;
  const hotelName = hotelObj
    ? (locale === 'ar' ? hotelObj.name.ar : hotelObj.name.en)
    : 'Hotel';
  const hotelCity = getLocalized(hotelObj?.city as LocalizedString, locale) || 'Egypt';
  const bookingStatus = getLocalized(booking.status as LocalizedString, locale) || booking.status;
  const bookingPaymentStatus = getLocalized(booking.paymentStatus as LocalizedString, locale) || booking.paymentStatus;
  
  // High-fidelity sunset cover image fallback from Stitch design
  const coverImage = hotelObj?.coverImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiEAqtA1ofnKUzSm-QiDMot_U6ucHQKQ05duBztfFbopGgnERULpz7gPmnEoxk-2jh50KPLU_jLyahEcuP_gCyEVXLyE9P06hMsGGv1Wg7HEDFv_nP0oWWutmscKYinK4Aq7EXiXXjzHXXvaT5lecZASCfed42OJyOLuG7jFqh-FUE14-VIbKh-s0dIq6k0ddVA-FnAfdtrKDlbVZhPbsPBzgcktUC67MoZnoR3fcP6cy5mTY9gtTRTZBda0FQtcgJD5tVkjgxt9k';

  // Format dates beautifully per locale
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Format price per locale
  const formatPrice = (price: number, currencyCode: string) => {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode || 'USD',
        maximumFractionDigits: 2,
      }).format(price);
    } catch (e) {
      return `${currencyCode || '$'} ${price}`;
    }
  };

  // Condition to check if a booking can be cancelled
  // 1. Status is pending or confirmed
  // 2. Check-in date is in the future
  const checkInDate = new Date(booking.checkIn);
  const isFutureBooking = checkInDate > new Date();
  const canCancel = (bookingStatus === 'pending' || bookingStatus === 'confirmed') && isFutureBooking;

  // Condition to check if payment is required
  const needsPayment = (bookingPaymentStatus === 'pending' || bookingPaymentStatus === 'failed') && bookingStatus !== 'canceled';

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(booking._id);
      setShowCancelConfirm(false);
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    }
  };

  const handlePayNow = async () => {
    try {
      await checkoutMutation.mutateAsync(booking._id);
    } catch (err) {
      console.error('Failed to initiate payment:', err);
    }
  };

  // Mapping status badge classes and labels
  const getStatusBadge = () => {
    switch (bookingStatus) {
      case 'confirmed':
        return (
          <span className="px-3 py-1 bg-success/10 text-success text-[10px] font-bold rounded-full border border-success/20 tracking-wider uppercase">
            {t('status.confirmed')}
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 bg-on-surface/10 text-on-surface-variant text-[10px] font-bold rounded-full border border-on-surface/20 tracking-wider uppercase">
            {t('status.completed')}
          </span>
        );
      case 'canceled':
        return (
          <span className="px-3 py-1 bg-error/10 text-error text-[10px] font-bold rounded-full border border-error/20 tracking-wider uppercase">
            {t('status.canceled')}
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full border border-primary/20 tracking-wider uppercase">
            {t('status.pending')}
          </span>
        );
    }
  };

  const getPaymentBadge = () => {
    if (bookingStatus === 'canceled') return null;

    switch (bookingPaymentStatus) {
      case 'succeeded':
        return (
          <span className="px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-bold rounded-full border border-secondary/20 tracking-wider uppercase">
            {t('paymentStatus.succeeded')}
          </span>
        );
      case 'failed':
        return (
          <span className="px-3 py-1 bg-error/10 text-error text-[10px] font-bold rounded-full border border-error/20 tracking-wider uppercase">
            {t('paymentStatus.failed')}
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-full border border-amber-500/20 tracking-wider uppercase">
            {t('paymentStatus.pending')}
          </span>
        );
    }
  };

  return (
    <div className={`bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group ${bookingStatus === 'canceled' ? 'opacity-60 border-dashed' : bookingStatus === 'completed' ? 'opacity-90 grayscale-[0.3]' : ''}`}>
      <div className="flex flex-col md:flex-row h-full min-h-[220px]">
        {/* Left Side: Cover Image with parallax-style hover effect */}
        <div className="w-full md:w-1/3 h-48 md:h-auto overflow-hidden relative min-h-[180px]">
          <div 
            className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
            style={{ backgroundImage: `url('${coverImage}')` }}
            role="img"
            aria-label={hotelName}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
        </div>

        {/* Right Side: Detailed Info & Interactive Actions */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            {/* Title & Status Badges */}
            <div className="flex justify-between items-start gap-4 mb-2">
              <h3 className="font-display font-bold text-lg md:text-xl text-on-surface leading-snug">
                {hotelName}
              </h3>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {getStatusBadge()}
                {getPaymentBadge()}
              </div>
            </div>

            {/* Destination/Location */}
            <p className="text-on-surface-variant font-medium text-xs mb-4 flex items-center gap-1">
              <MapPin size={14} className="text-secondary" /> {hotelCity}, {locale === 'ar' ? 'مصر' : 'Egypt'}
            </p>

            {/* Check-in and Guest Count Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-outline mb-1 font-semibold">{t('checkIn')}</p>
                <p className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
                  <Calendar size={14} className="text-outline/70" />
                  {formatDate(booking.checkIn)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-outline mb-1 font-semibold">{t('guests')}</p>
                <p className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
                  <Users size={14} className="text-outline/70" />
                  {booking.guests} {booking.guests === 1 ? (locale === 'ar' ? 'شخص' : 'Guest') : (locale === 'ar' ? 'أشخاص' : 'Guests')}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing & Custom Interactive Action Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-outline-variant/20 pt-4 mt-auto">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-outline font-semibold">
                {bookingStatus === 'canceled' ? t('refundAmount') : t('totalPrice')}
              </p>
              <p className={`text-xl font-bold font-display ${bookingStatus === 'canceled' ? 'text-on-surface-variant' : 'text-primary'}`}>
                {formatPrice(booking.totalPrice, booking.currency)}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Show confirm delete state instead of standard layout if canceling */}
              {showCancelConfirm ? (
                <div className="flex items-center gap-2 bg-error/5 p-1.5 rounded-lg border border-error/20">
                  <span className="text-xs font-semibold text-error hidden sm:inline px-1">{td('cancelConfirmTitle')}</span>
                  <button 
                    onClick={handleCancel}
                    disabled={cancelMutation.isPending}
                    className="px-3 py-1.5 bg-error text-white text-xs font-semibold rounded hover:bg-error/90 transition-all flex items-center gap-1"
                  >
                    {cancelMutation.isPending && <Loader2 size={12} className="animate-spin" />}
                    {locale === 'ar' ? 'نعم، إلغاء' : 'Yes, Cancel'}
                  </button>
                  <button 
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={cancelMutation.isPending}
                    className="px-3 py-1.5 bg-surface text-on-surface text-xs font-semibold rounded border border-outline-variant hover:bg-surface-container transition-all"
                  >
                    {locale === 'ar' ? 'تراجع' : 'No'}
                  </button>
                </div>
              ) : (
                <>
                  {/* View Details Link */}
                  <Link 
                    href={`/bookings/${booking._id}`}
                    className="px-4 py-2 border border-secondary text-secondary hover:bg-secondary/10 transition-colors rounded-lg font-semibold text-xs text-center min-w-[90px]"
                  >
                    {t('viewDetails')}
                  </Link>

                  {/* Cancel Button */}
                  {canCancel && (
                    <button 
                      onClick={() => setShowCancelConfirm(true)}
                      className="px-4 py-2 border border-error/40 text-error hover:bg-error/10 transition-colors rounded-lg font-semibold text-xs min-w-[90px]"
                    >
                      {t('cancelBooking')}
                    </button>
                  )}

                  {/* Pay Now Stripe CTA */}
                  {needsPayment && (
                    <button 
                      onClick={handlePayNow}
                      disabled={checkoutMutation.isPending}
                      className="px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-all active:scale-95 rounded-lg font-semibold text-xs flex justify-center items-center gap-1.5 min-w-[95px] shadow-sm hover:shadow text-center"
                    >
                      {checkoutMutation.isPending ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : null}
                      {t('payNow')}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
