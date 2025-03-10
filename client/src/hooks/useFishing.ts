import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FishSpecies } from '@shared/schema';
import { 
  getFishingParams, 
  generateFishSize, 
  isCatchSuccessful, 
  pickRandomFishSpecies 
} from '@/lib/game/fishing';

export function useFishing() {
  // Get fish species data
  const { data: allFishSpecies } = useQuery<FishSpecies[]>({
    queryKey: ['/api/fish-species']
  });
  
  // Fishing state
  const [fishSpecies, setFishSpecies] = useState<FishSpecies | null>(null);
  const [fishSize, setFishSize] = useState<number>(0);
  const [indicatorPosition, setIndicatorPosition] = useState<number>(0);
  const [indicatorDirection, setIndicatorDirection] = useState<1 | -1>(1);
  const [indicatorSpeed, setIndicatorSpeed] = useState<number>(150);
  const [hitZonePosition, setHitZonePosition] = useState<number>(150);
  const [hitZoneWidth, setHitZoneWidth] = useState<number>(60);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  
  // Initialize fishing minigame
  useEffect(() => {
    if (!allFishSpecies || allFishSpecies.length === 0) return;
    
    // Pick a random fish species
    const selectedFish = pickRandomFishSpecies(allFishSpecies);
    setFishSpecies(selectedFish);
    
    // Generate a random fish size
    const size = generateFishSize(selectedFish);
    setFishSize(size);
    
    // Get fishing parameters based on rarity
    const params = getFishingParams(selectedFish.rarity);
    
    // Set hit zone size and position
    const hitZoneSize = Math.floor(
      params.gaugeWidth * 
      (Math.random() * (params.maxHitPercentage - params.minHitPercentage) + params.minHitPercentage) / 100
    );
    const maxPosition = params.gaugeWidth - hitZoneSize;
    const hitPosition = Math.floor(Math.random() * maxPosition);
    
    setHitZonePosition(hitPosition);
    setHitZoneWidth(hitZoneSize);
    
    // Set indicator speed
    const speed = Math.floor(
      Math.random() * (params.maxSpeed - params.minSpeed) + params.minSpeed
    );
    setIndicatorSpeed(speed);
    
    // Reset indicator position
    setIndicatorPosition(0);
    setIndicatorDirection(1);
    
    // Start animation
    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(updateIndicator);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [allFishSpecies]);
  
  // Update indicator position
  const updateIndicator = useCallback((time: number) => {
    if (!isActive) return;
    
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;
    
    // Calculate new position
    // The gauge width is 256px (w-64 = 16rem = 256px)
    const gaugeWidth = 256; 
    let newPosition = indicatorPosition + (indicatorDirection * indicatorSpeed * deltaTime / 1000);
    
    // Reverse direction if at edges
    if (newPosition >= gaugeWidth - 10) { // Subtract indicator width (8px) plus some margin
      newPosition = gaugeWidth - 10;
      setIndicatorDirection(-1);
    } else if (newPosition <= 0) {
      newPosition = 0;
      setIndicatorDirection(1);
    }
    
    setIndicatorPosition(newPosition);
    
    // Always ensure we request the next animation frame
    animationRef.current = requestAnimationFrame(updateIndicator);
  }, [indicatorDirection, indicatorSpeed, isActive]); // Remove indicatorPosition from deps to prevent re-creation of this function
  
  // Handle catch attempt
  const handleCatchAttempt = useCallback(() => {
    if (!isActive || !fishSpecies) return;
    
    // Stop animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    setIsActive(false);
    
    // Check if catch is successful
    const success = isCatchSuccessful(
      indicatorPosition,
      hitZonePosition,
      hitZoneWidth
    );
    
    setIsSuccess(success);
  }, [indicatorPosition, hitZonePosition, hitZoneWidth, isActive, fishSpecies]);
  
  // Reset the game
  const resetGame = useCallback(() => {
    if (!allFishSpecies || allFishSpecies.length === 0) return;
    
    // Reset state
    setIsSuccess(null);
    setIsActive(true);
    
    // Pick a new fish
    const selectedFish = pickRandomFishSpecies(allFishSpecies);
    setFishSpecies(selectedFish);
    
    // Generate a new fish size
    const size = generateFishSize(selectedFish);
    setFishSize(size);
    
    // Get fishing parameters based on rarity
    const params = getFishingParams(selectedFish.rarity);
    
    // Set hit zone size and position
    const hitZoneSize = Math.floor(
      params.gaugeWidth * 
      (Math.random() * (params.maxHitPercentage - params.minHitPercentage) + params.minHitPercentage) / 100
    );
    const maxPosition = params.gaugeWidth - hitZoneSize;
    const hitPosition = Math.floor(Math.random() * maxPosition);
    
    setHitZonePosition(hitPosition);
    setHitZoneWidth(hitZoneSize);
    
    // Set indicator speed
    const speed = Math.floor(
      Math.random() * (params.maxSpeed - params.minSpeed) + params.minSpeed
    );
    setIndicatorSpeed(speed);
    
    // Reset indicator position
    setIndicatorPosition(0);
    setIndicatorDirection(1);
    
    // Start animation
    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(updateIndicator);
  }, [allFishSpecies, updateIndicator]);
  
  return {
    fishSpecies,
    fishSize,
    indicatorPosition,
    hitZonePosition,
    hitZoneWidth,
    isSuccess,
    handleCatchAttempt,
    resetGame
  };
}
