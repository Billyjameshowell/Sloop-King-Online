import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Fish species model
export const fishSpecies = pgTable("fish_species", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  rarity: integer("rarity").notNull(), // 1-5, with 5 being most rare
  minSize: integer("min_size").notNull(), // in cm
  maxSize: integer("max_size").notNull(), // in cm
  gaugeType: text("gauge_type").notNull(), // shape of the gauge for fishing minigame
  color: text("color").notNull(), // color code for rendering
});

export const insertFishSpeciesSchema = createInsertSchema(fishSpecies);

// Player catches model
export const playerCatches = pgTable("player_catches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  fishSpeciesId: integer("fish_species_id").notNull(),
  size: integer("size").notNull(), // in cm
  caughtAt: timestamp("caught_at").defaultNow().notNull(),
});

export const insertPlayerCatchSchema = createInsertSchema(playerCatches).pick({
  userId: true,
  fishSpeciesId: true,
  size: true,
});

// Player stats model
export const playerStats = pgTable("player_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  fishCaught: integer("fish_caught").default(0).notNull(),
  largestFish: integer("largest_fish").default(0).notNull(), // in cm
  rareFinds: integer("rare_finds").default(0).notNull(),
  positionX: integer("position_x").default(0).notNull(),
  positionY: integer("position_y").default(0).notNull(),
});

export const insertPlayerStatsSchema = createInsertSchema(playerStats).extend({
  fishCaught: z.number().optional(),
  largestFish: z.number().optional(),
  rareFinds: z.number().optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
});

// Game world islands
export const islands = pgTable("islands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  positionX: integer("position_x").notNull(),
  positionY: integer("position_y").notNull(),
  size: integer("size").notNull(),
  isHub: boolean("is_hub").default(false).notNull(),
});

export const insertIslandSchema = createInsertSchema(islands);

// Leaderboard model for daily tracking
export const leaderboard = pgTable("leaderboard", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  category: text("category").notNull(), // "biggest_fish" or "most_fish"
  value: integer("value").notNull(),
  date: timestamp("date").defaultNow().notNull(),
});

export const insertLeaderboardSchema = createInsertSchema(leaderboard).pick({
  userId: true,
  category: true,
  value: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type FishSpecies = typeof fishSpecies.$inferSelect;
export type InsertFishSpecies = z.infer<typeof insertFishSpeciesSchema>;

export type PlayerCatch = typeof playerCatches.$inferSelect;
export type InsertPlayerCatch = z.infer<typeof insertPlayerCatchSchema>;

export type PlayerStats = typeof playerStats.$inferSelect;
export type InsertPlayerStats = z.infer<typeof insertPlayerStatsSchema>;

export type Island = typeof islands.$inferSelect;
export type InsertIsland = z.infer<typeof insertIslandSchema>;

export type LeaderboardEntry = typeof leaderboard.$inferSelect;
export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardSchema>;

// This type is used for the game state on the frontend
export type GameState = {
  player: {
    id: number;
    username: string;
    position: { x: number; y: number };
    stats: {
      fishCaught: number;
      largestFish: number;
      rareFinds: number;
    };
    isMoving: boolean;
    isAnchored: boolean;
    isFishing: boolean;
    direction: number; // angle in degrees
    speed: number;
    destination?: { x: number; y: number }; // Optional destination for click-to-navigate
  };
  world: {
    width: number;
    height: number;
    islands: Island[];
  };
  collection: {
    catches: (PlayerCatch & { species: FishSpecies })[];
  };
};
