'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, Sparkles, Filter, Grid, Map as MapIcon, ChevronLeft, ChevronRight, 
  Star, MapPin, Sliders, Calendar, DollarSign, Heart, AlertCircle, Compass
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { hotelsApi } from '@/lib/api/hotels';
import { Hotel } from '@/types/hotel';

const HotelsMap = dynamic(() => import('@/components/hotel/HotelsMap'), { ssr: false });

export default function HotelsPage() {
  const t = useTranslations('hotelListing');
  const detailT = useTranslations('hotelDetail');
  const locale = useLocale();

  // Filter States
  const [searchCity, setSearchCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
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

  // AI Prompt State
  const [aiQuery, setAiQuery] = useState('');
  const [isAiMode, setIsAiMode] = useState(false);
  const [activeAiQuery, setActiveAiQuery] = useState('');

  // View States
  const [isMapView, setIsMapView] = useState(false);
  const [page, setPage] = useState(1);

  const metadata = {
    cities: ['Cairo', 'Luxor', 'Aswan', 'Hurghada', 'Sharm El Sheikh', 'Alexandria'],
    amenities: ['Pool', 'Free WiFi', 'Spa', 'Nile View', 'Beach Access', 'Gym']
  };

  // Build reactive API parameters based on active states
  const queryParams = {
    page,
    limit: 9,
    sort: sortOption,
    ...(isAiMode && activeAiQuery ? { search: activeAiQuery } : {
      ...(searchCity && { city: searchCity }),
      ...(selectedStars && { stars: selectedStars }),
      ...(maxPrice && { maxPrice }),
    })
  };

  // Fetch hotels using TanStack Query
  const { 
    data: hotelsQueryResponse, 
    isLoading: loading,
    error: hotelsQueryError
  } = useQuery({
    queryKey: ['hotels', queryParams],
    queryFn: () => hotelsApi.getHotels(queryParams),
    placeholderData: (previousData) => previousData, // smooth transitions without loading flashes
  });

  // Extract query data and apply client-side amenity filters if selected
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

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAiMode(false);
    setPage(1);
    // Setting page and filters automatically invalidates query cache and refetches
  };

  const handleAiSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setIsAiMode(true);
    setActiveAiQuery(aiQuery);
    setPage(1);
    // Setting query states automatically invalidates query cache and refetches
  };

  const handleToggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  // AI calculation helpers
  const calculateCompatibility = (hotel: Hotel, query: string) => {
    let score = 80;
    const q = query.toLowerCase();
    const name = (hotel.name.en + ' ' + (hotel.name.ar || '')).toLowerCase();
    const city = hotel.city.toLowerCase();
    const amenitiesStr = hotel.amenities.join(' ').toLowerCase();

    if (q.includes(city) || city.includes(q)) score += 5;
    if (q.includes('nile') && (name.includes('nile') || amenitiesStr.includes('nile'))) score += 7;
    if (q.includes('pyramid') && (name.includes('pyramid') || amenitiesStr.includes('pyramid') || name.includes('giza'))) score += 8;
    if (q.includes('pool') && amenitiesStr.includes('pool')) score += 4;
    if (q.includes('spa') && amenitiesStr.includes('spa')) score += 5;
    if (q.includes('view') && (name.includes('view') || amenitiesStr.includes('view'))) score += 3;
    if (q.includes('luxury') && hotel.stars === 5) score += 5;

    return Math.min(score, 99);
  };

  const generateAIInsight = (hotel: Hotel, query: string) => {
    const q = query.toLowerCase();
    const city = hotel.city;

    if (locale === 'ar') {
      if (q.includes('نيل') || q.includes('بحر') || q.includes('نهر')) {
        return `يتطابق تماماً مع رغبتك في الاستمتاع بإطلالة نيلية خلابة في ${city}. يشمل جلسات هادئة وخدمات ممتازة.`;
      }
      if (q.includes('هرم') || q.includes('أهرامات') || q.includes('جيزة')) {
        return `يوفر إطلالات مباشرة ومثيرة على الأهرامات كخيار أول، مثالي لاهتماماتك التراثية والتاريخية.`;
      }
      return `خيار رائع في ${city} يوفر لك ملاذاً من الفخامة والخصوصية وخدمة الكونسيرج الذكي على مدار الساعة.`;
    } else {
      if (q.includes('nile') || q.includes('sea') || q.includes('water')) {
        return `Matches your request for waterfront views in ${city} perfectly. Includes relaxing decks and premium service.`;
      }
      if (q.includes('pyramid') || q.includes('giza')) {
        return `Provides stunning, unobstructed view of the Giza Pyramids. Highly recommended for historical exploration.`;
      }
      return `A prestigious sanctuary in ${city} matching your comfort preferences with exceptional concierge rating.`;
    }
  };

  return (
    <main className="pt-28 pb-20 bg-background min-h-screen">
      {/* Top Banner: AI Conversational Search */}
      <section className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop mb-12">
        <div className="relative rounded-2xl bg-surface-container-low border border-outline-variant/30 overflow-hidden p-8 md:p-12 shadow-lg">
          {/* Decorative Blur Backgrounds */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-secondary/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <h1 className="font-display text-3xl md:text-5xl font-semibold text-on-surface leading-tight">
              {locale === 'ar' ? (
                <>ابحث عن ملاذك في <span className="text-primary italic">رمال مصر الأبدية</span></>
              ) : (
                <>Find Your Sanctuary in the <span className="text-primary italic">Everlasting Sands</span></>
              )}
            </h1>
            
            <form onSubmit={handleAiSearchSubmit} className="relative group max-w-2xl mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/35 via-secondary/20 to-primary/35 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative flex items-center bg-white dark:bg-surface-container-lowest rounded-xl shadow-md p-1.5 border border-outline-variant/20">
                <Sparkles className="ml-4 text-primary animate-pulse" size={24} />
                <input 
                  type="text"
                  placeholder={t('aiSearchPlaceholder')}
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  className=" w-full py-4 px-4 border-none focus:ring-0 text-base md:text-lg font-body text-on-surface placeholder:text-outline outline-none"
                />
                <Button 
                  type="submit"
                  variant="primary"
                  className="px-6 md:px-8 py-3 rounded-lg flex items-center gap-2 font-semibold shadow-md shrink-0"
                >
                  <Sparkles size={16} />
                  <span className="hidden sm:inline">{t('askRahalBtn')}</span>
                </Button>
              </div>
            </form>

            {/* AI Chips */}
            {isAiMode && activeAiQuery && (
              <div className="flex flex-wrap justify-center gap-3 animate-fade-in pt-2">
                <span className="flex items-center gap-2 px-4 py-1.5 bg-secondary/10 text-secondary rounded-full border border-secondary/20 text-xs font-semibold">
                  <Sparkles size={12} />
                  <span>{t('interpretation')} {activeAiQuery.includes('nile') ? 'Nile View' : activeAiQuery.includes('pyramid') ? 'Pyramid View' : 'Heritage'}</span>
                </span>
                <span className="flex items-center gap-2 px-4 py-1.5 bg-secondary/10 text-secondary rounded-full border border-secondary/20 text-xs font-semibold">
                  <Sparkles size={12} />
                  <span>{t('budget')} {maxPrice > 20000 ? 'Luxury' : 'Standard'}</span>
                </span>
                <button 
                  onClick={() => { setAiQuery(''); setIsAiMode(false); }}
                  className="text-xs text-outline hover:text-primary transition-colors underline font-medium"
                >
                  {t('refinePrompt')}
                </button>
              </div>
            )}
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
                  <span>{t('sidebarTitle')}</span>
                </h3>
                <p className="text-xs text-on-surface-variant font-medium">
                  {t('sidebarSubtitle')}
                </p>
              </div>

              <form onSubmit={handleApplyFilters} className="space-y-6">
                {/* Location Select */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-outline block" htmlFor="city">
                    {t('locationLabel')}
                  </label>
                  <select 
                    id="city"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="w-full px-3 py-3 bg-white dark:bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all text-sm font-medium text-on-surface cursor-pointer"
                  >
                    <option value="">{t('locationPlaceholder')}</option>
                    {metadata.cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Date Check In / Out */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-outline block">
                    {t('datesLabel')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full px-2 py-2.5 bg-white dark:bg-surface-container-lowest border border-outline-variant rounded-xl text-xs font-semibold focus:ring-1 focus:ring-secondary outline-none"
                    />
                    <input 
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full px-2 py-2.5 bg-white dark:bg-surface-container-lowest border border-outline-variant rounded-xl text-xs font-semibold focus:ring-1 focus:ring-secondary outline-none"
                    />
                  </div>
                </div>

                {/* Nightly Rate Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-outline">
                      {t('priceLabel')}
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
                    {t('ratingLabel')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[5, 4, 3].map(stars => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => setSelectedStars(selectedStars === stars ? null : stars)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          selectedStars === stars 
                            ? 'bg-primary/10 dark:bg-primary/10 border-primary dark:border-primary text-primary dark:text-primary' 
                            : 'bg-white dark:bg-surface-container-lowest border-outline-variant/60 hover:border-primary text-on-surface-variant dark:text-on-surface-variant'
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
                    {t('amenitiesLabel')}
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {metadata.amenities.map(amenity => (
                      <label key={amenity} className="flex items-center gap-3 cursor-pointer group">
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
                  {t('applyFilters')}
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
                  {t('resultsTitle')}
                </h2>
                <p className="text-xs text-on-surface-variant font-medium">
                  {t('showingResults', { count: totalCount })}
                </p>
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-surface-container rounded-xl p-1 border border-outline-variant/20 shadow-inner">
                <button 
                  onClick={() => setIsMapView(false)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    !isMapView 
                      ? 'bg-white text-primary shadow-sm' 
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  <Grid size={14} />
                  <span>{t('gridView')}</span>
                </button>
                <button 
                  onClick={() => setIsMapView(true)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    isMapView 
                      ? 'bg-white text-primary shadow-sm' 
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  <MapIcon size={14} />
                  <span>{t('mapView')}</span>
                </button>
              </div>
            </div>

            {/* Loading Spinner */}
            {loading ? (
              <div className="h-96 flex items-center justify-center bg-surface-container-low border border-outline-variant/15 rounded-2xl shadow-sm">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : isMapView ? (
              <div className="h-[600px] bg-surface-container rounded-2xl border border-outline-variant/20 overflow-hidden relative shadow-sm">
                <HotelsMap hotels={hotels} locale={locale} />
              </div>
            ) : hotels.length === 0 ? (
              /* Empty state */
              <div className="py-24 text-center bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-sm">
                <AlertCircle className="mx-auto text-outline" size={48} />
                <h3 className="font-display text-xl font-semibold mt-4 text-on-surface">No Sanctuaries Found</h3>
                <p className="text-sm text-on-surface-variant max-w-sm mx-auto mt-2">
                  Try adjusting your filters or describe your request using a different prompt to find available stays.
                </p>
              </div>
            ) : (
              /* Grid Layout */
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 min-[1920px]:grid-cols-4 gap-6">
                {hotels.map((hotel) => {
                  const hotelName = hotel.name[locale as 'en' | 'ar'] || hotel.name.en;
                  const matchPercent = isAiMode && activeAiQuery ? calculateCompatibility(hotel, activeAiQuery) : null;
                  
                  return (
                    <Card key={hotel._id} className="group bg-surface-container-lowest rounded-xl border border-outline-variant/25 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                      {/* Card Image Cover wrapped in details link */}
                      <div className="relative h-72 overflow-hidden bg-surface-container group/img">
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
                        
                        {/* Match score or Pick badge */}
                        {matchPercent ? (
                           <div className="absolute bottom-4 left-4 bg-secondary text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 text-xs font-bold pointer-events-none">
                            <Sparkles size={12} />
                            <span>{t('aiMatch', { percent: matchPercent })}</span>
                          </div>
                        ) : hotel.stars === 5 ? (
                          <div className="absolute top-4 left-4 bg-primary text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-md pointer-events-none">
                            {t('rahalChoice')}
                          </div>
                        ) : null}

                        <button 
                          onClick={(e) => toggleFavorite(hotel._id, e)}
                          className={`absolute top-4 right-4 backdrop-blur-md p-2 rounded-full transition-all shadow-md z-10 ${
                            favorites.includes(hotel._id)
                              ? "bg-primary text-white hover:bg-primary-container"
                              : "bg-white/20 text-white hover:bg-white hover:text-error"
                          }`}
                          aria-label="Add to favorites"
                        >
                          <Heart size={16} className={favorites.includes(hotel._id) ? "fill-white" : ""} />
                        </button>
                      </div>

                      {/* Card Content info */}
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

                        {/* AI insight recommendation snippet */}
                        {isAiMode && activeAiQuery ? (
                          <div className="space-y-3">
                            <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                              <div className="h-full bg-secondary transition-all duration-1000" style={{ width: `${matchPercent}%` }}></div>
                            </div>
                            <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/20">
                              <div className="flex items-start gap-2 text-xs leading-relaxed text-on-surface-variant italic">
                                <Sparkles size={14} className="text-primary shrink-0 mt-0.5" />
                                <p>{generateAIInsight(hotel, activeAiQuery)}</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Amenities tags */
                          <div className="flex flex-wrap gap-1.5">
                            {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                              <span key={idx} className="px-2.5 py-1 bg-surface-container text-[10px] font-bold text-on-surface-variant rounded-md">
                                {amenity}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Starting price & book link */}
                        <div className="pt-3 flex justify-between items-center border-t border-outline-variant/20 mt-auto">
                          <div>
                            <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block">
                              {t('startingAt')}
                            </span>
                            <span className="font-bold text-lg text-on-surface">
                              {hotel.averagePricePerNight.toLocaleString()} {hotel.currency || 'EGP'}
                              <span className="text-[10px] font-normal text-on-surface-variant ml-0.5">
                                {t('perNight')}
                              </span>
                            </span>
                          </div>
                          <Link href={`/hotels/${hotel.slug}`}>
                            <Button 
                              variant="ghost"
                              className="px-4 py-2 border border-primary text-primary hover:bg-primary/5 rounded-lg text-xs font-bold active:scale-95 transition-all"
                            >
                              {t('bookNow')}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Pagination controls */}
            {!loading && totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-3 pt-6 border-t border-outline-variant/15">
                <button 
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
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
                        ? 'bg-primary text-white' 
                        : 'border border-outline-variant/50 text-on-surface-variant hover:border-primary hover:text-primary'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button 
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant/50 text-outline hover:border-primary hover:text-primary transition-all disabled:opacity-40 disabled:hover:border-outline-variant/50 disabled:hover:text-outline"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Reveal More button */}
            {!loading && totalPages > 1 && page < totalPages && (
              <div className="mt-12 text-center">
                <button 
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full border border-outline-variant hover:border-primary hover:text-primary text-on-surface-variant font-semibold text-sm transition-all"
                >
                  <span>{t('revealMore')}</span>
                  <Compass className="group-hover:rotate-45 transition-transform" size={14} />
                </button>
              </div>
            )}

          </div>
        </div>
      </section>
    </main>
  );
}
