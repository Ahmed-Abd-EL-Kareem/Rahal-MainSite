'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { User, CreditCard, Sparkles } from 'lucide-react';
import { usersApi } from '@/lib/api/users';
import { cn } from '@/lib/utils/cn';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('account');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [userId, setUserId] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const tokenMatch = document.cookie.match(/(^|;\s*)token\s*=\s*([^;]*)/);
    const token = tokenMatch ? tokenMatch[2] : null;

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      const id = decoded.id || decoded._id || decoded.sub || null;
      if (!id) {
        router.push('/login');
        return;
      }
      setUserId(id);
    } catch (err) {
      router.push('/login');
    } finally {
      setIsCheckingAuth(false);
    }
  }, [pathname, router]);

  // Fetch current user using React Query
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ['currentUser', userId],
    queryFn: () => usersApi.getUser(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  if (isCheckingAuth || (userId && isUserLoading)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-32 bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mb-4"></div>
        <p className="text-on-surface-variant font-body text-sm">
          {locale === 'ar' ? 'جاري تحميل تفاصيل الحساب...' : 'Loading account details...'}
        </p>
      </div>
    );
  }

  // Sidebar items
  const menuItems = [
    {
      href: '/account',
      label: t('sidebarProfile'),
      icon: User,
      active: pathname === '/account' || pathname === `/${locale}/account`,
    },
    {
      href: '/account/subscription',
      label: t('sidebarSubscription'),
      icon: CreditCard,
      active: pathname === '/account/subscription' || pathname === `/${locale}/account/subscription`,
    },
  ];

  return (
    <main className="flex-1 max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop py-24 md:py-32 bg-background text-on-background">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Sidebar Navigation */}
        <aside className="md:col-span-3">
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-body font-medium',
                    item.active
                      ? 'bg-primary-container/10 text-primary border-l-4 border-primary scale-[0.98]'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  )}
                >
                  <Icon size={18} className={cn(item.active ? 'text-primary' : 'text-on-surface-variant')} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* AI Insight Chip */}
          <div className="mt-8 p-4 bg-secondary/5 border border-secondary/15 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Sparkles size={36} className="text-secondary" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-secondary" />
              <span className="text-secondary font-bold text-[10px] uppercase tracking-widest font-body">
                {t('insightTitle')}
              </span>
            </div>
            <p className="text-body text-secondary/80 text-xs italic leading-relaxed">
              {t('insightText')}
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="md:col-span-9">
          {children}
        </section>
      </div>
    </main>
  );
}
