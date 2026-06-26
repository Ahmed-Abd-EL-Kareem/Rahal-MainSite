'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Globe, Menu, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import ThemeToggle from '../ui/ThemeToggle';
import Button from '../ui/Button';
import { cn } from '@/lib/utils/cn';
import { usersApi } from '@/lib/api/users';

export default function Header() {
  const t = useTranslations('common.nav');
  const locale = useLocale();
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();

  const isAuthPage = [
    '/login', '/signup', '/forgot-password', '/reset-password', '/verify-otp',
    '/en/login', '/en/signup', '/en/forgot-password', '/en/reset-password', '/en/verify-otp',
    '/ar/login', '/ar/signup', '/ar/forgot-password', '/ar/reset-password', '/ar/verify-otp'
  ].some(p => pathname === p || pathname.startsWith(p + '/'));

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const tokenMatch = document.cookie.match(/(^|;\s*)token\s*=\s*([^;]*)/);
      const token = tokenMatch ? tokenMatch[2] : null;
      setIsLoggedIn(!!token);

      if (token) {
        try {
          const payload = token.split('.')[1];
          const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
          setUserId(decoded.id || decoded._id || decoded.sub || null);
        } catch (err) {
          setUserId(null);
        }
      } else {
        setUserId(null);
      }
    };
    checkAuth();
  }, [pathname]);

  // Fetch current user using TanStack Query
  const { data: userData } = useQuery({
    queryKey: ['currentUser', userId],
    queryFn: () => usersApi.getUser(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
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

  // State derived from pathname and scroll position
  const isTransparent = isHomepage && !isScrolled;
  const isFloating = isScrolled;
  const isFilledFullWidth = !isHomepage && !isScrolled;

  // Toggle locale using cookie strategy (standard for localePrefix: 'never')
  const toggleLocale = () => {
    const nextLocale = locale === 'en' ? 'ar' : 'en';
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000`;
    window.location.reload();
  };

  // Determine which logo to use
  const logoSrc = isTransparent
    ? '/images/logo-2.png' // White logo on dark transparent background
    : (isDark ? '/images/logo-2.png' : '/images/logo.png'); // Standard dark logo for light theme, white logo for dark theme

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
      {/* Left Container: Logo & Desktop Navigation Links */}
      <div className="flex items-center gap-12">
        {/* Logo (Visible on both desktop & mobile now) */}
        <Link href="/" className="flex items-center gap-2 group hover:scale-[1.02] transition-transform duration-300">
          <Image
            src={logoSrc}
            alt="Rahal Logo"
            width={isFloating ? 32 : 40}
            height={isFloating ? 32 : 40}
            className="object-contain transition-all duration-500 group-hover:rotate-12"
            priority
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

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative py-2 group cursor-pointer"
              >
                <span
                  className={cn(
                    'text-sm font-medium transition-colors duration-300',
                    isTransparent 
                      ? (isActive ? 'text-primary-fixed-dim' : 'text-white/90 group-hover:text-primary-fixed-dim') 
                      : (isActive ? 'text-primary font-semibold' : 'text-on-surface-variant group-hover:text-primary')
                  )}
                >
                  {link.label}
                </span>
                <span
                  className={cn(
                    'absolute bottom-0 left-0 w-full h-[2px] transition-transform duration-300 origin-left rounded-full',
                    isTransparent ? 'bg-primary-fixed-dim' : 'bg-primary',
                    isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  )}
                />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Action Controls */}
      <div className="hidden md:flex items-center gap-4">
        {/* Language Switcher */}
        <button
          onClick={toggleLocale}
          className={cn(
            'group/lang flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer border',
            isTransparent
              ? 'border-white/20 bg-white/10 text-white/90 hover:bg-white/20 hover:border-primary-fixed-dim'
              : 'border-outline-variant/30 bg-surface-container-low/50 text-on-surface-variant hover:bg-surface-container-high hover:border-primary'
          )}
          aria-label={isAr ? 'Switch to English' : 'تحويل للغة العربية'}
        >
          <Globe size={14} className="transition-transform duration-500 group-hover/lang:rotate-180" />
          <span>{isAr ? 'EN' : 'AR'}</span>
        </button>

        {/* Theme Toggle */}
        <ThemeToggle 
          className={cn(
            'transition-colors duration-300',
            isTransparent ? 'text-white/90 hover:text-white hover:bg-white/10' : ''
          )} 
        />

        {/* Auth Buttons / Profile Dropdown */}
        {!isLoggedIn ? (
          <>
            <Link href="/login">
              <Button 
                variant="ghost" 
                className={cn(
                  'px-4 py-2 text-sm transition-colors duration-300',
                  isTransparent ? 'text-white hover:bg-white/10' : 'text-on-surface'
                )}
              >
                {t('login')}
              </Button>
            </Link>
            <Link href="/signup">
              <Button 
                variant="primary" 
                pill
                className={cn(
                  'text-sm px-5 py-2 hover:scale-[1.02] transition-transform duration-300 shadow-md hover:shadow-primary/20',
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
              className="flex items-center gap-2 p-1 rounded-full hover:bg-surface-container-high/40 transition-colors cursor-pointer outline-none border-none bg-transparent"
              aria-label="User menu"
            >
              {userImage && !imageError ? (
                <img 
                  src={userImage} 
                  alt={currentUser?.name || 'User'} 
                  className="w-9 h-9 rounded-full object-cover border border-primary-fixed-dim/30 shadow-sm"
                  onError={() => {
                    setImageError(true);
                  }}
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xs font-bold font-display">
                  {userInitial}
                </div>
              )}
            </button>

            {isDropdownOpen && (
              <>
                {/* Overlay backdrop to close dropdown on click outside */}
                <div 
                  className="fixed inset-0 z-40 cursor-default bg-transparent" 
                  onClick={() => setIsDropdownOpen(false)}
                />
                
                <div 
                  className={cn(
                    "absolute mt-3 w-52 bg-surface border border-outline-variant/20 shadow-xl rounded-2xl p-2.5 z-50 animate-fade-in text-on-surface text-left",
                    locale === 'ar' ? "left-0 origin-top-left" : "right-0 origin-top-right"
                  )}
                  style={{ textAlign: locale === 'ar' ? 'right' : 'left' }}
                >
                  <div className="px-3 py-2 border-b border-outline-variant/10 mb-1.5">
                    <p className="text-xs font-bold text-on-surface truncate">
                      {currentUser?.name || 'Explorer'}
                    </p>
                    <p className="text-[10px] text-on-surface-variant truncate">
                      {currentUser?.email || ''}
                    </p>
                  </div>
                  
                  <Link 
                    href="/account"
                    onClick={() => setIsDropdownOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer",
                      locale === 'ar' ? "flex-row-reverse" : ""
                    )}
                  >
                    <span>{t('profile')}</span>
                  </Link>
                  
                  <Link 
                    href="/favorites"
                    onClick={() => setIsDropdownOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer",
                      locale === 'ar' ? "flex-row-reverse" : ""
                    )}
                  >
                    <span>{t('favorites')}</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleLogout();
                    }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-error hover:bg-error/5 rounded-xl transition-colors cursor-pointer border-none bg-transparent",
                      locale === 'ar' ? "flex-row-reverse" : ""
                    )}
                    style={{ textAlign: locale === 'ar' ? 'right' : 'left' }}
                  >
                    <span>{t('logout')}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu Controls */}
      <div className="flex md:hidden items-center gap-3">
        <ThemeToggle 
          className={cn(
            'transition-colors duration-300',
            isTransparent ? 'text-white/90 hover:text-white hover:bg-white/10' : ''
          )} 
        />
        <button
          onClick={toggleLocale}
          className={cn(
            'p-1 text-sm font-medium cursor-pointer transition-colors duration-300',
            isTransparent ? 'text-white' : 'text-on-surface-variant'
          )}
        >
          {isAr ? 'EN' : 'AR'}
        </button>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={cn(
            'p-2 cursor-pointer transition-colors duration-300 rounded-full',
            isTransparent
              ? 'text-white hover:bg-white/10'
              : 'text-on-surface-variant hover:bg-surface-container'
          )}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div
          className={cn(
            'absolute left-0 w-full transition-all duration-300 md:hidden flex flex-col p-6 gap-6',
            isFloating
              ? 'top-18 bg-surface/95 backdrop-blur-md border border-outline-variant/20 shadow-xl rounded-3xl'
              : 'top-20 bg-surface border-b border-outline-variant/20 shadow-lg'
          )}
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'text-base font-medium py-1 border-b border-outline-variant/10 transition-colors duration-200',
                    isActive ? 'text-primary font-semibold' : 'text-on-surface hover:text-primary'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="flex flex-col gap-3">
            {!isLoggedIn ? (
              <>
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                  <Button variant="ghost" fullWidth className="text-on-surface">
                    {t('login')}
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                  <Button variant="primary" pill fullWidth>
                    {t('signup')}
                  </Button>
                </Link>
              </>
            ) : (
              <div className="flex flex-col gap-4">
                <Link 
                  href="/account" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 p-3 bg-surface-container rounded-xl border border-outline-variant/10 text-left",
                    locale === 'ar' ? "flex-row-reverse text-right" : ""
                  )}
                >
                  {userImage && !imageError ? (
                    <img 
                      src={userImage} 
                      alt={currentUser?.name || 'User'} 
                      className="w-10 h-10 rounded-full object-cover border border-primary/20" 
                      onError={() => {
                        setImageError(true);
                      }}
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
                  <Button variant="secondary" fullWidth className="py-2.5 rounded-xl font-semibold">
                    {t('profile')}
                  </Button>
                </Link>
                
                <Link href="/favorites" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                  <Button variant="secondary" fullWidth className="py-2.5 rounded-xl font-semibold">
                    {t('favorites')}
                  </Button>
                </Link>
                
                <Button 
                  variant="ghost" 
                  fullWidth 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }} 
                  className="text-error hover:bg-error/5 py-2.5 rounded-xl font-semibold border-none bg-transparent"
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
