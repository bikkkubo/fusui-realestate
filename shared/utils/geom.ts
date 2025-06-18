/**
 * Shared geospatial calculation utilities
 */

export interface Position {
  lat: number;
  lng: number;
}

/**
 * Calculate distance between two points using Haversine formula
 * @param point1 First coordinate
 * @param point2 Second coordinate
 * @returns Distance in meters
 */
export function calculateDistance(point1: Position, point2: Position): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (point1.lat * Math.PI) / 180;
  const φ2 = (point2.lat * Math.PI) / 180;
  const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
  const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
           Math.cos(φ1) * Math.cos(φ2) *
           Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calculate bearing from one point to another
 * @param from Starting point
 * @param to Ending point  
 * @returns Bearing in degrees (0-360)
 */
export function calculateBearing(from: Position, to: Position): number {
  const φ1 = (from.lat * Math.PI) / 180;
  const φ2 = (to.lat * Math.PI) / 180;
  const Δλ = ((to.lng - from.lng) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);
  return ((θ * 180) / Math.PI + 360) % 360;
}

/**
 * Calculate endpoint coordinates for a direction line
 * @param center Starting point
 * @param angle Direction angle in degrees (0 = North)
 * @param distance Distance in meters
 * @returns Endpoint coordinates
 */
export function calculateEndpoint(center: Position, angle: number, distance: number): Position {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (center.lat * Math.PI) / 180;
  const λ1 = (center.lng * Math.PI) / 180;
  const θ = (angle * Math.PI) / 180;

  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(distance / R) + 
    Math.cos(φ1) * Math.sin(distance / R) * Math.cos(θ)
  );

  const λ2 = λ1 + Math.atan2(
    Math.sin(θ) * Math.sin(distance / R) * Math.cos(φ1),
    Math.cos(distance / R) - Math.sin(φ1) * Math.sin(φ2)
  );

  return {
    lat: (φ2 * 180) / Math.PI,
    lng: (λ2 * 180) / Math.PI
  };
}