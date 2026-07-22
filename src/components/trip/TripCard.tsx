"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Sparkles, Trash2, ArrowRight, Loader2, Hotel } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { tripsApi } from "@/lib/api/trips";
import { Trip } from "@/types/trip";

interface TripCardProps {
  trip: Trip;
  locale: "en" | "ar";
  t: {
    title: string;
    subtitle: string;
    newTrip: string;
    search: string;
    empty: string;
    resumePlanning: string;
    viewDetails: string;
    aiGenerated: string;
    travelers: string;
    nights: string;
    loading: string;
    errorLoad: string;
    delete: string;
    aiHotels: string;
    budget: { budget: string; "mid-range": string; luxury: string };
    details: string;
  };
  onDelete: (id: string) => void;
}

function localize(value: unknown, locale: "en" | "ar"): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") {
    const obj = value as Record<string, string>;
    return obj[locale] ?? obj.en ?? Object.values(obj)[0] ?? "";
  }
  return String(value);
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TripCard({ trip, locale, t, onDelete }: TripCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = React.useState(false);

  const title = localize(trip.title, locale);
  const destination = localize(trip.destination, locale);
  const summary = localize(trip.summary, locale);
  const budgetRaw = localize(trip.budget, locale) || (typeof trip.budget === "string" ? trip.budget : "");
  const budgetKey = (typeof trip.budget === "string" ? trip.budget : localize(trip.budget, "en")) as keyof typeof t.budget;

  const budgetVariant =
    budgetKey === "luxury"
      ? "bg-tertiary/10 text-tertiary border-tertiary/20"
      : budgetKey === "mid-range"
      ? "bg-primary/10 text-primary border-primary/20"
      : "bg-success/10 text-success border-success/20";

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await tripsApi.deleteTrip(trip._id);
      onDelete(trip._id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Link
      href={`/trips/${trip._id}`}
      className="group bg-surface-container-lowest rounded-2xl border border-outline-variant/25 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full min-w-0"
    >
      {/* Image Cover - 16:9 aspect */}
      <div className="relative w-full aspect-video overflow-hidden bg-surface-container group/img shrink-0">
        <Image
          src={
            trip.imageUrl ||
            "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80"
          }
          alt={title}
          fill
          className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* AI Generated Badge */}
        {trip.isAIGenerated && (
          <span className="absolute top-3 left-3 flex items-center gap-1 bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
            <Sparkles size={10} />
            {t.aiGenerated}
          </span>
        )}

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDelete();
          }}
          disabled={deleting}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={t.delete}
        >
          {deleting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Trash2 size={14} />
          )}
        </button>
      </div>

      {/* Card Content */}
      <div className="flex-1 flex flex-col p-4 space-y-3">
        {/* Destination + Title */}
        <div className="flex items-start gap-2">
          <MapPin className="text-primary shrink-0 mt-0.5" size={14} />
          <h3 className="font-display text-base font-bold text-on-surface line-clamp-1 flex-1 min-w-0">
            {title}
          </h3>
        </div>
        <p className="text-sm text-on-surface-variant line-clamp-1">{destination}</p>

        {/* Meta Chips */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className={cn("px-2 py-0.5 rounded-full border font-medium", "bg-surface-container text-on-surface-variant border-outline-variant/30")}>
            {trip.duration} {t.nights}
          </span>
          <span className={cn("px-2 py-0.5 rounded-full border font-medium", "bg-surface-container text-on-surface-variant border-outline-variant/30")}>
            {trip.travelers} {t.travelers}
          </span>
          <span className={cn("px-2 py-0.5 rounded-full border font-medium", budgetVariant)}>
            {t.budget[budgetKey] ?? budgetRaw}
          </span>
        </div>

        {/* Summary */}
        {summary && (
          <p className="text-xs text-on-surface-variant line-clamp-2 flex-1">{summary}</p>
        )}

        {/* Footer Actions */}
        <div className="mt-auto flex flex-col gap-2 pt-2 border-t border-outline-variant/15">
          {/* Details Button - Full Width */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/trips/${trip._id}`);
            }}
            className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary hover:bg-primary/90 transition-colors rounded-xl py-2.5 font-bold text-sm shadow-sm"
          >
            <span>{t.details}</span>
            <ArrowRight size={14} className="shrink-0" />
          </button>

          {/* AI Hotel Recommendations Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/hotels/recommendations?tripId=${trip._id}`);
            }}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-tertiary bg-tertiary/10 hover:bg-tertiary/20 border border-tertiary/20 transition-colors rounded-lg py-2"
          >
            <Hotel size={12} className="shrink-0" />
            <span>{t.aiHotels}</span>
          </button>
        </div>
      </div>
    </Link>
  );
}