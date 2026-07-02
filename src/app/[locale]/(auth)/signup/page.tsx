/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Mail, Lock, Eye, EyeOff, User, Compass, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { authApi } from '@/lib/api/auth';
import AuthLayout from '@/components/layout/AuthLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import Image from 'next/image';

export default function SignUpPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [passwordStrength, setPasswordStrength] = useState(0); // 0-4
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password strength calculator
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    let score = 0;
    if (password.length > 5) score++; // Weak
    if (password.length > 8) score++; // Fair
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++; // Good
    if (/[^A-Za-z0-9]/.test(password)) score++; // Strong
    setPasswordStrength(score);
  }, [password]);

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
      case 1: return 'bg-error'; // red
      case 2: return 'bg-primary-container'; // orange/yellow
      case 3: return 'bg-primary'; // brand gold
      case 4: return 'bg-success'; // green
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
    if (!name || !email || !password) {
      setError(t('errors.missingFields'));
      return;
    }
    if (!agreeTerms) {
      setError(t('errors.termsRequired'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authApi.signup({ name, email, password });
      if (response && response.token) {
        // Use AuthProvider's login function to set auth state
        login(response.token, {
          id: response.data.user._id,
          email: response.data.user.email,
          name: response.data.user.name,
          avatar: response.data.user.image,
        });
        // Redirect to home page after successful signup
        router.push(`/${locale}`);
        router.refresh();
      } else {
        setError(t('errors.emailInUse'));
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || t('errors.emailInUse'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    window.location.href = authApi.getGoogleAuthUrl();
  };

  return (
    <AuthLayout locale={locale}>
      <main className="min-h-screen flex flex-col md:flex-row bg-background">
        {/* Left Side: Hero Image & Value Props (Visible on Desktop) */}
        <section className="hidden md:flex relative md:w-1/2 lg:w-3/5 overflow-hidden bg-obsidian">
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-10000000 hover:scale-110 opacity-70"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAnw16NgRyNjedCf6S1GEHIcnFxivUtI6PMqHKfrMiUypHKZU2AefPpPauiQi4VqfPZx8PHZECiN0JPgD6WpRK9CT-OxEGLm5KWrtXgRCC46RxiRyarjABg0FWOzhGXVrkPXXpLa8HAxCgIcK3fX3nrIsTrRQrJ6whfJxHHp0YQ_nzrD89azPjNDGJgPE9CvqeYjuSlluNXBfwy_wcDHFB47bxew538tIiI-0BC4seENFkuxtPGWekTS9cFShTlCGOO7PZ9VJa4Hpk')",
            }}
          ></div>
          {/* Hero Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/85 flex flex-col justify-between p-12 lg:p-20 text-white z-10">
            <div>
              <Link href="/" className="flex items-center gap-3">
                {/* <Compass className="text-primary-fixed-dim" size={24} /> */}
                <Image
                  src="/images/logo-2.png"
                  alt="Rahal Logo"
                  width={35}
                  height={35}
                />
                <span className="font-display font-bold text-headline-md text-primary-fixed-dim tracking-tight">
                  Rahal
                </span>
              </Link>
            </div>

            <div className="max-w-lg space-y-8">
              <h1 className="font-display text-4xl lg:text-5xl font-bold leading-tight">
                {locale === "ar"
                  ? "ابدأ رحلتك الأبدية"
                  : "Begin Your Eternal Journey"}
              </h1>
              <div className="space-y-6">
                {/* Value Prop 1 */}
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl flex items-start gap-4 border border-white/15">
                  <div className="bg-primary/20 p-2.5 rounded-lg flex items-center justify-center text-primary-fixed-dim">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold mb-1">
                      {locale === "ar"
                        ? "مسارات ذكاء اصطناعي مخصصة"
                        : "Personalized AI Itineraries"}
                    </h3>
                    <p className="font-body text-sm text-surface-variant/90 leading-relaxed">
                      {locale === "ar"
                        ? "تقوم شبكاتنا العصبية المتقدمة بتنسيق تجارب تتناسب مع تفضيلاتك وجدولك الزمني."
                        : "Our advanced neural networks curate experiences that resonate with your personal history and travel style."}
                    </p>
                  </div>
                </div>

                {/* Value Prop */}
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl flex items-start gap-4 border border-white/15">
                  <div className="bg-secondary/20 p-2.5 rounded-lg flex items-center justify-center text-secondary-fixed">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold mb-1">
                      {locale === "ar"
                        ? "حجز فوري ذكي"
                        : "One-Click Secure Bookings"}
                    </h3>
                    <p className="font-body text-sm text-surface-variant/90 leading-relaxed">
                      {locale === "ar"
                        ? "ربط فوري وحجز متكامل للفنادق الفاخرة والمعالم السياحية بلمسة واحدة."
                        : "Direct connection to high-end curators and hotel reservations built with trusted security."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="opacity-60 text-xs font-medium">
          © 2024 Rahal AI Travel. Inspired by the eternal spirit of the Nile.
        </div> */}
        </section>

        {/* Right Side: Sign Up Form */}
        <section className="flex-1 bg-surface flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 relative overflow-y-auto h-screen">
          {/* Mobile Header Logo */}
          <div className="md:hidden flex items-center gap-2 mb-8">
            {/* <Compass className="text-primary" size={24} /> */}
            <Image
              src="/images/logo-2.png"
              alt="Rahal Logo"
              width={35}
              height={35}
            />
            <span className="font-display font-bold text-bold text-headline-sm text-primary">
              Rahal
            </span>
          </div>

          <div className="w-full max-w-md">
            <header className="mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-on-surface mb-2">
                {t("signupTitle")}
              </h2>
              <p className="font-body text-sm md:text-base text-on-surface-variant">
                {t("signupSubtitle")}
              </p>
            </header>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-error-container/20 border border-error-container/30 rounded-xl flex items-start gap-3 text-error">
                <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Registration Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="space-y-1">
                <label
                  className="text-xs font-semibold text-on-surface-variant block uppercase tracking-wider"
                  htmlFor="name"
                >
                  {t("nameLabel")}
                </label>
                <div className="relative group">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors"
                    size={20}
                  />
                  <input
                    className="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-outline-variant font-body text-on-surface"
                    id="name"
                    type="text"
                    placeholder={t("namePlaceholder")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label
                  className="text-xs font-semibold text-on-surface-variant block uppercase tracking-wider"
                  htmlFor="email"
                >
                  {t("emailLabel")}
                </label>
                <div className="relative group">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors"
                    size={20}
                  />
                  <input
                    className="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-outline-variant font-body text-on-surface"
                    id="email"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  className="text-xs font-semibold text-on-surface-variant block uppercase tracking-wider"
                  htmlFor="password"
                >
                  {t("passwordLabel")}
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors"
                    size={20}
                  />
                  <input
                    className="w-full pl-12 pr-12 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-outline-variant font-body text-on-surface"
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between items-center px-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${getStrengthTextColor()}`}
                    >
                      {t("strength", { val: getStrengthLabel() })}
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full flex gap-1 h-1">
                    <div
                      className={`w-1/4 h-full rounded-full transition-all duration-300 ${passwordStrength >= 1 ? getStrengthColor() : "bg-surface-container-high"}`}
                    ></div>
                    <div
                      className={`w-1/4 h-full rounded-full transition-all duration-300 ${passwordStrength >= 2 ? getStrengthColor() : "bg-surface-container-high"}`}
                    ></div>
                    <div
                      className={`w-1/4 h-full rounded-full transition-all duration-300 ${passwordStrength >= 3 ? getStrengthColor() : "bg-surface-container-high"}`}
                    ></div>
                    <div
                      className={`w-1/4 h-full rounded-full transition-all duration-300 ${passwordStrength >= 4 ? getStrengthColor() : "bg-surface-container-high"}`}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Terms of Service Checkbox */}
              <div className="flex items-start gap-3">
                <div className="flex items-center h-5">
                  <input
                    className="w-5 h-5 rounded border-outline-variant/60 text-primary focus:ring-primary cursor-pointer"
                    id="terms"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    required
                  />
                </div>
                <label
                  className="text-xs text-on-surface-variant font-medium cursor-pointer"
                  htmlFor="terms"
                >
                  {locale === "ar" ? (
                    <>
                      أنا أوافق على{" "}
                      <Link
                        className="text-primary hover:underline font-bold"
                        href="#"
                      >
                        شروط الخدمة
                      </Link>{" "}
                      و{" "}
                      <Link
                        className="text-primary hover:underline font-bold"
                        href="#"
                      >
                        سياسة الخصوصية
                      </Link>
                      .
                    </>
                  ) : (
                    <>
                      I agree to the{" "}
                      <Link
                        className="text-primary hover:underline font-bold"
                        href="#"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        className="text-primary hover:underline font-bold"
                        href="#"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </>
                  )}
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                className="py-3.5 rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                    <span>
                      {locale === "ar" ? "جاري التحضير..." : "Creating..."}
                    </span>
                  </span>
                ) : (
                  <span>{t("signupBtn")}</span>
                )}
              </Button>
            </form>

            {/* Social Sign Up */}
            <div className="relative py-4 my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/30"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-surface px-4 text-xs text-on-surface-variant uppercase tracking-widest font-medium">
                  {t("continueWith")}
                </span>
              </div>
            </div>

            <button
              onClick={handleGoogleAuth}
              className="w-full py-3 border border-outline-variant/50 hover:border-primary bg-white dark:bg-surface-container text-on-surface font-semibold text-sm rounded-xl flex items-center justify-center gap-3 transition-all hover:bg-surface-container-lowest"
            >
              <svg className="w-5 h-5 animate-pulse" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                ></path>
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                ></path>
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                ></path>
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                ></path>
              </svg>
              <span>{t("googleBtn")}</span>
            </button>

            {/* Footer Link */}
            <footer className="mt-6 text-center">
              <p className="font-body text-sm text-on-surface-variant">
                {t("haveAccount")}
                <Link
                  href="/login"
                  className="text-primary font-bold hover:underline ms-1"
                >
                  {t("loginLink")}
                </Link>
              </p>
            </footer>
          </div>
        </section>
      </main>
    </AuthLayout>
  );
}