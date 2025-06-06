import { locations, markers, fengShuiAnalysis, type Location, type InsertLocation, type Marker, type InsertMarker, type FengShuiAnalysis, type InsertFengShuiAnalysis } from "@shared/schema";

export interface IStorage {
  // Location operations
  getLocation(id: number): Promise<Location | undefined>;
  getLocationByCoordinates(lat: number, lng: number, tolerance?: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined>;
  
  // Marker operations
  getMarkers(locationId?: number): Promise<Marker[]>;
  createMarker(marker: InsertMarker): Promise<Marker>;
  updateMarker(id: number, marker: Partial<InsertMarker>): Promise<Marker | undefined>;
  deleteMarker(id: number): Promise<boolean>;
  
  // Feng Shui Analysis operations
  getFengShuiAnalysis(locationId: number): Promise<FengShuiAnalysis | undefined>;
  createFengShuiAnalysis(analysis: InsertFengShuiAnalysis): Promise<FengShuiAnalysis>;
  
  // Geocoding operations
  geocodeAddress(address: string): Promise<{ lat: number; lng: number; formattedAddress: string } | null>;
}

export class MemStorage implements IStorage {
  private locations: Map<number, Location>;
  private markers: Map<number, Marker>;
  private fengShuiAnalyses: Map<number, FengShuiAnalysis>;
  private currentLocationId: number;
  private currentMarkerId: number;
  private currentAnalysisId: number;

  constructor() {
    this.locations = new Map();
    this.markers = new Map();
    this.fengShuiAnalyses = new Map();
    this.currentLocationId = 1;
    this.currentMarkerId = 1;
    this.currentAnalysisId = 1;
  }

  async getLocation(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async getLocationByCoordinates(lat: number, lng: number, tolerance: number = 0.001): Promise<Location | undefined> {
    for (const location of this.locations.values()) {
      const latDiff = Math.abs(location.latitude - lat);
      const lngDiff = Math.abs(location.longitude - lng);
      if (latDiff <= tolerance && lngDiff <= tolerance) {
        return location;
      }
    }
    return undefined;
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = this.currentLocationId++;
    const location: Location = {
      ...insertLocation,
      id,
      createdAt: new Date(),
    };
    this.locations.set(id, location);
    return location;
  }

  async updateLocation(id: number, locationUpdate: Partial<InsertLocation>): Promise<Location | undefined> {
    const existing = this.locations.get(id);
    if (!existing) return undefined;
    
    const updated: Location = { ...existing, ...locationUpdate };
    this.locations.set(id, updated);
    return updated;
  }

  async getMarkers(locationId?: number): Promise<Marker[]> {
    const allMarkers = Array.from(this.markers.values());
    if (locationId !== undefined) {
      return allMarkers.filter(marker => marker.locationId === locationId);
    }
    return allMarkers;
  }

  async createMarker(insertMarker: InsertMarker): Promise<Marker> {
    const id = this.currentMarkerId++;
    const marker: Marker = {
      ...insertMarker,
      id,
      createdAt: new Date(),
    };
    this.markers.set(id, marker);
    return marker;
  }

  async updateMarker(id: number, markerUpdate: Partial<InsertMarker>): Promise<Marker | undefined> {
    const existing = this.markers.get(id);
    if (!existing) return undefined;
    
    const updated: Marker = { ...existing, ...markerUpdate };
    this.markers.set(id, updated);
    return updated;
  }

  async deleteMarker(id: number): Promise<boolean> {
    return this.markers.delete(id);
  }

  async getFengShuiAnalysis(locationId: number): Promise<FengShuiAnalysis | undefined> {
    for (const analysis of this.fengShuiAnalyses.values()) {
      if (analysis.locationId === locationId) {
        return analysis;
      }
    }
    return undefined;
  }

  async createFengShuiAnalysis(insertAnalysis: InsertFengShuiAnalysis): Promise<FengShuiAnalysis> {
    const id = this.currentAnalysisId++;
    const analysis: FengShuiAnalysis = {
      ...insertAnalysis,
      id,
      analysisDate: new Date(),
    };
    this.fengShuiAnalyses.set(id, analysis);
    return analysis;
  }

  async geocodeAddress(address: string): Promise<{ lat: number; lng: number; formattedAddress: string } | null> {
    // Simple mock geocoding for Japan addresses
    // In a real implementation, this would use Google Maps Geocoding API or similar service
    
    // Mock Tokyo area coordinates based on common addresses
    const mockCoordinates = [
      { keywords: ['東京', '新宿'], lat: 35.6896, lng: 139.6917, formatted: '東京都新宿区' },
      { keywords: ['東京', '渋谷'], lat: 35.6581, lng: 139.7014, formatted: '東京都渋谷区' },
      { keywords: ['東京', '池袋'], lat: 35.7295, lng: 139.7109, formatted: '東京都豊島区池袋' },
      { keywords: ['東京', '品川'], lat: 35.6284, lng: 139.7387, formatted: '東京都港区品川' },
      { keywords: ['大阪'], lat: 34.6937, lng: 135.5023, formatted: '大阪府大阪市' },
      { keywords: ['京都'], lat: 35.0116, lng: 135.7681, formatted: '京都府京都市' },
      { keywords: ['横浜'], lat: 35.4478, lng: 139.6425, formatted: '神奈川県横浜市' },
    ];
    
    const addressLower = address.toLowerCase();
    for (const coord of mockCoordinates) {
      if (coord.keywords.some(keyword => addressLower.includes(keyword.toLowerCase()))) {
        // Add some random variation
        const lat = coord.lat + (Math.random() - 0.5) * 0.01;
        const lng = coord.lng + (Math.random() - 0.5) * 0.01;
        return {
          lat,
          lng,
          formattedAddress: coord.formatted
        };
      }
    }
    
    // Default to Tokyo Station area if no match
    return {
      lat: 35.6812 + (Math.random() - 0.5) * 0.01,
      lng: 139.7671 + (Math.random() - 0.5) * 0.01,
      formattedAddress: '東京駅周辺'
    };
  }
}

export const storage = new MemStorage();
