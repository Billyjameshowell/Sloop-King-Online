import { useState } from 'react';
import { GameState } from '@shared/schema';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface GameSidebarProps {
  gameState: GameState;
  onStartFishing: () => void;
  onDropAnchor: () => void;
  onReturnToHub: () => void;
  onOpenMap: () => void;
}

export default function GameSidebar({ 
  gameState, 
  onStartFishing, 
  onDropAnchor, 
  onReturnToHub, 
  onOpenMap 
}: GameSidebarProps) {
  const [mapOpen, setMapOpen] = useState(false);
  
  const handleStartFishing = () => {
    // Only allow fishing when the ship is anchored
    if (gameState.player.isAnchored) {
      onStartFishing();
    }
  };
  
  const handleOpenMap = () => {
    setMapOpen(true);
    onOpenMap();
  };
  
  return (
    <aside className="w-64 bg-gray-800 border-l-4 border-black p-4 flex flex-col">
      {/* Player Stats */}
      <div className="mb-6">
        <h3 className="font-pixel text-sand-yellow mb-2 text-sm">CAPTAIN'S LOG</h3>
        <div className="bg-gray-700 p-2 rounded pixel-border">
          <div className="grid grid-cols-2 gap-2 text-xs text-white">
            <span>Fish Caught:</span>
            <span>{gameState.player.stats.fishCaught}</span>
            <span>Largest Fish:</span>
            <span>{gameState.player.stats.largestFish > 0 ? `${gameState.player.stats.largestFish} cm` : 'None'}</span>
            <span>Rare Finds:</span>
            <span>{gameState.player.stats.rareFinds}</span>
          </div>
        </div>
      </div>
      
      {/* Collection Book */}
      <div className="flex-1 overflow-hidden">
        <h3 className="font-pixel text-sand-yellow mb-2 text-sm">FISH COLLECTION</h3>
        <div className="bg-gray-700 p-2 rounded h-full overflow-y-auto pixel-border">
          {gameState.collection.catches.length > 0 ? (
            gameState.collection.catches.map((catch_, index) => (
              <div key={index} className="mb-2 p-2 bg-gray-600 rounded flex items-center">
                <div className="w-8 h-8 mr-2 flex-shrink-0" style={{ backgroundColor: catch_.species.color }}>
                  {/* Fish icon would be rendered here */}
                </div>
                <div className="text-xs text-white">
                  <div className="font-bold">{catch_.species.name}</div>
                  <div>Size: {catch_.size} cm</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-white font-pixel-body text-center pt-4">
              No fish caught yet!
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mt-4">
        <h3 className="font-pixel text-sand-yellow mb-2 text-sm">ACTIONS</h3>
        <div className="grid grid-cols-2 gap-2">
          <button 
            className={`pixel-btn text-white py-2 font-pixel text-xs ${gameState.player.isAnchored ? 'bg-ocean-blue' : 'bg-gray-600'}`}
            onClick={handleStartFishing}
            disabled={!gameState.player.isAnchored}
          >
            FISH
          </button>
          <button 
            className="pixel-btn bg-island-green text-white py-2 font-pixel text-xs"
            onClick={handleOpenMap}
          >
            MAP
          </button>
          <button 
            className="pixel-btn bg-wood-brown text-white py-2 font-pixel text-xs"
            onClick={onDropAnchor}
          >
            {gameState.player.isAnchored ? "RAISE" : "ANCHOR"}
          </button>
          <button 
            className="pixel-btn bg-sand-yellow text-black py-2 font-pixel text-xs"
            onClick={onReturnToHub}
          >
            HUB
          </button>
        </div>
      </div>
      
      {/* Debug controls section removed */}
      
      {/* Map Dialog */}
      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <DialogContent className="bg-gray-800 border-4 border-black max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-pixel text-xl text-sand-yellow">World Map</DialogTitle>
          </DialogHeader>
          
          <div className="w-full h-[500px] bg-deep-blue relative">
            {/* Map Grid */}
            <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-20 pointer-events-none">
              {Array.from({ length: 10 }).map((_, rowIndex) => (
                Array.from({ length: 10 }).map((_, colIndex) => (
                  <div 
                    key={`${rowIndex}-${colIndex}`}
                    className="border border-white"
                  />
                ))
              ))}
            </div>
            
            {/* Islands on map */}
            {gameState.world.islands.map((island) => (
              <div 
                key={island.id}
                className="absolute"
                style={{
                  left: `${(island.positionX / gameState.world.width) * 100}%`,
                  top: `${(island.positionY / gameState.world.height) * 100}%`,
                  width: `${island.size / 5}px`,
                  height: `${island.size / 5}px`,
                  backgroundColor: island.isHub ? '#FFC107' : '#8BC34A',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-white text-xs font-pixel whitespace-nowrap">
                  {island.name}
                </div>
              </div>
            ))}
            
            {/* Player position on map */}
            <div
              className="absolute w-3 h-3 bg-white rounded-full animate-pulse"
              style={{
                left: `${(gameState.player.position.x / gameState.world.width) * 100}%`,
                top: `${(gameState.player.position.y / gameState.world.height) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-white text-xs font-pixel whitespace-nowrap">
                You
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
