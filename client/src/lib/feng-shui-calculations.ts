// Feng Shui direction calculation utilities

export interface Direction {
  name: string;
  angle: number;
  color: string;
  type: 'primary' | 'secondary';
}

export interface Position {
  lat: number;
  lng: number;
}

// Earth radius in meters
const EARTH_RADIUS = 6371000;

/**
 * Calculate endpoint coordinates for a direction line
 * @param center Starting point
 * @param angle Direction angle in degrees (0 = North)
 * @param distance Distance in meters
 * @returns Endpoint coordinates
 */
export function calculateEndpoint(center: Position, angle: number, distance: number): Position {
  const lat1 = center.lat * Math.PI / 180;
  const lon1 = center.lng * Math.PI / 180;
  const bearing = angle * Math.PI / 180;
  
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distance / EARTH_RADIUS) +
    Math.cos(lat1) * Math.sin(distance / EARTH_RADIUS) * Math.cos(bearing)
  );
  
  const lon2 = lon1 + Math.atan2(
    Math.sin(bearing) * Math.sin(distance / EARTH_RADIUS) * Math.cos(lat1),
    Math.cos(distance / EARTH_RADIUS) - Math.sin(lat1) * Math.sin(lat2)
  );
  
  return {
    lat: lat2 * 180 / Math.PI,
    lng: lon2 * 180 / Math.PI
  };
}

/**
 * Calculate distance between two points in meters
 * @param point1 First point
 * @param point2 Second point
 * @returns Distance in meters
 */
export function calculateDistance(point1: Position, point2: Position): number {
  const lat1 = point1.lat * Math.PI / 180;
  const lat2 = point2.lat * Math.PI / 180;
  const deltaLat = (point2.lat - point1.lat) * Math.PI / 180;
  const deltaLng = (point2.lng - point1.lng) * Math.PI / 180;
  
  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return EARTH_RADIUS * c;
}

/**
 * Calculate bearing from one point to another
 * @param from Starting point
 * @param to Ending point
 * @returns Bearing in degrees (0-360)
 */
export function calculateBearing(from: Position, to: Position): number {
  const lat1 = from.lat * Math.PI / 180;
  const lat2 = to.lat * Math.PI / 180;
  const deltaLng = (to.lng - from.lng) * Math.PI / 180;
  
  const y = Math.sin(deltaLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
  
  const bearing = Math.atan2(y, x) * 180 / Math.PI;
  return (bearing + 360) % 360;
}

/**
 * Get feng shui direction analysis for a given bearing
 * @param bearing Bearing in degrees
 * @returns Direction analysis
 */
export function getFengShuiDirection(bearing: number): {
  primary: string;
  secondary: string;
  element: string;
  fortune: 'auspicious' | 'inauspicious' | 'neutral';
} {
  const normalizedBearing = (bearing + 360) % 360;
  
  // Primary directions (四正)
  if (normalizedBearing >= 337.5 || normalizedBearing < 22.5) {
    return { primary: '北', secondary: '', element: '水', fortune: 'neutral' };
  }
  if (normalizedBearing >= 22.5 && normalizedBearing < 67.5) {
    return { primary: '北東', secondary: '', element: '土', fortune: 'inauspicious' };
  }
  if (normalizedBearing >= 67.5 && normalizedBearing < 112.5) {
    return { primary: '東', secondary: '', element: '木', fortune: 'auspicious' };
  }
  if (normalizedBearing >= 112.5 && normalizedBearing < 157.5) {
    return { primary: '南東', secondary: '', element: '木', fortune: 'auspicious' };
  }
  if (normalizedBearing >= 157.5 && normalizedBearing < 202.5) {
    return { primary: '南', secondary: '', element: '火', fortune: 'auspicious' };
  }
  if (normalizedBearing >= 202.5 && normalizedBearing < 247.5) {
    return { primary: '南西', secondary: '', element: '土', fortune: 'inauspicious' };
  }
  if (normalizedBearing >= 247.5 && normalizedBearing < 292.5) {
    return { primary: '西', secondary: '', element: '金', fortune: 'neutral' };
  }
  if (normalizedBearing >= 292.5 && normalizedBearing < 337.5) {
    return { primary: '北西', secondary: '', element: '金', fortune: 'auspicious' };
  }
  
  return { primary: '北', secondary: '', element: '水', fortune: 'neutral' };
}

/**
 * Calculate optimal feng shui position based on current location
 * @param center Current center position
 * @param targetDirection Desired direction for optimization
 * @returns Optimal position
 */
export function calculateOptimalPosition(
  center: Position, 
  targetDirection: string = '南東'
): Position {
  const directions: Record<string, number> = {
    '北': 0,
    '北東': 45,
    '東': 90,
    '南東': 135,
    '南': 180,
    '南西': 225,
    '西': 270,
    '北西': 315
  };
  
  const angle = directions[targetDirection] || 135; // Default to 南東
  const distance = 100; // 100 meters offset
  
  return calculateEndpoint(center, angle, distance);
}
