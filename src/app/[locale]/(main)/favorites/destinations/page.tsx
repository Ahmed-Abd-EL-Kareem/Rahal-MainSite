
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Heart, MapPin, LogIn, Compass } from 'lucide-react';
import Button from '@/components/ui/Button';
import { destinationsApi } from '@/lib/api/destinations';

export default function FavoriteDestinationsPage() {
  const t = useTranslations('favoritesPage');
  const listT = useTranslations('destinationsListing');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const tokenMatch = document.cookie.match(/(^|;\s*)auth_token\s*=\s*([^;]*)/);
    setIsLoggedIn(!!tokenMatch);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rahal_favorites_destinations');
      if (saved) {
        try {
          setFavorites(JSON.parse(saved));
        } catch {
          setFavorites([]);
        }
      }
    }
  }, []);

  const { data: destinationsResponse, isLoading: loading } = useQuery({
    queryKey: ['destinations', 'all'],
    queryFn: () => destinationsApi.getDestinations({ limit: 200 }),
    enabled: isLoggedIn === true,
  });

  const allDestinations = destinationsResponse?.data || [];
  const favoriteDestinations = allDestinations.filter((d) => favorites.includes(d._id));

  const toggleFavorite = (destId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = favorites.includes(destId)
      ? favorites.filter((id) => id !== destId)
      : [...favorites, destId];
    setFavorites(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rahal_favorites_destinations', JSON.stringify(next));
    }
  };

  if (isLoggedIn === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background pt-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="pt-32 pb-20 bg-background min-h-screen flex items-center">
        <div className="max-w-md mx-auto px-6 text-center space-y-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto border border-primary/20 shadow-md">
            <Compass size={32} className="animate-pulse" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-on-surface">{t('loginRequiredTitle')}</h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">{t('loginRequiredSubtitle')}</p>
          </div>
          <Link href="/login" className="inline-block w-full">
            <Button variant="primary" fullWidth className="py-3 font-semibold rounded-xl flex items-center justify-center gap-2">
              <LogIn size={16} />
              <span>{t('loginBtn')}</span>
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-28 pb-20 bg-background min-h-screen">
      <section className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        {/* Page Header */}

        <div className="border-b border-outline-variant/15 pb-6 mb-10">
          <h1 className="font-display text-3xl md:text-5xl font-semibold text-on-surface">
            {isAr ? 'وجهاتي المفضلة' : 'My Saved Destinations'}
          </h1>
          <p className="text-sm text-on-surface-variant mt-2 font-medium">
            {isAr
              ? 'مجموعتك المختارة من أهم معالم مصر السياحية.'
              : 'Your handpicked collection of Egypt\'s most treasured destinations.'
            }
          </p>
        </div>

        {loading ? (
          <div className="h-96 flex items-center justify-center bg-surface-container-low border border-outline-variant/15 rounded-2xl shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : favoriteDestinations.length === 0 ? (
          <div className="py-20 text-center bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-sm max-w-2xl mx-auto space-y-6 px-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto border border-primary/20 shadow-md">
              <Heart size={32} />
            </div>
            <div className="space-y-2 max-w-sm mx-auto">
              <h3 className="font-display text-xl font-bold text-on-surface">{isAr ? 'لا توجد وجهات مفضلة' : 'No favorite destinations yet'}</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">{isAr ? 'استكشف الوجهات وأضفها إلى مفضلاتك' : 'Explore destinations and add them to your favorites.'}</p>
            </div>
            <Link href="/destinations" className="inline-block">
              <Button variant="primary" className="font-semibold py-2.5 px-6 rounded-xl">
                {isAr ? 'استكشف الوجهات' : 'Explore Destinations'}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteDestinations.map((dest) => {
              const name = dest.name?.[locale as 'en' | 'ar'] ?? dest.name?.en ?? dest.name?.ar ?? '';
              const desc = dest.description?.[locale as 'en' | 'ar'] ?? dest.description?.en ?? dest.description?.ar ?? '';
              const imageSrc = dest.coverImage ?? dest.images?.[0] ?? 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750';
              const isFav = favorites.includes(dest._id);
              const priceTier = dest.averageBudgetPerDay < 100 ? '$' : dest.averageBudgetPerDay < 250 ? '$$' : dest.averageBudgetPerDay < 500 ? '$$$' : '$$$$';

              return (
                <article
                  key={dest._id}
                  className="group bg-surface-container-lowest rounded-2xl border border-outline-variant/25 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative"
                >
                  <Link href={`/${locale}/destinations/${dest.slug}`} className="absolute inset-0 z-0" />
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden bg-surface-container group/img">
                    <img
                      src={imageSrc}
                      alt={name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750';
                      }}
                    />
                    {/* Heart - SAME AS HOTELS */}
                    <button
                      onClick={(e) => toggleFavorite(dest._id, e)}
                      className="absolute top-4 right-4 bg-primary text-white p-2 rounded-full hover:bg-primary-container transition-all shadow-md z-10 cursor-pointer"
                      aria-label="Remove from favorites"
                    >
                      <Heart size={16} className="fill-white" />
                    </button>
                  </div>
                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between relative z-0 pointer-events-none">
                    <div className="space-y-2">
                      {/* Category & price tier */}
                      <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant tracking-wider uppercase">
                        <span>{listT(dest.category as any) || dest.category}</span>
                        <span className="text-primary tracking-widest">{priceTier}</span>
                      </div>
                      {/* Title */}
                      <h3 className="font-display text-lg font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                        {name}
                      </h3>
                      {/* Location */}
                      {/* <div className="flex items-center gap-1 text-[11px] text-on-surface-variant font-semibold">
                        <MapPin size={12} className="text-primary shrink-0" />
                        <span>
                          {isAr
                            ? `${dest.city}، مصر`
                            : `${dest.city}, Egypt`}
                        </span>
                      </div> */}

                      <div className="flex items-center gap-1 text-[11px] text-on-surface-variant font-semibold">
                        <MapPin size={12} className="text-primary shrink-0" />
                        <span>
                          {isAr
                            ? `${listT(dest.city as any) || dest.city}، مصر`
                            : `${listT(dest.city as any) || dest.city}, Egypt`}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="font-body text-xs text-on-surface-variant leading-relaxed line-clamp-2 pt-1">
                        {desc}
                      </p>
                    </div>
                    {/* Bottom: price + explore */}
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-outline-variant/10 pointer-events-auto">
                      <div>
                        <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block">
                          {isAr ? 'يبدأ من' : 'Starting from'}
                        </span>
                        {/* <span className="font-display text-base font-bold text-on-surface">
                          {dest.averageBudgetPerDay?.toLocaleString() || '-'} {dest.currency || 'EGP'}
                          <span className="text-[10px] font-normal text-on-surface-variant ml-0.5">/ {isAr ? 'يوم' : 'day'}</span>
                        </span> */}
                        <span className="font-display text-base font-bold text-on-surface">
                          {dest.averageBudgetPerDay?.toLocaleString() || '-'} {isAr ? 'ج.م' : (dest.currency || 'EGP')}
                          <span className="text-[10px] font-normal text-on-surface-variant ml-0.5">/ {isAr ? 'يوم' : 'day'}</span>
                        </span>
                      </div>
                      <Link
                        href={`/${locale}/destinations/${dest.slug}`}
                        className="px-4 py-2 bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-semibold rounded-lg text-xs tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer uppercase z-10"
                      >
                        {isAr ? 'استكشف' : 'Explore'}
                      </Link>
                    </div>
                  </div>
                </article>


              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}