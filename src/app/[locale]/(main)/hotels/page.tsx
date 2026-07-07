'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {  
  Search, Filter, Grid, Map as MapIcon, ChevronLeft, ChevronRight, 
  Sliders, DollarSign, AlertCircle,
  Loader2, MessageSquare, X, Sparkles, Calendar
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { hotelsApi } from '@/lib/api/hotels';
import { Hotel } from '@/types/hotel';
import HotelCard from '@/components/hotel/HotelCard';
import { getLocaleQueryKey } from '@/lib/hooks/useLocaleQuery';

const HotelsMap = dynamic(() => import('@/components/hotel/HotelsMap'), { ssr: false });

interface AIHotelMatch {
  name: string;
  confidence: number;
  reason: string;
}

export default function HotelsPage() {
  const t = useTranslations('hotelListing');
  const detailT = useTranslations('hotelDetail');
  const locale = useLocale();
  const router = useRouter();

  // Filter States
  const [searchCity, setSearchCity] = useState('');
  const [maxPrice, setMaxPrice] = useState(50000);
  const [selectedStars, setSelectedStars] = useState<number | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState('-stars');
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
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

  // View States
  const [isMapView, setIsMapView] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const metadata = {
    cities: ['Cairo', 'Luxor', 'Aswan', 'Hurghada', 'Sharm El Sheikh', 'Alexandria'],
    amenities: ['Pool', 'Free WiFi', 'Spa', 'Nile View', 'Beach Access', 'Gym']
  };

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleToggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  // Build reactive API parameters based on active states
  const queryParams = {
    page,
    limit: 9,
    sort: sortOption,
    ...(searchCity && { city: searchCity }),
    ...(debouncedSearch.length >= 3 && { search: debouncedSearch }),
    ...(selectedStars && { stars: selectedStars }),
    ...(maxPrice && { maxPrice }),
  };

  // Fetch hotels using TanStack Query
  const { 
    data: hotelsQueryResponse, 
    isLoading: loading,
    error: hotelsQueryError
  } = useQuery({
    queryKey: getLocaleQueryKey(['hotels', queryParams], locale),
    queryFn: () => hotelsApi.getHotels(queryParams),
    placeholderData: (previousData) => previousData,
  });

  const rawHotels = hotelsQueryResponse?.data || [];
  const hotels = selectedAmenities.length > 0 
    ? rawHotels.filter(hotel => 
        selectedAmenities.every(amenity => 
          hotel.amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase()))
        )
      )
    : rawHotels;

  const totalCount = hotelsQueryResponse?.pagination?.total || rawHotels.length;
  const totalPages = hotelsQueryResponse?.pagination?.totalPages || 1;

