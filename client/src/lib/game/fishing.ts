import { FishSpecies } from "@shared/schema";

export interface FishingParams {
  minHitPercentage: number; // Minimum size of hit zone as percentage (0-100)
  maxHitPercentage: number; // Maximum size of hit zone as percentage (0-100)
  minSpeed: number; // Minimum speed of indicator (pixels per second)
  maxSpeed: number; // Maximum speed of indicator (pixels per second)
  gaugeWidth: number; // Width of the fishing gauge in pixels, should match UI
}

// Fishing parameters adjusted by fish rarity
export const getFishingParams = (rarity: number): FishingParams => {
  switch (rarity) {
    case 1: // Common
      return {
        minHitPercentage: 35,
        maxHitPercentage: 45,
        minSpeed: 100,
        maxSpeed: 150,
        gaugeWidth: 250
      };
    case 2:
      return {
        minHitPercentage: 30,
        maxHitPercentage: 40,
        minSpeed: 150,
        maxSpeed: 200,
        gaugeWidth: 250
      };
    case 3:
      return {
        minHitPercentage: 25,
        maxHitPercentage: 35,
        minSpeed: 200,
        maxSpeed: 250,
        gaugeWidth: 250
      };
    case 4:
      return {
        minHitPercentage: 15,
        maxHitPercentage: 25,
        minSpeed: 250,
        maxSpeed: 300,
        gaugeWidth: 250
      };
    case 5: // Rare
      return {
        minHitPercentage: 10,
        maxHitPercentage: 20,
        minSpeed: 300,
        maxSpeed: 350,
        gaugeWidth: 250
      };
    default:
      return {
        minHitPercentage: 30,
        maxHitPercentage: 40,
        minSpeed: 150,
        maxSpeed: 200,
        gaugeWidth: 250
      };
  }
};

// Generate a random fish size within the species range
export const generateFishSize = (fishSpecies: FishSpecies): number => {
  const { minSize, maxSize } = fishSpecies;
  return Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
};

// Check if catch attempt is successful
export const isCatchSuccessful = (
  indicatorPosition: number,
  hitZonePosition: number,
  hitZoneWidth: number
): boolean => {
  return (
    indicatorPosition >= hitZonePosition &&
    indicatorPosition <= hitZonePosition + hitZoneWidth
  );
};

// Pick a random fish species based on rarity
export const pickRandomFishSpecies = (fishSpecies: FishSpecies[]): FishSpecies => {
  // Sort by rarity (increasing)
  const sortedFish = [...fishSpecies].sort((a, b) => a.rarity - b.rarity);
  
  // Assign probability weights based on rarity (inverse)
  const weights: number[] = [];
  let totalWeight = 0;
  
  for (const fish of sortedFish) {
    // Higher rarity (5) = lower chance, lower rarity (1) = higher chance
    const weight = 1 / fish.rarity;
    weights.push(weight);
    totalWeight += weight;
  }
  
  // Normalize weights to sum to 1
  const normalizedWeights = weights.map(w => w / totalWeight);
  
  // Generate a random number between 0 and 1
  const random = Math.random();
  
  // Pick a fish based on its probability
  let cumulativeProbability = 0;
  for (let i = 0; i < normalizedWeights.length; i++) {
    cumulativeProbability += normalizedWeights[i];
    if (random <= cumulativeProbability) {
      return sortedFish[i];
    }
  }
  
  // Fallback to first fish (should never happen)
  return sortedFish[0];
};
