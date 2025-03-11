import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { FishSpecies } from "@shared/schema";
import {
  getFishingParams,
  generateFishSize,
  isCatchSuccessful,
  pickRandomFishSpecies,
} from "@/lib/game/fishing";

export function useFishing() {
  // Get fish species data
  const { data: allFishSpecies } = useQuery<FishSpecies[]>({
    queryKey: ["/api/fish-species"],
  });

  // Fishing state
  const [fishSpecies, setFishSpecies] = useState<FishSpecies | null>(null);
  const [fishSize, setFishSize] = useState<number>(0);
  const [indicatorPosition, setIndicatorPosition] = useState<number>(0);
  const [hitZonePosition, setHitZonePosition] = useState<number>(150);
  const [hitZoneWidth, setHitZoneWidth] = useState<number>(60);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  // Refs for animation
  const animationRef = useRef<number | null>(null);
  const movingRightRef = useRef<boolean>(true);
  const speedRef = useRef<number>(3);
  
  // Reference to gauge container element to measure actual width
  const gaugeRef = useRef<HTMLDivElement | null>(null);
  
  // Store the actual container width for calculations
  const containerWidthRef = useRef<number>(400); // Default width

  // Update container width measurement
  useEffect(() => {
    const updateContainerWidth = () => {
      // Use the actual width of the gauge container from DOM if available
      if (gaugeRef.current) {
        containerWidthRef.current = gaugeRef.current.offsetWidth;
        console.log('Gauge container width measured:', containerWidthRef.current);
      }
    };

    // Initial measurement
    updateContainerWidth();
    
    // Update on window resize
    window.addEventListener('resize', updateContainerWidth);
    
    return () => {
      window.removeEventListener('resize', updateContainerWidth);
    };
  }, []);

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
      (params.gaugeWidth *
        (Math.random() * (params.maxHitPercentage - params.minHitPercentage) +
          params.minHitPercentage)) /
        100,
    );
    const maxPosition = params.gaugeWidth - hitZoneSize;
    const hitPosition = Math.floor(Math.random() * maxPosition);

    setHitZonePosition(hitPosition);
    setHitZoneWidth(hitZoneSize);

    // Set indicator speed
    const speed = Math.floor(
      Math.random() * (params.maxSpeed - params.minSpeed) + params.minSpeed,
    );
    speedRef.current = Math.max(3, Math.floor(speed / 20)); // Ensure minimum speed

    // Reset indicator position
    setIndicatorPosition(0);
    movingRightRef.current = true;

    // Animation function that will be called repeatedly
    function moveIndicator() {
      if (!isActive) return;

      // Use the full width of the container instead of hardcoded value
      const gaugeWidth = containerWidthRef.current;
      const indicatorWidth = 4;

      setIndicatorPosition((prev) => {
        let newPos;

        if (movingRightRef.current) {
          newPos = prev + speedRef.current;
          if (newPos >= gaugeWidth - indicatorWidth) {
            movingRightRef.current = false;
            newPos = gaugeWidth - indicatorWidth;
          }
        } else {
          newPos = prev - speedRef.current;
          if (newPos <= 0) {
            movingRightRef.current = true;
            newPos = 0;
          }
        }

        return newPos;
      });

      animationRef.current = requestAnimationFrame(moveIndicator);
    }

    // Start animation
    animationRef.current = requestAnimationFrame(moveIndicator);

    // Cleanup when component unmounts
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [allFishSpecies, isActive]);

  // Handle catch attempt
  const handleCatchAttempt = () => {
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
      hitZoneWidth,
    );

    setIsSuccess(success);
  };

  // Reset the game
  const resetGame = () => {
    if (!allFishSpecies || allFishSpecies.length === 0) return;

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Reset state
    setIsSuccess(null);
    setIsActive(true);

    // Wait for next tick to ensure any current catch operation completes first
    setTimeout(() => {
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
        (params.gaugeWidth *
          (Math.random() * (params.maxHitPercentage - params.minHitPercentage) +
            params.minHitPercentage)) /
          100,
      );
      const maxPosition = params.gaugeWidth - hitZoneSize;
      const hitPosition = Math.floor(Math.random() * maxPosition);

      setHitZonePosition(hitPosition);
      setHitZoneWidth(hitZoneSize);

      // Set indicator speed
      const speed = Math.floor(
        Math.random() * (params.maxSpeed - params.minSpeed) + params.minSpeed,
      );
      speedRef.current = Math.max(3, Math.floor(speed / 45));

      // Reset indicator position
      setIndicatorPosition(0);
      movingRightRef.current = true;
    }, 0);

    // Animation function that will be called repeatedly
    function moveIndicator() {
      if (!isActive) return;

      // Use the full width of the container instead of hardcoded value
      const gaugeWidth = containerWidthRef.current;
      const indicatorWidth = 4;

      setIndicatorPosition((prev) => {
        let newPos;

        if (movingRightRef.current) {
          newPos = prev + speedRef.current;
          if (newPos >= gaugeWidth - indicatorWidth) {
            movingRightRef.current = false;
            newPos = gaugeWidth - indicatorWidth;
          }
        } else {
          newPos = prev - speedRef.current;
          if (newPos <= 0) {
            movingRightRef.current = true;
            newPos = 0;
          }
        }

        return newPos;
      });

      animationRef.current = requestAnimationFrame(moveIndicator);
    }

    // Start animation
    animationRef.current = requestAnimationFrame(moveIndicator);
  };

  return {
    fishSpecies,
    fishSize,
    indicatorPosition,
    hitZonePosition,
    hitZoneWidth,
    isSuccess,
    handleCatchAttempt,
    resetGame,
    gaugeRef, // Expose the ref so components can attach it
  };
}
