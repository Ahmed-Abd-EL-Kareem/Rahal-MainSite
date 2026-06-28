// 'use client';

// import React, { useState, useEffect, useRef, Suspense } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { useTranslations, useLocale } from 'next-intl';
// import { Compass, ArrowLeft } from 'lucide-react';
// import Button from '@/components/ui/Button';
// import Card from '@/components/ui/Card';
// import { authApi } from '@/lib/api/auth';
// import { APIError } from '@/lib/api/client';


// function VerifyOtpContent() {
//   const t = useTranslations('auth');
//   const locale = useLocale();
//   const isRtl = locale === 'ar';
//   const router = useRouter();

//   const [email] = useState<string>(() => {
//     if (typeof window !== 'undefined') {
//       return sessionStorage.getItem('resetEmail') || '';
//     }
//     return '';
//   });
//   const [otp, setOtp] = useState<string[]>(Array(6).fill(''));

//   // Load email from sessionStorage on mount
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const storedEmail = sessionStorage.getItem('resetEmail');
//       if (!storedEmail) {
//         router.push(`/${locale}/forgot-password`);
//       }
//     }
//   }, [router, locale]);
//   const [loading, setLoading] = useState(false);
//   const [resending, setResending] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [successMsg, setSuccessMsg] = useState<string | null>(null);
//   const [countdown, setCountdown] = useState(0);

//   const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

//   // Focus the first input on mount
//   useEffect(() => {
//     if (inputRefs.current[0]) {
//       inputRefs.current[0].focus();
//     }
//   }, []);

//   // Timer countdown hook
//   useEffect(() => {
//     if (countdown <= 0) return;
//     const timer = setInterval(() => {
//       setCountdown((prev) => prev - 1);
//     }, 1000);
//     return () => clearInterval(timer);
//   }, [countdown]);

//   const handleChange = (value: string, index: number) => {
//     // Keep numeric only
//     const cleanValue = value.replace(/[^0-9]/g, '');
//     if (!cleanValue) {
//       const newOtp = [...otp];
//       newOtp[index] = '';
//       setOtp(newOtp);
//       return;
//     }

//     const char = cleanValue[cleanValue.length - 1];
//     const newOtp = [...otp];
//     newOtp[index] = char;
//     setOtp(newOtp);

//     // Auto-focus next field
//     if (index < 5) {
//       inputRefs.current[index + 1]?.focus();
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
//     if (e.key === 'Backspace') {
//       if (otp[index] === '') {
//         // Backspace on empty input: move focus back and clear previous character
//         if (index > 0) {
//           const newOtp = [...otp];
//           newOtp[index - 1] = '';
//           setOtp(newOtp);
//           inputRefs.current[index - 1]?.focus();
//         }
//       } else {
//         // Clear current value
//         const newOtp = [...otp];
//         newOtp[index] = '';
//         setOtp(newOtp);
//       }
//       e.preventDefault();
//     }
//   };

//   const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
//     e.preventDefault();
//     const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').substring(0, 6);
//     if (pasteData) {
//       const newOtp = [...otp];
//       for (let i = 0; i < 6; i++) {
//         newOtp[i] = pasteData[i] || '';
//       }
//       setOtp(newOtp);
      
