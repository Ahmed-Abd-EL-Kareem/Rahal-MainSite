
'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter, notFound } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import {
  MapPin,
  Sparkles,
  Compass,
  Calendar,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  Bookmark,
  Star,
  Clock,
  Camera,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { destinationsApi } from '@/lib/api/destinations';
import { hotelsApi } from '@/lib/api/hotels';

export default function DestinationDetailsPage() {
  const t = useTranslations('destinationDetail');
  const tList = useTranslations('destinationsListing');
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const isAr = locale === 'ar';

  const [activeSection, setActiveSection] = useState('overview');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // Section references for scroll-spy
  const overviewRef = useRef<HTMLDivElement>(null);
  const attractionsRef = useRef<HTMLDivElement>(null);
  const bestTimeRef = useRef<HTMLDivElement>(null);
  const hotelsRef = useRef<HTMLDivElement>(null);

  // Fetch destination details
  const { data: destinationResponse, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['destination', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Invalid slug');
      const response = await destinationsApi.getDestinationBySlug(slug);
      if (!response || !response.data) throw new Error('Destination not found');
      return response.data;
    },
    enabled: !!slug,
  });

  const destination = destinationResponse;

  // Fetch nearby hotels based on destination city
  const { data: hotelsResponse } = useQuery({
    queryKey: ['destination-hotels', destination?.city],
    queryFn: async () => {
      if (!destination?.city) return [];
      const response = await hotelsApi.getHotels({ city: destination.city, limit: 4 });
      return response?.data || [];
    },
    enabled: !!destination?.city,
  });

  const hotels = hotelsResponse || [];

  // Favorite handler
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rahal_favorites_destinations');
      if (saved) {
        try { setFavorites(JSON.parse(saved)); } catch { setFavorites([]); }
      }
    }
  }, []);

  const isFav = destination ? favorites.includes(destination._id) : false;

  const toggleFavorite = () => {
    if (!destination) return;
    const next = isFav
      ? favorites.filter(id => id !== destination._id)
      : [...favorites, destination._id];
    setFavorites(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rahal_favorites_destinations', JSON.stringify(next));
    }
  };

  // Scroll spy effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;

      if (hotelsRef.current && scrollPosition >= hotelsRef.current.offsetTop) {
        setActiveSection('hotels');
      } else if (bestTimeRef.current && scrollPosition >= bestTimeRef.current.offsetTop) {
        setActiveSection('bestTime');
      } else if (attractionsRef.current && scrollPosition >= attractionsRef.current.offsetTop) {
        setActiveSection('attractions');
      } else {
        setActiveSection('overview');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string, ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      const offsetTop = ref.current.offsetTop - 150;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
      setActiveSection(id);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (queryError || !destination) {
    // If not found, trigger Next.js notFound()
    notFound();
  }

  const name = destination.name[locale as 'en' | 'ar'] || destination.name.en;
  const desc = destination.description[locale as 'en' | 'ar'] || destination.description.en;
  const cover = destination.coverImage || destination.images[0] || 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750';

  // Thumbs list - UPDATED: safer fallback logic
  const getThumbSrc = (idx: number) => {
    const fallbacks = [
      'https://images.unsplash.com/photo-1719659018185-8a239c35fb4a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80',
    ];

    // If image previously errored → use fallback
    if (imageErrors[idx]) {
      return fallbacks[idx] || fallbacks[0];
    }

    // If original image exists → use it
    if (destination.images && destination.images[idx]) {
      return destination.images[idx];
    }

    // If no original image → fallback
    return fallbacks[idx] || fallbacks[0];
  };

  // Best months set representation
  const allMonths = [
    { name: 'January', labelAr: 'يناير', labelEn: 'Jan' },
    { name: 'February', labelAr: 'فبراير', labelEn: 'Feb' },
    { name: 'March', labelAr: 'مارس', labelEn: 'Mar' },
    { name: 'April', labelAr: 'أبريل', labelEn: 'Apr' },
    { name: 'May', labelAr: 'مايو', labelEn: 'May' },
    { name: 'June', labelAr: 'يونيو', labelEn: 'Jun' },
    { name: 'July', labelAr: 'يوليو', labelEn: 'Jul' },
    { name: 'August', labelAr: 'أغسطس', labelEn: 'Aug' },
    { name: 'September', labelAr: 'سبتمبر', labelEn: 'Sep' },
    { name: 'October', labelAr: 'أكتوبر', labelEn: 'Oct' },
    { name: 'November', labelAr: 'نوفمبر', labelEn: 'Nov' },
    { name: 'December', labelAr: 'ديسمبر', labelEn: 'Dec' },
  ];

  // Helper to format currency
  const formatBudget = (budget: number) => {
    const curr = destination.currency || 'EGP';
    const displayCurrency = isAr ? (curr === 'EGP' ? 'ج.م' : '$') : curr;
    return isAr ? `${budget} ${displayCurrency}` : `${displayCurrency} ${budget}`;
  };

  // Chevron components direction dependent
  const ChevronIcon = isAr ? ChevronLeft : ChevronRight;

  return (
    <main className="pt-28 pb-24 bg-background min-h-screen text-on-surface" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 aspect-[2.39/1] md:aspect-auto lg:h-[500px]">
          {/* Main Large Image */}
          <div className="lg:col-span-3 h-[300px] md:h-[450px] lg:h-full relative overflow-hidden rounded-2xl group shadow-md">
            <img
              src={cover}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 z-10" />

            {/* Content overlaid on main image */}
            <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 md:p-10 text-white">


              {/* Bottom: Destination title */}
              <div className="space-y-3">
                <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  {name}
                </h1>
                <div className="flex items-center gap-2 text-sm text-white/90">
                  <MapPin size={16} className="text-primary-fixed-dim" />
                  {/* <span>
                    {destination.city}, {locale === 'ar' ? 'مصر' : 'Egypt'}
                  </span> */}
                  <span>
                    {t(destination.city as any) || destination.city}، {t('Egypt')}
                  </span>
                </div>
              </div>
            </div>

            {/* Favorite button on top of image */}
            {/* <button
              onClick={toggleFavorite}
              className={`absolute top-6 right-6 z-30 p-3 rounded-full border transition-all cursor-pointer shadow-lg ${isFav
                ? 'bg-primary border-primary text-on-primary'
                : 'bg-white/90 backdrop-blur-sm border-white/20 text-on-surface-variant hover:bg-white hover:text-primary'
                }`}
            >
              <Bookmark size={20} className={isFav ? 'fill-current' : ''} />
            </button> */}
            <button
              onClick={toggleFavorite}
              className={`absolute top-6 end-6 z-30 p-3 rounded-full border transition-all cursor-pointer shadow-lg ${isFav
                ? 'bg-primary border-primary text-on-primary'
                : 'bg-white/90 backdrop-blur-sm border-white/20 text-on-surface-variant hover:bg-white hover:text-primary'
                }`}
            >
              <Bookmark size={20} className={isFav ? 'fill-current' : ''} />
            </button>
          </div>

          {/* Right side Thumbnail grid (1 top landscape, 2 bottom side-by-side) - UPDATED */}
          <div className="hidden lg:grid grid-rows-2 gap-4 h-full">
            {/* Top Thumbnail - UPDATED */}
            <div className="relative overflow-hidden rounded-2xl cursor-pointer group shadow-sm bg-surface-container">
              {getThumbSrc(0) ? (
                <img
                  src={getThumbSrc(0)}
                  alt={`${name} thumbnail 1`}
                  onError={() => setImageErrors(prev => ({ ...prev, [0]: true }))}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#FFD700] via-[#FFECB3] to-[#F5F5DC]">
                  <Camera size={24} className="text-white/80" />
                </div>
              )}
            </div>

            {/* Bottom Row containing 2 thumbnails side-by-side */}
            <div className="grid grid-cols-2 gap-4">
              {/* Bottom Left Thumbnail - UPDATED */}
              <div className="relative overflow-hidden rounded-2xl cursor-pointer group shadow-sm bg-surface-container">
                {getThumbSrc(1) ? (
                  <img
                    src={getThumbSrc(1)}
                    alt={`${name} thumbnail 2`}
                    onError={() => setImageErrors(prev => ({ ...prev, [1]: true }))}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#FFD700] via-[#FFECB3] to-[#F5F5DC]">
                    <Camera size={24} className="text-white/80" />
                  </div>
                )}
              </div>

              {/* Bottom Right Thumbnail - UPDATED */}
              <div className="relative overflow-hidden rounded-2xl cursor-pointer group shadow-sm bg-surface-container">
                {getThumbSrc(2) ? (
                  <>
                    <img
                      src={getThumbSrc(2)}
                      alt={`${name} thumbnail 3`}
                      onError={() => setImageErrors(prev => ({ ...prev, [2]: true }))}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                    />
                    {destination.images && destination.images.length > 3 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-xs pointer-events-none z-10">
                        +{destination.images.length - 3}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#FFD700] via-[#FFECB3] to-[#F5F5DC]">
                    <Camera size={24} className="text-white/80" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STICKY SUB-NAV ─────────────────────────────────────────── */}
      <nav className="sticky top-20 bg-background/95 backdrop-blur-md z-40 border-b border-outline-variant/15 shadow-sm mt-8">
        <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop flex gap-8 py-4 overflow-x-auto whitespace-nowrap scrollbar-none">
          {[
            { id: 'overview', label: t('overview'), ref: overviewRef },
            { id: 'attractions', label: t('attractions'), ref: attractionsRef },
            { id: 'bestTime', label: t('bestTime'), ref: bestTimeRef },
            { id: 'hotels', label: t('hotels'), ref: hotelsRef },
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id, sec.ref)}
              className={`text-sm font-bold tracking-wide transition-all pb-1 border-b-2 cursor-pointer ${activeSection === sec.id
                ? 'border-primary text-primary font-extrabold'
                : 'border-transparent text-on-surface-variant hover:text-primary hover:border-outline-variant/30'
                }`}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── MAIN CONTENT ───────────────────────────────────────────── */}
      <section className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Left Column (Content) */}
          <div className="lg:col-span-8 space-y-16">
            {/* Overview / Introduction */}
            <div ref={overviewRef} id="overview" className="space-y-6 pt-4 scroll-mt-28">
              <div className="bg-secondary/5 rounded-2xl p-6 border border-secondary/10 flex gap-4 shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-on-secondary-container rounded-full flex items-center justify-center flex-shrink-0 text-white shadow">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="font-display text-base font-bold text-secondary mb-1">
                    {t('aiInsight')}
                  </h4>
                  <p className="text-on-surface-variant text-sm font-medium italic leading-relaxed">
                    {t('aiInsightDesc')}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-on-surface border-b border-outline-variant/20 pb-3">
                  {name}
                </h2>
                <p className="font-body text-sm md:text-base text-on-surface-variant leading-relaxed whitespace-pre-line">
                  {desc}
                </p>
              </div>

              {/* Stats Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {/* 1. Best Time to Visit */}
                <div className="bg-surface border border-outline-variant/25 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                    <Calendar size={22} />
                  </div>
                  <h4 className="font-display text-sm font-bold text-on-surface mb-1">
                    {t('bestTimeLabel')}
                  </h4>
                  {/* <span className="text-xs font-semibold text-primary mb-2">
                    {destination.bestMonths.slice(0, 2).join(' - ')}
                  </span> */}
                  <span className="text-xs font-semibold text-primary mb-2">
                    {destination.bestMonths && destination.bestMonths.length > 0
                      ? destination.bestMonths
                        .slice(0, 2)
                        .map((m) => t(m as any) || m)
                        .join(locale === 'ar' ? ' - ' : ' - ')
                      : ''}
                  </span>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    {t('bestTimeDesc')}
                  </p>
                </div>

                {/* 2. Average Budget */}
                <div className="bg-surface border border-outline-variant/25 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                    <DollarSign size={22} />
                  </div>
                  <h4 className="font-display text-sm font-bold text-on-surface mb-1">
                    {t('budgetLabel')}
                  </h4>
                  <span className="text-xs font-semibold text-primary mb-2">
                    {formatBudget(destination.averageBudgetPerDay)} / {locale === 'ar' ? 'يوم' : 'day'}
                  </span>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    {t('budgetDesc')}
                  </p>
                </div>

                {/* 3. Region */}
                <div className="bg-surface border border-outline-variant/25 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                    <Compass size={22} />
                  </div>
                  <h4 className="font-display text-sm font-bold text-on-surface mb-1">
                    {t('regionLabel')}
                  </h4>
                  {/* <span className="text-xs font-semibold text-primary mb-2">
                    {tList(destination.region as any) || destination.region}
                  </span> */}
                  <span className="text-xs font-semibold text-primary mb-2">
                    {t(destination.region as any) || destination.region}
                  </span>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    {t('regionDesc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Attractions grid */}
            <div ref={attractionsRef} id="attractions" className="space-y-6 pt-4 scroll-mt-28">
              <div className="border-b border-outline-variant/20 pb-3">
                <h3 className="font-display text-2xl font-bold text-on-surface">
                  {t('mustSeeAttractions')}
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  {t('attractionsSubtitle')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {destination.attractions.map((attr, idx) => (
                  <div
                    key={idx}
                    className="bg-surface border border-outline-variant/20 rounded-2xl p-5 hover:border-primary/30 transition-all flex gap-4 shadow-sm"
                  >
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                      <Bookmark size={18} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-display text-base font-bold text-on-surface leading-tight">
                        {attr.name[locale as 'en' | 'ar'] || attr.name.en}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {/* <span className="bg-surface-container text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {attr.type}
                        </span> */}
                        <span className="bg-surface-container text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {t(attr.type as any) || attr.type}
                        </span>
                        {/* <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {attr.entryFee === 0 ? t('freeEntry') : `${attr.entryFee} EGP`}
                        </span> */}
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {attr.entryFee === 0
                            ? t('freeEntry')
                            : locale === 'ar'
                              ? `${attr.entryFee} ج.م`
                              : `${attr.entryFee} EGP`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Time & Months Pills */}
            <div ref={bestTimeRef} id="best-time" className="space-y-6 pt-4 scroll-mt-28">
              <div className="border-b border-outline-variant/20 pb-3">
                <h3 className="font-display text-2xl font-bold text-on-surface">
                  {t('bestTimeLabel')}
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  {t('bestTimeDesc')}
                </p>
              </div>

              <div className="bg-surface border border-outline-variant/20 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
                <p className="text-sm font-medium leading-relaxed text-on-surface-variant">
                  {locale === 'ar'
                    ? 'يتميز هذا المقصد السياحي بأوقات محددة تكون فيها درجات الحرارة ممتازة ومثالية لمشاهدة المعالم التاريخية. نوضح أدناه الشهور المفضلة للزيارة:'
                    : 'This tourist destination has specific times of the year when temperature and crowds are highly optimal for sightseeing. Below are the recommended months:'}
                </p>

                {/* Months Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {allMonths.map((m) => {
                    const isActive = destination.bestMonths.some(
                      (bm) => bm.toLowerCase() === m.name.toLowerCase()
                    );
                    return (
                      <div
                        key={m.name}
                        className={`py-3 px-2 rounded-xl text-center text-xs font-bold transition-all border ${isActive
                          ? 'bg-primary text-on-primary border-primary shadow-sm scale-[1.03]'
                          : 'bg-surface-container-low text-on-surface-variant border-transparent opacity-60'
                          }`}
                      >
                        {isAr ? m.labelAr : m.labelEn}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Premium Stays / Nearby Hotels */}
            <div ref={hotelsRef} id="hotels" className="space-y-6 pt-4 scroll-mt-28">
              <div className="border-b border-outline-variant/20 pb-3">
                <h3 className="font-display text-2xl font-bold text-on-surface">
                  {t('premiumStays')}
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  {t('premiumStaysSubtitle')}
                </p>
              </div>

              {hotels.length === 0 ? (
                <div className="bg-surface-container rounded-2xl p-8 text-center text-on-surface-variant text-sm font-medium">
                  {locale === 'ar' ? 'لا توجد فنادق متاحة حالياً.' : 'No premium accommodations available near this location.'}
                </div>
              ) : (
                /* Horizontal Scroll Slider */
                <div className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin">
                  {hotels.map((hotel) => {
                    const hotelName = hotel.name[locale as 'en' | 'ar'] || hotel.name.en;
                    const hotelImg = hotel.coverImage || hotel.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945';

                    return (
                      <article
                        key={hotel._id}
                        className="flex-shrink-0 w-80 bg-surface border border-outline-variant/20 hover:border-primary/20 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all snap-start flex flex-col relative group"
                      >
                        {/* Overlay link */}
                        <Link href={`/${locale}/hotels/${hotel.slug}`} className="absolute inset-0 z-0" />

                        {/* Image */}
                        <div className="h-44 w-full relative overflow-hidden bg-surface-container">
                          <img
                            src={hotelImg}
                            alt={hotelName}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-104"
                            loading="lazy"
                          />
                          {/* Rating badge */}
                          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-on-surface px-2.5 py-1 rounded-md text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                            <Star size={10} className="fill-primary text-primary" />
                            <span>{hotel.stars.toFixed(1)}</span>
                          </div>
                        </div>

                        {/* Cost & Title details */}
                        <div className="p-5 flex-1 flex flex-col justify-between relative z-10 pointer-events-none">
                          <div className="space-y-2">
                            <h4 className="font-display text-base font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                              {hotelName}
                            </h4>
                            <div className="flex items-center gap-1 text-[10px] text-on-surface-variant font-semibold">
                              <MapPin size={11} className="text-primary shrink-0" />
                              <span>{hotel.city}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-5 pt-3 border-t border-outline-variant/10 pointer-events-auto">
                            <div>
                              <span className="text-[10px] font-bold text-primary">
                                {hotel.averagePricePerNight.toLocaleString()} {hotel.currency || 'EGP'}
                              </span>
                              <span className="text-[9px] text-on-surface-variant block">
                                {locale === 'ar' ? '/ ليلة' : '/ night'}
                              </span>
                            </div>

                            <Link
                              href={`/${locale}/hotels/${hotel.slug}`}
                              className="px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold rounded-lg text-[10px] tracking-wide transition-all z-10"
                            >
                              {t('viewDetails')}
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            {/* AI Callout Section */}
            {/* <div className="bg-[#1c1c19] text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-xl text-center space-y-6">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/25 via-transparent to-transparent opacity-60 pointer-events-none" />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-secondary/30 bg-secondary/10 text-secondary-container text-[10px] font-bold uppercase tracking-wider mx-auto">
                <Sparkles size={12} />
                <span>Rahal AI Assistant</span>
              </div>

              <h3 className="font-display text-2xl md:text-4xl font-semibold tracking-tight text-white max-w-lg mx-auto leading-tight">
                {t('planTripTitle', { name })}
              </h3>

              <p className="text-sm text-white/80 max-w-md mx-auto leading-relaxed">
                {t('planTripSubtitle')}
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
                <Link href={`/${locale}/planner?destination=${slug}`}>
                  <Button variant="primary" className="shadow-lg shadow-primary/20 flex items-center gap-2 py-3 px-8 text-on-primary">
                    <span>{t('planTripBtn')}</span>
                    <ArrowRight size={16} />
                  </Button>
                </Link>
                <Link href={`/${locale}/about`}>
                  <Button variant="ghost" className="border border-white/20 text-white hover:bg-white/10 py-3 px-8">
                    {t('learnMore')}
                  </Button>
                </Link>
              </div>
            </div> */}
          </div>

          {/* Right Column Sticky Sidebar (Desktop only) */}
          <div className="hidden lg:col-span-4 lg:block sticky top-36 z-20">
            <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 shadow-md space-y-6">

              <div className="flex items-center gap-2.5 text-secondary">
                <Sparkles size={18} className="animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {t('rahalAiConcierge')}
                </span>
              </div>
              <h4 className="font-display text-lg font-bold text-on-surface leading-tight">
                {locale === 'ar' ? 'جاهز لزيارة هذه الوجهة؟' : 'Ready to Visit this destination?'}
              </h4>

              <p className="text-xs text-on-surface-variant leading-relaxed">
                {locale === 'ar'
                  ? 'دع ذكاءنا الاصطناعي يبني لك رحلة متكاملة تشمل الفنادق والمعالم وخطوط السير المريحة والمطابقة لميزانيتك.'
                  : 'Let our intelligent agent design a detailed itinerary for this location, optimizing logictics, bookings, and timings for your best experience.'}
              </p>

              <Link href={`/${locale}/planner?destination=${slug}`} className="block w-full">
                <Button variant="primary" fullWidth className="py-3.5 shadow flex items-center justify-center gap-2">
                  <span>{t('stickyPlanTrip')}</span>
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STICKY BOTTOM BAR (Mobile only) ─────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur-md border-t border-outline-variant/15 p-4 z-40 flex items-center justify-between shadow-lg">
        <div>
          <span className="text-[10px] text-on-surface-variant font-bold block uppercase tracking-wider">
            {locale === 'ar' ? 'رحلة مخصصة بالذكاء الاصطناعي' : 'AI-POWERED TRIP'}
          </span>
          <span className="font-display text-sm font-bold text-on-surface truncate max-w-[150px] block">
            {name}
          </span>
        </div>

        <Link href={`/${locale}/planner?destination=${slug}`}>
          <Button variant="primary" className="py-2.5 px-5 text-xs flex items-center gap-1.5 text-on-primary">
            <span>{t('stickyPlanTrip')}</span>
            <ArrowRight size={14} />
          </Button>
        </Link>
      </div>
    </main>
  );
}

