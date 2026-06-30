/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Compass, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { authApi } from '@/lib/api/auth';
import { APIError } from '@/lib/api/client';
import AuthLayout from '@/components/layout/AuthLayout';
import { OTPInput } from '@/components/auth/OTPInput';

function VerifyOtpContent() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const router = useRouter();

  const [email] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('resetEmail') || '';
    }
    return '';
  });
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));

  // Route guard — block access unless forgotPasswordStarted is set
  const [authorized, setAuthorized] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const started = sessionStorage.getItem('forgotPasswordStarted');
    if (!started) {
      router.replace(`/${locale}/forgot-password`);
      return;
    }
    setAuthorized(true);
  }, [router, locale]);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Timer countdown hook
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleOtpChange = (value: string[]) => {
    setOtp(value);
  };

  const handleOtpComplete = (value: string) => {
    // Value is already in state via handleOtpChange
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(isRtl ? 'البريد الإلكتروني مفقود.' : 'Email is missing from the request.');
      return;
    }

    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError(isRtl ? 'يرجى إدخال الرمز المكون من 6 أرقام كاملاً.' : 'Please enter the full 6-digit code.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      console.log('EMAIL =>', email);
      console.log('OTP =>', otpCode);

      await authApi.verifyOtp(email, otpCode);

      // Save verification state
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('otpVerified', 'true');
        sessionStorage.setItem('resetEmail', email);
      }

      setSuccessMsg(
        isRtl ? 'تم التحقق بنجاح!' : 'Verification successful!'
      );

      setTimeout(() => {
        router.push(`/${locale}/reset-password`);
      }, 1000);

    } catch (err: unknown) {
      console.error('OTP verification error:', err);

      if (err instanceof APIError) {
        setError(err.message);
      } else {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(
          errorMsg ||
          t('errors.genericOtp') ||
          'An unexpected error occurred. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    if (!email) {
      setError(isRtl ? 'البريد الإلكتروني مفقود.' : 'Email is missing.');
      return;
    }

    setResending(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await authApi.forgotPassword(email);
      setSuccessMsg(isRtl ? 'تم إعادة إرسال الرمز بنجاح!' : 'Verification code resent successfully!');
      setCountdown(60);
    } catch (err: unknown) {
      console.error('OTP resend error:', err);
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(errorMsg || t('errors.genericOtp') || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setResending(false);
    }
  };

  // Guard — show spinner until authorized
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <AuthLayout locale={locale}>
      <main
        className="min-h-screen flex flex-col md:flex-row bg-background overflow-hidden"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* LEFT PANEL — Cinematic Luxor Temple */}
        <section className="relative hidden md:flex md:w-1/2 h-screen items-end overflow-hidden p-10">
          {/* Hero image */}
          <div className="absolute inset-0 z-0">
            <div
              className="w-full h-full bg-cover bg-center ken-burns"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAnw16NgRyNjedCf6S1GEHIcnFxivUtI6PMqHKfrMiUypHKZU2AefPpPauiQi4VqfPZx8PHZECiN0JPgD6WpRK9CT-OxEGLm5KWrtXgRCC46RxiRyarjABg0FWOzhGXVrkPXXpLa8HAxCgIcK3fX3nrIsTrRQrJ6whfJxHHp0YQ_nzrD89azPjNDGJgPE9CvqeYjuSlluNXBfwy_wcDHFB47bxew538tIiI-0BC4seENFkuxtPGWekTS9cFShTlCGOO7PZ9VJa4Hpk')",
              }}
            />
            {/* Unified bottom-up dark gradient for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>

          {/* Top-left brand mark */}
          <div
            className={`absolute top-10 ${isRtl ? "right-10" : "left-10"} z-10 flex items-center gap-2 animate-slide-up`}
          >
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Compass className="text-on-primary" size={18} />
            </div>
            <span
              className="text-white font-bold tracking-tight font-display"
              style={{ fontSize: '20px' }}
            >
              Rahal
            </span>
          </div>

          {/* Bottom content: eyebrow + headline + blockquote */}
          <div className="relative z-10 w-full max-w-xl mb-10">
{/* Eyebrow: horizontal rule + "ANCIENT WISDOM" */}
            <div
              className={`flex items-center gap-3 mb-5 opacity-90 ${isRtl ? "flex-row-reverse" : ""} animate-slide-up animate-delay-1`}
            >
              <span className="h-px w-12 bg-primary-fixed-dim flex-shrink-0" />
              <span
                className="text-primary-fixed-dim tracking-widest uppercase font-body"
                style={{ fontSize: '12px', fontWeight: 600 }}
              >
                {t('verifyOtp.ancientWisdom')}
              </span>
            </div>

            {/* Main headline */}
            <h1
              className="text-white leading-tight mb-8 animate-slide-up animate-delay-2"
              style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: 'clamp(32px, 3.8vw, 52px)',
                fontWeight: 700,
                lineHeight: '1.12',
              }}
            >
              {isRtl ? (
                <>
                  الأمان
                  <br />
                  عبر الزمن
                </>
              ) : (
                <>
                  {t('verifyOtp.securityThroughTime').split(' ')[0]} <br />
                  {t('verifyOtp.securityThroughTime').split(' ').slice(1).join(' ')}
                </>
              )}
            </h1>

            {/* Blockquote */}
            <blockquote className={`border-l-2 border-primary-fixed-dim pl-4 ${isRtl ? 'border-r-2 border-l-0 pr-4 pl-0' : ''} animate-slide-up animate-delay-3`}>
              <p
                className="italic text-white/80 mb-2"
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: '16px',
                  fontWeight: 600,
                }}
              >
                {t('verifyOtp.trueWisdomInDetails')}
              </p>
              <cite
                className="text-primary-fixed-dim not-italic opacity-80 font-body"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                — {t('verifyOtp.rahalArchiveSeries')}
              </cite>
            </blockquote>
          </div>
        </section>

        {/* RIGHT PANEL — OTP Verification Form */}
        <section className="w-full md:w-1/2 min-h-screen flex items-center justify-center bg-surface px-6 py-12 md:px-10 relative overflow-y-auto">
          {/* Mobile brand header */}
          <div
            className={`absolute top-8 ${isRtl ? "right-6" : "left-6"} md:hidden flex items-center gap-2`}
          >
            <Compass className="text-primary" size={18} />
            <span
              className="font-bold text-primary font-display"
              style={{ fontSize: '18px' }}
            >
              Rahal
            </span>
          </div>

          <Card
            hoverEffect={false}
            className="w-full max-w-md bg-transparent border-0 shadow-none p-0 rounded-none"
          >
            <div className="w-full space-y-8">
              {/* Shield icon + heading */}
              <div
                className={`space-y-3 animate-slide-up animate-delay-1 ${isRtl ? "text-right" : "text-left"}`}
              >
                {/* Shield icon circle */}
                <div
                  className={`w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary mb-4 ${isRtl ? "mr-auto" : ""}`}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4c1.4 0 2.8.5 3.86 1.57L7.5 14.09c-.34-.97-.5-2-.5-3.09 0-3.31 2.24-6 5-6zm0 14c-2.76 0-5-2.69-5-6 0-.9.16-1.77.45-2.57L16.5 18.43C15.44 19.5 13.8 20 12 20z" />
                  </svg>
                </div>

                <h1
                  className="text-on-background font-display"
                  style={{ fontSize: '28px', fontWeight: 600, lineHeight: '36px' }}
                >
                  {t('verifyOtpTitle')}
                </h1>

                <p
                  className="text-on-surface-variant leading-relaxed font-body"
                  style={{ fontSize: '15px', fontWeight: 400 }}
                >
                  {t('verifyOtpSubtitle', { email: email || 'your email' })}
                </p>
              </div>

              {/* Error alert */}
              {error && (
                <div className="p-3 rounded-xl border border-error/20 bg-error/5 text-error text-sm animate-slide-up">
                  {error}
                </div>
              )}

              {/* Success message */}
              {successMsg && (
                <div className="p-3 rounded-xl border border-success/20 bg-success/5 text-success text-sm animate-slide-up">
                  {successMsg}
                </div>
              )}

              {/* OTP Form */}
              <form
                onSubmit={handleSubmit}
                className="space-y-8 animate-slide-up animate-delay-2"
              >
                {/* OTP inputs */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                    {t('verifyOtpLabel') || 'Verification Code (OTP)'}
                  </label>

                  <OTPInput
                    length={6}
                    value={otp}
                    onChange={handleOtpChange}
                    disabled={loading}
                    error={!!error}
                    autoFocus={true}
                  />
                </div>

                {/* Verify CTA */}
                <Button
                  type="submit"
                  fullWidth
                  disabled={loading}
                  className="bg-primary hover:bg-primary-container text-on-primary h-14 rounded-xl font-body font-semibold text-base flex items-center justify-center gap-2 group shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                      <span>{t('verifying') || 'Verifying...'}</span>
                    </span>
                  ) : (
                    <>
                      <span>{t('verifyOtpBtn')}</span>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="group-hover:translate-x-0.5 transition-transform"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </Button>
              </form>

              {/* Resend & Back to Login */}
              <div className="flex flex-col items-center gap-4 pt-2 animate-slide-up animate-delay-3">
                {/* Resend */}
                {countdown > 0 ? (
                  <span
                    className="text-sm text-on-surface-variant font-body"
                  >
                    {t('resendActive', { seconds: countdown })}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="group flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50 font-body"
                  >
                    <span>
                      {isRtl ? 'لم تستلم الرمز؟' : "Didn't receive code?"}
                    </span>
                    <span className="text-primary font-semibold border-b border-transparent group-hover:border-primary transition-colors">
                      {resending
                        ? isRtl
                          ? 'جارٍ الإرسال...'
                          : 'Sending...'
                        : t('resendBtn')}
                    </span>
                  </button>
                )}

                {/* Back to Login */}
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors mt-1 group font-body text-sm font-medium"
                >
                  {isRtl ? (
                    <>
                      <span>{t('backToLoginLink')}</span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="group-hover:translate-x-0.5 transition-transform"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                      <span>{t('backToLoginLink')}</span>
                    </>
                  )}
                </Link>
              </div>
            </div>
          </Card>

          {/* Ambient sandpaper texture overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
            style={{
              backgroundImage:
                "url('https://www.transparenttextures.com/patterns/sandpaper.png')",
            }}
            aria-hidden="true"
          />
        </section>
      </main>
    </AuthLayout>
  );
}

function VerifyOtpLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<VerifyOtpLoading />}>
      <VerifyOtpContent />
    </Suspense>
  );
}