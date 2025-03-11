import { useRef, useEffect } from 'react';
import { GameState } from '@shared/schema';
import GameCanvas from '@/components/GameCanvas';
import GameSidebar from '@/components/GameSidebar';
import FishingMinigame from '@/components/FishingMinigame';
import { useFishingLog, FishingLogEntry } from '@/hooks/useFishingLog';

interface GameContainerProps {
  gameState: GameState;
  onStartFishing: () => void;
  onEndFishing: () => void;
  onCatchFish: (fishSpeciesId: number, size: number) => void;
  onDropAnchor: () => void;
  onReturnToHub: () => void;
  onOpenMap: () => void;
}

export default function GameContainer({
  gameState,
  onStartFishing,
  onEndFishing,
  onCatchFish,
  onDropAnchor,
  onReturnToHub,
  onOpenMap
}: GameContainerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { logEntries, addLogEntry } = useFishingLog(10);

  // Focus the canvas element on load for keyboard controls
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.focus();
    }
  }, []);
  
  // Wrapper functions to add log entries for fishing actions
  const handleStartFishing = () => {
    addLogEntry("Started fishing...", "info");
    onStartFishing();
  };
  
  const handleEndFishing = () => {
    addLogEntry("Ended fishing session.", "info");
    onEndFishing();
  };
  
  const handleCatchFish = (fishSpeciesId: number, size: number) => {
    // Find the fish species in the player's catches
    const fishSpecies = gameState.collection.catches.find(c => c.species.id === fishSpeciesId)?.species;
    
    if (fishSpecies) {
      addLogEntry(`Caught a ${fishSpecies.name} (${size}cm)!`, "catch");
    } else {
      // Fallback if we can't find the species
      addLogEntry(`Caught a fish (${size}cm)!`, "catch");
    }
    
    onCatchFish(fishSpeciesId, size);
  };
  
  return (
    <div className="game-container flex flex-1 overflow-hidden">
      {/* Main game area */}
      <main className="flex-1 relative">
        <GameCanvas 
          ref={canvasRef} 
          gameState={gameState}
        />
        
        {/* Debug Controls */}
        <div className="absolute top-0 right-0 bg-gray-800 bg-opacity-75 p-2 rounded pixel-border">
          <div className="flex flex-col items-end space-y-2">
            <div className="text-xs font-pixel text-white">
              DEBUG CONTROLS
            </div>
            <button 
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-pixel px-2 py-1 rounded"
              onClick={() => {
                console.log('Toggle anchor button clicked');
                if (gameState.player.isAnchored) {
                  console.log('Raising anchor');
                } else {
                  console.log('Dropping anchor');
                }
                onDropAnchor();
              }}
            >
              {gameState.player.isAnchored ? "Raise Anchor" : "Drop Anchor"}
            </button>
            <div className="text-xs font-pixel text-white">
              Player state:
              <pre className="whitespace-pre-wrap text-yellow-400 text-xs">
                {JSON.stringify({
                  position: gameState.player.position,
                  direction: gameState.player.direction,
                  speed: gameState.player.speed,
                  isMoving: gameState.player.isMoving,
                  isAnchored: gameState.player.isAnchored
                }, null, 2)}
              </pre>
            </div>
          </div>
        </div>
        
        {/* Player Position Overlay */}
        <div className="absolute top-4 left-4 bg-gray-800 bg-opacity-75 p-2 rounded pixel-border">
          <div className="flex items-center space-x-2 text-xs font-pixel">
            <span className="text-white">Position:</span>
            <span id="player-position" className="text-white">
              X: {Math.round(gameState.player.position.x)} Y: {Math.round(gameState.player.position.y)}
            </span>
          </div>
        </div>
        
        {/* Game Controls Help */}
        <div className="absolute bottom-4 left-4 bg-gray-800 bg-opacity-75 p-2 rounded pixel-border">
          <h3 className="font-pixel text-xs mb-2 text-white">CONTROLS:</h3>
          <ul className="text-xs space-y-1 font-pixel-body text-white">
            <li>WASD / Arrow Keys: Ship Movement</li>
            <li>Space: Start Fishing (when anchored)</li>
            <li>E: Interact with Nearby Objects</li>
            <li>I: Open Inventory</li>
          </ul>
        </div>
        
        {/* Fishing Minigame (conditionally rendered) */}
        {gameState.player.isFishing && (
          <FishingMinigame
            onCancel={handleEndFishing}
            onCatch={handleCatchFish}
          />
        )}
      </main>
      
      {/* Game Sidebar */}
      <GameSidebar
        gameState={gameState}
        onStartFishing={handleStartFishing}
        onDropAnchor={onDropAnchor}
        onReturnToHub={onReturnToHub}
        onOpenMap={onOpenMap}
        fishingLogEntries={logEntries}
      />
    </div>
  );
}
