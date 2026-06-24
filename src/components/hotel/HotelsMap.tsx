'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Hotel } from '@/types/hotel';

interface HotelsMapProps {
  hotels: Hotel[];
  locale: string;
}

export default function HotelsMap({ hotels, locale }: HotelsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up default Leaflet icon settings to avoid Next.js image packaging issues
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });

    // Initialize map if not already done
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView([26.8206, 30.8025], 6); // Default center on Egypt

      // Premium CartoDB Voyager style
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Custom Pharaoh Gold marker icon
    const goldIcon = L.divIcon({
      html: `
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-[#7e5700]/20 border border-[#7e5700] shadow-md relative">
          <div class="w-3.5 h-3.5 bg-[#7e5700] rounded-full border border-white"></div>
        </div>
      `,
      className: 'custom-map-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });

    // Add markers for current hotels
    hotels.forEach(hotel => {
      if (!hotel.location || !hotel.location.coordinates) return;
      const [lng, lat] = hotel.location.coordinates;

      const hotelName = hotel.name[locale as 'en' | 'ar'] || hotel.name.en;
      const hotelCover = hotel.coverImage || hotel.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945';
      
      const popupHtml = `
        <div class="w-48 font-sans p-1 rounded-lg overflow-hidden flex flex-col gap-2 bg-surface text-on-surface">
          <div class="h-24 w-full relative rounded-md overflow-hidden bg-surface-container-low" style="margin-bottom: 4px;">
            <img src="${hotelCover}" class="w-full h-full object-cover" style="height: 96px; width: 100%; object-fit: cover; border-radius: 4px;" alt="${hotelName}" />
          </div>
          <div class="flex flex-col gap-0.5 px-1">
            <h4 class="font-bold text-xs line-clamp-1" style="color: #7e5700; margin: 0; font-size: 13px; font-weight: 700;">${hotelName}</h4>
            <span class="text-[10px] text-on-surface-variant font-medium">${hotel.city}</span>
            <div class="flex justify-between items-center mt-1 pt-1 border-t border-outline-variant/10" style="border-top: 1px solid rgba(0,0,0,0.06); padding-top: 4px; display: flex; justify-content: space-between; align-items: center;">
              <span class="font-bold text-xs" style="font-size: 11px;">${hotel.averagePricePerNight.toLocaleString()} ${hotel.currency || 'EGP'}</span>
              <a href="/${locale}/hotels/${hotel.slug}" class="text-[10px] font-bold" style="color: #7e5700; text-decoration: underline; font-weight: 700;">View details</a>
            </div>
          </div>
        </div>
      `;

      const marker = L.marker([lat, lng], { icon: goldIcon }).addTo(map);
      marker.bindPopup(popupHtml);
      markersRef.current.push(marker);
    });

    // Fit map bounds to show all markers
    if (hotels.length > 0) {
      const bounds = L.latLngBounds(
        hotels.map(h => [h.location.coordinates[1], h.location.coordinates[0]])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    // Cleanup function
    return () => {
      // We don't remove the map instance on simple prop updates, only on complete unmount
    };
  }, [hotels, locale]);

  // Complete cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-2xl" 
      style={{ minHeight: '600px', zIndex: 10 }} 
    />
  );
}
