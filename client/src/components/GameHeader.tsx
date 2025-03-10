import { useState } from 'react';
import { GameState } from '@shared/schema';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GameHeaderProps {
  gameState: GameState;
  onSave: () => void;
}

export default function GameHeader({ gameState, onSave }: GameHeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const handleSave = () => {
    onSave();
  };
  
  return (
    <header className="w-full bg-gray-800 p-4 border-b-4 border-black">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="font-pixel text-2xl text-sand-yellow tracking-wider">SLOOP KING</h1>
        <div className="flex space-x-4">
          <button 
            className="pixel-btn bg-sand-yellow text-black px-4 py-2 font-pixel text-sm"
            onClick={() => setSettingsOpen(true)}
          >
            Settings
          </button>
          <button 
            className="pixel-btn bg-island-green text-black px-4 py-2 font-pixel text-sm"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
      
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="bg-gray-800 border-4 border-black">
          <DialogHeader>
            <DialogTitle className="font-pixel text-xl text-sand-yellow">Settings</DialogTitle>
            <DialogDescription className="font-pixel-body text-white">
              Configure your Sloop King experience
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="controls">
            <TabsList className="grid grid-cols-2 bg-gray-700">
              <TabsTrigger value="controls" className="font-pixel">Controls</TabsTrigger>
              <TabsTrigger value="about" className="font-pixel">About</TabsTrigger>
            </TabsList>
            
            <TabsContent value="controls" className="mt-4">
              <div className="bg-gray-700 p-4 rounded">
                <h3 className="font-pixel text-white mb-2">Game Controls</h3>
                <ul className="font-pixel-body text-white space-y-2">
                  <li>WASD / Arrow Keys: Move ship</li>
                  <li>Space: Start fishing when anchored</li>
                  <li>Space: Catch fish (hit the timing)</li>
                  <li>E: Interact with objects</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="about" className="mt-4">
              <div className="bg-gray-700 p-4 rounded">
                <h3 className="font-pixel text-white mb-2">About Sloop King</h3>
                <p className="font-pixel-body text-white">
                  A retro pixel-art fishing adventure game. Sail the seas, catch rare fish, and become
                  the Sloop King!
                </p>
                <p className="font-pixel-body text-white mt-2">
                  Version: 1.0.0
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </header>
  );
}
