/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  Sparkles, Filter, Grid, Map as MapIcon, ChevronLeft, ChevronRight, 
  Star, MapPin, Sliders, Calendar, DollarSign, Heart, AlertCircle, Compass,
  Loader2, MessageSquare, X, ArrowLeft, Send, Mic, Trash2, Copy, 
  History, Clock, Users, Building2, Waves, Mountain, Sun, Moon
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { aiApi } from '@/lib/api/ai';
import { Hotel } from '@/types/hotel';
import HotelCard from '@/components/hotel/HotelCard';
import { useAuth } from '@/components/providers/AuthProvider';

const HotelsMap = dynamic(() => import('@/components/hotel/HotelsMap'), { ssr: false });

const STORAGE_KEY = 'rahal_ai_search_results';

export default function AIHotelSearchPage() {
  const t = useTranslations('aiHotelSearch');
  const commonT = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isAuthenticated, authLoading, router, locale]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // State
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchedHotels, setMatchedHotels] = useState<Hotel[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);
  const [isMapView, setIsMapView] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Persist results across locale changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${locale}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setMatchedHotels(parsed.hotels || []);
          setQuery(parsed.query || '');
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, [locale]);

  // Save results to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined' && matchedHotels.length > 0) {
      localStorage.setItem(`${STORAGE_KEY}_${locale}`, JSON.stringify({
        hotels: matchedHotels,
        query,
        timestamp: Date.now(),
      }));
    }
  }, [locale, matchedHotels, query]);

  // Load favorites from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rahal_favorites');
      if (saved) {
        try {
          setFavorites(JSON.parse(saved));
        } catch {
          setFavorites([]);
        }
      }
    }
  }, []);

  const toggleFavorite = (hotelId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = favorites.includes(hotelId)
      ? favorites.filter(id => id !== hotelId)
      : [...favorites, hotelId];
    setFavorites(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rahal_favorites', JSON.stringify(next));
    }
  };

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (payload: { query: string }) => {
      return await aiApi.hotelSearch({ query: payload.query, context: {} });
    },
    onSuccess: (response: { data: { reply: string; hotels: Hotel[]; tokensUsed: number } }) => {
      const replyText = response.data.reply || '';
      const hotelsFromAI = response.data.hotels || [];
      
      setMatchedHotels(hotelsFromAI);
      setError(null);
    },
    onError: (err: Error) => {
      console.error('AI Search error:', err);
      setError(err.message || 'Failed to search. Please try again.');
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    searchMutation.mutate({ query });
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setActiveSuggestion(suggestion);
    setTimeout(() => {
      handleSearch(new Event('submit') as unknown as React.FormEvent);
    }, 100);
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setError(null);
    setMatchedHotels([]);
    setActiveSuggestion(null);
    setIsMapView(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${STORAGE_KEY}_${locale}`);
    }
  };

  // Example suggestions
  const suggestions = [
    t('suggestion1'),
    t('suggestion2'),
    t('suggestion3'),
    t('suggestion4'),
  ];

  return (
    <main className="pt-28 pb-20 bg-background min-h-screen">
      {/* Hero Section - Compact Banner like Hotels page */}
      <section className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop mb-8">
        <div className="relative rounded-xl bg-surface-container-low border border-outline-variant/20 overflow-hidden p-4 md:p-6 shadow-md">
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
            {/* Back Link */}
            <div className="flex justify-start">
              <Link
                href={`/${locale}/hotels`}
                className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium text-sm"
              >
                <ArrowLeft size={18} />
                <span>{t("backToHotels")}</span>
              </Link>
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold border border-primary/20">
                <Sparkles size={14} className="animate-pulse" />
                <span>{t("aiPowered")}</span>
              </div>

              <h1 className="font-display text-xl md:text-2xl font-semibold text-on-surface leading-tight">
                {locale === "ar" ? (
                  <>
                    اكتشف ملاذك المثالي مع{" "}
                    <span className="text-primary italic">رحّال AI</span>
                  </>
                ) : (
                  <>
                    Discover Your Perfect Sanctuary with{" "}
                    <span className="text-primary italic">Rahal AI</span>
                  </>
                )}
              </h1>

              <p className="text-sm md:text-base text-on-surface-variant max-w-xl mx-auto">
                {t("heroDescription")}
              </p>
            </div>

            {/* Search Form */}
            <form
              onSubmit={handleSearch}
              className="relative group max-w-3xl mx-auto w-full"
            >
              <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 via-secondary/15 to-primary/30 rounded-[1.5rem] blur opacity-60 group-hover:opacity-100 transition duration-500"></div>

              <div className="relative flex items-center bg-white dark:bg-surface-container-lowest rounded-[1.5rem] shadow-xl p-2 border border-outline-variant/20">
                <div className="flex items-center gap-2 ms-4">
                  <Sparkles size={24} className="text-primary animate-pulse" />
                </div>

                <div className="flex-1 flex items-center gap-3">
                  <Input
                    type="text"
                    placeholder={t("searchPlaceholder")}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={isLoading}
                    className="bg-transparent border-none focus:ring-0 outline-none text-lg font-body text-on-surface placeholder:text-outline w-full py-4"
                    autoFocus
                  />

                  {query && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="text-on-surface-variant hover:text-primary transition-colors p-1"
                      aria-label="Clear search"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="px-8 py-4 rounded-xl flex items-center gap-2 font-semibold shadow-lg shrink-0 text-lg"
                  disabled={isLoading || !query.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>{t("searching")}</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      <span className="hidden sm:inline">{t("searchBtn")}</span>
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Suggestions */}
            <div className="flex flex-wrap justify-center gap-2 mt-6 animate-fade-in">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                    activeSuggestion === suggestion
                      ? "bg-primary text-white border-primary shadow-md"
                      : "bg-white dark:bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  <Sparkles size={14} className="inline-block mx-1" />
                  {suggestion}
                </button>
              ))}
            </div>

            {/* AI Error */}
            {error && (
              <div className="animate-fade-in pt-2">
                <div className="bg-error/10 border border-error/20 text-error rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle size={20} />
                  <span className="text-sm">{error}</span>
                  <button
                    onClick={handleClear}
                    className="ms-auto text-sm underline hover:text-error/80"
                  >
                    {t("dismiss")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results Section - Always visible */}
      <section className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        {/* Results Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/15">
            <div>
              <h2 className="font-display text-lg font-bold text-on-surface uppercase tracking-wider">
                {t("resultsTitle")}
              </h2>
              <p className="text-xs text-on-surface-variant font-medium">
                {t("showingResults", { count: matchedHotels.length })}
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-surface-container rounded-xl p-1 border border-outline-variant/20 shadow-inner">
              <button
                onClick={() => setIsMapView(false)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  !isMapView
                    ? "bg-white text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                <Grid size={14} />
                <span>{t("gridView")}</span>
              </button>
              <button
                onClick={() => setIsMapView(true)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  isMapView
                    ? "bg-white text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                <MapIcon size={14} />
                <span>{t("mapView")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Map View */}
        {isMapView && matchedHotels.length > 0 && (
          <div className="mb-12 h-[600px] bg-surface-container rounded-2xl border border-outline-variant/20 overflow-hidden relative shadow-sm">
            <HotelsMap hotels={matchedHotels} locale={locale} />
          </div>
        )}

        {/* Grid View */}
        {!isMapView && (
          <>
            {/* Loading */}
            {matchedHotels.length === 0 && !isLoading ? (
              /* Empty State - No Search Performed Yet */
              <div className="py-24 text-center bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-sm">
                <Sparkles className="mx-auto text-outline" size={48} />
                <h3 className="font-display text-xl font-semibold mt-4 text-on-surface">
                  {t("noExactMatches") || "No Results Yet"}
                </h3>
                <p className="text-sm text-on-surface-variant max-w-sm mx-auto mt-2">
                  {t("noExactMatchesDesc") ||
                    "Search for hotels using natural language to find your perfect match."}
                </p>
              </div>
            ) : isLoading ? (
              <div className="h-96 flex items-center justify-center bg-surface-container-low border border-outline-variant/15 rounded-2xl shadow-sm">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
               
                {matchedHotels.map((hotel) => {
                  const isFavorite = favorites.includes(hotel._id);

                  return (
                    <HotelCard
                      key={hotel._id}
                      hotel={hotel}
                      locale={locale}
                      showAmenities={true}
                      showMatchScore={false}
                      onToggleFavorite={toggleFavorite}
                      isFavorite={isFavorite}
                    />
                  );
                })}
              </div>
            )}

            {/* Empty State After Search - No Results */}
            {matchedHotels.length === 0 && !isLoading && query && (
              <div className="py-24 text-center bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-sm">
                <AlertCircle className="mx-auto text-outline" size={48} />
                <h3 className="font-display text-xl font-semibold mt-4 text-on-surface">
                  {t("noExactMatches")}
                </h3>
                <p className="text-sm text-on-surface-variant max-w-sm mx-auto mt-2">
                  {t("noExactMatchesDesc")}
                </p>
                <Button
                  variant="primary"
                  className="mt-4"
                  onClick={handleClear}
                >
                  <Sparkles size={16} className="me-2" />
                  {t("tryNewSearch")}
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* CTA Section */}
      {/* <section className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop mt-16">
        <div className="bg-gradient-to-r from-primary via-primary/80 to-secondary rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
              {t('ctaTitle')}
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
              {t('ctaDescription')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href={`/${locale}/hotels`}>
                <Button variant="secondary" className="px-8 py-3">
                  {t('browseAllHotels')}
                </Button>
              </Link>
              <Link href={`/${locale}/planner`}>
                <Button variant="ghost" className="px-8 py-3 border-white text-white hover:bg-white/10">
                  {t('planTrip')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section> */}
    </main>
  );
}