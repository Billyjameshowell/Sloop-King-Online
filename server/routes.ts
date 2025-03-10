import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupWebsocketServer } from "./websocket";
import { 
  insertUserSchema, 
  insertPlayerCatchSchema, 
  insertPlayerStatsSchema 
} from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // create HTTP server
  const httpServer = createServer(app);
  
  // Setup WebSocket server
  setupWebsocketServer(httpServer, storage);
  
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const newUser = await storage.createUser(userData);
      res.status(201).json({ id: newUser.id, username: newUser.username });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  });
  
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ id: user.id, username: user.username });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving user" });
    }
  });
  
  // Game world routes
  app.get("/api/islands", async (_req, res) => {
    try {
      const islands = await storage.getAllIslands();
      res.json(islands);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving islands" });
    }
  });
  
  // Fish species routes
  app.get("/api/fish-species", async (_req, res) => {
    try {
      const fishSpecies = await storage.getAllFishSpecies();
      res.json(fishSpecies);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving fish species" });
    }
  });
  
  // Player stats routes
  app.get("/api/users/:id/stats", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const stats = await storage.getPlayerStats(userId);
      if (!stats) {
        return res.status(404).json({ message: "Player stats not found" });
      }
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving player stats" });
    }
  });
  
  app.post("/api/users/:id/stats", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if stats already exist
      const existingStats = await storage.getPlayerStats(userId);
      if (existingStats) {
        return res.status(409).json({ message: "Player stats already exist" });
      }
      
      // Default position is at the hub island
      const islands = await storage.getAllIslands();
      const hubIsland = islands.find(island => island.isHub) || islands[0];
      const defaultX = hubIsland ? hubIsland.positionX : 500;
      const defaultY = hubIsland ? hubIsland.positionY : 500;
      
      // Create new stats with defaults
      const statsData = insertPlayerStatsSchema.parse({
        userId,
        fishCaught: 0,
        largestFish: 0,
        rareFinds: 0,
        positionX: defaultX,
        positionY: defaultY
      });
      
      const newStats = await storage.createPlayerStats(statsData);
      
      res.status(201).json(newStats);
    } catch (error) {
      console.error("Error creating player stats:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid stats data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating player stats" });
    }
  });
  
  app.patch("/api/users/:id/stats", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Validate request body
      const statsSchema = z.object({
        positionX: z.number().optional(),
        positionY: z.number().optional(),
        fishCaught: z.number().optional(),
        largestFish: z.number().optional(),
        rareFinds: z.number().optional()
      });
      
      const updatedStats = statsSchema.parse(req.body);
      const stats = await storage.updatePlayerStats(userId, updatedStats);
      res.json(stats);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid stats data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating player stats" });
    }
  });
  
  // Fish catch routes
  app.get("/api/users/:id/catches", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const catches = await storage.getPlayerCatches(userId);
      res.json(catches);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving catches" });
    }
  });
  
  app.post("/api/users/:id/catches", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const catchData = insertPlayerCatchSchema.parse({
        ...req.body,
        userId
      });
      
      const newCatch = await storage.createPlayerCatch(catchData);
      res.status(201).json(newCatch);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid catch data", errors: error.errors });
      }
      res.status(500).json({ message: "Error recording catch" });
    }
  });
  
  // Leaderboard routes
  app.get("/api/leaderboard/:category", async (req, res) => {
    try {
      const category = req.params.category;
      if (category !== "biggest_fish" && category !== "most_fish") {
        return res.status(400).json({ message: "Invalid leaderboard category" });
      }
      
      const date = new Date();
      const leaderboard = await storage.getDailyLeaderboard(category, date);
      
      const formattedLeaderboard = leaderboard.map(entry => ({
        id: entry.id,
        username: entry.user.username,
        value: entry.value,
        date: entry.date
      }));
      
      res.json(formattedLeaderboard);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving leaderboard" });
    }
  });
  
  return httpServer;
}
