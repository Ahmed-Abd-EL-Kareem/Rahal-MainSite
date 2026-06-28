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
    <>
      {/* Google Fonts: Playfair Display + Inter */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');

        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-inter { font-family: 'Inter', sans-serif; }

        .rahal-left-panel {
          background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDA3TjE5UIGwIhDPhjrWRg9CwGS9BQE8MVpAkudTe427F1aMKXb5NRF_Lqat5pvHbyQV7pha-N7T-y_1TFKqLSJ9g_VcYGGtYi10Wq56IhC3oC9DJUJixr_UOCwtO-0vhFS6BDMjXWttfOD8Ro7AFPCG_LKlm4pyqA1fht8A2J8i5qnxTWSh4KyQmIlrNm7zpeKgoEWrWy5RKsaF35GHS5H3n4HxRL_TvB2s4bDWwWE_WQELPp2NBqMXplYNPvjqAuyO_OdQXqmvjM')
        ;
          background-size: cover;
          background-position: center;
        }

        .gold-overlay {
          background: linear-gradient(
            to bottom,
            rgba(126, 87, 0, 0.15) 0%,
            rgba(0, 0, 0, 0.55) 100%
          );
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-slide-up {
          animation: fadeSlideUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .animate-delay-1 { animation-delay: 0.08s; }
        .animate-delay-2 { animation-delay: 0.16s; }
        .animate-delay-3 { animation-delay: 0.24s; }
        .animate-delay-4 { animation-delay: 0.32s; }
        .animate-delay-5 { animation-delay: 0.40s; }

        .rahal-brand-circle {
          background: #7e5700;
          box-shadow: 0 4px 20px rgba(126, 87, 0, 0.35);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .rahal-brand-circle:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 28px rgba(126, 87, 0, 0.45);
        }

        .rahal-input-wrapper input:focus {
          border-color: #366286;
          box-shadow: 0 0 0 3px rgba(54, 98, 134, 0.15);
        }

        .rahal-cta-btn {
          background: #7e5700 !important;
          color: #fff !important;
          border-radius: 9999px !important;
          transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease !important;
          box-shadow: 0 4px 14px rgba(126, 87, 0, 0.3) !important;
        }
        .rahal-cta-btn:hover:not(:disabled) {
          background: #c8922a !important;
          box-shadow: 0 6px 20px rgba(200, 146, 42, 0.4) !important;
        }
        .rahal-cta-btn:active:not(:disabled) {
          transform: scale(0.97) !important;
        }
        .rahal-cta-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .rahal-back-link {
          color: #504536;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.15s ease;
        }
        .rahal-back-link:hover { color: #7e5700; }

        .rahal-subtitle { color: #7e5700; }

        .rahal-decorative { color: #827564; opacity: 0.18; }
      `}</style>

      <main
        className="min-h-screen flex flex-col md:flex-row bg-[#fcf9f4] font-inter overflow-hidden"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* ── Left Panel: Cinematic image ── */}
        <section className="relative hidden md:flex md:w-1/2 lg:w-7/12 h-screen overflow-hidden rahal-left-panel">
          {/* Gold-to-dark overlay */}
          <div className="absolute inset-0 gold-overlay z-10" />

          {/* Left content overlay */}
          <div className="relative z-20 flex flex-col justify-between w-full h-full p-10 lg:p-[40px]">
            {/* Eyebrow + headline */}
            <div className="mt-10">
              <p
                className="font-inter text-xs font-semibold tracking-[0.2em] uppercase text-[#f8bc51] mb-4 drop-shadow"
                style={{ letterSpacing: '0.2em' }}
              >
                {isRtl ? 'حارس الرحلات' : 'The Guardian of Journeys'}
              </p>
              <h1 className="font-playfair text-white leading-tight drop-shadow-lg"
                  style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 700, maxWidth: '480px' }}>
                {isRtl
                  ? 'استعد التواصل مع إرثك السياحي.'
                  : 'Reconnect with your Travel Legacy.'}
              </h1>
            </div>

            {/* Bottom quote */}
            <div className={`mb-8 flex items-center gap-3 opacity-90 ${isRtl ? 'flex-row-reverse' : ''}`}>
              {/* Shield icon via SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#f8bc51" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                <path d="M12 2L4 5v6c0 5.25 3.5 10.15 8 11.35C16.5 21.15 20 16.25 20 11V5l-8-3zm-1 13l-3-3 1.41-1.41L11 12.17l4.59-4.58L17 9l-6 6z"/>
              </svg>
              <p className="font-inter text-sm italic text-[#f8bc51] drop-shadow">
                {isRtl
                  ? '"خصوصيتك أبدية كالرمال."'
                  : '"Your privacy is as eternal as the sands."'}
              </p>
            </div>
          </div>
        </section>

        {/* ── Right Panel: Recovery Form ── */}
        <section className="w-full md:w-1/2 lg:w-5/12 bg-[#f6f3ee] flex items-center justify-center p-6 md:p-10 lg:p-16 overflow-y-auto min-h-screen">
          <div className="w-full max-w-[400px] py-10">

            {/* Brand mark */}
            <div className="flex flex-col items-center mb-10 animate-fade-slide-up">
              <button
                type="button"
                className="rahal-brand-circle w-16 h-16 rounded-full flex items-center justify-center"
                aria-label="Rahal Heritage"
                tabIndex={-1}
              >
                <Compass size={28} color="#fff" strokeWidth={1.75} />
              </button>
              <span
                className="font-playfair font-bold text-[#7e5700] mt-3 tracking-tight"
                style={{ fontSize: '20px', lineHeight: '28px' }}
              >
                Rahal Heritage
              </span>
            </div>

            {/* Form header */}
            <div className={`mb-8 animate-fade-slide-up animate-delay-1 ${isRtl ? 'text-right' : ''}`}>
              <h2
                className="font-playfair text-[#1c1c19] mb-2"
                style={{ fontSize: '32px', fontWeight: 600, lineHeight: '40px' }}
              >
                {t('forgotPasswordTitle')}
              </h2>
              <p className="font-inter text-base leading-6 rahal-subtitle">
                {t('forgotPasswordSubtitle')}
              </p>
            </div>

            {/* Error alert */}
            {error && (
              <div className="mb-5 p-4 bg-[#ffdad6] border border-[#ba1a1a]/20 rounded-xl flex items-start gap-3 text-[#93000a] animate-fade-slide-up">
                <AlertCircle className="flex-shrink-0 mt-0.5" size={17} />
                <span className="font-inter text-sm font-medium leading-relaxed">{error}</span>
              </div>
            )}

            {/* Form */}
            <form
              className="space-y-5 animate-fade-slide-up animate-delay-2"
              onSubmit={handleSubmit}
              noValidate
            >
              {/* Email input */}
              <div className={`rahal-input-wrapper ${isRtl ? 'text-right' : ''}`}>
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
                  className={`h-14 px-4 bg-white border border-[#7e5700] rounded-xl font-inter text-base text-[#1c1c19] placeholder-[#827564]/60 focus:outline-none transition-all ${isRtl ? 'text-right' : 'text-left'}`}
                />
              </div>

              {/* CTA button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
                className="rahal-cta-btn h-14 font-inter font-semibold text-base flex items-center justify-center gap-2 group"
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
            <div className="mt-10 text-center animate-fade-slide-up animate-delay-3">
              <Link
                href="/login"
                className={`rahal-back-link inline-flex items-center gap-1.5 group ${isRtl ? 'flex-row-reverse' : ''}`}
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
            <div className="mt-16 flex justify-center gap-5 rahal-decorative animate-fade-slide-up animate-delay-4" aria-hidden="true">
              {/* Three lotus/heritage SVG icons */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2 0-2 5.5-4.5 5.5-4.5C13 2 10 7 10 7c.5-1 3-4 3-4C6 5 4 11.5 4 11.5 4 7 8 4 8 4 1 7 2 17 2 17c0-2 .5-4 .5-4C3 22 6.5 22 6.5 22H19l-2-14z"/></svg>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2 0-2 5.5-4.5 5.5-4.5C13 2 10 7 10 7c.5-1 3-4 3-4C6 5 4 11.5 4 11.5 4 7 8 4 8 4 1 7 2 17 2 17c0-2 .5-4 .5-4C3 22 6.5 22 6.5 22H19l-2-14z"/></svg>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
