import { useState, useEffect, useRef } from 'react';
import { useFishing } from '@/hooks/useFishing';

interface FishingMinigameProps {
  onCancel: () => void;
  onCatch: (fishSpeciesId: number, size: number) => void;
}

export default function FishingMinigame({ onCancel, onCatch }: FishingMinigameProps) {
  const { 
    fishSpecies, 
    indicatorPosition, 
    hitZonePosition, 
    hitZoneWidth,
    fishSize,
    isSuccess,
    handleCatchAttempt,
    resetGame
  } = useFishing();
  
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        handleCatchAttempt();
      }
      if (e.code === 'Escape') {
        onCancel();
      }
    };
    
    window.addEventListener('keypress', handleKeyPress);
    
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [handleCatchAttempt, onCancel]);
  
  // If we've determined success or failure, show result
  useEffect(() => {
    if (isSuccess !== null) {
      const timer = setTimeout(() => {
        if (isSuccess && fishSpecies) {
          onCatch(fishSpecies.id, fishSize);
        } else {
          resetGame();
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isSuccess, fishSpecies, fishSize, onCatch, resetGame]);
  
  if (!fishSpecies) {
    return null;
  }
  
  return (
    <div className="absolute left-1/2 bottom-1/4 transform -translate-x-1/2 bg-gray-800 p-4 rounded pixel-border">
      <h3 className="font-pixel text-center mb-4 text-sand-yellow">FISHING!</h3>
      
      {/* Fishing gauge */}
      <div className="w-64 h-8 bg-gray-700 relative mb-4 pixel-border overflow-hidden">
        {/* Success zone */}
        <div 
          className={`fish-hit-area absolute h-full ${isSuccess !== null ? (isSuccess ? 'bg-green-500' : 'bg-red-500') : 'bg-green-500 bg-opacity-50'}`}
          style={{ 
            width: `${hitZoneWidth}px`, 
            left: `${hitZonePosition}px` 
          }}
        ></div>
        
        {/* Moving indicator */}
        <div 
          className="fish-indicator"
          style={{ 
            left: `${indicatorPosition}px`
          }}
        ></div>
      </div>
      
      {/* Fish preview */}
      <div className="w-32 h-32 bg-deep-blue mx-auto relative pixel-border">
        <div className="absolute inset-0 flex items-center justify-center">
          {isSuccess === null ? (
            <div className="w-16 h-8 animate-wave relative" style={{ backgroundColor: fishSpecies.color }}>
              {/* Fish silhouette with forked tail */}
              <div className="w-4 h-4 bg-white rounded-full absolute left-2 top-2"></div>
              {/* Create forked tail using two angled divs */}
              <div className="w-2 h-3 bg-white absolute right-0 top-0" style={{ transform: 'skew(0deg, -20deg)' }}></div>
              <div className="w-2 h-3 bg-white absolute right-0 bottom-0" style={{ transform: 'skew(0deg, 20deg)' }}></div>
            </div>
          ) : isSuccess ? (
            <div className="text-center">
              <div className="w-20 h-12 relative" style={{ backgroundColor: fishSpecies.color }}>
                {/* Caught fish with forked tail */}
                <div className="w-4 h-4 bg-white rounded-full absolute left-4 top-4"></div>
                {/* Create forked tail using two angled divs */}
                <div className="w-3 h-4 bg-white absolute right-0 top-1" style={{ transform: 'skew(0deg, -20deg)' }}></div>
                <div className="w-3 h-4 bg-white absolute right-0 bottom-1" style={{ transform: 'skew(0deg, 20deg)' }}></div>
              </div>
              <p className="text-white font-pixel text-xs mt-2">You caught a</p>
              <p className="text-white font-pixel text-xs">{fishSpecies.name}!</p>
              <p className="text-white font-pixel text-xs">{fishSize} cm</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-white font-pixel text-xs">It got away!</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Instructions */}
      <p className="text-center mt-4 text-sm text-white font-pixel-body">
        Press SPACE when the indicator hits the green zone!
      </p>
      
      {/* Action buttons */}
      <div className="flex justify-center space-x-4 mt-4">
        <button 
          className="pixel-btn bg-red-500 text-white px-4 py-2 font-pixel text-xs"
          onClick={onCancel}
        >
          CANCEL
        </button>
        {isSuccess === null ? (
          <button 
            className="pixel-btn bg-green-500 text-white px-4 py-2 font-pixel text-xs"
            onClick={handleCatchAttempt}
          >
            CATCH!
          </button>
        ) : (
          <button 
            className="pixel-btn bg-blue-500 text-white px-4 py-2 font-pixel text-xs"
            onClick={() => isSuccess ? onCatch(fishSpecies.id, fishSize) : resetGame()}
          >
            {isSuccess ? "KEEP" : "TRY AGAIN"}
          </button>
        )}
      </div>
    </div>
  );
}
