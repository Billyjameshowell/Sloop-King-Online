import { useRef, useEffect } from 'react';
import { GameState } from '@shared/schema';
import GameCanvas from '@/components/GameCanvas';
import GameSidebar from '@/components/GameSidebar';
import FishingMinigame from '@/components/FishingMinigame';

interface GameContainerProps {
  gameState: GameState;
  onStartFishing: () => void;
  onEndFishing: () => void;
  onCatchFish: (fishSpeciesId: number, size: number) => void;
  onDropAnchor: () => void;
  onReturnToHub: () => void;
  onOpenMap: () => void;
  onSetDestination?: (x: number, y: number) => void;
}

export default function GameContainer({
  gameState,
  onStartFishing,
  onEndFishing,
  onCatchFish,
  onDropAnchor,
  onReturnToHub,
  onOpenMap,
  onSetDestination
}: GameContainerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Focus the canvas element on load for keyboard controls
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.focus();
    }
  }, []);
  
  return (
    <div className="game-container flex flex-1 overflow-hidden">
      {/* Main game area */}
      <main className="flex-1 relative">
        <GameCanvas 
          ref={canvasRef} 
          gameState={gameState} 
          onSetDestination={onSetDestination}
        />
        
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
            <li>Mouse Click: Navigate to Position</li>
            <li>WASD / Arrow Keys: Manual Steering</li>
            <li>Space: Start Fishing (when stopped)</li>
            <li>E: Interact with Nearby Objects</li>
            <li>I: Open Inventory</li>
          </ul>
        </div>
        
        {/* Fishing Minigame (conditionally rendered) */}
        {gameState.player.isFishing && (
          <FishingMinigame
            onCancel={onEndFishing}
            onCatch={onCatchFish}
          />
        )}
      </main>
      
      {/* Game Sidebar */}
      <GameSidebar
        gameState={gameState}
        onStartFishing={onStartFishing}
        onDropAnchor={onDropAnchor}
        onReturnToHub={onReturnToHub}
        onOpenMap={onOpenMap}
      />
    </div>
  );
}
