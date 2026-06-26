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

  // Load email from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEmail = sessionStorage.getItem('resetEmail');
      if (!storedEmail) {
        router.push(`/${locale}/forgot-password`);
      }
    }
  }, [router, locale]);

  // Derived password strength scoring (avoids useEffect state setter)
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
      setError(isRtl ? 'البريد الإلكتروني مفقود.' : 'Email is missing.');
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
      // await authApi.resetPassword({ email, password, confirmPassword });
      await authApi.resetPassword({
        email,
        newPassword: password,
      });
      setSuccess(true);
      
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('resetEmail');
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

  return (
    <>
      {/* ── Rahal Heritage: Reset Password Design Tokens ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');

        /* Right panel warm sand gradient */
        .rh-sand-gradient {
          background: linear-gradient(135deg, #fcf9f4 0%, #f0ede9 100%);
        }

        /* Left panel: bottom-up dark gradient for text legibility */
        .rh-cinematic-overlay {
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.82) 0%,
            rgba(0, 0, 0, 0.18) 50%,
            transparent 100%
          );
        }

        /* Input focus: gold ring */
        .rh-input-wrap input:focus {
          border-color: #7e5700 !important;
          box-shadow: 0 0 0 4px rgba(200, 146, 42, 0.16) !important;
          outline: none !important;
        }

        /* CTA button: gold, rounded-xl */
        .rh-cta-btn {
          background: #c8922a !important;
          color: #ffffff !important;
          border-radius: 0.75rem !important;
          height: 56px !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 15px !important;
          font-weight: 600 !important;
          letter-spacing: 0.01em !important;
          box-shadow: 0 4px 16px rgba(126, 87, 0, 0.25) !important;
          transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease !important;
        }
        .rh-cta-btn:hover:not(:disabled) {
          background: #7e5700 !important;
          box-shadow: 0 6px 24px rgba(126, 87, 0, 0.35) !important;
        }
        .rh-cta-btn:active:not(:disabled) {
          transform: scale(0.98) !important;
        }
        .rh-cta-btn:disabled {
          opacity: 0.60 !important;
          cursor: not-allowed !important;
        }

        /* Secure restoration pill badge */
        .rh-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 14px;
          border-radius: 9999px;
          background: rgba(200, 146, 42, 0.18);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(200, 146, 42, 0.28);
          color: #f8bc51;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        /* Ken-Burns subtle zoom */
        .rh-hero-img {
          transition: transform 12s ease-out;
          transform: scale(1.06);
        }
        .rh-hero-img:hover { transform: scale(1.00); }

        /* Entrance animations */
        @keyframes rh-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rh-anim  { animation: rh-fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .rh-d1    { animation-delay: 0.05s; }
        .rh-d2    { animation-delay: 0.13s; }
        .rh-d3    { animation-delay: 0.21s; }
        .rh-d4    { animation-delay: 0.29s; }
        .rh-d5    { animation-delay: 0.37s; }

        /* Strength bar transition */
        .rh-bar { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }

        /* Footer links */
        .rh-footer-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: #827564;
          transition: color 0.15s ease;
        }
        .rh-footer-link:hover { color: #7e5700; }

        /* Back to login */
        .rh-back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #c8922a;
          transition: color 0.15s ease;
        }
        .rh-back-link:hover { color: #7e5700; }

        /* Sandpaper ambient texture */
        .rh-texture {
          background-image: url('https://www.transparenttextures.com/patterns/sandpaper.png');
        }
      `}</style>

      <main
        className="min-h-screen flex flex-col lg:flex-row overflow-hidden"
        style={{ fontFamily: "'Inter', sans-serif" }}
        dir={isRtl ? 'rtl' : 'ltr'}
      >

        {/* ══════════════════════════════════════════
            LEFT PANEL — Sphinx / Milky Way cinematic
            ══════════════════════════════════════════ */}
        <section className="relative hidden lg:flex lg:w-1/2 h-screen overflow-hidden">

          {/* Hero image — 2×2 grid: كل خلية بتعرض الصورة كاملة */}
          <div className="absolute inset-0 z-0">
            <div className="w-full h-full grid grid-cols-2 grid-rows-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD9GJPvonhyqfM5VB0fXipr_Mq_lsesZSJB1LWSDGxugO5JInfC-uURsS6SEDb5ORkCPtZxeMgjQepInPfTnci9OBg5kBtIC54xF7hHg2YZp5GIxJlVtUj0UVvLI-w9SkWeFnyoTEJnJbTRLK7FBbRkebfsRE4H3Fm2Y3IR1fslogjiLRKIXqC2fWzRGphiIYuEwS-GmUDPkKY404WKIhATFfJIZ-KfDa1ecgCtc_KrFgKnqeGnPIQtAiiXRQzXv1jZC6I1JvUZFnQ')",
                    backgroundPosition: 'center center',
                    backgroundSize: 'cover',
                  }}
                />
              ))}
            </div>
            <div className="absolute inset-0 rh-cinematic-overlay" />
          </div>

          {/* Content: bottom of panel */}
          <div className="relative z-10 flex flex-col justify-end p-10 h-full w-full">
            <div className="mb-8 max-w-md">
              {/* Secure restoration badge */}
              <div className="mb-4">
                <span className="rh-badge">
                  {isRtl ? 'استعادة آمنة' : 'Secure Restoration'}
                </span>
              </div>

              {/* Headline */}
              {/* <h1
                className="text-white mb-4 leading-tight"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(32px, 3.8vw, 52px)',
                  fontWeight: 700,
                  lineHeight: '1.1',
                }}
              >
                {isRtl ? 'استعادة وصولك' : 'Restoring Your Access'}
              </h1> */}
              {/* Headline */}
<h1
  className="text-white mb-4"
  style={{
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(40px,4vw,56px)",
    fontWeight: 700,
    lineHeight: "1.05",
    letterSpacing: "-0.03em",
    maxWidth: "430px",
  }}
>
  {isRtl ? "استعادة وصولك" : "Restoring Your Access"}
</h1>

              {/* Subtitle */}
              {/* <p
                className="text-white/80 leading-relaxed mb-8"
                style={{ fontSize: '16px', fontWeight: 100 }}
              >
                {isRtl
                  ? 'رحلتك تستمر هنا. استعد ممرك الرقمي إلى عجائب رحّال هيريتيج.'
                  : 'Your journey continues here. Reclaim your digital passage to the wonders of Rahal Heritage.'}
              </p> */}
              <p
  className="text-white/75 mb-7"
  style={{
    fontSize: "px",
    fontWeight: 100,
    lineHeight: "1.75",
    maxWidth: "390px",
  }}
>
  {isRtl
    ? "رحلتك تستمر هنا. استعد ممرك الرقمي إلى عجائب رحّال هيريتيج."
    : "Your journey continues here. Reclaim your digital passage to the wonders of Rahal Heritage."}
</p>

              {/* Encrypted footer row */}
              {/* <div className={`flex items-center gap-3 text-white/55 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <ShieldCheck size={18} className="flex-shrink-0" />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 100 }}>
                  {isRtl ? 'مشفر ومحمي بواسطة Rahal AI' : 'Encrypted & Secured by Rahal AI'}
                </span>
              </div> */}
              <div
  className={`flex items-center gap-2 text-white/70 ${
    isRtl ? "flex-row-reverse" : ""
  }`}
