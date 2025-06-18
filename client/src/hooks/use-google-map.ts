import { useEffect, useRef, useState } from "react";
import { initializeGoogleMaps } from "@/lib/map-loader";

interface UseGoogleMapProps {
  center: { lat: number; lng: number };
  zoom: number;
  onPositionChange: (position: { lat: number; lng: number }) => void;
}

export function useGoogleMap({ center, zoom, onPositionChange }: UseGoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerElements, setMarkerElements] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadMap = async () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error('Google Maps API key not configured');
        return;
      }

      try {
        await initializeGoogleMaps();
        initializeMap();
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.google) return;

      try {
        const mapConfig: google.maps.MapOptions = {
          center,
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: false,
          gestureHandling: 'cooperative',
        };

        // Use Map ID if available for AdvancedMarkerElement support
        const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;
        if (mapId) {
          mapConfig.mapId = mapId;
        }

        const newMap = new window.google.maps.Map(mapRef.current, mapConfig);

        // Create center marker with AdvancedMarkerElement
        if (window.google.maps.marker?.AdvancedMarkerElement) {
          const markerContent = document.createElement('div');
          markerContent.style.cssText = `
            width: 16px;
            height: 16px;
            background-color: #3b82f6;
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          `;

          const centerMarker = new window.google.maps.marker.AdvancedMarkerElement({
            position: center,
            map: newMap,
            title: "現在位置",
            content: markerContent
          });

          setMarkerElements([centerMarker]);
        }

        // Add click listener
        newMap.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            onPositionChange({
              lat: e.latLng.lat(),
              lng: e.latLng.lng()
            });
          }
        });

        setMap(newMap);
        setIsLoaded(true);
      } catch (error) {
        console.error('Google Maps initialization failed:', error);
      }
    };

    loadMap();
  }, []);

  // Update map center and markers when position changes
  useEffect(() => {
    if (map && isLoaded) {
      map.setCenter(center);
      
      // Update marker positions
      markerElements.forEach(marker => {
        if (marker.title === "現在位置") {
          marker.position = center;
        }
      });
    }
  }, [map, center, markerElements, isLoaded]);

  return {
    mapRef,
    map,
    isLoaded
  };
}