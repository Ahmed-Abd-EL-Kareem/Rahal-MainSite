'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Compass, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { authApi } from '@/lib/api/auth';
import { APIError } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/layout/AuthLayout';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError(
        t('errors.missingFields') ||
        'Please fill in all required fields.'
      );
      return;
    }

    if (!isValidEmail(email)) {
      setError(
        t('emailRequired') ||
        'Please enter a valid email address.'
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authApi.forgotPassword(email);

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('resetEmail', email);
        sessionStorage.setItem('forgotPasswordStarted', 'true');
      }

      router.push(`/${locale}/verify-otp`);
    } catch (err: unknown) {
      console.error('Password recovery error:', err);

      if (err instanceof APIError) {
        setError(err.message);
      } else {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(
          errorMsg ||
          t('forgotPasswordError') ||
          'An unexpected error occurred. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout locale={locale}>
      <main
        className="min-h-screen flex flex-col md:flex-row bg-background font-body overflow-hidden"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Left Panel: Cinematic image */}
        <section className="relative hidden md:flex md:w-1/2 lg:w-7/12 h-screen overflow-hidden">
          <div
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDA3TjE5UIGwIhDPhjrWRg9CwGS9BQE8MVpAkudTe427F1aMKXb5NRF_Lqat5pvHbyQV7pha-N7T-y_1TFKqLSJ9g_VcYGGtYi10Wq56IhC3oC9DJUJixr_UOCwtO-0vhFS6BDMjXWttfOD8Ro7AFPCG_LKlm4pyqA1fht8A2J8i5qnxTWSh4KyQmIlrNm7zpeKgoEWrWy5RKsaF35GHS5H3n4HxRL_TvB2s4bDWwWE_WQELPp2NBqMXplYNPvjqAuyO_OdQXqmvjM')",
            }}
          />
          {/* Bottom-up dark overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

          {/* Left content overlay */}
          <div className="relative z-20 flex flex-col justify-between w-full h-full p-10 lg:p-[40px]">
            {/* Eyebrow + headline */}
            <div className="mt-10 animate-slide-up">
              <p
                className="font-body text-xs font-semibold tracking-widest uppercase text-primary-fixed-dim mb-4 drop-shadow"
              >
                {t('forgotPassword.guardianOfJourneys') || (isRtl ? 'حارس الرحلات' : 'The Guardian of Journeys')}
              </p>
              <h1
                className="font-display text-white leading-tight drop-shadow-lg"
                style={{
                  fontSize: 'clamp(28px, 3.5vw, 48px)',
                  fontWeight: 700,
                  maxWidth: '480px',
                }}
              >
                {t('forgotPassword.reconnectWithLegacy') || (isRtl ? 'استعد التواصل مع إرثك السياحي.' : 'Reconnect with your Travel Legacy.')}
              </h1>
            </div>

            {/* Bottom quote */}
            <div
              className={`mb-8 flex items-center gap-3 opacity-90 ${isRtl ? 'flex-row-reverse' : ''} animate-slide-up animate-delay-1`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="flex-shrink-0 text-primary-fixed-dim"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2L4 5v6c0 5.25 3.5 10.15 8 11.35C16.5 21.15 20 16.25 20 11V5l-8-3zm-1 13l-3-3 1.41-1.41L11 12.17l4.59-4.58L17 9l-6 6z" />
              </svg>
              <p className="font-body text-sm italic text-primary-fixed-dim drop-shadow">
                {t('forgotPassword.eternalPrivacy') || (isRtl ? '"خصوصيتك أبدية كالرمال."' : '"Your privacy is as eternal as the sands."')}
              </p>
            </div>
          </div>
        </section>

        {/* Right Panel: Recovery Form */}
        <section className="w-full md:w-1/2 lg:w-5/12 bg-surface flex items-center justify-center p-6 md:p-10 lg:p-16 overflow-y-auto min-h-screen">
          <div className="w-full max-w-[400px] py-10">
            {/* Brand mark */}
            <div className="flex flex-col items-center mb-10 animate-slide-up">
              <button
                type="button"
                className="w-16 h-16 rounded-full bg-primary shadow-lg hover:scale-105 hover:shadow-xl transition-all flex items-center justify-center"
                aria-label="Rahal Heritage"
                tabIndex={-1}
              >
                <Image
                  src="/images/logo-2.png"
                  alt="Rahal Heritage"
                  width={50}
                  height={50}
                />
              </button>
              <span className="font-display font-bold text-primary mt-3 tracking-tight" style={{ fontSize: '20px', lineHeight: '28px' }}>
                Rahal Heritage
              </span>
            </div>

            {/* Form header */}
            <div className={`mb-8 ${isRtl ? 'text-right' : 'text-left'} animate-slide-up animate-delay-1`}>
              <h2 className="font-display text-on-background mb-2" style={{ fontSize: '32px', fontWeight: 600, lineHeight: '40px' }}>
                {t('forgotPasswordTitle')}
              </h2>
              <p className="font-body text-base text-on-surface-variant leading-6">
                {t('forgotPasswordSubtitle')}
              </p>
            </div>

            {/* Error alert */}
            {error && (
              <div className="mb-5 p-4 bg-error-container/20 border border-error-container/30 rounded-xl flex items-start gap-3 text-on-error-container animate-slide-up animate-delay-2">
                <AlertCircle className="flex-shrink-0 mt-0.5" size={17} />
                <span className="font-body text-sm font-medium leading-relaxed">
                  {error}
                </span>
              </div>
            )}

            {/* Form */}
            <form className="space-y-5 animate-slide-up animate-delay-2" onSubmit={handleSubmit} noValidate>
              {/* Email input */}
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  aria-required="true"
                  aria-invalid={!!error}
                  className="h-14 px-4 bg-white dark:bg-surface-container-low border border-primary rounded-xl font-body text-base text-on-background placeholder-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* CTA button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
                className="h-14 font-body font-semibold text-base flex items-center justify-center gap-2 group rounded-full bg-primary hover:bg-primary-container text-on-primary shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    <span>{t('sendingLink') || 'Sending...'}</span>
                  </span>
                ) : (
                  <>
                    <span>{t('forgotPasswordBtn')}</span>
                    {isRtl ? (
                      <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    ) : (
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    )}
                  </>
                )}
              </Button>
            </form>

            {/* Back to login */}
            <div className="mt-10 text-center animate-slide-up animate-delay-3">
              <Link
                href="/login"
                className={`font-body text-sm font-medium inline-flex items-center gap-1.5 group transition-colors ${isRtl ? 'flex-row-reverse' : ''} text-on-surface-variant hover:text-primary`}
              >
                {isRtl ? (
                  <>
                    <span>{t('backToLoginLink') || 'Back to Sign In'}</span>
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                ) : (
                  <>
                    <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    <span>{t('backToLoginLink') || 'Back to Sign In'}</span>
                  </>
                )}
              </Link>
            </div>

            {/* Decorative hieroglyphic accent */}
            <div
              className="mt-16 flex justify-center gap-5 text-outline/20 animate-slide-up animate-delay-4"
              aria-hidden="true"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2 0-2 5.5-4.5 5.5-4.5C13 2 10 7 10 7c.5-1 3-4 3-4C6 5 4 11.5 4 11.5 4 7 8 4 8 4 1 7 2 17 2 17c0-2 .5-4 .5-4C3 22 6.5 22 6.5 22H19l-2-14z" />
              </svg>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
              </svg>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2 0-2 5.5-4.5 5.5-4.5C13 2 10 7 10 7c.5-1 3-4 3-4C6 5 4 11.5 4 11.5 4 7 8 4 8 4 1 7 2 17 2 17c0-2 .5-4 .5-4C3 22 6.5 22 6.5 22H19l-2-14z" />
              </svg>
            </div>
          </div>
        </section>
      </main>
    </AuthLayout>
  );
}