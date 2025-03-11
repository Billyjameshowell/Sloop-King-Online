import { useState, useEffect, useRef } from 'react';
import { useFishing } from '@/hooks/useFishing';

interface FishingMinigameProps {
  onCancel: () => void;
  onCatch: (fishSpeciesId: number, size: number) => void;
}

export default function FishingMinigame({ onCancel, onCatch }: FishingMinigameProps) {
  const fishingUtils = useFishing();
  const { 
    fishSpecies, 
    indicatorPosition, 
    hitZonePosition, 
    hitZoneWidth,
    fishSize,
    isSuccess,
    handleCatchAttempt,
    resetGame,
    gaugeRef
  } = fishingUtils;
  
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
  
  // Removed the auto-timeout effect so user can click Keep or Release
  
  // Log the gauge size when it's available
  useEffect(() => {
    if (gaugeRef.current) {
      console.log('Fishing gauge width:', gaugeRef.current.offsetWidth);
    }
  }, [gaugeRef.current]);
  
  if (!fishSpecies) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4 py-6">
      <div className="bg-gray-900 bg-opacity-70 absolute inset-0" onClick={onCancel}></div>
      <div className="bg-gray-800 p-6 rounded pixel-border z-10 max-w-md w-full mx-auto">
        <h3 className="font-pixel text-center mb-6 text-sand-yellow text-xl uppercase tracking-wide">FISHING!</h3>
        
        {/* Fishing gauge */}
        <div 
          ref={gaugeRef}
          className="w-full h-10 bg-gray-700 relative mb-6 pixel-border overflow-hidden"
        >
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
            className="absolute h-full w-4 bg-white"
            style={{ left: `${indicatorPosition}px` }}
          ></div>
        </div>
        
        {/* Fish preview */}
        <div className="w-full h-40 max-w-[200px] mx-auto bg-deep-blue relative pixel-border mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            {isSuccess === null ? (
              <div className="w-20 h-10 animate-wave relative" style={{ backgroundColor: fishSpecies.color }}>
                {/* Fish silhouette with forked tail */}
                <div className="w-5 h-5 bg-white rounded-full absolute left-3 top-2"></div>
                {/* Create forked tail using two angled divs */}
                <div className="w-3 h-4 bg-white absolute right-0 top-0" style={{ transform: 'skew(0deg, -20deg)' }}></div>
                <div className="w-3 h-4 bg-white absolute right-0 bottom-0" style={{ transform: 'skew(0deg, 20deg)' }}></div>
              </div>
            ) : isSuccess ? (
              <div className="text-center">
                <div className="w-24 h-16 relative mx-auto" style={{ backgroundColor: fishSpecies.color }}>
                  {/* Caught fish with forked tail */}
                  <div className="w-6 h-6 bg-white rounded-full absolute left-4 top-5"></div>
                  {/* Create forked tail using two angled divs */}
                  <div className="w-4 h-5 bg-white absolute right-0 top-2" style={{ transform: 'skew(0deg, -20deg)' }}></div>
                  <div className="w-4 h-5 bg-white absolute right-0 bottom-2" style={{ transform: 'skew(0deg, 20deg)' }}></div>
                </div>
                <p className="text-white font-pixel text-sm mt-3">You caught</p>
                <p className="text-white font-pixel text-sm">a</p>
                <p className="text-white font-pixel text-lg">{fishSpecies.name}!</p>
                <p className="text-white font-pixel text-md mt-1">{fishSize} cm</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-white font-pixel text-md">It got away!</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Instructions */}
        <p className="text-center mb-6 text-md text-white font-pixel-body">
          {isSuccess === null 
            ? "Press SPACE when the indicator hits the green zone!" 
            : isSuccess 
              ? "Click KEEP to add this fish to your collection, or RELEASE to let it go."
              : "Better luck next time!"}
        </p>
        
        {/* Action buttons */}
        <div className="flex justify-center space-x-6 mt-4">
          {isSuccess === null ? (
            <>
              <button 
                className="pixel-btn bg-red-500 text-white px-6 py-3 font-pixel text-md"
                onClick={onCancel}
              >
                CANCEL
              </button>
              <button 
                className="pixel-btn bg-green-500 text-white px-6 py-3 font-pixel text-md"
                onClick={handleCatchAttempt}
              >
                CATCH!
              </button>
            </>
          ) : isSuccess ? (
            <>
              <button 
                className="pixel-btn bg-red-500 text-white px-6 py-3 font-pixel text-md"
                onClick={() => {
                  // Simply reset the game and exit fishing minigame
                  resetGame();
                  onCancel(); // Exit fishing minigame after releasing
                }}
              >
                RELEASE
              </button>
              <button 
                className="pixel-btn bg-green-500 text-white px-6 py-3 font-pixel text-md"
                onClick={() => {
                  // Capture the current fishSpecies.id and fishSize before they might change
                  const currentFishId = fishSpecies.id;
                  const currentFishSize = fishSize;
                  
                  // Call onCatch and exit fishing minigame immediately
                  onCatch(currentFishId, currentFishSize);
                  onCancel(); // Exit fishing minigame after keeping the fish
                }}
              >
                KEEP
              </button>
            </>
          ) : (
            <>
              <button 
                className="pixel-btn bg-red-500 text-white px-6 py-3 font-pixel text-md"
                onClick={onCancel}
              >
                QUIT
              </button>
              <button 
                className="pixel-btn bg-green-500 text-white px-6 py-3 font-pixel text-md"
                onClick={resetGame}
              >
                TRY AGAIN
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
