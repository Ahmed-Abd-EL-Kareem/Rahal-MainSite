'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Heart, Star, MapPin, AlertCircle, Compass, LogIn } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { hotelsApi } from '@/lib/api/hotels';
import { Hotel } from '@/types/hotel';

export default function FavoritesPage() {
  const t = useTranslations('favoritesPage');
  const listT = useTranslations('hotelListing');
  const locale = useLocale();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Check login and fetch favorites from localStorage
  useEffect(() => {
    const tokenMatch = document.cookie.match(/(^|;\s*)token\s*=\s*([^;]*)/);
    setIsLoggedIn(!!tokenMatch);

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rahal_favorites');
      if (saved) {
        try {
          setFavorites(JSON.parse(saved));
        } catch (e) {
          setFavorites([]);
        }
      }
    }
  }, []);

  // Fetch all hotels
  const { data: hotelsResponse, isLoading: loading } = useQuery({
    queryKey: ['hotels', 'all'],
    queryFn: () => hotelsApi.getHotels({ limit: 100 }), // fetch all to filter locally
    enabled: isLoggedIn === true,
  });

  const allHotels = hotelsResponse?.data || [];
  const favoriteHotels = allHotels.filter(hotel => favorites.includes(hotel._id));

  const toggleFavorite = (hotelId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = favorites.filter(id => id !== hotelId);
    setFavorites(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rahal_favorites', JSON.stringify(next));
    }
  };

  if (isLoggedIn === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background pt-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Not logged in empty state
  if (!isLoggedIn) {
    return (
      <main className="pt-32 pb-20 bg-background min-h-screen flex items-center">
        <div className="max-w-md mx-auto px-6 text-center space-y-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto border border-primary/20 shadow-md">
            <Compass size={32} className="animate-pulse" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-on-surface">
              {t('loginRequiredTitle')}
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {t('loginRequiredSubtitle')}
            </p>
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
            {t('title')}
          </h1>
          <p className="text-sm text-on-surface-variant mt-2 font-medium">
            {t('subtitle')}
          </p>
        </div>

        {loading ? (
          <div className="h-96 flex items-center justify-center bg-surface-container-low border border-outline-variant/15 rounded-2xl shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : favoriteHotels.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-sm max-w-2xl mx-auto space-y-6 px-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto border border-primary/20 shadow-md">
              <Heart size={32} />
            </div>
            <div className="space-y-2 max-w-sm mx-auto">
              <h3 className="font-display text-xl font-bold text-on-surface">{t('emptyTitle')}</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {t('emptySubtitle')}
              </p>
            </div>
            <Link href="/hotels" className="inline-block">
              <Button variant="primary" className="font-semibold py-2.5 px-6 rounded-xl">
                {t('exploreBtn')}
              </Button>
            </Link>
          </div>
        ) : (
          /* Favorites Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteHotels.map((hotel) => {
              const hotelName = hotel.name[locale as 'en' | 'ar'] || hotel.name.en;
              return (
                <Card key={hotel._id} className="group bg-surface-container-lowest rounded-xl border border-outline-variant/25 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  {/* Image Cover */}
                  <div className="relative h-64 overflow-hidden bg-surface-container group/img">
                    <Link href={`/hotels/${hotel.slug}`} className="absolute inset-0 block">
                      <img 
                        src={hotel.coverImage || hotel.images[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"}
                        alt={hotelName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105 absolute inset-0"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                    </Link>
                    
                    {hotel.stars === 5 && (
                      <div className="absolute top-4 left-4 bg-primary text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-md pointer-events-none">
                        {listT('rahalChoice')}
                      </div>
                    )}

                    <button 
                      onClick={(e) => toggleFavorite(hotel._id, e)}
                      className="absolute top-4 right-4 bg-primary text-white p-2 rounded-full hover:bg-primary-container transition-all shadow-md z-10 cursor-pointer"
                      aria-label="Remove from favorites"
                    >
                      <Heart size={16} className="fill-white" />
                    </button>
                  </div>

                  {/* Card Content Info */}
                  <div className="p-5 flex flex-col flex-1 space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <Link href={`/hotels/${hotel.slug}`}>
                          <h4 className="font-display text-lg font-semibold text-on-surface hover:text-primary transition-colors line-clamp-1">
                            {hotelName}
                          </h4>
                        </Link>
                        <div className="flex items-center gap-1 text-on-surface-variant text-xs font-semibold mt-1">
                          <MapPin size={12} className="text-primary" />
                          <span>{hotel.city}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-primary">
                        <Star size={14} className="fill-primary" />
                        <span className="font-bold text-xs">{hotel.stars.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Amenities tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-surface-container text-[10px] font-bold text-on-surface-variant rounded-md">
                          {amenity}
                        </span>
                      ))}
                    </div>

                    {/* Starting price & book link */}
                    <div className="pt-3 flex justify-between items-center border-t border-outline-variant/20 mt-auto">
                      <div>
                        <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block">
                          {listT('startingAt')}
                        </span>
                        <span className="font-bold text-lg text-on-surface">
                          {hotel.averagePricePerNight.toLocaleString()} {hotel.currency || 'EGP'}
                          <span className="text-[10px] font-normal text-on-surface-variant ml-0.5">
                            {listT('perNight')}
                          </span>
                        </span>
                      </div>
                      <Link href={`/hotels/${hotel.slug}`}>
                        <Button 
                          variant="ghost"
                          className="px-4 py-2 border border-primary text-primary hover:bg-primary/5 rounded-lg text-xs font-bold active:scale-95 transition-all"
                        >
                          {listT('bookNow')}
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
