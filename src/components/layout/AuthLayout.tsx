'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useRouter, usePathname } from 'next/navigation';
import ThemeToggle from '../ui/ThemeToggle';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/components/providers/AuthProvider';

interface AuthLayoutProps {
  children: React.ReactNode;
  locale: string;
}

export default function AuthLayout({ children, locale }: AuthLayoutProps) {
  const t = useTranslations('common.nav');
  const { resolvedTheme, setTheme } = useTheme();
  const isAr = locale === 'ar';
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const toggleLocale = () => {
    const nextLocale = locale === 'en' ? 'ar' : 'en';
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000`;
    window.location.reload();
  };

  return (
    <>
      {/* Fixed top-right: Theme Toggle + Language Toggle */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2 md:top-6 md:right-6">
        {/* Theme Toggle */}
        <ThemeToggle
          className={cn(
            'transition-colors duration-300',
            'bg-surface/80 backdrop-blur-md border border-outline-variant/20 rounded-full p-2 shadow-lg'
          )}
        />

        {/* Language Switcher */}
        <button
          onClick={toggleLocale}
          className={cn(
            'group/lang flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer border',
            'bg-surface/80 backdrop-blur-md border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high hover:border-primary shadow-lg'
          )}
          aria-label={isAr ? 'Switch to English' : 'تحويل للغة العربية'}
        >
          <Globe size={14} className="transition-transform duration-500 group-hover/lang:rotate-180" />
          <span>{isAr ? 'EN' : 'AR'}</span>
        </button>
      </div>

      {/* Main content */}
      <main className="min-h-screen relative">
        {children}
      </main>
    </>
  );
}