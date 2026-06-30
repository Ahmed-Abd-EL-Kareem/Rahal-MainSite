/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Compass, AlertCircle, CheckCircle, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, ShieldCheck, HelpCircle, Shield } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { authApi } from '@/lib/api/auth';
import { APIError } from '@/lib/api/client';
import AuthLayout from '@/components/layout/AuthLayout';

export default function ResetPasswordPage() {
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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedEmail = sessionStorage.getItem('resetEmail');
    const otpVerified = sessionStorage.getItem('otpVerified');

    if (!storedEmail || otpVerified !== 'true') {
      setAuthorized(false);
      router.replace(`/${locale}/forgot-password`);
      return;
    }

    setAuthorized(true);
  }, [router, locale]);

  // Derived password strength scoring
  const passwordStrength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length > 5) score++; // Weak
    if (password.length > 8) score++; // Fair
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++; // Good
    if (/[^A-Za-z0-9]/.test(password)) score++; // Strong
    return score;
  })();

  const getStrengthLabel = () => {
    switch (passwordStrength) {
      case 1: return t('strengthWeak');
      case 2: return t('strengthFair');
      case 3: return t('strengthGood');
      case 4: return t('strengthStrong');
      default: return t('strengthNone');
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 1: return 'bg-error';
      case 2: return 'bg-primary-container';
      case 3: return 'bg-primary';
      case 4: return 'bg-success';
      default: return 'bg-surface-container-highest';
    }
  };

  const getStrengthTextColor = () => {
    switch (passwordStrength) {
      case 1: return 'text-error';
      case 2: return 'text-primary-container';
      case 3: return 'text-primary';
      case 4: return 'text-success';
      default: return 'text-outline';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError(t('errors.missingFields'));
      return;
    }

    if (!password || !confirmPassword) {
      setError(t('errors.missingFields'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('errors.passwordMismatch'));
      return;
    }

    if (passwordStrength < 2) {
      setError(t('errors.weakPassword'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authApi.resetPassword({
        email,
        newPassword: password,
      });
      
      setSuccess(true);

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('otpVerified');
        sessionStorage.removeItem('resetEmail');
        sessionStorage.removeItem('forgotPasswordStarted');
      }

      setTimeout(() => {
        router.push(`/${locale}/login`);
      }, 1500);
    } catch (err: unknown) {
      console.error('Password reset error:', err);
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(errorMsg || t('errors.genericReset') || 'Failed to reset password.');
      }
    } finally {
      setLoading(false);
    }
  };


  if (authorized === null || !authorized) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </main>
    );
  }

  return (
    <AuthLayout locale={locale}>
      <main
        className="min-h-screen flex flex-col lg:flex-row overflow-hidden"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* LEFT PANEL — Cinematic */}
        <section className="relative hidden lg:flex lg:w-1/2 h-screen overflow-hidden">
          {/* Hero image */}
          <div className="absolute inset-0 z-0">
            <div className="w-full h-full bg-cover bg-center ken-burns">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD9GJPvonhyqfM5VB0fXipr_Mq_lsesZSJB1LWSDGxugO5JInfC-uURsS6SEDb5ORkCPtZxeMgjQepInPfTnci9OBg5kBtIC54xF7hHg2YZp5GIxJlVtUj0UVvLI-w9SkWeFnyoTEJnJbTRLK7FBbRkebfsRE4H3Fm2Y3IR1fslogjiLRKIXqC2fWzRGphiIYuEwS-GmUDPkKY404WKIhATFfJIZ-KfDa1ecgCtc_KrFgKnqeGnPIQtAiiXRQzXv1jZC6I1JvUZFnQ')",
                  backgroundPosition: 'center center',
                  backgroundSize: 'cover',
                }}
              />
            </div>
            {/* Unified bottom-up dark gradient for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>

          {/* Content: bottom of panel */}
          <div className="relative z-10 flex flex-col justify-end p-10 h-full w-full">
            <div className="mb-8 max-w-md">
              {/* Secure restoration badge */}
              <div className="mb-4 animate-slide-up animate-delay-1">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 text-primary-fixed-dim font-body text-xs font-semibold tracking-widest uppercase">
                  {t('resetPassword.secureRestoration')}
                </span>
              </div>

              {/* Headline */}
              <h1
                className="text-white mb-4 leading-tight animate-slide-up animate-delay-2"
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: 'clamp(40px, 4vw, 56px)',
                  fontWeight: 700,
                  lineHeight: '1.05',
                  letterSpacing: '-0.03em',
                  maxWidth: '430px',
                }}
              >
                {t('resetPassword.restoringAccess')}
              </h1>

              {/* Subtitle */}
              <p
                className="text-white/75 mb-7 animate-slide-up animate-delay-3"
                style={{
                  fontSize: '16px',
                  fontWeight: 100,
                  lineHeight: '1.75',
                  maxWidth: '390px',
                }}
              >
                {t('resetPassword.journeyContinues')}
              </p>

              {/* Encrypted footer row */}
              <div
                className={`flex items-center gap-2 text-white/70 ${isRtl ? 'flex-row-reverse' : ''} animate-slide-up animate-delay-4`}
              >
                <ShieldCheck size={16} className="flex-shrink-0" />
                <span
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: '12px',
                    fontWeight: 500,
                    letterSpacing: '0.02em',
                  }}
                >
                  {t('resetPassword.encryptedSecured')}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT PANEL — Reset Password Form */}
        <section className="w-full lg:w-1/2 bg-background flex items-center justify-center px-6 py-12 md:px-12 relative overflow-y-auto min-h-screen">
          {/* Sandpaper ambient texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" aria-hidden="true" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/sandpaper.png')" }} />

          {/* Mobile Logo */}
          <div className={`absolute top-8 ${isRtl ? 'right-6' : 'left-6'} lg:hidden flex items-center gap-2`}>
            <Compass className="text-primary" size={18} />
            <span className="font-bold text-primary" style={{ fontFamily: 'var(--font-playfair)', fontSize: '18px' }}>
              Rahal
            </span>
          </div>

          <Card
            hoverEffect={false}
            className="w-full max-w-md bg-transparent border-0 shadow-none p-0 rounded-none z-10"
          >
            <div className="w-full space-y-7">
              {/* Heading */}
              <header className={`space-y-2 animate-slide-up animate-delay-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                <h1
                  className="text-on-background font-display"
                  style={{ fontSize: '28px', fontWeight: 600, lineHeight: '36px' }}
                >
                  {t('resetPasswordTitle')}
                </h1>
                <p className="text-on-surface-variant leading-relaxed" style={{ fontSize: '14px', fontWeight: 400 }}>
                  {t('resetPasswordSubtitle')}
                </p>
              </header>

              {/* Error Alert */}
              {error && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-xl flex items-start gap-3 text-error animate-slide-up">
                  <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm font-medium leading-relaxed">{error}</span>
                </div>
              )}

              {/* Success Alert */}
              {success && (
                <div className="p-4 bg-success/10 border border-success/20 rounded-xl flex items-start gap-3 text-success animate-slide-up">
                  <CheckCircle className="flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm font-medium leading-relaxed">
                    {t('resetPasswordSuccess')}
                  </span>
                </div>
              )}

              {/* Reset Form */}
              <form className="space-y-5 animate-slide-up animate-delay-2" onSubmit={handleSubmit} noValidate>
                {/* New Password Field */}
                <div className="space-y-1.5">
                  <label
                    className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider"
                    htmlFor="password"
                  >
                    {t('newPasswordLabel')}
                  </label>
                  <div className="relative group">
                    <Lock
                      className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors`}
                      size={18}
                    />
                    <Input
                      className={`${isRtl ? 'pr-11 pl-11 text-right' : 'pl-11 pr-11 text-left'} h-14 bg-surface-container-low border-2 border-outline-variant rounded-xl text-on-surface placeholder-on-surface-variant/50 focus:border-primary focus:ring-0 outline-none transition-all duration-200 text-sm`}
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('passwordPlaceholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading || success}
                    />
                    <button
                      className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors`}
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                      disabled={loading || success}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>

                  {/* Password Strength */}
                  <div className="space-y-1.5 pt-1">
                    <div className={`flex justify-between items-center ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[11px] font-medium text-outline uppercase tracking-wider">
                        {t('strength', { val: '' }).replace(':', '').trim() || 'Security Strength'}
                      </span>
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${getStrengthTextColor()}`}>
                        {getStrengthLabel()}
                      </span>
                    </div>
                    {/* 3-segment bar */}
                    <div className="flex gap-1.5 h-1.5 w-full">
                      <div className={`flex-1 h-full rounded-full transition-all duration-300 ${passwordStrength >= 1 ? getStrengthColor() : 'bg-surface-container-highest'}`} />
                      <div className={`flex-1 h-full rounded-full transition-all duration-300 ${passwordStrength >= 2 ? getStrengthColor() : 'bg-surface-container-highest'}`} />
                      <div className={`flex-1 h-full rounded-full transition-all duration-300 ${passwordStrength >= 3 ? getStrengthColor() : 'bg-surface-container-highest'}`} />
                    </div>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-1.5">
                  <label
                    className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider"
                    htmlFor="confirmPassword"
                  >
                    {t('confirmPasswordLabel')}
                  </label>
                  <div className="relative group">
                    <ShieldCheck
                      className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors`}
                      size={18}
                    />
                    <Input
                      className={`${isRtl ? 'pr-11 pl-11 text-right' : 'pl-11 pr-11 text-left'} h-14 bg-surface-container-low border-2 border-outline-variant rounded-xl text-on-surface placeholder-on-surface-variant/50 focus:border-primary focus:ring-0 outline-none transition-all duration-200 text-sm`}
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={t('passwordPlaceholder')}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading || success}
                    />
                    <button
                      className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors`}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      type="button"
                      disabled={loading || success}
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Submit CTA */}
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={loading || success}
                  className="bg-primary hover:bg-primary-container text-on-primary h-14 rounded-xl font-body font-semibold text-base flex items-center justify-center gap-2 group mt-1 shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                      <span>{t('sendingLink') || 'Saving...'}</span>
                    </span>
                  ) : (
                    <>
                      <span>{t('resetPasswordBtn')}</span>
                      {isRtl ? (
                        <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={18} />
                      ) : (
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                      )}
                    </>
                  )}
                </Button>
              </form>

              {/* Back to Login */}
              <div className={`text-center animate-slide-up animate-delay-3`}>
                <Link href="/login" className="inline-flex items-center gap-1.5 text-primary hover:text-primary-container transition-colors group font-body text-sm font-medium">
                  {isRtl ? (
                    <>
                      <span>{t('backToLoginLink')}</span>
                      <ArrowRight className="group-hover:translate-x-0.5 transition-transform" size={15} />
                    </>
                  ) : (
                    <>
                      <ArrowLeft className="group-hover:-translate-x-0.5 transition-transform" size={15} />
                      <span>{t('backToLoginLink')}</span>
                    </>
                  )}
                </Link>
              </div>

              {/* Footer links: Help Center + Privacy Policy */}
              <div className={`pt-6 border-t border-outline-variant/30 text-center flex  justify-center  gap-6 animate-slide-up animate-delay-4`}>
                <a href="#" className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors font-body">
                  <HelpCircle size={15} />
                  <span>{t('resetPassword.helpCenter')}</span>
                </a>
                <a href="#" className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors font-body">
                  <Shield size={15} />
                  <span>{t('resetPassword.privacyPolicy')}</span>
                </a>
              </div>

            </div>
          </Card>
        </section>
      </main>
    </AuthLayout>
  );
}