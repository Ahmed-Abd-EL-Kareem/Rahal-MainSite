/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Globe, Menu, X, User, Heart, LogOut, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils/cn';
import Button from '@/components/ui/Button';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { usersApi } from '@/lib/api/users';

export default function Header() {
  const t = useTranslations('common.nav');
  const locale = useLocale();
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();

  const isAuthPage = [
    '/login', '/signup', '/forgot-password', '/reset-password',
  ].some(p => pathname === `/${locale}${p}` || pathname.startsWith(`/${locale}${p}/`));

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");
    if (tokenFromUrl) {
      document.cookie = `token=${tokenFromUrl}; path=/; max-age=86400; SameSite=Lax`;
      params.delete("token");
      const cleanUrl = window.location.pathname + (params.toString() ? `?${params}` : "");
      window.history.replaceState({}, "", cleanUrl);
    }
    const checkAuth = () => {
      const tokenMatch = document.cookie.match(/(^|;\s*)token\s*=\s*([^;]*)/);
      const token = tokenMatch ? tokenMatch[2] : null;
      setIsLoggedIn(!!token);

      if (token) {
        try {
          const payload = token.split('.')[1];
          const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
          setUserId(decoded.id || decoded._id || decoded.sub || null);
        } catch {
          setUserId(null);
        }
      } else {
        setUserId(null);
      }
    };
    checkAuth();
  }, [pathname]);

  const { data: userData } = useQuery({
    queryKey: ['currentUser', userId],
    queryFn: () => usersApi.getUser(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const currentUser = userData?.data?.user || null;
  const userInitial = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U';
  const userImage = currentUser?.image;

  useEffect(() => {
    setImageError(false);
  }, [userImage]);

  if (isAuthPage) return null;

  const isAr = locale === 'ar';
  const isDark = mounted && resolvedTheme === 'dark';
  const isHomepage = pathname === '/';

  const isTransparent = isHomepage && !isScrolled;
  const isFloating = isScrolled;
  const isFilledFullWidth = !isHomepage && !isScrolled;

  const toggleLocale = () => {
    const nextLocale = locale === 'en' ? 'ar' : 'en';
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000`;
    window.location.reload();
  };

  const handleLogout = () => {
    document.cookie = 'token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    setIsLoggedIn(false);
    setUserId(null);
    window.location.href = '/';
  };

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/destinations', label: t('destinations') },
    { href: '/hotels', label: t('hotels') },
    ...(isLoggedIn ? [{ href: '/planner', label: t('planner') }] : []),
    { href: '/pricing', label: t('pricing') },
  ];

  if (!mounted) {
    return (
      <nav
        className={cn(
          'fixed z-50 transition-all duration-500 ease-in-out flex items-center justify-between',
          isFloating
            ? 'top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] md:w-[calc(100%-4rem)] max-w-[1200px] h-16 px-6 bg-surface/80 backdrop-blur-md border border-outline-variant/15 shadow-lg shadow-primary/5 rounded-full'
            : isFilledFullWidth
            ? 'top-0 left-0 w-full h-20 px-margin-mobile md:px-margin-desktop bg-surface/85 backdrop-blur-md border-b border-outline-variant/15 shadow-sm'
            : 'top-0 left-0 w-full h-20 px-margin-mobile md:px-margin-desktop bg-transparent border-b border-transparent'
        )}
      >
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-2 group hover:scale-[1.02] transition-transform duration-300" aria-label="Rahal Home">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
              <span className="font-display font-bold text-xl text-primary">{isAr ? 'رحّال' : 'Rahal'}</span>
            </div>
          </Link>
        </div>
      </nav>
    );
  }

  const logoSrc = isTransparent
    ? '/images/logo-2.png'
    : isDark
    ? '/images/logo-2.png'
    : '/images/logo.png';

  return (
    <nav
      className={cn(
        'fixed z-50 transition-all duration-500 ease-in-out flex items-center justify-between',
        isFloating
          ? 'top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] md:w-[calc(100%-4rem)] max-w-[1200px] h-16 px-6 bg-surface/90 backdrop-blur-md border border-outline-variant/20 shadow-xl shadow-primary/10 rounded-full'
          : isFilledFullWidth
          ? 'top-0 left-0 w-full h-20 px-margin-mobile md:px-margin-desktop bg-surface/95 backdrop-blur-md border-b border-outline-variant/20 shadow-sm'
          : 'top-0 left-0 w-full h-20 px-margin-mobile md:px-margin-desktop bg-transparent border-b border-transparent'
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center gap-12">
        <Link
          href="/"
          className="flex items-center gap-3 group hover:scale-[1.02] transition-transform duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg"
          aria-label="Rahal Home"
        >
          <Image
            src={logoSrc}
            alt=""
            width={isFloating ? 32 : 40}
            height={isFloating ? 32 : 40}
            className="object-contain transition-all duration-500 group-hover:rotate-12"
            priority
            aria-hidden="true"
          />
          <span
            className={cn(
              'font-display font-bold text-lg md:text-xl transition-all duration-300',
              isTransparent ? 'text-white' : 'text-on-background'
            )}
          >
            {locale === 'ar' ? 'رحّال' : 'Rahal'}
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1" role="menubar">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                className="relative py-3 px-4 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl"
                aria-current={isActive ? 'page' : undefined}
              >
                <span
                  className={cn(
                    'text-sm font-medium transition-colors duration-300 relative z-10',
                    isTransparent
                      ? (isActive ? 'text-primary-fixed-dim' : 'text-white/90 group-hover:text-primary-fixed-dim')
                      : (isActive ? 'text-primary font-semibold' : 'text-on-surface-variant group-hover:text-primary')
                  )}
                >
                  {link.label}
                </span>
                <span
                  className={cn(
                    'absolute bottom-2 inset-x-2 h-[2px] transition-transform duration-300 origin-center rounded-full',
                    isTransparent ? 'bg-primary-fixed-dim' : 'bg-primary',
                    isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  )}
                />
              </Link>
            );
          })}
        </div>
      </div>

      <div className="hidden md:flex items-center gap-3">
        <div className="relative group/locale" role="group" aria-label={isAr ? 'Language selection' : 'اختيار اللغة'}>
          <button
            onClick={toggleLocale}
            className={cn(
              'group/lang flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer border',
              isTransparent
                ? 'border-white/20 bg-white/10 text-white/90 hover:bg-white/20 hover:border-primary-fixed-dim'
                : 'border-outline-variant/30 bg-surface-container-low/50 text-on-surface-variant hover:bg-surface-container hover:border-primary/30'
            )}
            aria-label={isAr ? 'Switch to English' : 'تحويل للغة العربية'}
            aria-expanded="false"
            aria-haspopup="listbox"
          >
            <Globe size={14} className="transition-transform duration-500 group-hover/lang:rotate-180" aria-hidden="true" />
            <span className="uppercase tracking-wider">{isAr ? 'EN' : 'AR'}</span>
            <ChevronDown size={12} className="transition-transform duration-300 group-hover/locale:rotate-180" aria-hidden="true" />
          </button>
        </div>

        <ThemeToggle
          className={cn(
            'transition-colors duration-300',
            isTransparent ? 'text-white/90 hover:text-white hover:bg-white/10' : ''
          )}
        />

        {!isLoggedIn ? (
          <>
            <Link href="/login" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl">
              <Button
                variant="ghost"
                className={cn(
                  'px-5 py-2.5 text-sm transition-colors duration-300',
                  isTransparent ? 'text-white hover:bg-white/10' : 'text-on-surface hover:bg-surface-container'
                )}
              >
                {t('login')}
              </Button>
            </Link>
            <Link href="/signup" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl">
              <Button
                variant="primary"
                pill
                className={cn(
                  'text-sm px-6 py-2.5 hover:scale-[1.02] transition-transform duration-300 shadow-md hover:shadow-primary/30',
                  isTransparent ? 'bg-primary-fixed text-on-primary-fixed hover:bg-primary-fixed-dim' : ''
                )}
              >
                {t('signup')}
              </Button>
            </Link>
          </>
        ) : (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-surface-container-high/50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={t('profile')}
              aria-expanded={isDropdownOpen}
              aria-haspopup="menu"
            >
              {userImage && !imageError ? (
                <img
                  src={userImage}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover border border-primary-fixed-dim/30 shadow-sm"
                  onError={() => setImageError(true)}
                  aria-hidden="true"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xs font-bold font-display">
                  {userInitial}
                </div>
              )}
              <ChevronDown size={14} className={cn('transition-transform duration-300', isDropdownOpen && 'rotate-180')} aria-hidden="true" />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 cursor-default bg-transparent"
                  onClick={() => setIsDropdownOpen(false)}
                  aria-hidden="true"
                />
                <div
                  ref={dropdownRef}
                  role="menu"
                  className={cn(
                    "absolute mt-2.5 w-56 bg-surface border border-outline-variant/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-2 z-50 animate-fade-in text-on-surface text-start",
                    isAr ? "inset-inline-start-0 origin-top-start left-0" : "inset-inline-end-0 origin-top-end right-0"
                  )}
                >
                  <div className="px-3 py-2.5 border-b border-outline-variant/10 mb-1.5">
                    <p className="text-xs font-bold text-on-surface truncate">{currentUser?.name || 'Explorer'}</p>
                    <p className="text-[10px] text-on-surface-variant truncate">{currentUser?.email || ''}</p>
                  </div>

                  <Link
                    href="/account"
                    onClick={() => setIsDropdownOpen(false)}
                    role="menuitem"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer",
                      isAr ? "flex-row-reverse" : ""
                    )}
                  >
                    <User size={16} className="shrink-0 text-on-surface-variant/60" aria-hidden="true" />
                    <span>{t('profile')}</span>
                  </Link>

                  <Link
                    href="/favorites"
                    onClick={() => setIsDropdownOpen(false)}
                    role="menuitem"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer",
                      isAr ? "flex-row-reverse" : ""
                    )}
                  >
                    <Heart size={16} className="shrink-0 text-on-surface-variant/60" aria-hidden="true" />
                    <span>{t('favorites')}</span>
                  </Link>

                  <button
                    onClick={() => { setIsDropdownOpen(false); handleLogout(); }}
                    role="menuitem"
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-error hover:bg-error/5 rounded-xl transition-colors cursor-pointer border-none bg-transparent",
                      isAr ? "flex-row-reverse" : ""
                    )}
                  >
                    <LogOut size={16} className="shrink-0" aria-hidden="true" />
                    <span>{t('logout')}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex md:hidden items-center gap-2">
        <ThemeToggle
          className={cn(
            'transition-colors duration-300',
            isTransparent ? 'text-white/90 hover:text-white hover:bg-white/10' : ''
          )}
        />
        <button
          onClick={toggleLocale}
          className={cn(
            'p-1.5 text-sm font-medium cursor-pointer transition-colors duration-300 rounded-full',
            isTransparent ? 'text-white hover:bg-white/10' : 'text-on-surface-variant hover:bg-surface-container'
          )}
          aria-label={isAr ? 'Switch to English' : 'تحويل للغة العربية'}
        >
          {isAr ? 'EN' : 'AR'}
        </button>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={cn(
            'p-2 cursor-pointer transition-colors duration-300 rounded-full',
            isTransparent ? 'text-white hover:bg-white/10' : 'text-on-surface-variant hover:bg-surface-container'
          )}
          aria-label={isMobileMenuOpen ? t('closeMenu') : t('openMenu')}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          className={cn(
            'absolute inset-inline-start-0 w-full transition-all duration-300 md:hidden flex flex-col p-6 gap-6',
            isFloating
              ? 'top-18 bg-surface/95 backdrop-blur-md border border-outline-variant/20 shadow-2xl rounded-3xl'
              : 'top-20 bg-surface border-b border-outline-variant/20 shadow-lg'
          )}
        >
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'text-base font-medium py-3 border-b border-outline-variant/10 transition-colors duration-200',
                    isActive ? 'text-primary font-semibold' : 'text-on-surface hover:text-primary'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="flex flex-col gap-3 pt-4 border-t border-outline-variant/10">
            {!isLoggedIn ? (
              <>
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                  <Button variant="ghost" fullWidth className="text-on-surface py-3 rounded-xl font-semibold">
                    {t('login')}
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                  <Button variant="primary" pill fullWidth className="py-3 rounded-xl font-semibold">
                    {t('signup')}
                  </Button>
                </Link>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 p-3 bg-surface-container rounded-xl border border-outline-variant/10 text-start",
                    isAr ? "flex-row-reverse" : ""
                  )}
                >
                  {userImage && !imageError ? (
                    <img
                      src={userImage}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-primary/20"
                      onError={() => setImageError(true)}
                      aria-hidden="true"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xs font-bold shrink-0">
                      {userInitial}
                    </div>
                  )}
                  <div className="truncate flex-1">
                    <p className="text-sm font-bold text-on-surface truncate">{currentUser?.name || 'Explorer'}</p>
                    <p className="text-xs text-on-surface-variant truncate">{currentUser?.email || ''}</p>
                  </div>
                </Link>

                <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                  <Button variant="secondary" fullWidth className="py-3 rounded-xl font-semibold">
                    {t('profile')}
                  </Button>
                </Link>

                <Link href="/favorites" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                  <Button variant="secondary" fullWidth className="py-3 rounded-xl font-semibold">
                    {t('favorites')}
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                  className="text-error hover:bg-error/5 py-3 rounded-xl font-semibold border-none bg-transparent"
                >
                  {t('logout')}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}