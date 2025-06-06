import { pgTable, text, serial, real, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  elevation: real("elevation"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const markers = pgTable("markers", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").references(() => locations.id),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  type: text("type").notNull().default("point"), // point, center, feng-shui
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fengShuiAnalysis = pgTable("feng_shui_analysis", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").references(() => locations.id),
  directions: text("directions").notNull(), // JSON string of direction calculations
  analysisDate: timestamp("analysis_date").defaultNow(),
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  createdAt: true,
});

export const insertMarkerSchema = createInsertSchema(markers).omit({
  id: true,
  createdAt: true,
});

export const insertFengShuiAnalysisSchema = createInsertSchema(fengShuiAnalysis).omit({
  id: true,
  analysisDate: true,
});

export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;

export type InsertMarker = z.infer<typeof insertMarkerSchema>;
export type Marker = typeof markers.$inferSelect;

export type InsertFengShuiAnalysis = z.infer<typeof insertFengShuiAnalysisSchema>;
export type FengShuiAnalysis = typeof fengShuiAnalysis.$inferSelect;
