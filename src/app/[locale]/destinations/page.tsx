'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  MapPin,
  Star,
  Grid,
  Map,
  X,
  Sparkles,
  Heart,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { destinationsApi } from '@/lib/api/destinations';
import { Destination } from '@/types/destination';

// Dynamically import Leaflet Map component with SSR disabled
const DestinationsMap = dynamic(() => import('@/components/destination/DestinationsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-surface-container flex items-center justify-center border border-outline-variant/20 rounded-2xl">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  ),
});

export default function DestinationsPage() {
  const t = useTranslations('destinationsListing');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const isAr = locale === 'ar';

  // Read URL search params
  const regionParam = searchParams.get('region') || '';
  const categoryParam = searchParams.get('category') || '';
  const maxBudgetParam = searchParams.get('maxBudget') || '5000';
  const searchParam = searchParams.get('search') || '';
  const pageParam = searchParams.get('page') || '1';
  const viewParam = (searchParams.get('view') as 'grid' | 'map') || 'grid';

  // Local state for debounced search and temporary UI inputs
  const [searchVal, setSearchVal] = useState(searchParam);
  const [maxBudgetVal, setMaxBudgetVal] = useState(Number(maxBudgetParam));
  const [favorites, setFavorites] = useState<string[]>([]);
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);

  // Sync searchVal with URL search param
  useEffect(() => {
    setSearchVal(searchParam);
  }, [searchParam]);

  // Sync budget state with URL param
  useEffect(() => {
    setMaxBudgetVal(Number(maxBudgetParam));
  }, [maxBudgetParam]);

  // Favorite handler
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rahal_favorites_destinations');
      if (saved) {
        try {
          setFavorites(JSON.parse(saved));
        } catch (e) {
          setFavorites([]);
        }
      }
    }
  }, []);

  // Update query parameters in the URL
  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  // Debounced search logic
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchVal !== searchParam) {
        updateParams({ search: searchVal || null, page: '1' });
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchVal, searchParam]);

  // Query destinations from API
  const limit = 6;
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['destinations', searchParam, regionParam, categoryParam, maxBudgetParam, pageParam],
    queryFn: async () => {
      const response = await destinationsApi.getDestinations({
        search: searchParam || undefined,
        region: regionParam || undefined,
        category: categoryParam || undefined,
        maxBudget: maxBudgetParam !== '5000' ? Number(maxBudgetParam) : undefined,
        page: Number(pageParam),
        limit,
      });
      return response;
    },
  });

  // Append items for "Load More" page additions
  useEffect(() => {
    if (data?.data) {
      if (pageParam === '1') {
        setAllDestinations(data.data);
      } else {
        setAllDestinations(prev => {
          const existingIds = new Set(prev.map(d => d._id));
          const filteredNew = data.data.filter(d => !existingIds.has(d._id));
          return [...prev, ...filteredNew];
        });
      }
    }
  }, [data, pageParam]);

  // Extract pagination meta safely
  const pagination = (data as any)?.meta?.pagination || data?.pagination;
  const hasMore = pagination
    ? allDestinations.length < pagination.total
    : (data?.data && data.data.length === limit);

  // Region configurations
  const regions = [
    { id: 'Upper Egypt', labelEn: 'Upper Egypt', labelAr: 'صعيد مصر' },
    { id: 'Lower Egypt', labelEn: 'Lower Egypt', labelAr: 'الوجه البحري' },
    { id: 'Sinai', labelEn: 'Sinai', labelAr: 'سيناء' },
    { id: 'Red Sea', labelEn: 'Red Sea', labelAr: 'البحر الأحمر' },
    { id: 'Western Desert', labelEn: 'Western Desert', labelAr: 'الصحراء الغربية' },
    { id: 'Delta', labelEn: 'Delta', labelAr: 'الدلتا' },
    { id: 'Mediterranean', labelEn: 'Mediterranean', labelAr: 'البحر المتوسط' },
  ];

  // Category configurations
  const categories = [
    { id: 'historical', labelEn: 'History', labelAr: 'تاريخي' },
    { id: 'beach', labelEn: 'Beach', labelAr: 'شاطئي' },
    { id: 'adventure', labelEn: 'Adventure', labelAr: 'مغامرة' },
    { id: 'cultural', labelEn: 'Culture', labelAr: 'ثقافي' },
    { id: 'religious', labelEn: 'Religious', labelAr: 'ديني' },
    { id: 'nature', labelEn: 'Nature', labelAr: 'طبيعة' },
    { id: 'landmark', labelEn: 'Landmarks', labelAr: 'معالم' },
  ];

  // Set region filter
  const handleRegionChange = (regionId: string) => {
    if (regionId === 'all') {
      updateParams({ region: null, page: '1' });
    } else {
      updateParams({ region: regionId, page: '1' });
    }
  };

  // Set category filter
  const handleCategorySelect = (categoryId: string) => {
    if (categoryParam === categoryId) {
      updateParams({ category: null, page: '1' }); // Toggle off
    } else {
      updateParams({ category: categoryId, page: '1' });
    }
  };

  // Set budget slider value on change (mouseup or drag end)
  const handleBudgetChange = (value: number) => {
    updateParams({ maxBudget: value === 5000 ? null : String(value), page: '1' });
  };

  // Toggle grid/map view
  const setView = (view: 'grid' | 'map') => {
    updateParams({ view });
  };

  // Load more pages
  const handleLoadMore = () => {
    const nextPage = Number(pageParam) + 1;
    updateParams({ page: String(nextPage) });
  };

  // Favorite toggle helper
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const next = favorites.includes(id)
      ? favorites.filter(favId => favId !== id)
      : [...favorites, id];
    setFavorites(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rahal_favorites_destinations', JSON.stringify(next));
    }
  };

  // Clear all filters
  const handleClearAll = () => {
    setSearchVal('');
    router.push(pathname);
  };

  // Start AI chat placeholder handler
  const handleStartAIChat = () => {
    console.log("Start AI Chat clicked - placeholder widget handler");
    alert(isAr ? "سيتم فتح محادثة كونسيرج الذكاء الاصطناعي قريباً!" : "AI Concierge Chat will be available soon!");
  };

  // Format budget currency output

  const formatBudgetText = (budget: number, currency?: string) => {
    const curr = currency || 'EGP';

    const currencyMap: { [key: string]: { ar: string, en: string } } = {
      'EGP': { ar: 'ج.م', en: 'EGP' },
      'USD': { ar: '$', en: '$' },

    };

    const displayCurrency = isAr
      ? (currencyMap[curr]?.ar || curr)
      : (currencyMap[curr]?.en || curr);

    // 3. إرجاع النص المترجم
    return isAr
      ? `${budget} ${displayCurrency} / يوم`
      : `${budget} ${displayCurrency} / day`;
  };

  // Generate consistent mock rating & reviews
  const getMockRating = (id: string) => {
    const charCodeSum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rating = (4.5 + (charCodeSum % 5) * 0.1).toFixed(1);
    const reviewCount = 50 + (charCodeSum % 450);
    return { rating, reviewCount };
  };

  // Generate price class indicators ($ to $$$$)
  const getPriceTier = (budget: number) => {
    if (budget < 100) return '$';
    if (budget < 250) return '$$';
    if (budget < 500) return '$$$';
    return '$$$$';
  };

  return (
    <main className="pt-28 pb-20 bg-background min-h-screen">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop mt-8">

        {/* Main Grid Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">

          {/* LEFT SIDEBAR FILTERS (3 Cols) */}
          <aside className="lg:col-span-3 space-y-8 bg-surface border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <div className="border-b border-outline-variant/20 pb-4">
              <h2 className="font-display text-xl font-bold text-on-surface flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-primary" />
                {t('sidebarTitle')}
              </h2>
            </div>

            {/* SEARCH INPUT */}
            <div className="space-y-2">
              <div className="relative flex items-center bg-surface-container rounded-lg border border-transparent focus-within:border-secondary focus-within:bg-white transition-all">
                <Search size={16} className={`absolute text-on-surface-variant ${isAr ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className={`w-full py-2.5 bg-transparent border-none rounded-lg focus:ring-0 focus:outline-none text-sm text-on-surface font-medium ${isAr ? 'text-right pr-10 pl-4' : 'pl-10 pr-4'
                    }`}
                  dir={isAr ? 'rtl' : 'ltr'}
                />
                {searchVal && (
                  <button
                    onClick={() => setSearchVal('')}
                    className={`absolute text-on-surface-variant hover:text-on-surface ${isAr ? 'left-3' : 'right-3'}`}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* REGION SELECTION */}
            <div className="space-y-4">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-on-surface-variant">
                {t('regionLabel')}
              </h3>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={!regionParam}
                    onChange={() => handleRegionChange('all')}
                    className="w-4 h-4 rounded text-primary border-outline-variant focus:ring-primary focus:ring-offset-background cursor-pointer accent-[#7e5700]"
                  />
                  <span className={`text-sm font-medium transition-colors group-hover:text-primary ${!regionParam ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                    {t('allRegions')}
                  </span>
                </label>

                {regions.map((region) => (
                  <label key={region.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={regionParam === region.id}
                      onChange={() => handleRegionChange(region.id)}
                      className="w-4 h-4 rounded text-primary border-outline-variant focus:ring-primary focus:ring-offset-background cursor-pointer accent-[#7e5700]"
                    />
                    <span className={`text-sm font-medium transition-colors group-hover:text-primary ${regionParam === region.id ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                      {isAr ? region.labelAr : region.labelEn}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* CATEGORY SELECTION */}
            <div className="space-y-4">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-on-surface-variant">
                {t('categoryLabel')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const isActive = categoryParam === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all cursor-pointer ${isActive
                        ? 'bg-primary text-on-primary border-primary shadow-sm active:scale-95'
                        : 'bg-surface-container-low text-on-surface-variant border-transparent hover:border-outline-variant/30 hover:bg-surface-container'
                        }`}
                    >
                      {isAr ? category.labelAr : category.labelEn}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BUDGET RANGE SLIDER */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-on-surface-variant">
                  {t('budgetLabel')}
                </h3>
                <span className="text-xs font-bold text-primary">
                  {maxBudgetVal === 5000 ? '$5,000+' : `$${maxBudgetVal}`}
                </span>
              </div>
              <div className="space-y-2">

                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={maxBudgetVal}
                  onChange={(e) => setMaxBudgetVal(Number(e.target.value))}
                  onMouseUp={() => handleBudgetChange(maxBudgetVal)}
                  onTouchEnd={() => handleBudgetChange(maxBudgetVal)}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#7e5700]"
                  style={{
                    background: `linear-gradient(to right, #7e5700 0%, #7e5700 ${((maxBudgetVal - 100) / (5000 - 100)) * 100}%, #e5e7eb ${((maxBudgetVal - 100) / (5000 - 100)) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-[10px] font-bold text-outline">
                  <span>$100</span>
                  <span>$5,000+</span>
                </div>
              </div>
            </div>

            {/* RAHAL AI SIDEBAR WIDGET */}
            <div className="bg-secondary/10 border border-secondary/20 rounded-2xl p-5 space-y-4 shadow-sm relative overflow-hidden">
              {/* Subtle design accents */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-secondary/20 to-transparent rounded-full -mr-8 -mt-8 pointer-events-none"></div>

              <div className="flex items-center gap-2 text-secondary">
                <Sparkles size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Rahal AI</span>
              </div>

              <h4 className="font-display text-sm font-bold text-on-surface leading-snug">
                {t('startAIChatTitle')}
              </h4>

              <button
                onClick={handleStartAIChat}
                className="w-full py-2.5 px-4 bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-semibold rounded-lg text-xs tracking-wide transition-all shadow active:scale-95 cursor-pointer"
              >
                {t('startAIChatBtn')}
              </button>
            </div>
          </aside>

          {/* MAIN RESULTS SECTION (9 Cols) */}
          <section className="lg:col-span-9 space-y-6">

            {/* Top Toolbar / Active filters bar */}
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-outline-variant/20 pb-4">

              {/* Active Filter Chips */}
              <div className="flex flex-wrap items-center gap-2">
                {(regionParam || categoryParam || maxBudgetParam !== '5000' || searchParam) && (
                  <>
                    <span className="text-xs font-bold text-on-surface-variant">
                      {t('activeFilters')}
                    </span>

                    {/* Search query chip */}
                    {searchParam && (
                      <span className="inline-flex items-center gap-1 bg-surface-container text-on-surface px-2.5 py-1 rounded-full text-xs font-semibold border border-outline-variant/10">
                        {`"${searchParam}"`}
                        <button onClick={() => setSearchVal('')} className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
                          <X size={12} />
                        </button>
                      </span>
                    )}

                    {/* Region chip */}
                    {regionParam && (
                      <span className="inline-flex items-center gap-1 bg-surface-container text-on-surface px-2.5 py-1 rounded-full text-xs font-semibold border border-outline-variant/10">
                        {isAr
                          ? regions.find(r => r.id === regionParam)?.labelAr || regionParam
                          : regions.find(r => r.id === regionParam)?.labelEn || regionParam
                        }
                        <button onClick={() => updateParams({ region: null, page: '1' })} className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
                          <X size={12} />
                        </button>
                      </span>
                    )}

                    {/* Category chip */}
                    {categoryParam && (
                      <span className="inline-flex items-center gap-1 bg-surface-container text-on-surface px-2.5 py-1 rounded-full text-xs font-semibold border border-outline-variant/10">
                        {isAr
                          ? categories.find(c => c.id === categoryParam)?.labelAr || categoryParam
                          : categories.find(c => c.id === categoryParam)?.labelEn || categoryParam
                        }
                        <button onClick={() => updateParams({ category: null, page: '1' })} className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
                          <X size={12} />
                        </button>
                      </span>
                    )}

                    {/* Budget chip */}
                    {maxBudgetParam !== '5000' && (
                      <span className="inline-flex items-center gap-1 bg-surface-container text-on-surface px-2.5 py-1 rounded-full text-xs font-semibold border border-outline-variant/10">
                        {isAr ? `حد أقصى ${maxBudgetParam}$` : `Max $${maxBudgetParam}`}
                        <button onClick={() => updateParams({ maxBudget: null, page: '1' })} className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
                          <X size={12} />
                        </button>
                      </span>
                    )}

                    {/* Clear all shortcut */}
                    <button
                      onClick={handleClearAll}
                      className="text-xs font-bold text-primary hover:text-primary-container transition-colors underline decoration-dotted cursor-pointer"
                    >
                      {t('clearAll')}
                    </button>
                  </>
                )}
              </div>

              {/* Grid / Map view toggle */}
              <div className="flex bg-surface-container p-1 rounded-xl border border-outline-variant/20 shadow-inner">
                <button
                  onClick={() => setView('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewParam === 'grid'
                    ? 'bg-surface text-primary shadow-sm border border-outline-variant/10'
                    : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                  <Grid size={14} />
                  <span>{t('gridView')}</span>
                </button>

                <button
                  onClick={() => setView('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewParam === 'map'
                    ? 'bg-surface text-primary shadow-sm border border-outline-variant/10'
                    : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                  <Map size={14} />
                  <span>{t('mapView')}</span>
                </button>
              </div>
            </div>

            {/* RESULTS CONTAINER */}
            {isLoading && pageParam === '1' ? (
              /* Skeletal loaders */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-surface rounded-2xl border border-outline-variant/20 overflow-hidden shadow-sm animate-pulse space-y-4 p-4 h-[420px]">
                    <div className="w-full h-48 bg-surface-container-highest rounded-xl"></div>
                    <div className="h-4 bg-surface-container-highest rounded w-3/4"></div>
                    <div className="h-3 bg-surface-container-highest rounded w-1/2"></div>
                    <div className="h-3 bg-surface-container-highest rounded w-full"></div>
                    <div className="h-3 bg-surface-container-highest rounded w-5/6"></div>
                    <div className="flex justify-between items-center pt-4">
                      <div className="h-4 bg-surface-container-highest rounded w-1/4"></div>
                      <div className="h-8 bg-surface-container-highest rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : allDestinations.length === 0 ? (
              /* Empty results fallback */
              <div className="text-center py-20 bg-surface rounded-2xl border border-outline-variant/30 shadow-sm space-y-4">
                <SlidersHorizontal className="mx-auto text-outline" size={48} />
                <h3 className="font-display text-xl font-bold text-on-surface">
                  {t('noDestinations')}
                </h3>
                <p className="text-on-surface-variant text-sm max-w-md mx-auto leading-relaxed">
                  Try adjusting your filters, clearing your search input, or resetting all states to find your next destination.
                </p>
                <button
                  onClick={handleClearAll}
                  className="px-6 py-2.5 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-semibold rounded-lg text-sm shadow cursor-pointer transition-all active:scale-95 inline-block"
                >
                  {t('clearAll')}
                </button>
              </div>
            ) : viewParam === 'map' ? (
              /* MAP VIEW */
              // <div className="w-full overflow-hidden rounded-2xl border border-outline-variant/30 shadow">
              //   <DestinationsMap destinations={allDestinations} locale={locale} />
              // </div>

              <div className="w-full overflow-hidden rounded-2xl border border-outline-variant/30 shadow-md relative 
                h-[calc(100vh-300px)] min-h-[400px] max-h-[650px]">
                <DestinationsMap destinations={allDestinations} locale={locale} />
              </div>
            ) : (
              /* GRID VIEW */
              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allDestinations.map((destination) => {
                    const name = destination.name[locale as 'en' | 'ar'] || destination.name.en;
                    const desc = destination.description[locale as 'en' | 'ar'] || destination.description.en;
                    const imageSrc = destination.coverImage || destination.images[0] || 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750';
                    const isFav = favorites.includes(destination._id);
                    // const { rating, reviewCount } = getMockRating(destination._id);
                    const priceTier = getPriceTier(destination.averageBudgetPerDay);

                    return (
                      <article
                        key={destination._id}
                        className="group bg-surface hover:bg-surface-container-lowest border border-outline-variant/20 hover:border-primary/20 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full relative"
                      >
                        {/* Image Gallery area */}
                        <div className="h-52 w-full relative overflow-hidden bg-surface-container">
                          <img
                            src={imageSrc}
                            alt={name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />

                          {/* Heart/Favorite button */}
                          <button
                            onClick={(e) => toggleFavorite(destination._id, e)}
                            className={`absolute top-4 right-4 p-2.5 rounded-full border transition-all shadow-sm cursor-pointer z-10 ${isFav
                              ? 'bg-primary border-primary text-on-primary scale-110'
                              : 'bg-white/80 backdrop-blur-sm border-white/20 text-on-surface-variant hover:bg-white hover:text-primary'
                              }`}
                            aria-label="Save Destination"
                          >
                            <Heart size={16} className={isFav ? 'fill-current' : ''} />
                          </button>

                          {/* Star Rating Badge */}
                          {/* <div className="absolute bottom-4 left-4 inline-flex items-center gap-1 px-2.5 py-1 bg-[#1c1c19]/70 backdrop-blur-sm text-white rounded-full text-[10px] font-bold shadow-sm">
                            <Star size={10} className="fill-primary text-primary" />
                            <span>{rating} ({reviewCount})</span>
                          </div> */}
                        </div>

                        {/* Content details */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div className="space-y-2">
                            {/* Category Label & Price tier */}
                            <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant tracking-wider uppercase">
                              <span>
                                {t(destination.category as any) || destination.category}
                              </span>
                              <span className="text-primary tracking-widest">{priceTier}</span>
                            </div>

                            {/* Title */}
                            <h3 className="font-display text-lg font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                              {name}
                            </h3>

                            {/* Location */}
                            <div className="flex items-center gap-1 text-[11px] text-on-surface-variant font-semibold">
                              <MapPin size={12} className="text-primary shrink-0" />
                              <span>
                                {isAr
                                  ? `${t(destination.city as any) || destination.city}، ${t('Egypt' as any) || 'مصر'}`
                                  : `${destination.city}, Egypt`
                                }
                              </span>
                            </div>

                            {/* Description snippet */}
                            <p className="font-body text-xs text-on-surface-variant leading-relaxed line-clamp-2 pt-1">
                              {desc}
                            </p>
                          </div>

                          {/* Bottom price and explore */}
                          <div className="flex justify-between items-center mt-6 pt-4 border-t border-outline-variant/10">
                            <div>
                              <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block">
                                {t('startingFrom')}
                              </span>
                              <span className="font-display text-base font-bold text-on-surface">
                                {/* {formatBudgetText(destination.averageBudgetPerDay)} */}
                                {formatBudgetText(destination.averageBudgetPerDay, destination.currency)}
                              </span>
                            </div>

                            <button
                              onClick={() => router.push(`/destinations/slug/${destination.slug}`)}
                              className="px-4 py-2 bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-semibold rounded-lg text-xs tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer uppercase"
                            >
                              {t('exploreBtn')}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Loading spin for subsequent loads */}
                {isFetching && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-primary" size={24} />
                  </div>
                )}

                {/* LOAD MORE BUTTON */}
                {hasMore && !isFetching && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="secondary"
                      onClick={handleLoadMore}
                      className="border-primary text-primary hover:bg-primary hover:text-on-primary font-semibold tracking-wide rounded-xl px-8 py-3"
                    >
                      {t('loadMore')}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