return (
  <main className="pt-28 pb-20 bg-background min-h-screen">
    {/* Hero Section - Compact Banner */}
    <section className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop mb-8">
      <div className="relative rounded-xl bg-surface-container-low border border-outline-variant/20 overflow-hidden p-4 md:p-6 shadow-md">
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
          <h1 className="font-display text-xl md:text-2xl font-semibold text-on-surface leading-tight">
            {locale === "ar" ? (
              <>
                ابحث عن ملاذك في{" "}
                <span className="text-primary italic">رمال مصر الأبدية</span>
              </>
            ) : (
              <>
                Find Your Sanctuary in the{" "}
                <span className="text-primary italic">Everlasting Sands</span>
              </>
            )}
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant max-w-xl mx-auto">
            {locale === "ar"
              ? "اكتشف أفضل الفنادق في مصر مع فلاتر دقيقة أو دع الذكاء الاصطناعي يرشدك"
              : "Discover the best hotels in Egypt with precise filters or let AI guide you"}
          </p>
          <div className="mt-4 flex justify-center">
            <Link href={`/${locale}/booking/conversation`}>
              <Button
                variant="primary"
                className="gap-2.5 px-7 py-3.5 rounded-xl text-base font-semibold shadow-md hover:shadow-[0_0_24px_var(--color-brand-glow),0_8px_24px_var(--color-accent-glow)] transition-all active:scale-95"
              >
                <Calendar size={18} />
                <span>{t("bookWithAi")}</span>
                <Sparkles size={12} className="text-accent animate-pulse" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* Main Listing Section */}
    <section className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
      <div className="flex flex-col lg:flex-row gap-gutter items-start">
        {/* Left Sidebar: Filters */}
        <aside className="w-full lg:w-80 2xl:w-96 shrink-0 lg:sticky lg:top-24 z-30">
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/20 shadow-sm space-y-6">
            <div className="space-y-1">
              <h3 className="font-display text-xl font-semibold text-on-surface flex items-center gap-2">
                <Filter size={18} className="text-primary" />
                <span>{t("sidebarTitle")}</span>
              </h3>
              <p className="text-xs text-on-surface-variant font-medium">
                {t("sidebarSubtitle")}
              </p>
            </div>

            <form onSubmit={handleApplyFilters} className="space-y-6">
              {/* AI Search Button - Navigate to AI Search Page */}
              <Link href={`/${locale}/hotels/ai-search`}>
                <Button
                  variant="secondary"
                  fullWidth
                  className="gap-2 py-3 font-semibold mb-4"
                >
                  <Sparkles size={18} />
                  <span>{t("aiSearchNav")}</span>
                </Button>
              </Link>

              {/* Search Input - First Filter */}
              <div className="space-y-2">
                <label
                  className="text-xs font-bold uppercase tracking-wider text-outline block"
                  htmlFor="searchHotels"
                >
                  {t("searchLabel")}
                </label>
                <input
                  id="searchHotels"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="w-full px-3 py-3 bg-white dark:bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all text-sm font-medium text-on-surface placeholder:text-outline"
                />
              </div>

              {/* Location Select */}
              <div className="space-y-2">
                <label
                  className="text-xs font-bold uppercase tracking-wider text-outline block"
                  htmlFor="city"
                >
                  {t("locationLabel")}
                </label>
                <select
                  id="city"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full px-3 py-3 bg-white dark:bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all text-sm font-medium text-on-surface cursor-pointer"
                >
                  <option value="">{t("locationPlaceholder")}</option>
                  {metadata.cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              {/* Nightly Rate Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-outline">
                    {t("priceLabel")}
                  </label>
                  <span className="text-xs font-bold text-primary">
                    {maxPrice.toLocaleString()} EGP
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Stars Chip Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-outline block">
                  {t("ratingLabel")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {[5, 4, 3].map((stars) => (
                    <button
                      key={stars}
                      type="button"
                      onClick={() =>
                        setSelectedStars(selectedStars === stars ? null : stars)
                      }
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        selectedStars === stars
                          ? "bg-primary/10 dark:bg-primary/10 border-primary dark:border-primary text-primary dark:text-primary"
                          : "bg-white dark:bg-surface-container-lowest border-outline-variant/60 hover:border-primary text-on-surface-variant dark:text-on-surface-variant"
                      }`}
                    >
                      {stars}★
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities checklist */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-outline block">
                  {t("amenitiesLabel")}
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {metadata.amenities.map((amenity) => (
                    <label
                      key={amenity}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(amenity)}
                        onChange={() => handleToggleAmenity(amenity)}
                        className="w-4 h-4 rounded border-outline-variant/60 text-primary focus:ring-primary cursor-pointer"
                      />
                      <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface">
                        {amenity}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                className="py-3 font-semibold shadow-md active:scale-95 transition-transform"
              >
                {t("applyFilters")}
              </Button>
            </form>
          </div>
        </aside>

        {/* Right Content Section: Grid & Map */}
        <div className="flex-1 w-full space-y-6">
          {/* View Controls & Results Count */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/15">
            <div>
              <h2 className="font-display text-lg font-bold text-on-surface uppercase tracking-wider">
                {t("resultsTitle")}
              </h2>
              <p className="text-xs text-on-surface-variant font-medium">
                {t("showingResults", { count: totalCount })}
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

          {/* Loading Spinner */}
          {loading ? (
            <div className="h-96 flex items-center justify-center bg-surface-container-low border border-outline-variant/15 rounded-2xl shadow-sm">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isMapView ? (
            <div className="h-[600px] bg-surface-container rounded-2xl border border-outline-variant/20 overflow-hidden relative shadow-sm">
              <HotelsMap hotels={hotels} locale={locale} />
            </div>
          ) : hotels.length === 0 ? (
            /* Empty state */
            <div className="py-24 text-center bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-sm">
              <AlertCircle className="mx-auto text-outline" size={48} />
              <h3 className="font-display text-xl font-semibold mt-4 text-on-surface">
                No Sanctuaries Found
              </h3>
              <p className="text-sm text-on-surface-variant max-w-sm mx-auto mt-2">
                Try adjusting your filters or describe your request using a
                different prompt to find available stays.
              </p>
            </div>
          ) : (
            /* Grid Layout */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
              {hotels.map((hotel) => (
                <HotelCard
                  key={hotel._id}
                  hotel={hotel}
                  locale={locale}
                  showAmenities={true}
                  onToggleFavorite={toggleFavorite}
                  isFavorite={favorites.includes(hotel._id)}
                />
              ))}
            </div>
          )}

          {/* Pagination controls */}
          {!loading && totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-3 pt-6 border-t border-outline-variant/15">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant/50 text-outline hover:border-primary hover:text-primary transition-all disabled:opacity-40 disabled:hover:border-outline-variant/50 disabled:hover:text-outline"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${
                    page === p
                      ? "bg-primary text-white"
                      : "border border-outline-variant/50 text-on-surface-variant hover:border-primary hover:text-primary"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={page === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant/50 text-outline hover:border-primary hover:text-primary transition-all disabled:opacity-40 disabled:hover:border-outline-variant/50 disabled:hover:text-outline"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  </main>
);
}