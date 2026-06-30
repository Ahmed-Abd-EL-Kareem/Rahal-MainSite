'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';

export default function FloatingChatButton() {
  const pathname = usePathname();
  const t = useTranslations('home.chatbot');

  const isAuthPage = [
    '/login', '/signup', '/forgot-password', '/reset-password',
  ].some((p) => pathname === p || pathname.startsWith(p + '/'));

  const isChatPage = pathname === '/chat' || pathname.startsWith('/chat/');

  if (isAuthPage || isChatPage) return null;

  return (
    <div className="fixed bottom-6 end-6 z-[100]">
      <Link
        href="/chat"
        aria-label={t('chatWithRahal')}
        className={cn(
          'group flex items-center gap-0 overflow-hidden rounded-full',
          'bg-primary text-white shadow-lg shadow-primary/25',
          'border border-primary/20',
          'transition-all duration-300 ease-out',
          'hover:shadow-xl hover:shadow-primary/35 hover:scale-[1.03]',
          'active:scale-[0.97]',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
        )}
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center">
          <Image
            src="/images/logo.png"
            alt=""
            width={32}
            height={32}
            className="object-contain drop-shadow-sm transition-transform duration-300 group-hover:rotate-12"
            aria-hidden
          />
        </span>

        <span
          className={cn(
            'max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold',
            'opacity-0 transition-all duration-300 ease-out',
            'group-hover:max-w-[200px] group-hover:opacity-100',
            'group-hover:pe-5'
          )}
        >
          {t('chatWithRahal')}
        </span>
      </Link>
    </div>
  );
}
