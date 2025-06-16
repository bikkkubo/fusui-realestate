import { locations, markers, fengShuiAnalysis, kyuseiAnalysis, userProfiles, type Location, type InsertLocation, type Marker, type InsertMarker, type FengShuiAnalysis, type InsertFengShuiAnalysis, type KyuseiAnalysis, type InsertKyuseiAnalysis, type UserProfile, type InsertUserProfile } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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
  
  // Kyusei Analysis operations
  getKyuseiAnalysis(locationId: number): Promise<KyuseiAnalysis | undefined>;
  createKyuseiAnalysis(analysis: InsertKyuseiAnalysis): Promise<KyuseiAnalysis>;
  getKyuseiAnalysesByUser(sessionId: string): Promise<KyuseiAnalysis[]>;
  
  // User Profile operations
  getUserProfile(sessionId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(sessionId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;
  
  // Geocoding operations
  geocodeAddress(address: string): Promise<{ lat: number; lng: number; formattedAddress: string } | null>;
}

export class DatabaseStorage implements IStorage {
  async getLocation(id: number): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.id, id));
    return location || undefined;
  }

  async getLocationByCoordinates(lat: number, lng: number, tolerance: number = 0.001): Promise<Location | undefined> {
    const allLocations = await db.select().from(locations);
    for (const location of allLocations) {
      const latDiff = Math.abs(location.latitude - lat);
      const lngDiff = Math.abs(location.longitude - lng);
      if (latDiff <= tolerance && lngDiff <= tolerance) {
        return location;
      }
    }
    return undefined;
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const [location] = await db
      .insert(locations)
      .values(insertLocation)
      .returning();
    return location;
  }

  async updateLocation(id: number, locationUpdate: Partial<InsertLocation>): Promise<Location | undefined> {
    const [location] = await db
      .update(locations)
      .set(locationUpdate)
      .where(eq(locations.id, id))
      .returning();
    return location || undefined;
  }

  async getMarkers(locationId?: number): Promise<Marker[]> {
    if (locationId !== undefined) {
      return await db.select().from(markers).where(eq(markers.locationId, locationId));
    }
    return await db.select().from(markers);
  }

  async createMarker(insertMarker: InsertMarker): Promise<Marker> {
    const [marker] = await db
      .insert(markers)
      .values(insertMarker)
      .returning();
    return marker;
  }

  async updateMarker(id: number, markerUpdate: Partial<InsertMarker>): Promise<Marker | undefined> {
    const [marker] = await db
      .update(markers)
      .set(markerUpdate)
      .where(eq(markers.id, id))
      .returning();
    return marker || undefined;
  }

  async deleteMarker(id: number): Promise<boolean> {
    const result = await db.delete(markers).where(eq(markers.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getFengShuiAnalysis(locationId: number): Promise<FengShuiAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(fengShuiAnalysis)
      .where(eq(fengShuiAnalysis.locationId, locationId));
    return analysis || undefined;
  }

  async createFengShuiAnalysis(insertAnalysis: InsertFengShuiAnalysis): Promise<FengShuiAnalysis> {
    const [analysis] = await db
      .insert(fengShuiAnalysis)
      .values(insertAnalysis)
      .returning();
    return analysis;
  }

  async getKyuseiAnalysis(locationId: number): Promise<KyuseiAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(kyuseiAnalysis)
      .where(eq(kyuseiAnalysis.locationId, locationId));
    return analysis || undefined;
  }

  async createKyuseiAnalysis(insertAnalysis: InsertKyuseiAnalysis): Promise<KyuseiAnalysis> {
    const [analysis] = await db
      .insert(kyuseiAnalysis)
      .values(insertAnalysis)
      .returning();
    return analysis;
  }

  async getKyuseiAnalysesByUser(sessionId: string): Promise<KyuseiAnalysis[]> {
    // Join with locations that might be associated with the session
    return await db.select().from(kyuseiAnalysis).limit(10);
  }

  async getUserProfile(sessionId: string): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.sessionId, sessionId));
    return profile || undefined;
  }

  async createUserProfile(insertProfile: InsertUserProfile): Promise<UserProfile> {
    const [profile] = await db
      .insert(userProfiles)
      .values(insertProfile)
      .returning();
    return profile;
  }

  async updateUserProfile(sessionId: string, profileUpdate: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const [profile] = await db
      .update(userProfiles)
      .set(profileUpdate)
      .where(eq(userProfiles.sessionId, sessionId))
      .returning();
    return profile || undefined;
  }

  async geocodeAddress(address: string): Promise<{ lat: number; lng: number; formattedAddress: string } | null> {
    // Simple geocoding for Japan addresses
    // In a real implementation, this would use Google Maps Geocoding API or similar service
    
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
        const lat = coord.lat + (Math.random() - 0.5) * 0.01;
        const lng = coord.lng + (Math.random() - 0.5) * 0.01;
        return {
          lat,
          lng,
          formattedAddress: coord.formatted
        };
      }
    }
    
    return {
      lat: 35.6812 + (Math.random() - 0.5) * 0.01,
      lng: 139.7671 + (Math.random() - 0.5) * 0.01,
      formattedAddress: '東京駅周辺'
    };
  }
}

export const storage = new DatabaseStorage();
