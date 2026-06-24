'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface HotelMapProps {
  latitude: number;
  longitude: number;
  hotelName: string;
}

export default function HotelMap({ latitude, longitude, hotelName }: HotelMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

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
        scrollWheelZoom: false, // Prevent accidental scrolling when browsing details
      }).setView([latitude, longitude], 15);

      // Add a premium, sand-matching clean map tile style from CartoDB (Voyager style)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      // Create a marker with a customized popup
      const marker = L.marker([latitude, longitude]).addTo(map);
      marker.bindPopup(`
        <div class="p-1 font-sans text-xs" style="text-align: center;">
          <h4 class="font-bold text-primary" style="margin: 0 0 4px; color: #7e5700; font-size: 13px;">${hotelName}</h4>
          <span style="color: #504536; font-weight: 500;">Sanctuary Location</span>
        </div>
      `).openPopup();

      mapInstanceRef.current = map;
    } else {
      // Re-center map if coordinates change dynamically
      mapInstanceRef.current.setView([latitude, longitude], 15);
    }

    // Cleanup function on component unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, hotelName]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-2xl" 
      style={{ minHeight: '320px', zIndex: 10 }} 
    />
  );
}
