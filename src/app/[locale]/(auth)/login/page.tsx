/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Compass, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { authApi } from '@/lib/api/auth';
import AuthLayout from '@/components/layout/AuthLayout';
import { useAuth } from '@/components/providers/AuthProvider';

export default function LogInPage() {
  const t = useTranslations('auth');
  const navT = useTranslations('common.nav');
  const locale = useLocale();
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t('errors.missingFields'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login({ email, password });
      if (response && response.token) {
        // Use AuthProvider's login function to set auth state
        login(response.token, {
          id: response.data.user._id,
          email: response.data.user.email,
          name: response.data.user.name,
          avatar: response.data.user.image,
        });
      } else {
        setError(t('errors.invalidCredentials'));
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || t('errors.invalidCredentials'));
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
        {/* Left Side: Visual Anchor (Visible on Desktop) */}
        <section className="relative hidden md:flex md:w-1/2 lg:w-3/5 h-screen overflow-hidden bg-obsidian">
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/40 to-transparent"></div>
          {/* Full Bleed Hero Image */}        
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-[20000ms] hover:scale-110 opacity-80" 
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDA3TjE5UIGwIhDPhjrWRg9CwGS9BQE8MVpAkudTe427F1aMKXb5NRF_Lqat5pvHbyQV7pha-N7T-y_1TFKqLSJ9g_VcYGGtYi10Wq56IhC3oC9DJUJixr_UOCwtO-0vhFS6BDMjXWttfOD8Ro7AFPCG_LKlm4pyqA1fht8A2J8i5qnxTWSh4KyQmIlrNm7zpeKgoEWrWy5RKsaF35GHS5H3n4HxRL_TvB2s4bDWwWE_WQELPp2NBqMXplYNPvjqAuyO_OdQXqmvjM')" }}
          ></div>
          {/* Contextual Quote */}
          <div className="absolute bottom-12 left-12 z-20 max-w-md">
            <p className="font-display text-headline-sm text-white leading-tight italic opacity-90 mb-4">
              {locale === 'ar' 
                ? '"رحلة الألف ميل تبدأ بخطوة واحدة إلى الماضي."'
                : '"The journey of a thousand miles begins with a single step into the past."'}
            </p>
            <div className="h-1 w-20 bg-primary-fixed-dim rounded-full"></div>
          </div>
        </section>

        {/* Right Side: Login Panel */}
        <section className="flex-1 bg-surface flex items-center justify-center p-6 md:p-12 lg:p-24 relative overflow-y-auto h-screen">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <header className="space-y-2">
              <h1 className="font-display text-2xl md:text-3xl font-semibold text-on-surface">
                {t('loginTitle')}
              </h1>
              <p className="font-body text-sm md:text-base text-on-surface-variant">
                {t('loginSubtitle')}
              </p>
            </header>

            {/* Error Alert */}
            {error && (
              <div className="p-4 bg-error-container/20 border border-error-container/30 rounded-xl flex items-start gap-3 text-error">
                <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface-variant block uppercase tracking-wider" htmlFor="email">
                  {t('emailLabel')}
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-body text-on-surface"
                    id="email" 
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-semibold text-on-surface-variant block uppercase tracking-wider" htmlFor="password">
                    {t('passwordLabel')}
                  </label>
                  <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:text-primary-container transition-colors">
                    {t('forgotPassword.title')}
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    className="w-full pl-12 pr-12 py-3.5 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-body text-on-surface"
                    id="password" 
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('passwordPlaceholder')}
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
              </div>

              {/* Primary Action */}
              <Button 
                type="submit"
                variant="primary" 
                fullWidth
                className="py-3.5 rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 group font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                    <span>{locale === 'ar' ? 'جاري التحقق...' : 'Verifying...'}</span>
                  </span>
                ) : (
                  <>
                    <span>{t('loginBtn')}</span>
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/30"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-surface px-4 text-xs text-on-surface-variant uppercase tracking-widest font-medium">
                  {t('continueWith')}
                </span>
              </div>
            </div>

            {/* Social Login */}
            <button 
              onClick={handleGoogleAuth}
              className="w-full py-3 border border-outline-variant/50 hover:border-primary bg-white dark:bg-surface text-on-surface font-semibold text-sm rounded-xl flex items-center justify-center gap-3 transition-all hover:bg-surface-container-lowest"
            >
              <svg className="w-5 h-5 animate-pulse" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              <span>{t('googleBtn')}</span>
            </button>

            {/* Footer Link */}
            <footer className="text-center pt-2">
              <p className="font-body text-sm text-on-surface-variant">
                {t('noAccount')}
                <Link href="/signup" className="text-primary font-bold hover:underline ms-1">
                  {t('createAccountLink')}
                </Link>
              </p>
            </footer>
          </div>
        </section>
      </main>
    </AuthLayout>
  );
}