"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Destination } from "@/types/destination";

interface NearbyMapProps {
  destinations: Destination[];
  userCoords: { lat: number; lng: number } | null;
  locale: string;
  onMapReady?: (map: L.Map) => void;
}

export default function NearbyMap({
  destinations,
  userCoords,
  locale,
  onMapReady,
}: NearbyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const hasInitialFitRef = useRef<boolean>(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });

    const map = L.map(mapRef.current, {
      zoomControl: false,
      scrollWheelZoom: false,
    }).setView([26.8206, 30.8025], 6);

    if (typeof onMapReady === "function") onMapReady(map);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
        subdomains: "abcd",
        maxZoom: 20,
      },
    ).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (userMarkerRef.current) userMarkerRef.current.remove();

    const goldIcon = L.divIcon({
      html: `
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-[#7e5700]/30 border-2 border-[#7e5700] shadow-lg relative">
          <div class="w-2.5 h-2.5 bg-[#7e5700] rounded-full border border-white"></div>
        </div>
      `,
      className: "custom-map-marker-gold",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });

    const userIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute w-6 h-6 bg-[#366286]/30 rounded-full animate-ping"></div>
          <div class="w-4 h-4 bg-[#366286] rounded-full border-2 border-white shadow-md"></div>
        </div>
      `,
      className: "custom-user-marker",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    if (userCoords) {
      const marker = L.marker([userCoords.lat, userCoords.lng], {
        icon: userIcon,
      }).addTo(map);
      const userText = locale === "ar" ? "موقعك الحالي" : "Your Location";
      marker.bindPopup(
        `<strong class="text-xs text-secondary font-bold">${userText}</strong>`,
      );
      userMarkerRef.current = marker;
    }

    destinations.forEach((destination) => {
      if (!destination.location || !destination.location.coordinates) return;
      const [lng, lat] = destination.location.coordinates;
      const destinationName =
        destination.name[locale as "en" | "ar"] || destination.name.en;
      const cover =
        destination.coverImage ||
        destination.images[0] ||
        "https://images.unsplash.com/photo-1539650116574-8efeb43e2750";
      const exploreText = locale === "ar" ? "استكشف" : "Explore";

      let distanceText = "";
      if (userCoords) {
        const d =
          map.distance([userCoords.lat, userCoords.lng], [lat, lng]) / 1000;
        distanceText =
          locale === "ar"
            ? `على بعد ${d.toFixed(1)} كم`
            : `${d.toFixed(1)} km away`;
      } else {
        distanceText = destination.city;
      }

      const popupHtml = `
        <div class="w-44 font-sans p-1 rounded-lg flex flex-col gap-2 bg-surface text-on-surface">
          <div class="h-20 w-full rounded overflow-hidden">
            <img src="${cover}" class="w-full h-full object-cover" style="height: 80px; width: 100%; object-fit: cover;" alt="${destinationName}" />
          </div>
          <div class="flex flex-col gap-0.5 px-0.5 font-body">
            <h4 class="font-display font-bold text-xs line-clamp-1" style="color: #7e5700; margin: 0; font-size: 12px;">${destinationName}</h4>
            <span class="text-[9px] text-on-surface-variant font-semibold block mb-1">${distanceText}</span>
            <a href="/${locale}/destinations/${destination.slug}" class="text-[9px] font-bold text-center py-1 rounded bg-[#7e5700] text-white hover:bg-[#c8922a] transition-all" style="color: #ffffff; text-decoration: none; display: block; width: 100%; text-align: center;">${exploreText}</a>
          </div>
        </div>
      `;

      const marker = L.marker([lat, lng], { icon: goldIcon }).addTo(map);
      marker.bindPopup(popupHtml);
      markersRef.current.push(marker);
    });

    if (!hasInitialFitRef.current && destinations.length > 0) {
      const points: L.LatLngExpression[] = destinations.map((d) => [
        d.location.coordinates[1],
        d.location.coordinates[0],
      ]);
      if (userCoords) {
        points.push([userCoords.lat, userCoords.lng]);
      }
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
      hasInitialFitRef.current = true;
    } else if (
      !hasInitialFitRef.current &&
      userCoords &&
      destinations.length === 0
    ) {
      map.setView([userCoords.lat, userCoords.lng], 10);
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [destinations, userCoords, locale]);

  return <div ref={mapRef} className="w-full h-full" style={{ zIndex: 10 }} />;
}
