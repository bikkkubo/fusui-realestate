import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

interface KyuseiSectorsProps {
  center: { lat: number; lng: number };
  sectors: Array<{start: number, end: number}>;
  radius: number;
}

// Create sector polygon points
function createSectorPoints(center: { lat: number; lng: number }, startAngle: number, endAngle: number, radius: number) {
  const points = [[center.lat, center.lng]]; // Start from center
  
  // Convert angles to radians and adjust for map coordinates (North = 0°)
  const start = (startAngle - 90) * Math.PI / 180;
  const end = (endAngle - 90) * Math.PI / 180;
  
  // Generate points along the arc
  const steps = Math.max(10, Math.ceil(Math.abs(endAngle - startAngle) / 5));
  for (let i = 0; i <= steps; i++) {
    const angle = start + (end - start) * i / steps;
    const latOffset = (radius / 111320) * Math.cos(angle); // Approximate meters to degrees
    const lngOffset = (radius / (111320 * Math.cos(center.lat * Math.PI / 180))) * Math.sin(angle);
    points.push([center.lat + latOffset, center.lng + lngOffset]);
  }
  
  points.push([center.lat, center.lng]); // Close the polygon
  return points;
}

export default function KyuseiSectors({ center, sectors, radius }: KyuseiSectorsProps) {
  const map = useMap();

  useEffect(() => {
    // Clear existing kyusei sectors
    map.eachLayer((layer) => {
      if (layer instanceof L.Polygon && (layer as any).isKyuseiSector) {
        map.removeLayer(layer);
      }
    });

    // Draw kyusei sectors
    sectors.forEach((sector, index) => {
      const points = createSectorPoints(center, sector.start, sector.end, radius);
      
      const polygon = L.polygon(points as L.LatLngExpression[], {
        color: '#00A96E',
        fillColor: '#00A96E',
        fillOpacity: 0.2,
        weight: 2,
        opacity: 0.6
      }).addTo(map);

      (polygon as any).isKyuseiSector = true;

      // Add label at the center of the sector
      const midAngle = (sector.start + sector.end) / 2;
      const labelRadius = radius * 0.7;
      const labelAngle = (midAngle - 90) * Math.PI / 180;
      const labelLatOffset = (labelRadius / 111320) * Math.cos(labelAngle);
      const labelLngOffset = (labelRadius / (111320 * Math.cos(center.lat * Math.PI / 180))) * Math.sin(labelAngle);
      
      const label = L.marker([center.lat + labelLatOffset, center.lng + labelLngOffset], {
        icon: L.divIcon({
          className: 'kyusei-label',
          html: `<div style="background: #00A96E; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">吉方位</div>`,
          iconSize: [40, 20],
          iconAnchor: [20, 10]
        })
      }).addTo(map);

      (label as any).isKyuseiSector = true;
    });

    return () => {
      // Cleanup on unmount
      map.eachLayer((layer) => {
        if ((layer instanceof L.Polygon || layer instanceof L.Marker) && (layer as any).isKyuseiSector) {
          map.removeLayer(layer);
        }
      });
    };
  }, [map, center, sectors, radius]);

  return null;
}