>
  <ShieldCheck size={16} className="flex-shrink-0" />

  <span
    style={{
      fontFamily: "'Inter', sans-serif",
      fontSize: "12px",
      fontWeight: 500,
      letterSpacing: "0.02em",
    }}
  >
    {isRtl
      ? "مشفر ومحمي بواسطة Rahal AI"
      : "Encrypted & Secured by Rahal AI"}
  </span>
</div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            RIGHT PANEL — Reset Password Form
            ══════════════════════════════════════════ */}
        <section className="w-full lg:w-1/2 rh-sand-gradient flex items-center justify-center px-6 py-12 md:px-12 relative overflow-y-auto min-h-screen">

          {/* Sandpaper ambient texture */}
          <div className="absolute inset-0 rh-texture opacity-[0.03] pointer-events-none" aria-hidden="true" />

          {/* Mobile Logo */}
          <div className={`absolute top-8 ${isRtl ? 'right-6' : 'left-6'} lg:hidden flex items-center gap-2`}>
            <Compass className="text-[#7e5700]" size={18} />
            <span
              className="font-bold text-[#7e5700]"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px' }}
            >
              Rahal
            </span>
          </div>

          {/*
            Card kept as required — rendered transparent/borderless
            so the sand-gradient panel shows through, matching the design.
          */}
          <Card
            hoverEffect={false}
            className="w-full max-w-md bg-transparent border-0 shadow-none p-0 rounded-none z-10"
          >
            <div className="w-full space-y-7">

              {/* ── Heading ── */}
              <header className={`space-y-2 rh-anim rh-d1 ${isRtl ? 'text-right' : ''}`}>
                <h1
                  className="text-[#1c1c19]"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '28px',
                    fontWeight: 600,
                    lineHeight: '36px',
                  }}
                >
                  {t('resetPasswordTitle')}
                </h1>
                <p
                  className="text-[#504536] leading-relaxed"
                  style={{ fontSize: '14px', fontWeight: 400 }}
                >
                  {t('resetPasswordSubtitle')}
                </p>
              </header>

              {/* ── Error Alert ── */}
              {error && (
                <div className="p-4 bg-error-container/20 border border-error-container/30 rounded-xl flex items-start gap-3 text-error rh-anim">
                  <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm font-medium leading-relaxed">{error}</span>
                </div>
              )}

              {/* ── Success Alert ── */}
              {success && (
                <div className="p-4 bg-success/15 border border-success-container/30 rounded-xl flex items-start gap-3 text-success rh-anim">
                  <CheckCircle className="flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm font-medium leading-relaxed">
                    {t('resetPasswordSuccess')}
                  </span>
                </div>
              )}

              {/* ── Reset Form ── */}
              <form className="space-y-5 rh-anim rh-d2" onSubmit={handleSubmit} noValidate>

                {/* New Password Field */}
                <div className="space-y-1.5">
                  <label
                    className="block text-xs font-semibold text-[#504536] uppercase tracking-wider"
                    htmlFor="password"
                  >
                    {t('newPasswordLabel')}
                  </label>
                  <div className="relative group rh-input-wrap">
                    <Lock
                      className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-[#827564] group-focus-within:text-[#7e5700] transition-colors`}
                      size={18}
                    />
                    <Input
                      className={`
                        ${isRtl ? 'pr-11 pl-11 text-right' : 'pl-11 pr-11 text-left'}
                        h-14 bg-white border-2 border-[#d4c4b0] rounded-xl
                        text-[#1c1c19] placeholder-[#b8a898]
                        focus:border-[#7e5700] focus:ring-0 outline-none
                        transition-all duration-200 text-sm
                      `}
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('passwordPlaceholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading || success}
                    />
                    <button
                      className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-[#827564] hover:text-[#1c1c19] transition-colors`}
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                      disabled={loading || success}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>

                  {/* Password Strength — always shown inline as per design */}
                  <div className="space-y-1.5 pt-1">
                    <div className={`flex justify-between items-center ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[11px] font-medium text-[#827564] uppercase tracking-wider">
                        {t('strength', { val: '' }).replace(':', '').trim() || 'Security Strength'}
                      </span>
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${getStrengthTextColor()}`}>
                        {getStrengthLabel()}
                      </span>
                    </div>
                    {/* 3-segment bar (matching reference design) */}
                    <div className="flex gap-1.5 h-1.5 w-full">
                      <div className={`rh-bar flex-1 h-full rounded-full ${passwordStrength >= 1 ? getStrengthColor() : 'bg-[#e0d5c9]'}`} />
                      <div className={`rh-bar flex-1 h-full rounded-full ${passwordStrength >= 2 ? getStrengthColor() : 'bg-[#e0d5c9]'}`} />
                      <div className={`rh-bar flex-1 h-full rounded-full ${passwordStrength >= 3 ? getStrengthColor() : 'bg-[#e0d5c9]'}`} />
                    </div>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-1.5">
                  <label
                    className="block text-xs font-semibold text-[#504536] uppercase tracking-wider"
                    htmlFor="confirmPassword"
                  >
                    {t('confirmPasswordLabel')}
                  </label>
                  <div className="relative group rh-input-wrap">
                    <ShieldCheck
                      className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-[#827564] group-focus-within:text-[#7e5700] transition-colors`}
                      size={18}
                    />
                    <Input
                      className={`
                        ${isRtl ? 'pr-11 pl-11 text-right' : 'pl-11 pr-11 text-left'}
                        h-14 bg-white border-2 border-[#d4c4b0] rounded-xl
                        text-[#1c1c19] placeholder-[#b8a898]
                        focus:border-[#7e5700] focus:ring-0 outline-none
                        transition-all duration-200 text-sm
                      `}
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={t('passwordPlaceholder')}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading || success}
                    />
                    <button
                      className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-[#827564] hover:text-[#1c1c19] transition-colors`}
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
                  className="rh-cta-btn flex items-center justify-center gap-2 group mt-1"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                      <span>{isRtl ? 'جاري الحفظ...' : 'Saving...'}</span>
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

              {/* ── Back to Login ── */}
              <div className={`text-center rh-anim rh-d3`}>
                <Link href="/login" className="rh-back-link group">
                  {isRtl ? (
                    <>
                      <span>{t('backToLoginLink') || 'Back to Sign In'}</span>
                      <ArrowRight className="group-hover:translate-x-0.5 transition-transform" size={15} />
                    </>
                  ) : (
                    <>
                      <ArrowLeft className="group-hover:-translate-x-0.5 transition-transform" size={15} />
                      <span>{t('backToLoginLink') || 'Back to Sign In'}</span>
                    </>
                  )}
                </Link>
              </div>

              {/* ── Footer links: Help Center + Privacy Policy ── */}
              <div className={`pt-6 border-t border-[#d4c4b0]/50 flex justify-center lg:justify-start gap-6 rh-anim rh-d4`}>
                <a href="#" className="rh-footer-link">
                  <HelpCircle size={15} />
                  <span>{isRtl ? 'مركز المساعدة' : 'Help Center'}</span>
                </a>
                <a href="#" className="rh-footer-link">
                  <Shield size={15} />
                  <span>{isRtl ? 'سياسة الخصوصية' : 'Privacy Policy'}</span>
                </a>
              </div>

            </div>
          </Card>
        </section>

      </main>
    </>
  );
}