//       // Place focus on either the next empty cell or the last cell
//       const nextIndex = Math.min(pasteData.length, 5);
//       inputRefs.current[nextIndex]?.focus();
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!email) {
//       setError(isRtl ? 'البريد الإلكتروني مفقود.' : 'Email is missing from the request.');
//       return;
//     }

//     const otpCode = otp.join('');
//     if (otpCode.length < 6) {
//       setError(isRtl ? 'يرجى إدخال الرمز المكون من 6 أرقام كاملاً.' : 'Please enter the full 6-digit code.');
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setSuccessMsg(null);

//     try {
//       console.log('EMAIL =>', email);
//       console.log('OTP =>', otpCode);
//       // await authApi.verifyOtp(email, otpCode);
//       // setSuccessMsg(isRtl ? 'تم التحقق بنجاح!' : 'Verification successful!');
      
//       // // Redirect to reset password on success
//       // setTimeout(() => {
//       //   router.push(`/${locale}/reset-password`);
//       // }, 1000);
//       await authApi.verifyOtp(email, otpCode);
// setSuccessMsg(isRtl ? 'تم التحقق بنجاح!' : 'Verification successful!');

// // ✅ أضف السطر ده
// sessionStorage.setItem('otpVerified', 'true');

// setTimeout(() => {
//   router.push(`/${locale}/reset-password`);
// }, 1000);
//     } catch (err: unknown) {
//       console.error('OTP verification error:', err);
//       if (err instanceof APIError) {
//         setError(err.message);
//       } else {
//         const errorMsg = err instanceof Error ? err.message : String(err);
//         setError(errorMsg || t('errors.genericOtp') || 'An unexpected error occurred. Please try again.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResend = async () => {
//     if (countdown > 0 || resending) return;
//     if (!email) {
//       setError(isRtl ? 'البريد الإلكتروني مفقود.' : 'Email is missing.');
//       return;
//     }

//     setResending(true);
//     setError(null);
//     setSuccessMsg(null);

//     try {
//       await authApi.forgotPassword(email);
//       setSuccessMsg(isRtl ? 'تم إعادة إرسال الرمز بنجاح!' : 'Verification code resent successfully!');
//       setCountdown(60);
//     } catch (err: unknown) {
//       console.error('OTP resend error:', err);
//       if (err instanceof APIError) {
//         setError(err.message);
//       } else {
//         const errorMsg = err instanceof Error ? err.message : String(err);
//         setError(errorMsg || t('errors.genericOtp') || 'An unexpected error occurred. Please try again.');
//       }
//     } finally {
//       setResending(false);
//     }
//   };



'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Compass, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { authApi } from '@/lib/api/auth';
import { APIError } from '@/lib/api/client';


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

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Timer countdown hook
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (value: string, index: number) => {
    // Keep numeric only
    const cleanValue = value.replace(/[^0-9]/g, '');
    if (!cleanValue) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    const char = cleanValue[cleanValue.length - 1];
    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    // Auto-focus next field
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '') {
        // Backspace on empty input: move focus back and clear previous character
        if (index > 0) {
          const newOtp = [...otp];
          newOtp[index - 1] = '';
          setOtp(newOtp);
          inputRefs.current[index - 1]?.focus();
        }
      } else {
        // Clear current value
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').substring(0, 6);
    if (pasteData) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasteData[i] || '';
      }
      setOtp(newOtp);
      
      // Place focus on either the next empty cell or the last cell
      const nextIndex = Math.min(pasteData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
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

    // try {
    //   console.log('EMAIL =>', email);
    //   console.log('OTP =>', otpCode);
    //   await authApi.verifyOtp(email, otpCode);
    //   setSuccessMsg(isRtl ? 'تم التحقق بنجاح!' : 'Verification successful!');
      
    //   // Redirect to reset password on success
    //   setTimeout(() => {
    //     router.push(`/${locale}/reset-password`);
    //   }, 1000);
    // } catch (err: unknown) {
    //   console.error('OTP verification error:', err);
    //   if (err instanceof APIError) {
    //     setError(err.message);
    //   } else {
    //     const errorMsg = err instanceof Error ? err.message : String(err);
    //     setError(errorMsg || t('errors.genericOtp') || 'An unexpected error occurred. Please try again.');
    //   }
    // } finally {
    //   setLoading(false);
    // }
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



    <>
      {/* ── Rahal Heritage: Verify OTP Design Tokens ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');

        /* Left panel: cinematic dark-to-darker overlay */
        .rh-cinematic-overlay {
          background: linear-gradient(
            to bottom,
            rgba(28, 28, 25, 0.38) 0%,
            rgba(28, 28, 25, 0.86) 100%
          );
        }

        /* OTP input focus ring (gold) */
        .rh-otp-input:focus {
          outline: none;
          border-color: #7e5700 !important;
          box-shadow: 0 0 0 4px rgba(200, 146, 42, 0.18);
        }

        /* OTP input filled state */
        .rh-otp-input:not(:placeholder-shown) {
          border-color: #c8922a;
          color: #7e5700;
        }

        /* CTA button — gold, rounded-xl */
        .rh-verify-btn {
          background: #c8922a !important;
          color: #ffffff !important;
          border-radius: 0.75rem !important;
          height: 56px !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 16px !important;
          font-weight: 600 !important;
          letter-spacing: 0.01em !important;
          box-shadow: 0 2px 12px rgba(126, 87, 0, 0.22) !important;
          transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease !important;
        }
        .rh-verify-btn:hover:not(:disabled) {
          background: #7e5700 !important;
          box-shadow: 0 4px 20px rgba(126, 87, 0, 0.32) !important;
        }
        .rh-verify-btn:active:not(:disabled) {
          transform: scale(0.98) !important;
        }
        .rh-verify-btn:disabled {
          opacity: 0.60 !important;
          cursor: not-allowed !important;
        }

        /* Shield icon circle */
        .rh-shield-circle {
          width: 64px;
          height: 64px;
          border-radius: 9999px;
          background: #f0ede9;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #7e5700;
        }

        /* Entrance animations */
        @keyframes rh-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rh-anim  { animation: rh-fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .rh-d1    { animation-delay: 0.05s; }
        .rh-d2    { animation-delay: 0.13s; }
        .rh-d3    { animation-delay: 0.21s; }
        .rh-d4    { animation-delay: 0.30s; }
        .rh-d5    { animation-delay: 0.38s; }

        /* Left panel scale-back ken burns */
        .rh-hero-img {
          transition: transform 20s ease-out;
          transform: scale(1.08);
        }
        .rh-hero-img:hover {
          transform: scale(1.00);
        }

        /* Blockquote gold left border */
        .rh-blockquote {
          border-left: 2px solid #f8bc51;
          padding-left: 1.5rem;
        }
        [dir="rtl"] .rh-blockquote {
          border-left: none;
          border-right: 2px solid #f8bc51;
          padding-left: 0;
          padding-right: 1.5rem;
        }
      `}</style>

      <main
        className="min-h-screen flex flex-col md:flex-row bg-[#fcf9f4] overflow-hidden"
        style={{ fontFamily: "'Inter', sans-serif" }}
        dir={isRtl ? 'rtl' : 'ltr'}
      >

        {/* ══════════════════════════════════════════
            LEFT PANEL — Cinematic Luxor Temple
            ══════════════════════════════════════════ */}
        <section className="relative hidden md:flex md:w-1/2 h-screen items-end overflow-hidden p-10">

          {/* Hero image */}
          <div className="absolute inset-0 z-0">
            <div
              className="w-full h-full bg-cover bg-center rh-hero-img"
              
                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAnw16NgRyNjedCf6S1GEHIcnFxivUtI6PMqHKfrMiUypHKZU2AefPpPauiQi4VqfPZx8PHZECiN0JPgD6WpRK9CT-OxEGLm5KWrtXgRCC46RxiRyarjABg0FWOzhGXVrkPXXpLa8HAxCgIcK3fX3nrIsTrRQrJ6whfJxHHp0YQ_nzrD89azPjNDGJgPE9CvqeYjuSlluNXBfwy_wcDHFB47bxew538tIiI-0BC4seENFkuxtPGWekTS9cFShTlCGOO7PZ9VJa4Hpk')" }}

            />
            {/* Cinematic dark overlay */}
            <div className="absolute inset-0 rh-cinematic-overlay" />
          </div>

          {/* Top-left brand mark */}
          <div className={`absolute top-10 ${isRtl ? 'right-10' : 'left-10'} z-10 flex items-center gap-2`}>
            <div className="w-10 h-10 bg-[#7e5700] rounded-lg flex items-center justify-center">
              <Compass className="text-white" size={18} />
            </div>
            <span
              className="text-white font-bold tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px' }}
            >
              Rahal
            </span>
          </div>

          {/* Bottom content: eyebrow + headline + blockquote */}
          <div className="relative z-10 w-full max-w-xl mb-10">
            {/* Eyebrow: horizontal rule + "ANCIENT WISDOM" */}
            <div className={`flex items-center gap-3 mb-5 opacity-90 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <span className="h-px w-12 bg-[#f8bc51] flex-shrink-0" />
              <span
                className="text-[#f8bc51] tracking-widest uppercase"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 600 }}
              >
                {isRtl ? 'الحكمة القديمة' : 'Ancient Wisdom'}
              </span>
            </div>

            {/* Main headline */}
            <h1
              className="text-white leading-tight mb-8"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(32px, 3.8vw, 52px)',
                fontWeight: 700,
                lineHeight: '1.12',
              }}
            >
              {isRtl ? (
                <>الأمان<br />عبر الزمن</>
              ) : (
                <>Security <br /> Through Time</>
              )}
            </h1>

            {/* Blockquote */}
            <blockquote className="rh-blockquote">
              <p
                className="italic text-[#e5e2dd] mb-2"
                style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: 600 }}
              >
                {isRtl
                  ? '"الحكمة الحقيقية تكمن في التفاصيل."'
                  : '"True wisdom is in the details."'}
              </p>
              <cite
                className="text-[#f8bc51] not-italic opacity-80"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 600 }}
              >
                — {isRtl ? 'سلسلة رحّال أرشيف' : 'Rahal Archive Series'}
              </cite>
            </blockquote>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            RIGHT PANEL — OTP Verification Form
            ══════════════════════════════════════════ */}
        <section className="w-full md:w-1/2 min-h-screen flex items-center justify-center bg-[#ffffff] px-6 py-12 md:px-10 relative overflow-y-auto">

          {/* Mobile brand header */}
          <div className={`absolute top-8 ${isRtl ? 'right-6' : 'left-6'} md:hidden flex items-center gap-2`}>
            <Compass className="text-[#7e5700]" size={18} />
            <span className="font-bold text-[#7e5700]" style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px' }}>
              Rahal
            </span>
          </div>

          {/*
            Card kept as required — made visually transparent so the white panel
            shows through, matching the design's clean open layout.
          */}
          <Card
            hoverEffect={false}
            className="w-full max-w-md bg-transparent border-0 shadow-none p-0 rounded-none"
          >
            <div className="w-full space-y-8">

              {/* ── Shield icon + heading ── */}
              <div className={`space-y-3 rh-anim rh-d1 ${isRtl ? 'text-right' : 'text-left'}`}>
                {/* Shield icon circle */}
                <div className={`rh-shield-circle mb-4 ${isRtl ? 'mr-auto' : ''}`}>
                  {/* Shield SVG */}
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4c1.4 0 2.8.5 3.86 1.57L7.5 14.09c-.34-.97-.5-2-.5-3.09 0-3.31 2.24-6 5-6zm0 14c-2.76 0-5-2.69-5-6 0-.9.16-1.77.45-2.57L16.5 18.43C15.44 19.5 13.8 20 12 20z"/>
                  </svg>
                </div>

                <h1
                  className="text-[#1c1c19]"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '28px',
                    fontWeight: 600,
                    lineHeight: '36px',
                  }}
                >
                  {t('verifyOtpTitle')}
                </h1>

                <p
                  className="text-[#504536] leading-relaxed"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px', fontWeight: 400 }}
                >
                  {t('verifyOtpSubtitle', {
                    email: email || 'your email',
                  })}
                </p>
              </div>

              {/* ── Error alert ── */}
              {error && (
                <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm rh-anim">
                  {error}
                </div>
              )}

              {/* ── Success message ── */}
              {successMsg && (
                <div className="p-3 rounded-xl border border-green-200 bg-green-50 text-green-600 text-sm rh-anim">
                  {successMsg}
                </div>
              )}

              {/* ── OTP Form ── */}
              <form onSubmit={handleSubmit} className="space-y-8 rh-anim rh-d2">

                {/* OTP inputs */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#504536] mb-4">
                    Verification Code (OTP)
                  </label>

                  <div className="flex justify-between gap-2 md:gap-3" dir="ltr">
                    {[...Array(6)].map((_, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={otp[index]}
                        onChange={(e) => handleChange(e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onPaste={handlePaste}
                        placeholder="·"
                        className="rh-otp-input w-full h-14 md:h-16 text-center text-2xl font-bold bg-[#f0ede9] border-2 border-[#d4c4b0] rounded-xl text-[#7e5700] transition-all duration-200"
                      />
                    ))}
                  </div>
                </div>

                {/* Verify CTA */}
                <Button
                  type="submit"
                  fullWidth
                  disabled={loading}
                  className="rh-verify-btn flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                      <span>Verifying...</span>
                    </span>
                  ) : (
                    <>
                      <span>{t('verifyOtpBtn')}</span>
                      <svg
                        width="18" height="18" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round"
                        className="group-hover:translate-x-0.5 transition-transform"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </Button>
              </form>

              {/* ── Resend & Back to Login ── */}
              <div className="flex flex-col items-center gap-4 pt-2 rh-anim rh-d3">
                {/* Resend */}
                {countdown > 0 ? (
                  <span
                    className="text-sm text-[#827564]"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {t('resendActive', { seconds: countdown })}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="group flex items-center gap-1 text-sm text-[#504536] hover:text-[#7e5700] transition-colors disabled:opacity-50"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    <span>{isRtl ? 'لم تستلم الرمز؟' : "Didn't receive code?"}</span>
                    <span className="text-[#7e5700] font-semibold border-b border-transparent group-hover:border-[#7e5700] transition-colors">
                      {resending
                        ? (isRtl ? 'جارٍ الإرسال...' : 'Sending...')
                        : t('resendBtn')}
                    </span>
                  </button>
                )}

                {/* Back to Login */}
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-[#504536] hover:text-[#7e5700] transition-colors mt-1 group"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 500 }}
                >
                  {isRtl ? (
                    <>
                      <span>{t('backToLoginLink')}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
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
            style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/sandpaper.png')" }}
            aria-hidden="true"
          />
        </section>

      </main>
    </>
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
