import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { calculateEndpoint } from "@/lib/feng-shui-calculations";

interface DirectionLinesProps {
  center: { lat: number; lng: number };
  showPrimaryDirections: boolean;
  showSecondaryDirections: boolean;
  radius: number;
}

const directions = {
  primary: [
    { name: '北', angle: 0, color: '#1976D2' },
    { name: '東', angle: 90, color: '#1976D2' },
    { name: '南', angle: 180, color: '#1976D2' },
    { name: '西', angle: 270, color: '#1976D2' }
  ],
  secondary: [
    { name: '北東', angle: 45, color: '#FF6B35' },
    { name: '南東', angle: 135, color: '#FF6B35' },
    { name: '南西', angle: 225, color: '#FF6B35' },
    { name: '北西', angle: 315, color: '#FF6B35' }
  ]
};

export default function DirectionLines({
  center,
  showPrimaryDirections,
  showSecondaryDirections,
  radius
}: DirectionLinesProps) {
  const map = useMap();

  useEffect(() => {
    // Clear existing direction lines and labels
    map.eachLayer((layer) => {
      if (layer instanceof L.Polyline || layer instanceof L.Marker) {
        if ((layer as any).isDirectionLine || (layer as any).isDirectionLabel) {
          map.removeLayer(layer);
        }
      }
    });

    // Add center marker
    const centerIcon = L.divIcon({
      className: 'custom-center-marker',
      html: '<div style="width: 16px; height: 16px; background: #1976D2; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const centerMarker = L.marker([center.lat, center.lng], {
      icon: centerIcon,
      draggable: true
    }).addTo(map);

    (centerMarker as any).isDirectionLabel = true;

    // Draw primary directions (四正線)
    if (showPrimaryDirections) {
      directions.primary.forEach(dir => {
        const endpoint = calculateEndpoint(center, dir.angle, radius);
        const line = L.polyline([
          [center.lat, center.lng],
          [endpoint.lat, endpoint.lng]
        ], {
          color: dir.color,
          weight: 2,
          opacity: 0.8
        }).addTo(map);

        (line as any).isDirectionLine = true;

        // Add direction label
        const midpoint = calculateEndpoint(center, dir.angle, radius * 0.9);
        const label = L.marker([midpoint.lat, midpoint.lng], {
          icon: L.divIcon({
            className: 'direction-label',
            html: `<div style="background: ${dir.color}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 12px; font-weight: 500; white-space: nowrap;">${dir.name}</div>`,
            iconSize: [30, 20],
            iconAnchor: [15, 10]
          })
        }).addTo(map);

        (label as any).isDirectionLabel = true;
      });
    }

    // Draw secondary directions (四隅線)
    if (showSecondaryDirections) {
      directions.secondary.forEach(dir => {
        const endpoint = calculateEndpoint(center, dir.angle, radius);
        const line = L.polyline([
          [center.lat, center.lng],
          [endpoint.lat, endpoint.lng]
        ], {
          color: dir.color,
          weight: 2,
          opacity: 0.7,
          dashArray: '5, 5'
        }).addTo(map);

        (line as any).isDirectionLine = true;

        // Add direction label
        const midpoint = calculateEndpoint(center, dir.angle, radius * 0.85);
        const label = L.marker([midpoint.lat, midpoint.lng], {
          icon: L.divIcon({
            className: 'direction-label',
            html: `<div style="background: ${dir.color}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px; font-weight: 500; white-space: nowrap;">${dir.name}</div>`,
            iconSize: [30, 18],
            iconAnchor: [15, 9]
          })
        }).addTo(map);

        (label as any).isDirectionLabel = true;
      });
    }

    return () => {
      // Cleanup on unmount
      map.eachLayer((layer) => {
        if (layer instanceof L.Polyline || layer instanceof L.Marker) {
          if ((layer as any).isDirectionLine || (layer as any).isDirectionLabel) {
            map.removeLayer(layer);
          }
        }
      });
    };
  }, [map, center, showPrimaryDirections, showSecondaryDirections, radius]);

  return null;
}
