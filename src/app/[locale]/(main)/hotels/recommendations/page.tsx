/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Sparkles,
  Grid,
  Map as MapIcon,
  Star,
  MapPin,
  Heart,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Users,
  Target,
  Award,
  RefreshCw,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { hotelsApi } from "@/lib/api/hotels";
import { aiApi } from "@/lib/api/ai";
import { Hotel } from "@/types/hotel";
import HotelCard from '@/components/hotel/HotelCard'
import { getLocaleQueryKey } from '@/lib/hooks/useLocaleQuery';
import { useAuth } from '@/components/providers/AuthProvider';

const HotelsMap = dynamic(() => import("@/components/hotel/HotelsMap"), {
  ssr: false,
});

interface RecommendationHotel {
  name: string;
  matchScore: number;
  price: string;
  reason: string;
  hotelId?: string;
}

export default function HotelRecommendationsPage() {
  const t = useTranslations("hotelRecommendations");
  const locale = useLocale();
  const isAr = locale === "ar";
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const router = useRouter();
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

  // Get tripId from URL params
  const tripId = searchParams.get("tripId");
  const limit = parseInt(searchParams.get("limit") || "4", 10);

  // Storage key for locale persistence
  const STORAGE_KEY = 'rahal_recommendations_results';

  // State
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<RecommendationHotel[]>(
    [],
  );
  const [isMapView, setIsMapView] = useState(false);

  // Favorites — same localStorage pattern used across the hotels/favorites pages
  const [favorites, setFavorites] = useState<string[]>([]);

  // Redirect to trips page if no tripId
  useEffect(() => {
    if (!tripId && typeof window !== 'undefined') {
      router.push(`/${locale}/trips`);
    }
  }, [tripId, locale, router]);

  // Persist results across locale changes
  useEffect(() => {
    if (typeof window !== 'undefined' && tripId) {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${tripId}_${locale}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setRecommendations(parsed.recommendations || []);
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, [locale, tripId]);

  // Save results to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined' && tripId && recommendations.length > 0) {
      localStorage.setItem(`${STORAGE_KEY}_${tripId}_${locale}`, JSON.stringify({
        recommendations,
        timestamp: Date.now(),
      }));
    }
  }, [tripId, locale, recommendations]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rahal_favorites");
      if (saved) {
        try {
          setFavorites(JSON.parse(saved));
        } catch {
          setFavorites([]);
        }
      }
    }
  }, []);

  const toggleFavorite = useCallback((hotelId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(hotelId)
        ? prev.filter((id) => id !== hotelId)
        : [...prev, hotelId];
      if (typeof window !== "undefined") {
        localStorage.setItem("rahal_favorites", JSON.stringify(next));
      }
      return next;
    });
  }, []);

  // Parse structured recommendations from the AI reply.
  // Real replies are markdown ("### 1. **Hotel Name**" then, on the NEXT
  // line, "**Match score:** 85 | **Price:** EGP 11,833 / night"), so the
  // single-line pattern below intentionally falls back to the known-hotel-name
  // scan for the actual multi-line format the backend produces.
  const parseRecommendations = useCallback(
    (replyText: string): RecommendationHotel[] => {
      const results: RecommendationHotel[] = [];

      const pattern1 =
        /(\d+)\.\s*\*\*([^*]+)\*\*\s*\*\*Match score:\*\*\s*(\d+)\s*\|\s*\*\*Price:\*\*\s*([^|]+)/g;
      let match;
      while ((match = pattern1.exec(replyText)) !== null) {
        results.push({
          name: match[2].trim(),
          matchScore: parseInt(match[3], 10),
          price: match[4].trim(),
          reason: "",
        });
      }

      if (results.length === 0) {
        const hotelNames = [
          "Winter Palace",
          "Kempinski",
          "Four Seasons",
          "Sofitel",
          "Hilton",
          "Marriott",
          "Ritz",
          "Oberoi",
          "Mena House",
          "Al Moudira",
          "Nile Ritz",
          "Fairmont",
          "InterContinental",
          "Steigenberger",
          "Jaz",
          "Pickalbatros",
          "Sunrise",
          "Jaz Makadi",
          "Baron Palace",
          "Dahab Paradise",
        ];
        hotelNames.forEach((name) => {
          if (replyText.toLowerCase().includes(name.toLowerCase())) {
            const index = replyText.toLowerCase().indexOf(name.toLowerCase());
            const ctx = replyText.substring(
              Math.max(0, index - 200),
              index + 500,
            );

            // Tolerate markdown asterisks between the label and the value,
            // e.g. "Match score:** 85" — `[:\s*]*` skips over "**" too.
            const scoreMatch = ctx.match(
              /(?:match score|score|rating)[:\s*]*(\d+)/i,
            );
            const priceMatch = ctx.match(
              /(?:price|cost)[:\s*]*((?:EGP|\$)?\s*[\d,]+\s*(?:EGP|\$)?)/i,
            );

            results.push({
              name,
              matchScore: scoreMatch ? parseInt(scoreMatch[1], 10) : 80,
              price: priceMatch ? priceMatch[1].trim() : "Price on request",
              reason: ctx.substring(0, 200).trim(),
            });
          }
        });
      }

      return results.slice(0, limit);
    },
    [limit],
  );

  // Extract hotel names from AI reply. Bold spans that contain a colon are
  // field labels (e.g. "**Match score:**", "**Price:**"), never hotel names —
  // excluding them keeps the candidate list clean.
  const extractHotelNames = useCallback((replyText: string): string[] => {
    const hotelNames: string[] = [];
    const boldMatches = replyText.match(/\*\*([^*]+)\*\*/g);
    if (boldMatches) {
      boldMatches.forEach((m) => {
        const name = m.replace(/\*\*/g, "").trim();
        if (name.length > 3 && name.length < 100 && !name.includes(":")) {
          hotelNames.push(name);
        }
      });
    }
    const egyptianHotels = [
      "Winter Palace",
      "Kempinski",
      "Four Seasons",
      "Sofitel",
      "Hilton",
      "Marriott",
      "Ritz",
      "Oberoi",
      "Mena House",
      "Al Moudira",
      "Nile Ritz",
      "Fairmont",
      "InterContinental",
      "Steigenberger",
      "Jaz",
      "Pickalbatros",
      "Sunrise",
      "Jaz Makadi",
      "Baron Palace",
      "Dahab Paradise",
    ];
    egyptianHotels.forEach((hotel) => {
      if (replyText.toLowerCase().includes(hotel.toLowerCase())) {
        hotelNames.push(hotel);
      }
    });
    return [...new Set(hotelNames)];
  }, []);

  // Fetch recommendations
  const fetchRecommendations = useCallback(async () => {
    if (!tripId) {
      // No trip selected — nothing to fetch, and we must not leave the
      // loading skeleton spinning forever.
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // `tripId` is narrowed to `string` here by the guard above.
      const response = await aiApi.hotelRecommendations({ tripId, limit });
      const replyText = response.data?.reply || "";
      const tokens = response.data?.tokensUsed || 0;

      const parsed = parseRecommendations(replyText);
      setRecommendations(parsed);

      const hotelNames = extractHotelNames(replyText);
      if (hotelNames.length > 0) {
        queryClient.invalidateQueries({
          queryKey: ["recommendation-hotels", hotelNames.join(",")],
        });
      }
    } catch (err) {
      console.error("Recommendations error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load recommendations",
      );
    } finally {
      setIsLoading(false);
    }
  }, [tripId, limit, parseRecommendations, extractHotelNames, queryClient]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Fetch matched hotels for the names mentioned in the AI reply
  const { data: hotelsData, isLoading: hotelsLoading } = useQuery({
    queryKey: getLocaleQueryKey(["recommendation-hotels", recommendations], locale),
    queryFn: async () => {
      const hotelNames = extractHotelNames(recommendations.map(r => r.name).join(" "));
      if (hotelNames.length === 0) return [] as Hotel[];

      const results = await Promise.all(
        hotelNames.map((name) =>
          hotelsApi
            .getHotels({ search: name, limit: 5 })
            .catch(() => ({ data: [] as Hotel[] })),
        ),
      );

      const allHotels = results.flatMap((r) => r.data || []);
      const uniqueHotels = allHotels.filter(
        (hotel, index, self) =>
          index === self.findIndex((h) => h._id === hotel._id),
      );

      return uniqueHotels;
    },
    enabled: recommendations.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const handleRefresh = () => {
    fetchRecommendations();
  };

  return (
    <main className="pt-28 pb-20 bg-background min-h-screen">
      {/* Hero Section - Compact Banner like Hotels page */}
      <section className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop mb-8">
        <div className="relative rounded-xl bg-surface-container-low border border-outline-variant/20 overflow-hidden p-4 md:p-6 shadow-md">
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
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
                {isAr ? (
                  <>
                    توصيات مخصصة لـ{" "}
                    <span className="text-primary italic">رحلتك</span>
                  </>
                ) : (
                  <>
                    Personalized Recommendations for{" "}
                    <span className="text-primary italic">Your Trip</span>
                  </>
                )}
              </h1>

              <p className="text-sm md:text-base text-on-surface-variant max-w-xl mx-auto">
                {t("heroDescription")}
              </p>

              {tripId && (
                <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
                  <Badge variant="outline" className="gap-1">
                    <Target size={12} />
                    <span>{t("tripBased")}</span>
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Users size={12} />
                    <span>{t("personalized")}</span>
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Award size={12} />
                    <span>{t("topMatches")}</span>
                  </Badge>
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-3 mt-4">
                <Button
                  variant="primary"
                  className="gap-2 text-sm px-4 py-2"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw
                    size={16}
                    className={isLoading ? "animate-spin" : ""}
                  />
                  <span>{t("refreshRecommendations")}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Error Display */}
      {error && (
        <section className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop mb-8">
          <div className="bg-error/10 border border-error/20 text-error rounded-xl p-4 flex items-center gap-3">
            <AlertCircle size={20} />
            <span className="text-sm flex-1">{error}</span>
            <Button
              variant="ghost"
              className="text-sm px-4 py-2"
              onClick={fetchRecommendations}
            >
              {t("retry")}
            </Button>
          </div>
        </section>
      )}

      {/* Matched Hotels Section */}
      {!isLoading && hotelsData && hotelsData.length > 0 && (
        <section className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-on-surface uppercase tracking-wider">
                {t("recommendedHotels")}
              </h2>
              <p className="text-xs text-on-surface-variant font-medium mt-1">
                {t("recommendedHotelsSubtitle", { count: hotelsData.length })}
              </p>
            </div>
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

          {isMapView ? (
            <div className="h-[600px] bg-surface-container rounded-2xl border border-outline-variant/20 overflow-hidden relative shadow-sm">
              <HotelsMap hotels={hotelsData} locale={locale} />
            </div>
          ) : hotelsLoading ? (
            <div className="h-96 flex items-center justify-center bg-surface-container-low border border-outline-variant/15 rounded-2xl shadow-sm">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {hotelsData.slice(0, 4).map((hotel) => {
                const hotelName =
                  hotel.name[locale as "en" | "ar"] || hotel.name.en;
                const recommendation = recommendations.find(
                  (r) =>
                    hotelName.toLowerCase().includes(r.name.toLowerCase()) ||
                    r.name.toLowerCase().includes(hotelName.toLowerCase()),
                );
                const matchScore = recommendation?.matchScore ?? 80;
                const isFavorite = favorites.includes(hotel._id);

                return (
                  <HotelCard
                    key={hotel._id}
                    hotel={hotel}
                    locale={locale}
                    showAmenities={true}
                    showMatchScore={true}
                    matchScore={matchScore}
                    onToggleFavorite={toggleFavorite}
                    isFavorite={isFavorite}
                  />
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Empty State — no hotels matched in the hotel catalog */}
      {!isLoading && !error && hotelsData && hotelsData.length === 0 && (
        <section className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop mb-12">
          <div className="py-24 text-center bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-sm">
            <Sparkles className="mx-auto text-outline" size={48} />
            <h3 className="font-display text-xl font-semibold mt-4 text-on-surface">
              {t("noRecommendationsFound")}
            </h3>
            <p className="text-sm text-on-surface-variant max-w-sm mx-auto mt-2">
              {t("noRecommendationsFoundDesc")}
            </p>
            <Button
              variant="primary"
              className="mt-4 gap-2"
              onClick={handleRefresh}
            >
              <RefreshCw size={16} />
              {t("tryAgain")}
            </Button>
          </div>
        </section>
      )}

      {/* Loading State */}
      {isLoading && (
        <section className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6 animate-pulse"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-container-highest" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-3/4 bg-surface-container-highest rounded" />
                    <div className="h-4 w-1/2 bg-surface-container-highest rounded" />
                    <div className="h-4 w-1/3 bg-surface-container-highest rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      {/* <section className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop mt-16">
        <div className="bg-gradient-to-r from-primary via-primary/80 to-secondary rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/5" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
              {t("ctaTitle")}
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
              {t("ctaDescription")}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href={`/${locale}/hotels`}>
                <Button variant="secondary" className="px-8 py-3 text-lg">
                  {t("browseAllHotels")}
                </Button>
              </Link>
              <Link href={`/${locale}/planner`}>
                <Button
                  variant="ghost"
                  className="px-8 py-3 text-lg border-white text-white hover:bg-white/10"
                >
                  {t("planTrip")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section> */}
    </main>
  );
}