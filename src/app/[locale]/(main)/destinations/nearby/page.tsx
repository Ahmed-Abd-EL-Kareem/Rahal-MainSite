'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Navigation, Sparkles, Star, Heart, ChevronDown, AlertCircle, LocateFixed, Plus, Minus } from 'lucide-react';
import Button from '@/components/ui/Button';
import { destinationsApi } from '@/lib/api/destinations';

// SSR-safe Leaflet map
const NearbyMap = dynamic(() => import('@/components/destination/NearbyMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  ),
});

type LocationStatus = 'idle' | 'locating' | 'granted' | 'denied';

const categories = [
  { id: 'all', labelEn: 'All Types', labelAr: 'جميع الفئات' },
  { id: 'historical', labelEn: 'History', labelAr: 'تاريخي' },
  { id: 'beach', labelEn: 'Beach', labelAr: 'شاطئي' },
  { id: 'adventure', labelEn: 'Adventure', labelAr: 'مغامرة' },
  { id: 'cultural', labelEn: 'Culture', labelAr: 'ثقافي' },
  { id: 'religious', labelEn: 'Religious', labelAr: 'ديني' },
  { id: 'nature', labelEn: 'Nature', labelAr: 'طبيعة' },
];

// Haversine distance in km
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function NearbyDestinationsPage() {
  const t = useTranslations('nearbyDestinations');
  const tList = useTranslations('destinationsListing');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const [status, setStatus] = useState<LocationStatus>('idle');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [cityName, setCityName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Hydrate favorites from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('rahal_favorites_destinations');
      if (saved) setFavorites(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const next = favorites.includes(id)
      ? favorites.filter(f => f !== id)
      : [...favorites, id];
    setFavorites(next);
    try { localStorage.setItem('rahal_favorites_destinations', JSON.stringify(next)); } catch { /* ignore */ }
  };

  // GPS handler — only entry point for fetching
  const handleEnableLocation = () => {
    if (typeof window === 'undefined' || !navigator?.geolocation) {
      setStatus('denied');
      setErrorMsg(isAr ? 'المتصفح لا يدعم تحديد الموقع الجغرافي.' : 'Geolocation is not supported by your browser.');
      return;
    }
    setStatus('locating');
    setErrorMsg('');
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const lat = coords.latitude;
        const lng = coords.longitude;
        setUserCoords({ lat, lng });
        setStatus('granted');

        // ── Reverse geocode with Nominatim (OSM, no API key needed) ──
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${locale}`,
            { headers: { 'Accept-Language': locale } },
          );
          if (res.ok) {
            const json = await res.json();
            const addr = json.address || {};
            // Prioritize governorate / state name over specific city/town district
            const city =
              addr.state ||
              addr.governorate ||
              addr.county ||
              addr.city ||
              addr.town ||
              addr.village ||
              addr.municipality ||
              '';
            setCityName(city);
          }
        } catch {
          // Silently fall back to coords if reverse geocoding fails
          setCityName(`${lat.toFixed(3)}, ${lng.toFixed(3)}`);
        }
      },
      (err) => {
        setStatus('denied');
        setErrorMsg(
          err.code === 1
            ? (isAr
              ? 'رفضت الإذن بالوصول إلى موقعك. يرجى السماح بالوصول من إعدادات المتصفح ثم المحاولة مجدداً.'
              : 'Location access was denied. Please allow location access in your browser settings and try again.')
            : (isAr
              ? 'تعذر تحديد موقعك الحالي. تأكد من تشغيل خدمات الموقع ثم أعد المحاولة.'
              : 'Unable to determine your location. Make sure location services are enabled and try again.')
        );
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  // ── Only fetch AFTER GPS is granted ───────────────────────────────
  const { data: nearbyData, isLoading: isFetching } = useQuery({
    queryKey: ['nearby-destinations', userCoords],
    queryFn: async () => {
      if (!userCoords) return [];
      const res = await destinationsApi.getNearbyDestinations({
        lng: userCoords.lng,
        lat: userCoords.lat,
        maxKm: 200,
        limit: 10,
      });
      return res?.data || [];
    },
    enabled: status === 'granted' && !!userCoords,
  });

  const rawDestinations = nearbyData || [];
  const filteredDestinations = rawDestinations.filter(d =>
    selectedCategory === 'all' || d.category.toLowerCase() === selectedCategory
  );

  // Dynamic AI tip text
  const aiTip = (() => {
    if (status !== 'granted' || filteredDestinations.length === 0) {
      return isAr
        ? 'قم بتفعيل ميزة الموقع للحصول على اقتراحات ذكية حول المعالم الأثرية والمطاعم القريبة منك.'
        : 'Enable location tracking to get smart suggestions about nearby historical sites and local experiences.';
    }
    const nearest = filteredDestinations[0];
    const dist = haversine(
      userCoords!.lat, userCoords!.lng,
      nearest.location.coordinates[1], nearest.location.coordinates[0],
    );
    const name = nearest.name[locale as 'en' | 'ar'] || nearest.name.en;
    return isAr
      ? `${name} يقع على بعد ${dist.toFixed(1)} كم فقط، وهو أقل ازدحاماً بين الساعة 4:00 و 5:30 مساءً اليوم.`
      : `${name} is only ${dist.toFixed(1)} km away and is least crowded between 4:00 PM and 5:30 PM today.`;
  })();

  // Location badge label — uses real reverse-geocoded city, never the nearest destination's city
  const locationLabel = (() => {
    if (status === 'idle') return isAr ? 'في انتظار تحديد الموقع...' : 'Waiting for location...';
    if (status === 'locating') return isAr ? 'جاري التحديد...' : 'Locating...';
    if (status === 'denied') return isAr ? 'تعذر تحديد الموقع' : 'Location unavailable';
    // Show reverse-geocoded city name; fall back to raw coords while Nominatim is still loading
    if (cityName) return cityName;
    return `${userCoords!.lat.toFixed(3)}, ${userCoords!.lng.toFixed(3)}`;
  })();

  return (
    <main className="pt-28 pb-20 bg-background min-h-screen font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">


          {/* ── LEFT COLUMN ────────────────────────────────────────────── */}
          <div className="lg:col-span-5 space-y-8">

            {/* Heading */}
            <div className="space-y-4">
              <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-on-surface">
                {t('title')}
              </h1>
              <p className="font-body text-sm md:text-base text-on-surface-variant leading-relaxed">
                {t('subtitle')}
              </p>
            </div>

            {/* Enable Location + Category filter */}
            <div className="flex flex-wrap items-center gap-4 relative z-30">
              <Button
                variant={status === 'granted' ? 'secondary' : 'primary'}
                onClick={handleEnableLocation}
                disabled={status === 'locating' || status === 'granted'}
                className="py-3 px-6 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                {status === 'granted'
                  ? <LocateFixed size={14} />
                  : <Navigation size={14} className={status === 'locating' ? 'animate-spin' : ''} />
                }
                <span>
                  {status === 'locating' && (isAr ? 'جاري التحديد...' : 'Locating...')}
                  {status === 'granted' && (isAr ? 'تم تحديد الموقع ✓' : 'Location Active ✓')}
                  {(status === 'idle' || status === 'denied') && t('enableLocation')}
                </span>
              </Button>

              {/* Category dropdown — only shown after GPS is granted */}
              {status === 'granted' && (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 px-5 py-3 border border-outline-variant/30 hover:border-primary/45 rounded-lg bg-surface text-on-surface text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <span>
                      {isAr
                        ? categories.find(c => c.id === selectedCategory)?.labelAr
                        : categories.find(c => c.id === selectedCategory)?.labelEn}
                    </span>
                    <ChevronDown size={14} className="text-on-surface-variant" />
                  </button>

                  {showDropdown && (
                    <div className="absolute top-full mt-2 w-44 bg-surface border border-outline-variant/20 rounded-xl shadow-xl z-50 py-2">
                      {categories.map(c => (
                        <button
                          key={c.id}
                          onClick={() => { setSelectedCategory(c.id); setShowDropdown(false); }}
                          className={`w-full px-4 py-2.5 text-xs font-semibold hover:bg-surface-container transition-all cursor-pointer ${selectedCategory === c.id ? 'text-primary font-bold bg-primary/5' : 'text-on-surface-variant'
                            } ${isAr ? 'text-right' : 'text-left'}`}
                        >
                          {isAr ? c.labelAr : c.labelEn}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* GPS denied error banner */}
            {status === 'denied' && (
              <div className="flex items-start gap-3 p-4 bg-error-container/20 border border-error/20 rounded-2xl text-error shadow-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold">{isAr ? 'لا يمكن تحديد موقعك' : 'Location access unavailable'}</p>
                  <p className="text-[11px] leading-relaxed opacity-90">{errorMsg}</p>
                  <button
                    onClick={handleEnableLocation}
                    className="text-[11px] font-bold underline decoration-dotted hover:opacity-80 cursor-pointer mt-1"
                  >
                    {isAr ? 'حاول مجدداً' : 'Try again'}
                  </button>
                </div>
              </div>
            )}

            {/* AI Tip widget */}
            <div className="bg-secondary/5 rounded-2xl p-6 border border-secondary/10 flex gap-4 shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-on-secondary-container rounded-full flex items-center justify-center flex-shrink-0 text-white shadow">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="font-display text-base font-bold text-secondary mb-1">
                  {t('aiTipTitle')}
                </h4>
                <p className="text-on-surface-variant text-sm font-medium italic leading-relaxed">
                  {aiTip}
                </p>
              </div>
            </div>

            {/* ── Destination list / empty states ─────────────────────── */}
            <div className="space-y-6">

              {/* IDLE: user has not clicked Enable Location yet */}
              {status === 'idle' && (
                <div className="py-14 text-center bg-surface-container-low border border-dashed border-outline-variant/30 rounded-2xl shadow-inner space-y-4">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                    <Navigation size={28} />
                  </div>
                  <h3 className="font-display text-base font-bold text-on-surface">
                    {isAr ? 'اكتشف ما هو قريب منك' : 'Enable your location to discover nearby destinations'}
                  </h3>
                  <p className="text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed">
                    {isAr
                      ? 'اضغط على "تفعيل تحديد الموقع" أعلاه للسماح لنا بإيجاد الوجهات القريبة منك.'
                      : 'Click "Enable Location" above to allow us to find destinations and hidden gems near you.'}
                  </p>
                </div>
              )}

              {/* LOCATING: GPS in progress */}
              {status === 'locating' && (
                <div className="py-14 text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <LocateFixed size={28} className="text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-on-surface-variant">
                    {isAr ? 'جاري تحديد موقعك...' : 'Detecting your location...'}
                  </p>
                </div>
              )}

              {/* DENIED: show a retry prompt (no list) */}
              {status === 'denied' && (
                <div className="py-12 text-center bg-surface-container-low border border-outline-variant/15 rounded-2xl shadow-sm space-y-3">
                  <AlertCircle className="mx-auto text-error" size={40} />
                  <h3 className="font-display text-base font-bold text-on-surface">
                    {isAr ? 'تعذر تحديد الموقع' : 'Location unavailable'}
                  </h3>
                  <p className="text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed">
                    {isAr
                      ? 'يرجى السماح بالوصول إلى موقعك من إعدادات المتصفح ثم اضغط "حاول مجدداً".'
                      : 'Please allow location access from your browser settings, then click "Try again".'}
                  </p>
                </div>
              )}

              {/* GRANTED — loading skeleton */}
              {status === 'granted' && isFetching && (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-surface rounded-2xl border border-outline-variant/25 h-36 animate-pulse p-4 flex gap-4">
                    <div className="w-28 h-full bg-surface-container rounded-xl" />
                    <div className="flex-1 space-y-2 py-2">
                      <div className="h-4 bg-surface-container rounded w-3/4" />
                      <div className="h-3 bg-surface-container rounded w-1/2" />
                      <div className="h-3 bg-surface-container rounded w-full" />
                    </div>
                  </div>
                ))
              )}

              {/* GRANTED — empty results */}
              {status === 'granted' && !isFetching && filteredDestinations.length === 0 && (
                <div className="py-12 text-center bg-surface-container-low border border-outline-variant/15 rounded-2xl shadow-sm space-y-3">
                  <MapPin className="mx-auto text-outline" size={40} />
                  <h3 className="font-display text-base font-bold text-on-surface">
                    {isAr ? 'لا توجد وجهات قريبة' : 'No nearby destinations found'}
                  </h3>
                  <p className="text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed">
                    {isAr
                      ? 'جرب تغيير فئة التصفية أو توسيع نطاق البحث.'
                      : 'Try a different category filter or broaden your search radius.'}
                  </p>
                </div>
              )}

              {/* GRANTED — destination cards */}
              {status === 'granted' && !isFetching && filteredDestinations.map((destination) => {
                const destName = destination.name[locale as 'en' | 'ar'] || destination.name.en;
                const destDesc = destination.description[locale as 'en' | 'ar'] || destination.description.en;
                const destImg = destination.coverImage || destination.images[0] || 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750';
                const isFav = favorites.includes(destination._id);
                const dist = haversine(
                  userCoords!.lat, userCoords!.lng,
                  destination.location.coordinates[1], destination.location.coordinates[0],
                );

                return (
                  <article
                    key={destination._id}
                    className="group bg-surface hover:bg-surface-container-lowest border border-outline-variant/20 hover:border-primary/25 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex h-40 relative duration-300"
                  >
                    <Link href={`/${locale}/destinations/${destination.slug}`} className="absolute inset-0 z-0" />

                    {/* Cover image + distance badge */}
                    <div className="w-1/3 h-full relative overflow-hidden bg-surface-container shrink-0">
                      <img
                        src={destImg}
                        alt={destName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className={`absolute top-3 ${isAr ? 'right-3' : 'left-3'} bg-secondary text-white font-bold text-[9px] px-2 py-0.5 rounded-full shadow-sm`}>
                        {isAr ? `${dist.toFixed(1)} كم` : `${dist.toFixed(1)} km`}
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-4 flex-1 flex flex-col justify-between relative z-10 pointer-events-none">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[9px] font-bold text-on-surface-variant tracking-wider uppercase">
                          <span>{tList(destination.category as any) || destination.category}</span>

                        </div>
                        <h3 className="font-display text-base font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                          {destName}
                        </h3>
                        <p className="font-body text-[11px] text-on-surface-variant leading-relaxed line-clamp-2">
                          {destDesc}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <span className="bg-surface-container text-on-surface-variant text-[9px] font-bold px-2 py-0.5 rounded-full">
                          {tList(destination.category as any) || destination.category}
                        </span>
                      </div>
                    </div>

                    {/* Favorite button */}

                    <button
                      onClick={(e) => toggleFavorite(destination._id, e)}
                      className={`absolute top-3 ${isAr ? 'left-3' : 'right-3'} z-20 p-2 rounded-full backdrop-blur-md shadow-md cursor-pointer transition-all ${isFav
                        ? 'bg-primary text-white hover:bg-primary-container'
                        : 'bg-black/10 text-on-surface-variant hover:bg-black/20 hover:text-error'
                        }`}
                    >
                      <Heart size={14} className={isFav ? 'fill-white' : ''} />
                    </button>
                  </article>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT COLUMN — Circular sticky map ────────────────────── */}
          <div className="lg:col-span-7 lg:sticky lg:top-36 z-20 space-y-4 relative">
            {/* Custom zoom controls positioned bottom‑right outside the circle */}
            <div className="absolute -bottom-12 right-0 flex flex-col gap-1 z-10">
              <button
                onClick={() => {
                  // @ts-ignore – invoke Leaflet map method via global reference
                  const map = (window as any).nearbyMapInstance;
                  if (map) map.zoomIn();
                }}
                className="w-8 h-8 flex items-center justify-center bg-surface border border-outline-variant rounded-full shadow-sm hover:bg-surface-container-low"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={() => {
                  const map = (window as any).nearbyMapInstance;
                  if (map) map.zoomOut();
                }}
                className="w-8 h-8 flex items-center justify-center bg-surface border border-outline-variant rounded-full shadow-sm hover:bg-surface-container-low"
              >
                <Minus size={16} />
              </button>
            </div>

            {/* Location badge above map */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 bg-surface border border-outline-variant/30 rounded-2xl py-2 px-5 shadow-sm max-w-sm">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${status === 'granted' ? 'bg-[#3a7c52] animate-pulse' : 'bg-outline-variant'
                  }`} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-outline shrink-0">
                  {t('yourLocation')}:
                </span>
                <span className="text-xs font-bold text-on-surface truncate max-w-[200px]">
                  {locationLabel}
                </span>
              </div>
            </div>

            {/* Circular map container */}
            <div className="w-full max-w-[400px] md:max-w-[480px] lg:max-w-[550px] aspect-square mx-auto rounded-full overflow-hidden border-4 border-outline-variant/25 shadow-2xl relative bg-surface-container-low">
              <NearbyMap
                destinations={status === 'granted' ? filteredDestinations : []}
                userCoords={userCoords}
                locale={locale}
                // expose the map instance globally for zoom buttons
                onMapReady={(map) => { (window as any).nearbyMapInstance = map; }}
              />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
