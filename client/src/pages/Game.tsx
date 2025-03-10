import { useEffect } from "react";
import GameHeader from "@/components/GameHeader";
import GameContainer from "@/components/GameContainer";
import MobileMessage from "@/components/MobileMessage";
import { useGame } from "@/hooks/useGame";
import { GameState } from "@shared/schema";

interface GameProps {
  username: string;
  userId: number;
}

export default function Game({ username, userId }: GameProps) {
  const { 
    gameState, 
    saveGame, 
    startFishing, 
    endFishing, 
    catchFish,
    dropAnchor,
    returnToHub,
    openMap,
    isConnected,
    initialize,
    setDestination
  } = useGame();
  
  useEffect(() => {
    // Initialize the game with user info
    initialize(userId, username);
  }, [userId, username, initialize]);
  
  if (!isConnected || !gameState) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white font-pixel text-center">
          <h1 className="text-xl mb-4 text-sand-yellow">SLOOP KING</h1>
          <p className="animate-pulse">Setting sail...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <MobileMessage />
      <GameHeader gameState={gameState as GameState} onSave={saveGame} />
      <GameContainer 
        gameState={gameState as GameState}
        onStartFishing={startFishing}
        onEndFishing={endFishing}
        onCatchFish={catchFish}
        onDropAnchor={dropAnchor}
        onReturnToHub={returnToHub}
        onOpenMap={openMap}
        onSetDestination={setDestination}
      />
    </div>
  );
}
