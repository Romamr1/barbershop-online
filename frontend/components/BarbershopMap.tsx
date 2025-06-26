'use client';

import { useEffect, useRef, useState } from 'react';
import { Barbershop } from '@/types';

interface BarbershopMapProps {
  barbershops: Barbershop[];
}

declare global {
  interface Window {
    google: any;
  }
}

export default function BarbershopMap({ barbershops }: BarbershopMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  useEffect(() => {
    // Load Google Maps API
    const loadGoogleMaps = () => {
      if (window.google) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // New York default
    
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 12,
      styles: [
        {
          featureType: 'all',
          elementType: 'geometry',
          stylers: [{ color: '#242f3e' }]
        },
        {
          featureType: 'all',
          elementType: 'labels.text.stroke',
          stylers: [{ color: '#242f3e' }]
        },
        {
          featureType: 'all',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#746855' }]
        },
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }]
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{ color: '#263c3f' }]
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#6b9a76' }]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#38414e' }]
        },
        {
          featureType: 'road',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#212a37' }]
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#9ca5b3' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{ color: '#746855' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#1f2835' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#f3d19c' }]
        },
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [{ color: '#2f3948' }]
        },
        {
          featureType: 'transit.station',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }]
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#17263c' }]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#515c6d' }]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.stroke',
          stylers: [{ color: '#17263c' }]
        }
      ]
    });

    setMap(mapInstance);
  };

  useEffect(() => {
    if (!map || barbershops.length === 0) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    const bounds = new window.google.maps.LatLngBounds();
    const newMarkers: any[] = [];

    barbershops.forEach((barbershop) => {
      const position = { lat: barbershop.latitude, lng: barbershop.longitude };
      
      const marker = new window.google.maps.Marker({
        position,
        map,
        title: barbershop.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="#f2751a"/>
              <path d="M8 12h16v8H8z" fill="white"/>
              <path d="M12 8h8v4h-8z" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16)
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="color: #000; padding: 8px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${barbershop.name}</h3>
            <p style="margin: 0 0 4px 0; font-size: 14px;">${barbershop.address}</p>
            <p style="margin: 0 0 4px 0; font-size: 14px;">Rating: ${barbershop.rating}/5</p>
            <p style="margin: 0; font-size: 14px;">Type: ${barbershop.type}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      newMarkers.push(marker);
      bounds.extend(position);
    });

    setMarkers(newMarkers);

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      map.fitBounds(bounds);
      
      // If only one marker, set a reasonable zoom level
      if (newMarkers.length === 1) {
        map.setZoom(15);
      }
    }
  }, [map, barbershops]);

  return (
    <div className="card">
      <div className="p-4 border-b border-primary-700">
        <h3 className="text-lg font-semibold text-white">
          Barbershop Locations ({barbershops.length})
        </h3>
      </div>
      <div ref={mapRef} className="map-container" />
    </div>
  );
} 