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

export const kyuseiAnalysis = pgTable("kyusei_analysis", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").references(() => locations.id),
  birthYear: integer("birth_year").notNull(),
  birthMonth: integer("birth_month").notNull(),
  birthDay: integer("birth_day").notNull(),
  moveYear: integer("move_year").notNull(),
  moveMonth: integer("move_month").notNull(),
  homenStar: integer("homen_star").notNull(),
  goodSectors: text("good_sectors").notNull(), // JSON array of {start, end, direction}
  badDirections: text("bad_directions").notNull(), // JSON array of direction names
  analysisResult: text("analysis_result"), // JSON object with full analysis
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  birthYear: integer("birth_year"),
  birthMonth: integer("birth_month"),
  birthDay: integer("birth_day"),
  homenStar: integer("homen_star"),
  preferredLocation: text("preferred_location"), // JSON object {lat, lng, name}
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export const insertKyuseiAnalysisSchema = createInsertSchema(kyuseiAnalysis).omit({
  id: true,
  createdAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;

export type InsertMarker = z.infer<typeof insertMarkerSchema>;
export type Marker = typeof markers.$inferSelect;

export type InsertFengShuiAnalysis = z.infer<typeof insertFengShuiAnalysisSchema>;
export type FengShuiAnalysis = typeof fengShuiAnalysis.$inferSelect;

export type InsertKyuseiAnalysis = z.infer<typeof insertKyuseiAnalysisSchema>;
export type KyuseiAnalysis = typeof kyuseiAnalysis.$inferSelect;

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
