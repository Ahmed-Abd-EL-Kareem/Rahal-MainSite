'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Heart, MapPin, Compass, LogIn } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { destinationsApi } from '@/lib/api/destinations';
import { Destination } from '@/types/destination';

export default function FavoriteDestinationsPage() {
  const t = useTranslations('favoritesPage'); // reuse existing translations if present
  const listT = useTranslations('destinationListing');
  const locale = useLocale();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Determine login status and load saved favorite destination IDs
  useEffect(() => {
    const tokenMatch = document.cookie.match(/(^|;\s*)token\s*=\s*([^;]*)/);
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

  // Fetch a broad list of destinations (client‑side filter for favorites)
  const { data: destinationsResponse, isLoading: loading } = useQuery({
    queryKey: ['destinations', 'all'],
    queryFn: () => destinationsApi.getDestinations({ limit: 200 }), // sufficient for local filter
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

  // Not logged‑in empty state – identical to hotel favorites
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
            {t('favoriteDestinationsTitle') || 'Favorite Destinations'}
          </h1>
          <p className="text-sm text-on-surface-variant mt-2 font-medium">
            {t('favoriteDestinationsSubtitle') || 'Your saved destinations'}
          </p>
        </div>

        {loading ? (
          <div className="h-96 flex items-center justify-center bg-surface-container-low border border-outline-variant/15 rounded-2xl shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : favoriteDestinations.length === 0 ? (
          // Empty state – mirrors hotel favorites empty UI
          <div className="py-20 text-center bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-sm max-w-2xl mx-auto space-y-6 px-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto border border-primary/20 shadow-md">
              <Heart size={32} />
            </div>
            <div className="space-y-2 max-w-sm mx-auto">
              <h3 className="font-display text-xl font-bold text-on-surface">{t('emptyTitle') || 'No favorite destinations yet'}</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">{t('emptySubtitle') || 'Explore destinations and add them to your favorites.'}</p>
            </div>
            <Link href="/destinations" className="inline-block">
              <Button variant="primary" className="font-semibold py-2.5 px-6 rounded-xl">
                {t('exploreBtn') || 'Explore Destinations'}
              </Button>
            </Link>
          </div>
        ) : (
          // Favorites grid – identical visual layout to hotel favorites
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteDestinations.map((dest) => {
              const name = dest.name[locale as 'en' | 'ar'] || dest.name.en;
              const imageSrc = dest.coverImage || dest.images?.[0] || 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750';
              const isFav = favorites.includes(dest._id);
              return (
                <Card key={dest._id} className="group bg-surface-container-lowest rounded-xl border border-outline-variant/25 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  {/* Image Cover */}
                  <div className="relative h-64 overflow-hidden bg-surface-container group/img">
                    <Link href={`/destinations/${dest.slug}`} className="absolute inset-0 block">
                      <img
                        src={imageSrc}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105 absolute inset-0"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750';
                        }}
                      />
                    </Link>
                    <button
                      onClick={(e) => toggleFavorite(dest._id, e)}
                      className="absolute top-4 right-4 bg-primary text-white p-2 rounded-full hover:bg-primary-container transition-all shadow-md z-10 cursor-pointer"
                      aria-label="Toggle favorite"
                    >
                      <Heart size={16} className="fill-white" />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex flex-col flex-1 space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <Link href={`/destinations/${dest.slug}`}>
                          <h4 className="font-display text-lg font-semibold text-on-surface hover:text-primary transition-colors line-clamp-1">
                            {name}
                          </h4>
                        </Link>
                        <div className="flex items-center gap-1 text-on-surface-variant text-xs font-semibold mt-1">
                          <MapPin size={12} className="text-primary" />
                          <span>{dest.city}</span>
                        </div>
                      </div>
                      {/* Rating placeholder */}
                      <div className="flex items-center gap-0.5 text-primary" />
                    </div>
                    {/* Bottom – price and explore button */}
                    <div className="pt-3 flex justify-between items-center border-t border-outline-variant/20 mt-auto">
                      <div>
                        <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block">
                          {listT('startingAt')}
                        </span>
                        <span className="font-bold text-lg text-on-surface">
                          {dest.averageBudgetPerDay?.toLocaleString() || '-'} {dest.currency || 'EGP'}
                          <span className="text-[10px] font-normal text-on-surface-variant ml-0.5">{listT('perDay')}</span>
                        </span>
                      </div>
                      <Link href={`/destinations/${dest.slug}`}>
                        <Button variant="ghost" className="px-4 py-2 border border-primary text-primary hover:bg-primary/5 rounded-lg text-xs font-bold active:scale-95 transition-all">
                          {listT('exploreBtn') || 'Explore'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
