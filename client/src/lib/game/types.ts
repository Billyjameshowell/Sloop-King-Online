import { FishSpecies, Island } from "@shared/schema";

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ShipState {
  position: Point;
  direction: number;
  speed: number;
  isMoving: boolean;
  isAnchored: boolean;
  isFishing: boolean;
}

export interface WorldState {
  width: number;
  height: number;
  islands: Island[];
}

export interface FishCatch {
  speciesId: number;
  size: number;
  timestamp: number;
}

export interface FishCollection {
  catches: FishCatch[];
  knownSpecies: FishSpecies[];
}

export interface PlayerStats {
  fishCaught: number;
  largestFish: number;
  rareFinds: number;
}

export interface FishingState {
  isActive: boolean;
  currentFish: FishSpecies | null;
  indicatorPosition: number;
  indicatorDirection: 1 | -1;
  hitZonePosition: number;
  hitZoneWidth: number;
  indicatorSpeed: number;
  lastUpdateTime: number;
  result: 'success' | 'failure' | null;
}

export interface LeaderboardEntry {
  username: string;
  value: number;
}

export interface LeaderboardState {
  biggestFish: LeaderboardEntry[];
  mostFish: LeaderboardEntry[];
}

export interface WebSocketMessage {
  type: string;
  payload: any;
}
