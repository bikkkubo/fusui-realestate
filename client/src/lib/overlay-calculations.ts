import { calculateBearing, calculateEndpoint } from './feng-shui-calculations';
import { getGoodAzimuths, KyuseiSector } from './kyusei-calculations';

export interface GridCell {
  lat: number;
  lng: number;
  bearing: number;
  isGood: boolean;
  cellBounds: Array<[number, number]>;
}

export interface OverlayData {
  goodCells: GridCell[];
  badCells: GridCell[];
  goodPolygons: Array<Array<[number, number]>>;
  badPolygons: Array<Array<[number, number]>>;
}

// Grid configuration
const CELL_SIZE_KM = 1; // 1km grid resolution
const MAX_RADIUS_KM = 120; // 120km radius coverage
const EARTH_RADIUS_KM = 6371;

/**
 * Convert kilometers to degrees latitude
 */
function kmToDegreesLat(km: number): number {
  return km / 111.32; // Approximately 111.32 km per degree latitude
}

/**
 * Convert kilometers to degrees longitude at given latitude
 */
function kmToDegreesLng(km: number, lat: number): number {
  return km / (111.32 * Math.cos(lat * Math.PI / 180));
}

/**
 * Create grid cell bounds as polygon coordinates
 */
function createCellBounds(centerLat: number, centerLng: number, cellSizeKm: number): Array<[number, number]> {
  const halfLatDeg = kmToDegreesLat(cellSizeKm / 2);
  const halfLngDeg = kmToDegreesLng(cellSizeKm / 2, centerLat);
  
  return [
    [centerLat - halfLatDeg, centerLng - halfLngDeg], // Southwest
    [centerLat - halfLatDeg, centerLng + halfLngDeg], // Southeast
    [centerLat + halfLatDeg, centerLng + halfLngDeg], // Northeast
    [centerLat + halfLatDeg, centerLng - halfLngDeg], // Northwest
    [centerLat - halfLatDeg, centerLng - halfLngDeg]  // Close polygon
  ];
}

/**
 * Check if a bearing falls within any of the good sectors
 */
function isBearingGood(bearing: number, goodSectors: KyuseiSector[]): boolean {
  return goodSectors.some(sector => {
    let start = sector.start;
    let end = sector.end;
    
    // Handle sectors that cross 0/360 degrees
    if (start > end) {
      return bearing >= start || bearing <= end;
    }
    
    return bearing >= start && bearing <= end;
  });
}

/**
 * Generate grid cells within radius and classify as good/bad
 */
export function generateFortuneGrid(
  homePosition: { lat: number; lng: number },
  goodSectors: KyuseiSector[]
): GridCell[] {
  const cells: GridCell[] = [];
  const { lat: homeLat, lng: homeLng } = homePosition;
  
  // Calculate grid bounds
  const latDegrees = kmToDegreesLat(MAX_RADIUS_KM);
  const lngDegrees = kmToDegreesLng(MAX_RADIUS_KM, homeLat);
  
  const minLat = homeLat - latDegrees;
  const maxLat = homeLat + latDegrees;
  const minLng = homeLng - lngDegrees;
  const maxLng = homeLng + lngDegrees;
  
  // Grid step size
  const latStep = kmToDegreesLat(CELL_SIZE_KM);
  const lngStep = kmToDegreesLng(CELL_SIZE_KM, homeLat);
  
  // Generate grid cells
  for (let lat = minLat; lat <= maxLat; lat += latStep) {
    for (let lng = minLng; lng <= maxLng; lng += lngStep) {
      // Skip if outside circular radius
      const distance = calculateDistance(homeLat, homeLng, lat, lng);
      if (distance > MAX_RADIUS_KM * 1000) continue; // Convert to meters
      
      // Calculate bearing from home to cell center
      const bearing = calculateBearing(homePosition, { lat, lng });
      
      // Determine if this cell is in a good direction
      const isGood = isBearingGood(bearing, goodSectors);
      
      // Create cell bounds
      const cellBounds = createCellBounds(lat, lng, CELL_SIZE_KM);
      
      cells.push({
        lat,
        lng,
        bearing,
        isGood,
        cellBounds
      });
    }
  }
  
  return cells;
}

/**
 * Calculate distance between two points in meters
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

/**
 * Group adjacent cells into larger polygons for performance
 * This is a simplified clustering approach
 */
export function groupCellsIntoPolygons(cells: GridCell[]): Array<Array<[number, number]>> {
  if (cells.length === 0) return [];
  
  // For now, return individual cell polygons
  // In a production environment, you would implement polygon union using a library like Turf.js
  return cells.map(cell => cell.cellBounds);
}

/**
 * Build complete overlay data with good and bad polygons
 */
export async function buildLuckOverlay(
  homePosition: { lat: number; lng: number },
  goodSectors: KyuseiSector[],
  onProgress?: (progress: number) => void
): Promise<OverlayData> {
  return new Promise((resolve) => {
    // Use requestIdleCallback for performance on mobile
    const processGrid = () => {
      if (onProgress) onProgress(0.1);
      
      // Generate all grid cells
      const allCells = generateFortuneGrid(homePosition, goodSectors);
      if (onProgress) onProgress(0.5);
      
      // Separate good and bad cells
      const goodCells = allCells.filter(cell => cell.isGood);
      const badCells = allCells.filter(cell => !cell.isGood);
      if (onProgress) onProgress(0.8);
      
      // Group into polygons
      const goodPolygons = groupCellsIntoPolygons(goodCells);
      const badPolygons = groupCellsIntoPolygons(badCells);
      if (onProgress) onProgress(1.0);
      
      resolve({
        goodCells,
        badCells,
        goodPolygons,
        badPolygons
      });
    };
    
    // Use setTimeout to avoid blocking the main thread
    setTimeout(processGrid, 10);
  });
}

/**
 * Calculate grid statistics for debugging
 */
export function getGridStats(overlayData: OverlayData) {
  return {
    totalCells: overlayData.goodCells.length + overlayData.badCells.length,
    goodCells: overlayData.goodCells.length,
    badCells: overlayData.badCells.length,
    goodPolygons: overlayData.goodPolygons.length,
    badPolygons: overlayData.badPolygons.length
  };
}