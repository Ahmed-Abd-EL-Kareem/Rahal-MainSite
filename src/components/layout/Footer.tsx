'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Mail } from 'lucide-react';
import Text from '../ui/Text';

const FacebookIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function Footer() {
  const pathname = usePathname();
  const t = useTranslations('common.footer');
  const navT = useTranslations('common.nav');
  const locale = useLocale();

  const isAuthPage = [
    '/login', '/signup', '/forgot-password', '/reset-password', '/verify-otp',
    '/en/login', '/en/signup', '/en/forgot-password', '/en/reset-password', '/en/verify-otp',
    '/ar/login', '/ar/signup', '/ar/forgot-password', '/ar/reset-password', '/ar/verify-otp'
  ].some(p => pathname === p || pathname.startsWith(p + '/'));

  if (isAuthPage) return null;

  const quickLinks = [
    { href: '/destinations', label: navT('destinations') },
    { href: '/hotels', label: navT('hotels') },
    { href: '/planner', label: navT('planner') },
    { href: '/pricing', label: navT('pricing') },
  ];

  const supportLinks = [
    { href: '/about', label: navT('about') },
    { href: '/privacy', label: t('privacy') },
    { href: '/terms', label: t('terms') },
  ];

  return (
    <footer className="bg-surface-container border-t border-outline-variant/20 py-16 px-margin-mobile md:px-margin-desktop w-full">
      <div className="max-w-container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-gutter">
        {/* Brand Information */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="Rahal Logo"
              width={35}
              height={35}
              className="object-contain dark:hidden"
            />
            <Image
              src="/images/logo-2.png"
              alt="Rahal Logo"
              width={35}
              height={35}
              className="object-contain hidden dark:block"
            />
            <span className="font-display font-bold text-lg md:text-xl text-on-surface">
              {locale === 'ar' ? 'رحّال' : 'Rahal'}
            </span>
          </div>
          <Text variant="body-md" className="max-w-xs">
            {t('tagline')}
          </Text>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-4">
          <span className="font-display font-semibold text-base text-on-surface uppercase tracking-wider">
            {t('quickLinks')}
          </span>
          <nav className="flex flex-col gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Support & Social Links */}
        <div className="flex flex-col gap-4">
          <span className="font-display font-semibold text-base text-on-surface uppercase tracking-wider">
            {t('support')}
          </span>
          <nav className="flex flex-col gap-3">
            {supportLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex gap-4 mt-4">
            <a href="#" className="p-2 bg-surface-container-high rounded-full text-on-surface hover:text-primary transition-all duration-200" aria-label="Facebook">
              <FacebookIcon />
            </a>
            <a href="#" className="p-2 bg-surface-container-high rounded-full text-on-surface hover:text-primary transition-all duration-200" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href="#" className="p-2 bg-surface-container-high rounded-full text-on-surface hover:text-primary transition-all duration-200" aria-label="Twitter">
              <TwitterIcon />
            </a>
            <a href="#" className="p-2 bg-surface-container-high rounded-full text-on-surface hover:text-primary transition-all duration-200" aria-label="Email">
              <Mail size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-container mx-auto mt-12 pt-8 border-t border-outline-variant/10 text-center">
        <Text variant="body-md" className="text-xs text-on-surface-variant/75">
          {t('copyright')}
        </Text>
      </div>
    </footer>
  );
}
