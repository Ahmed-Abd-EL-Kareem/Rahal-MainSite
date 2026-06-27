'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  MapPin,
  Grid,
  Map,
  X,
  Sparkles,
  Heart,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Compass,
  AlertCircle,
} from 'lucide-react';
import { destinationsApi } from '@/lib/api/destinations';
import { Destination } from '@/types/destination';

// Dynamically import Leaflet Map component with SSR disabled
const DestinationsMap = dynamic(() => import('@/components/destination/DestinationsMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] bg-surface-container flex items-center justify-center border border-outline-variant/20 rounded-2xl">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  ),
});

const LIMIT = 9;

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
  const viewParam = (searchParams.get('view') as 'grid' | 'map') || 'grid';

  // Local UI states
  const [searchVal, setSearchVal] = useState(searchParam);
  const [maxBudgetVal, setMaxBudgetVal] = useState(Number(maxBudgetParam));
  const [favorites, setFavorites] = useState<string[]>([]);

  // Pagination state (local, like hotels page)
  const [page, setPage] = useState(1);

  // Reset page to 1 whenever any filter changes
  useEffect(() => { setPage(1); }, [searchParam, regionParam, categoryParam, maxBudgetParam]);

  // Sync searchVal with URL search param
  useEffect(() => { setSearchVal(searchParam); }, [searchParam]);

  // Sync budget state with URL param
  useEffect(() => { setMaxBudgetVal(Number(maxBudgetParam)); }, [maxBudgetParam]);

  // Favorite handler
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rahal_favorites_destinations');
      if (saved) {
        try { setFavorites(JSON.parse(saved)); } catch { setFavorites([]); }
      }
    }
  }, []);

  // Update query parameters in the URL
  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '') { params.delete(key); } else { params.set(key, val); }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  // Debounced search logic
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchVal !== searchParam) {
        updateParams({ search: searchVal || null });
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchVal, searchParam]);

  // Query destinations from API
  const queryParams = {
    page,
    limit: LIMIT,
    search: searchParam || undefined,
    region: regionParam || undefined,
    category: categoryParam || undefined,
    maxBudget: maxBudgetParam !== '5000' ? Number(maxBudgetParam) : undefined,
    isActive: true,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['destinations', queryParams],
    queryFn: () => destinationsApi.getDestinations(queryParams),
    placeholderData: (previousData) => previousData,
  });

  const destinations: Destination[] = data?.data || [];
  const totalCount = (data as any)?.meta?.pagination?.total ?? data?.pagination?.total ?? destinations.length;
  const totalPages = (data as any)?.meta?.pagination?.totalPages ?? data?.pagination?.totalPages ?? 1;

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

  const handleRegionChange = (regionId: string) => {
    updateParams({ region: regionId === 'all' ? null : regionId });
    setPage(1);
  };

  const handleCategorySelect = (categoryId: string) => {
    updateParams({ category: categoryParam === categoryId ? null : categoryId });
    setPage(1);
  };

  const handleBudgetChange = (value: number) => {
    updateParams({ maxBudget: value === 5000 ? null : String(value) });
    setPage(1);
  };

  const setView = (view: 'grid' | 'map') => updateParams({ view });

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

  const handleClearAll = () => {
    setSearchVal('');
    setPage(1);
    router.push(pathname);
  };

  const handleStartAIChat = () => {
    alert(isAr ? 'سيتم فتح محادثة كونسيرج الذكاء الاصطناعي قريباً!' : 'AI Concierge Chat will be available soon!');
  };

  const formatBudgetText = (budget: number, currency?: string) => {
    const curr = currency || 'EGP';
    const currencyMap: Record<string, { ar: string; en: string }> = {
      EGP: { ar: 'ج.م', en: 'EGP' },
      USD: { ar: '$', en: '$' },
    };
    const displayCurrency = isAr ? (currencyMap[curr]?.ar || curr) : (currencyMap[curr]?.en || curr);
    return isAr ? `${budget} ${displayCurrency} / يوم` : `${budget} ${displayCurrency} / day`;
  };

  const getPriceTier = (budget: number) => {
    if (budget < 100) return '$';
    if (budget < 250) return '$$';
    if (budget < 500) return '$$$';
    return '$$$$';
  };

  const hasActiveFilters = !!(regionParam || categoryParam || maxBudgetParam !== '5000' || searchParam);

  return (
    <main className="pt-28 pb-20 bg-background min-h-screen">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop mt-8">
        <div className="flex flex-col lg:flex-row gap-gutter items-start">

          {/* ── LEFT SIDEBAR FILTERS ──────────────────────────────────── */}
          <aside className="w-full lg:w-80 2xl:w-96 shrink-0 lg:sticky lg:top-24 z-30 space-y-8 bg-surface border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <div className="border-b border-outline-variant/20 pb-4">
              <h2 className="font-display text-xl font-bold text-on-surface flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-primary" />
                {t('sidebarTitle')}
              </h2>
            </div>

            {/* SEARCH */}
            <div className="relative flex items-center bg-surface-container rounded-lg border border-transparent focus-within:border-secondary focus-within:bg-white transition-all">
              <Search size={16} className={`absolute text-on-surface-variant ${isAr ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className={`w-full py-2.5 bg-transparent border-none rounded-lg focus:ring-0 focus:outline-none text-sm text-on-surface font-medium ${isAr ? 'text-right pr-10 pl-4' : 'pl-10 pr-4'}`}
                dir={isAr ? 'rtl' : 'ltr'}
              />
              {searchVal && (
                <button onClick={() => setSearchVal('')} className={`absolute text-on-surface-variant hover:text-on-surface ${isAr ? 'left-3' : 'right-3'}`}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* REGION */}
            <div className="space-y-4">
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-outline">
                {t('regionLabel')}
              </h3>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={!regionParam} onChange={() => handleRegionChange('all')}
                    className="w-4 h-4 rounded border-outline-variant focus:ring-primary cursor-pointer accent-[#7e5700]" />
                  <span className={`text-sm font-medium transition-colors group-hover:text-primary ${!regionParam ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                    {t('allRegions')}
                  </span>
                </label>
                {regions.map((region) => (
                  <label key={region.id} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={regionParam === region.id} onChange={() => handleRegionChange(region.id)}
                      className="w-4 h-4 rounded border-outline-variant focus:ring-primary cursor-pointer accent-[#7e5700]" />
                    <span className={`text-sm font-medium transition-colors group-hover:text-primary ${regionParam === region.id ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                      {isAr ? region.labelAr : region.labelEn}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* CATEGORY */}
            <div className="space-y-4">
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-outline">
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

            {/* BUDGET SLIDER */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-outline">
                  {t('budgetLabel')}
                </h3>
                <span className="text-xs font-bold text-primary">
                  {maxBudgetVal === 5000 ? '$5,000+' : `$${maxBudgetVal}`}
                </span>
              </div>
              <input
                type="range" min="100" max="5000" step="100"
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

            {/* RAHAL AI WIDGET */}
            <div className="bg-secondary/10 border border-secondary/20 rounded-2xl p-5 space-y-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-secondary/20 to-transparent rounded-full -mr-8 -mt-8 pointer-events-none" />
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

          {/* ── MAIN RESULTS SECTION ──────────────────────────────────── */}
          <div className="flex-1 w-full space-y-6">

            {/* Toolbar: active filter chips + view toggle */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/15">

              {/* Active Filter Chips */}
              <div className="flex flex-wrap items-center gap-2 min-h-[28px]">
                {hasActiveFilters ? (
                  <>
                    <span className="text-xs font-bold text-on-surface-variant">{t('activeFilters')}</span>

                    {searchParam && (
                      <span className="inline-flex items-center gap-1 bg-surface-container text-on-surface px-2.5 py-1 rounded-full text-xs font-semibold border border-outline-variant/10">
                        {`"${searchParam}"`}
                        <button onClick={() => setSearchVal('')} className="text-on-surface-variant hover:text-on-surface cursor-pointer"><X size={12} /></button>
                      </span>
                    )}
                    {regionParam && (
                      <span className="inline-flex items-center gap-1 bg-surface-container text-on-surface px-2.5 py-1 rounded-full text-xs font-semibold border border-outline-variant/10">
                        {isAr ? regions.find(r => r.id === regionParam)?.labelAr : regions.find(r => r.id === regionParam)?.labelEn}
                        <button onClick={() => updateParams({ region: null })} className="text-on-surface-variant hover:text-on-surface cursor-pointer"><X size={12} /></button>
                      </span>
                    )}
                    {categoryParam && (
                      <span className="inline-flex items-center gap-1 bg-surface-container text-on-surface px-2.5 py-1 rounded-full text-xs font-semibold border border-outline-variant/10">
                        {isAr ? categories.find(c => c.id === categoryParam)?.labelAr : categories.find(c => c.id === categoryParam)?.labelEn}
                        <button onClick={() => updateParams({ category: null })} className="text-on-surface-variant hover:text-on-surface cursor-pointer"><X size={12} /></button>
                      </span>
                    )}
                    {maxBudgetParam !== '5000' && (
                      <span className="inline-flex items-center gap-1 bg-surface-container text-on-surface px-2.5 py-1 rounded-full text-xs font-semibold border border-outline-variant/10">
                        {isAr ? `حد أقصى ${maxBudgetParam}$` : `Max $${maxBudgetParam}`}
                        <button onClick={() => updateParams({ maxBudget: null })} className="text-on-surface-variant hover:text-on-surface cursor-pointer"><X size={12} /></button>
                      </span>
                    )}
                    <button onClick={handleClearAll} className="text-xs font-bold text-primary hover:text-primary-container underline decoration-dotted cursor-pointer">
                      {t('clearAll')}
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-on-surface-variant font-medium">
                    {isAr ? `عرض ${totalCount} وجهة` : `Showing ${totalCount} destinations`}
                  </span>
                )}
              </div>

              {/* Grid / Map toggle — identical to hotels */}
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href={`/${locale}/destinations/nearby`}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container shadow-md active:scale-95 shrink-0"
                >
                  <span>{t('nearMe')}</span>
                </Link>
                <div className="flex items-center bg-surface-container rounded-xl p-1 border border-outline-variant/20 shadow-inner">
                  <button
                    onClick={() => setView('grid')}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${viewParam === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'
                      }`}
                  >
                    <Grid size={14} />
                    <span>{t('gridView')}</span>
                  </button>
                  <button
                    onClick={() => setView('map')}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${viewParam === 'map' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'
                      }`}
                  >
                    <Map size={14} />
                    <span>{t('mapView')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ── CONTENT AREA ─────────────────────────────────────────── */}
            {isLoading ? (
              /* Skeleton loaders */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: LIMIT }).map((_, i) => (
                  <div key={i} className="bg-surface rounded-2xl border border-outline-variant/20 overflow-hidden shadow-sm animate-pulse h-[420px] p-4 space-y-4">
                    <div className="w-full h-48 bg-surface-container-highest rounded-xl" />
                    <div className="h-4 bg-surface-container-highest rounded w-3/4" />
                    <div className="h-3 bg-surface-container-highest rounded w-1/2" />
                    <div className="h-3 bg-surface-container-highest rounded w-full" />
                    <div className="flex justify-between items-center pt-4">
                      <div className="h-4 bg-surface-container-highest rounded w-1/4" />
                      <div className="h-8 bg-surface-container-highest rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : viewParam === 'map' ? (
              /* MAP VIEW — */
              <div className="h-[600px] bg-surface-container rounded-2xl border border-outline-variant/20 overflow-hidden relative shadow-sm">
                <DestinationsMap destinations={destinations} locale={locale} />
              </div>
            ) : destinations.length === 0 ? (
              /* Empty state */
              <div className="py-24 text-center bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-sm">
                <AlertCircle className="mx-auto text-outline" size={48} />
                <h3 className="font-display text-xl font-semibold mt-4 text-on-surface">{t('noDestinations')}</h3>
                <p className="text-sm text-on-surface-variant max-w-sm mx-auto mt-2">
                  {isAr ? 'جرب تعديل الفلاتر أو مسح حقل البحث للعثور على وجهة مناسبة.' : 'Try adjusting your filters or clearing the search to find available destinations.'}
                </p>
                <button onClick={handleClearAll} className="mt-6 px-6 py-2.5 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-semibold rounded-lg text-sm shadow cursor-pointer transition-all active:scale-95 inline-block">
                  {t('clearAll')}
                </button>
              </div>
            ) : (
              /* GRID VIEW */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {destinations.map((destination) => {
                  const name = destination.name[locale as 'en' | 'ar'] || destination.name.en;
                  const desc = destination.description[locale as 'en' | 'ar'] || destination.description.en;
                  const imageSrc = destination.coverImage || destination.images[0] || 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750';
                  const isFav = favorites.includes(destination._id);
                  const priceTier = getPriceTier(destination.averageBudgetPerDay);

                  return (
                    <article
                      key={destination._id}
                      className="group bg-surface hover:bg-surface-container-lowest border border-outline-variant/20 hover:border-primary/20 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative"
                    >
                      <Link href={`/${locale}/destinations/${destination.slug}`} className="absolute inset-0 z-0" />
                      {/* Image */}
                      <div className="h-52 w-full relative overflow-hidden bg-surface-container">
                        <img
                          src={imageSrc}
                          alt={name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                        {/* Heart */}
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
                      </div>
 
                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between relative z-0 pointer-events-none">
                        <div className="space-y-2">
                          {/* Category & price tier */}
                          <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant tracking-wider uppercase">
                            <span>{t(destination.category as any) || destination.category}</span>
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
                                : `${destination.city}, Egypt`}
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
                              {t('startingFrom')}
                            </span>
                            <span className="font-display text-base font-bold text-on-surface">
                              {formatBudgetText(destination.averageBudgetPerDay, destination.currency)}
                            </span>
                          </div>
                          <Link
                            href={`/${locale}/destinations/${destination.slug}`}
                            className="px-4 py-2 bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-semibold rounded-lg text-xs tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer uppercase z-10"
                          >
                            {t('exploreBtn')}
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* ── PAGINATION — identical structure to hotels page ──────── */}
            {!isLoading && totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-3 pt-6 border-t border-outline-variant/15">
                {/* Prev */}
                <button
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant/50 text-outline hover:border-primary hover:text-primary transition-all disabled:opacity-40 disabled:hover:border-outline-variant/50 disabled:hover:text-outline cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-all cursor-pointer ${page === p
                        ? 'bg-primary text-white'
                        : 'border border-outline-variant/50 text-on-surface-variant hover:border-primary hover:text-primary'
                      }`}
                  >
                    {p}
                  </button>
                ))}

                {/* Next */}
                <button
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant/50 text-outline hover:border-primary hover:text-primary transition-all disabled:opacity-40 disabled:hover:border-outline-variant/50 disabled:hover:text-outline cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* ── REVEAL MORE BUTTON — identical to hotels page ─────────── */}
            {!isLoading && totalPages > 1 && page < totalPages && (
              <div className="mt-12 text-center">
                <button
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full border border-outline-variant hover:border-primary hover:text-primary text-on-surface-variant font-semibold text-sm transition-all cursor-pointer"
                >
                  <span>{t('loadMore')}</span>
                  <Compass className="group-hover:rotate-45 transition-transform" size={14} />
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}
