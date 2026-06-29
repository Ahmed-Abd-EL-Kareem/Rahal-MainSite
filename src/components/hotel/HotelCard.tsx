'use client';

import React from 'react';
import Link from 'next/link';
import { Star, MapPin, Heart } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { Hotel } from '@/types/hotel';

interface HotelCardProps {
  hotel: Hotel;
  locale: string;
  showAmenities?: boolean;
  showMatchScore?: boolean;
  matchScore?: number;
  matchReason?: string;
  onToggleFavorite: (hotelId: string, e: React.MouseEvent) => void;
  isFavorite: boolean;
}

export default function HotelCard({
  hotel,
  locale,
  showAmenities = true,
  showMatchScore = false,
  matchScore,
  matchReason,
  onToggleFavorite,
  isFavorite,
}: HotelCardProps) {
  const t = useTranslations('hotelListing');
  const hotelName = hotel.name[locale as 'en' | 'ar'] || hotel.name.en;

  return (
    <Card className="group bg-surface-container-lowest rounded-xl border border-outline-variant/25 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Card Image Cover */}
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

        {/* Rahal Choice badge for 5-star */}
        {hotel.stars === 5 && (
          <div className="absolute top-3 left-3 bg-primary text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full shadow-md pointer-events-none">
            {t('rahalChoice')}
          </div>
        )}

        {/* Match score badge (for recommendations) */}
        {showMatchScore && matchScore !== undefined && (
          <div className="absolute bottom-3 left-3 bg-secondary text-white px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1 text-xs font-bold pointer-events-none">
            <Star size={10} className="fill-current" />
            <span>{t('aiMatch', { percent: matchScore })}</span>
          </div>
        )}

        {/* Favorite button */}
        <button
          onClick={(e) => onToggleFavorite(hotel._id, e)}
          className={`absolute top-3 right-3 backdrop-blur-md p-1.5 rounded-full transition-all shadow-md z-10 ${
            isFavorite
              ? "bg-primary text-white hover:bg-primary-container"
              : "bg-white/20 text-white hover:bg-white hover:text-error"
          }`}
          aria-label="Add to favorites"
        >
          <Heart size={14} className={isFavorite ? "fill-white" : ""} />
        </button>
      </div>

      {/* Card Content info */}
      <div className="p-4 flex flex-col flex-1 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <Link href={`/hotels/${hotel.slug}`}>
              <h4 className="font-display text-base font-semibold text-on-surface hover:text-primary transition-colors line-clamp-1 truncate">
                {hotelName}
              </h4>
            </Link>
            <div className="flex items-center gap-1 text-on-surface-variant text-xs font-semibold mt-0.5">
              <MapPin size={10} className="text-primary" />
              <span className="truncate">{hotel.city}</span>
            </div>
          </div>
          <div className="flex items-center gap-0.5 text-primary flex-shrink-0">
            <Star size={12} className="fill-primary" />
            <span className="font-bold text-xs">{hotel.stars.toFixed(1)}</span>
          </div>
        </div>

        {/* Amenities tags or Match insight */}
        {showMatchScore && matchReason ? (
          <div className="space-y-2">
            <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-secondary transition-all duration-1000" style={{ width: `${matchScore}%` }}></div>
            </div>
            <div className="p-2.5 bg-surface-container-low rounded-lg border border-outline-variant/20">
              <div className="flex items-start gap-1.5 text-xs leading-relaxed text-on-surface-variant italic">
                <Star size={11} className="text-primary shrink-0 mt-0.5" />
                <p>{matchReason}</p>
              </div>
            </div>
          </div>
        ) : showAmenities ? (
          <div className="flex flex-wrap gap-1">
            {hotel.amenities.slice(0, 3).map((amenity, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-surface-container text-[9px] font-bold text-on-surface-variant rounded-md">
                {amenity}
              </span>
            ))}
          </div>
        ) : null}

        {/* Starting price & book link - Enhanced layout */}
        <div className="pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-outline-variant/20 mt-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-[9px] font-semibold text-on-surface-variant uppercase tracking-wider">
              {t('startingAt')}
            </span>
            <span className="font-bold text-lg text-on-surface">
              {hotel.averagePricePerNight.toLocaleString()} {hotel.currency || 'EGP'}
              <span className="text-[9px] font-normal text-on-surface-variant ms-1">
                {t('perNight')}
              </span>
            </span>
          </div>
          <Link href={`/hotels/${hotel.slug}`}>
            <Button
              variant="ghost"
              className="w-full sm:w-[200px] px-6 py-2 border border-primary text-primary hover:bg-primary/5 rounded-lg text-sm font-bold active:scale-95 transition-all"
            >
              {t('bookNow')}
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}