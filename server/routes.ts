import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLocationSchema, insertMarkerSchema, insertFengShuiAnalysisSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Geocoding endpoint
  app.post("/api/geocode", async (req, res) => {
    try {
      const { address } = req.body;
      if (!address || typeof address !== "string") {
        return res.status(400).json({ error: "Address is required" });
      }

      const result = await storage.geocodeAddress(address);
      if (!result) {
        return res.status(404).json({ error: "Address not found" });
      }

      res.json(result);
    } catch (error) {
      console.error("Geocoding error:", error);
      res.status(500).json({ error: "Failed to geocode address" });
    }
  });

  // Location endpoints
  app.get("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const location = await storage.getLocation(id);
      if (!location) {
        return res.status(404).json({ error: "Location not found" });
      }
      res.json(location);
    } catch (error) {
      res.status(500).json({ error: "Failed to get location" });
    }
  });

  app.post("/api/locations", async (req, res) => {
    try {
      const data = insertLocationSchema.parse(req.body);
      const location = await storage.createLocation(data);
      res.status(201).json(location);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid location data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create location" });
    }
  });

  app.put("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertLocationSchema.partial().parse(req.body);
      const location = await storage.updateLocation(id, data);
      if (!location) {
        return res.status(404).json({ error: "Location not found" });
      }
      res.json(location);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid location data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update location" });
    }
  });

  // Marker endpoints
  app.get("/api/markers", async (req, res) => {
    try {
      const locationId = req.query.locationId ? parseInt(req.query.locationId as string) : undefined;
      const markers = await storage.getMarkers(locationId);
      res.json(markers);
    } catch (error) {
      res.status(500).json({ error: "Failed to get markers" });
    }
  });

  app.post("/api/markers", async (req, res) => {
    try {
      const data = insertMarkerSchema.parse(req.body);
      const marker = await storage.createMarker(data);
      res.status(201).json(marker);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid marker data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create marker" });
    }
  });

  app.put("/api/markers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertMarkerSchema.partial().parse(req.body);
      const marker = await storage.updateMarker(id, data);
      if (!marker) {
        return res.status(404).json({ error: "Marker not found" });
      }
      res.json(marker);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid marker data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update marker" });
    }
  });

  app.delete("/api/markers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMarker(id);
      if (!success) {
        return res.status(404).json({ error: "Marker not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete marker" });
    }
  });

  // Feng Shui Analysis endpoints
  app.get("/api/feng-shui-analysis/:locationId", async (req, res) => {
    try {
      const locationId = parseInt(req.params.locationId);
      const analysis = await storage.getFengShuiAnalysis(locationId);
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: "Failed to get feng shui analysis" });
    }
  });

  app.post("/api/feng-shui-analysis", async (req, res) => {
    try {
      const data = insertFengShuiAnalysisSchema.parse(req.body);
      const analysis = await storage.createFengShuiAnalysis(data);
      res.status(201).json(analysis);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid analysis data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create feng shui analysis" });
    }
  });

  // Calculate elevation for coordinates (mock implementation)
  app.get("/api/elevation", async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      
      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }
      
      // Mock elevation calculation
      const elevation = Math.max(0, 50 + Math.sin(lat * 10) * 20 + Math.cos(lng * 10) * 15);
      res.json({ elevation: Math.round(elevation * 1000) / 1000 });
    } catch (error) {
      res.status(500).json({ error: "Failed to get elevation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
