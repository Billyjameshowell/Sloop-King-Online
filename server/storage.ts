import { 
  users, type User, type InsertUser,
  fishSpecies, type FishSpecies, type InsertFishSpecies,
  playerCatches, type PlayerCatch, type InsertPlayerCatch,
  playerStats, type PlayerStats, type InsertPlayerStats,
  islands, type Island, type InsertIsland,
  leaderboard, type LeaderboardEntry, type InsertLeaderboardEntry
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Fish species methods
  getAllFishSpecies(): Promise<FishSpecies[]>;
  getFishSpecies(id: number): Promise<FishSpecies | undefined>;
  createFishSpecies(species: InsertFishSpecies): Promise<FishSpecies>;
  
  // Player catch methods
  getPlayerCatches(userId: number): Promise<(PlayerCatch & { species: FishSpecies })[]>;
  createPlayerCatch(catch_: InsertPlayerCatch): Promise<PlayerCatch>;
  
  // Player stats methods
  getPlayerStats(userId: number): Promise<PlayerStats | undefined>;
  createPlayerStats(stats: InsertPlayerStats): Promise<PlayerStats>;
  updatePlayerStats(userId: number, updates: Partial<Omit<PlayerStats, "id" | "userId">>): Promise<PlayerStats>;
  
  // Island methods
  getAllIslands(): Promise<Island[]>;
  getIsland(id: number): Promise<Island | undefined>;
  createIsland(island: InsertIsland): Promise<Island>;
  
  // Leaderboard methods
  getDailyLeaderboard(category: string, date: Date): Promise<(LeaderboardEntry & { user: User })[]>;
  updateLeaderboard(entry: InsertLeaderboardEntry): Promise<LeaderboardEntry>;
  resetDailyLeaderboard(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private fishSpecies: Map<number, FishSpecies>;
  private playerCatches: Map<number, PlayerCatch>;
  private playerStats: Map<number, PlayerStats>;
  private islands: Map<number, Island>;
  private leaderboard: Map<number, LeaderboardEntry>;
  
  private userIdCounter: number;
  private fishSpeciesIdCounter: number;
  private playerCatchIdCounter: number;
  private playerStatsIdCounter: number;
  private islandIdCounter: number;
  private leaderboardIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.fishSpecies = new Map();
    this.playerCatches = new Map();
    this.playerStats = new Map();
    this.islands = new Map();
    this.leaderboard = new Map();
    
    this.userIdCounter = 1;
    this.fishSpeciesIdCounter = 1;
    this.playerCatchIdCounter = 1;
    this.playerStatsIdCounter = 1;
    this.islandIdCounter = 1;
    this.leaderboardIdCounter = 1;
    
    // Initialize with default data
    this.initializeData();
  }
  
  private initializeData() {
    // Create default fish species
    const fishSpeciesData: InsertFishSpecies[] = [
      { name: "Blue Tangler", description: "A common blue fish found in shallow waters", rarity: 1, minSize: 10, maxSize: 25, gaugeType: "circle", color: "#1E88E5" },
      { name: "Striped Bass", description: "Striped fish that puts up a good fight", rarity: 2, minSize: 20, maxSize: 45, gaugeType: "segmented", color: "#9E9E9E" },
      { name: "Golden Glimmer", description: "Beautiful golden fish that shines in the sunlight", rarity: 3, minSize: 8, maxSize: 20, gaugeType: "triangle", color: "#FFC107" },
      { name: "Deep Sea Lurker", description: "Mysterious fish from the deepest parts of the ocean", rarity: 4, minSize: 30, maxSize: 60, gaugeType: "wave", color: "#4A148C" },
      { name: "Rainbow Fin", description: "Extremely rare fish with rainbow-colored fins", rarity: 5, minSize: 15, maxSize: 35, gaugeType: "zigzag", color: "#E91E63" }
    ];
    
    fishSpeciesData.forEach(species => this.createFishSpecies(species));
    
    // Create default islands
    const islandData: InsertIsland[] = [
      { name: "Harbor Hub", positionX: 500, positionY: 500, size: 100, isHub: true },
      { name: "Breezy Isle", positionX: 200, positionY: 300, size: 80, isHub: false },
      { name: "Coral Cove", positionX: 800, positionY: 200, size: 60, isHub: false },
      { name: "Mystic Rocks", positionX: 400, positionY: 700, size: 70, isHub: false },
      { name: "Treasure Bay", positionX: 700, positionY: 600, size: 90, isHub: false }
    ];
    
    islandData.forEach(island => this.createIsland(island));
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    
    // Create initial player stats
    await this.createPlayerStats({ userId: id });
    
    return user;
  }
  
  // Fish species methods
  async getAllFishSpecies(): Promise<FishSpecies[]> {
    return Array.from(this.fishSpecies.values());
  }
  
  async getFishSpecies(id: number): Promise<FishSpecies | undefined> {
    return this.fishSpecies.get(id);
  }
  
  async createFishSpecies(species: InsertFishSpecies): Promise<FishSpecies> {
    const id = this.fishSpeciesIdCounter++;
    const fishSpecies: FishSpecies = { ...species, id };
    this.fishSpecies.set(id, fishSpecies);
    return fishSpecies;
  }
  
  // Player catch methods
  async getPlayerCatches(userId: number): Promise<(PlayerCatch & { species: FishSpecies })[]> {
    const catches = Array.from(this.playerCatches.values())
      .filter(catch_ => catch_.userId === userId);
    
    return catches.map(catch_ => {
      const species = this.fishSpecies.get(catch_.fishSpeciesId)!;
      return { ...catch_, species };
    });
  }
  
  async createPlayerCatch(insertCatch: InsertPlayerCatch): Promise<PlayerCatch> {
    const id = this.playerCatchIdCounter++;
    const caughtAt = new Date();
    const playerCatch: PlayerCatch = { ...insertCatch, id, caughtAt };
    this.playerCatches.set(id, playerCatch);
    
    // Update player stats
    const playerStat = await this.getPlayerStats(insertCatch.userId);
    if (playerStat) {
      const updates: Partial<Omit<PlayerStats, "id" | "userId">> = {
        fishCaught: playerStat.fishCaught + 1
      };
      
      // Update largest fish if this one is bigger
      if (insertCatch.size > playerStat.largestFish) {
        updates.largestFish = insertCatch.size;
      }
      
      // Check if this is a rare find (rarity 4-5)
      const fish = await this.getFishSpecies(insertCatch.fishSpeciesId);
      if (fish && fish.rarity >= 4) {
        updates.rareFinds = playerStat.rareFinds + 1;
      }
      
      await this.updatePlayerStats(insertCatch.userId, updates);
      
      // Update leaderboard
      await this.updateLeaderboard({
        userId: insertCatch.userId,
        category: "biggest_fish",
        value: insertCatch.size
      });
      
      await this.updateLeaderboard({
        userId: insertCatch.userId,
        category: "most_fish",
        value: playerStat.fishCaught + 1
      });
    }
    
    return playerCatch;
  }
  
  // Player stats methods
  async getPlayerStats(userId: number): Promise<PlayerStats | undefined> {
    return Array.from(this.playerStats.values()).find(
      stats => stats.userId === userId
    );
  }
  
  async createPlayerStats(insertStats: InsertPlayerStats): Promise<PlayerStats> {
    const id = this.playerStatsIdCounter++;
    const playerStats: PlayerStats = { 
      ...insertStats, 
      id, 
      fishCaught: 0,
      largestFish: 0,
      rareFinds: 0,
      positionX: 500, // Start at hub
      positionY: 500
    };
    this.playerStats.set(id, playerStats);
    return playerStats;
  }
  
  async updatePlayerStats(userId: number, updates: Partial<Omit<PlayerStats, "id" | "userId">>): Promise<PlayerStats> {
    const stats = await this.getPlayerStats(userId);
    if (!stats) {
      throw new Error(`Player stats not found for user ${userId}`);
    }
    
    const updatedStats: PlayerStats = { ...stats, ...updates };
    this.playerStats.set(stats.id, updatedStats);
    return updatedStats;
  }
  
  // Island methods
  async getAllIslands(): Promise<Island[]> {
    return Array.from(this.islands.values());
  }
  
  async getIsland(id: number): Promise<Island | undefined> {
    return this.islands.get(id);
  }
  
  async createIsland(insertIsland: InsertIsland): Promise<Island> {
    const id = this.islandIdCounter++;
    // Create a properly typed Island object with isHub as a boolean
    const island: Island = { 
      id,
      name: insertIsland.name,
      size: insertIsland.size,
      positionX: insertIsland.positionX,
      positionY: insertIsland.positionY,
      isHub: insertIsland.isHub === true
    };
    this.islands.set(id, island);
    return island;
  }
  
  // Leaderboard methods
  async getDailyLeaderboard(category: string, date: Date): Promise<(LeaderboardEntry & { user: User })[]> {
    const dateString = date.toISOString().split('T')[0];
    
    const entries = Array.from(this.leaderboard.values())
      .filter(entry => {
        const entryDate = entry.date.toISOString().split('T')[0];
        return entry.category === category && entryDate === dateString;
      })
      .sort((a, b) => b.value - a.value) // Sort by value, highest first
      .slice(0, 10); // Top 10
    
    return entries.map(entry => {
      const user = this.users.get(entry.userId)!;
      return { ...entry, user };
    });
  }
  
  async updateLeaderboard(insertEntry: InsertLeaderboardEntry): Promise<LeaderboardEntry> {
    // Check if there's already an entry for this user, category, and date
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    const existingEntry = Array.from(this.leaderboard.values()).find(entry => {
      const entryDate = entry.date.toISOString().split('T')[0];
      return entry.userId === insertEntry.userId && 
             entry.category === insertEntry.category && 
             entryDate === todayString;
    });
    
    if (existingEntry) {
      // Only update if the new value is better
      if (insertEntry.value > existingEntry.value) {
        const updatedEntry: LeaderboardEntry = { 
          ...existingEntry, 
          value: insertEntry.value 
        };
        this.leaderboard.set(existingEntry.id, updatedEntry);
        return updatedEntry;
      }
      return existingEntry;
    } else {
      // Create a new entry
      const id = this.leaderboardIdCounter++;
      const date = new Date();
      const entry: LeaderboardEntry = { ...insertEntry, id, date };
      this.leaderboard.set(id, entry);
      return entry;
    }
  }
  
  async resetDailyLeaderboard(): Promise<void> {
    // This would be called by a daily cron job in a real app
    // Just reset all leaderboard entries
    this.leaderboard.clear();
    this.leaderboardIdCounter = 1;
  }
}

export const storage = new MemStorage();
