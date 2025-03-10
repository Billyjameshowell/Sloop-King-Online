import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { GameState, Island, FishSpecies } from '@shared/schema';

export function useGame() {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [otherPlayers, setOtherPlayers] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const playerIdRef = useRef<number | null>(null);
  const playerNameRef = useRef<string | null>(null);
  
  // Fetch initial island data
  const { data: islands } = useQuery<Island[]>({
    queryKey: ['/api/islands'],
    enabled: false
  });
  
  // Fetch fish species data
  const { data: fishSpecies } = useQuery<FishSpecies[]>({
    queryKey: ['/api/fish-species'],
    enabled: false
  });
  
  // Initialize game
  const initialize = useCallback((userId: number, username: string) => {
    playerIdRef.current = userId;
    playerNameRef.current = username;
    
    // Fetch necessary data
    queryClient.fetchQuery({ queryKey: ['/api/islands'] });
    queryClient.fetchQuery({ queryKey: ['/api/fish-species'] });
    queryClient.fetchQuery({ queryKey: [`/api/users/${userId}/stats`] });
    queryClient.fetchQuery({ queryKey: [`/api/users/${userId}/catches`] });
    
    // Initialize WebSocket connection
    // In Replit, we need to set up the WebSocket URL correctly
    // We'll use a relative URL to ensure it works in both development and production
    let wsUrl;
    if (window.location.hostname === 'localhost') {
      // If running locally
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${protocol}//${window.location.host}/gamews`;
    } else {
      // If running on Replit
      // This is a workable approach for Replit specifically
      wsUrl = `wss://${window.location.host}/gamews`;
    }
    
    console.log('Connecting to WebSocket at:', wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    
    ws.onopen = () => {
      setIsConnected(true);
      
      // Authenticate with the server
      ws.send(JSON.stringify({
        type: 'auth',
        payload: { userId, username }
      }));
    };
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'world_data':
          // Initialize game state
          if (islands && fishSpecies) {
            const initialGameState: GameState = {
              player: {
                id: userId,
                username: username,
                position: { x: 500, y: 500 }, // Start at hub
                stats: {
                  fishCaught: 0,
                  largestFish: 0,
                  rareFinds: 0
                },
                isMoving: false,
                isAnchored: false, // Start unanchored so ship can move
                isFishing: false,
                direction: 0,
                speed: 0
              },
              world: {
                width: 1000,
                height: 1000,
                islands: message.payload.islands
              },
              collection: {
                catches: []
              }
            };
            
            setGameState(initialGameState);
            
            // Fetch player stats
            // Player stats are now handled by the WebSocket connection
            
            // Fetch player catches
            fetch(`/api/users/${userId}/catches`)
              .then(res => res.json())
              .then(catches => {
                setGameState(prevState => {
                  if (!prevState) return null;
                  
                  return {
                    ...prevState,
                    collection: {
                      catches: catches
                    }
                  };
                });
              });
          }
          break;
          
        case 'existing_players':
          setOtherPlayers(message.payload);
          break;
          
        case 'player_joined':
          setOtherPlayers(prev => [...prev, message.payload]);
          break;
          
        case 'player_left':
          setOtherPlayers(prev => prev.filter(p => p.userId !== message.payload.userId));
          break;
          
        case 'player_update':
          setOtherPlayers(prev => 
            prev.map(p => p.userId === message.payload.userId ? { ...p, ...message.payload } : p)
          );
          break;
          
        case 'stats_update':
          setGameState(prevState => {
            if (!prevState) return null;
            
            return {
              ...prevState,
              player: {
                ...prevState.player,
                stats: {
                  ...message.payload
                }
              }
            };
          });
          break;
          
        case 'error':
          toast({
            title: 'Error',
            description: message.payload.message,
            variant: 'destructive'
          });
          break;
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to game server',
        variant: 'destructive'
      });
    };
    
    ws.onclose = () => {
      setIsConnected(false);
      // Try to reconnect after a delay
      setTimeout(() => {
        if (playerIdRef.current && playerNameRef.current) {
          initialize(playerIdRef.current, playerNameRef.current);
        }
      }, 3000);
    };
    
    // Set up game loop
    const gameLoop = setInterval(() => {
      if (gameState && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        // Send position updates
        wsRef.current.send(JSON.stringify({
          type: 'position_update',
          payload: {
            position: gameState.player.position,
            isMoving: gameState.player.isMoving,
            isAnchored: gameState.player.isAnchored,
            isFishing: gameState.player.isFishing
          }
        }));
      }
    }, 50); // 20 FPS update rate
    
    return () => {
      clearInterval(gameLoop);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [islands, fishSpecies, toast]);
  
  // Save game state
  const saveGame = useCallback(() => {
    if (!gameState || !playerIdRef.current) return;
    
    // Save player position
    apiRequest('PATCH', `/api/users/${playerIdRef.current}/stats`, {
      positionX: gameState.player.position.x,
      positionY: gameState.player.position.y
    })
    .then(() => {
      toast({
        title: 'Game Saved',
        description: 'Your progress has been saved',
      });
    })
    .catch(error => {
      toast({
        title: 'Save Failed',
        description: error.message,
        variant: 'destructive'
      });
    });
  }, [gameState, toast]);
  
  // Start fishing
  const startFishing = useCallback(() => {
    if (!gameState || !wsRef.current) return;
    
    setGameState(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        player: {
          ...prev.player,
          isFishing: true
        }
      };
    });
    
    wsRef.current.send(JSON.stringify({
      type: 'fishing_start',
      payload: {}
    }));
  }, [gameState]);
  
  // End fishing
  const endFishing = useCallback(() => {
    if (!gameState || !wsRef.current) return;
    
    setGameState(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        player: {
          ...prev.player,
          isFishing: false
        }
      };
    });
    
    wsRef.current.send(JSON.stringify({
      type: 'fishing_end',
      payload: {}
    }));
  }, [gameState]);
  
  // Catch fish
  const catchFish = useCallback((fishSpeciesId: number, size: number) => {
    if (!gameState || !wsRef.current || !playerIdRef.current) return;
    
    wsRef.current.send(JSON.stringify({
      type: 'catch_fish',
      payload: {
        fishSpeciesId,
        size
      }
    }));
    
    // End fishing
    setGameState(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        player: {
          ...prev.player,
          isFishing: false
        }
      };
    });
    
    // Refresh catch collection
    queryClient.invalidateQueries({ queryKey: [`/api/users/${playerIdRef.current}/catches`] })
      .then(() => {
        // Fetch updated catches
        fetch(`/api/users/${playerIdRef.current}/catches`)
          .then(res => res.json())
          .then(catches => {
            setGameState(prevState => {
              if (!prevState) return null;
              
              return {
                ...prevState,
                collection: {
                  catches: catches
                }
              };
            });
          });
      });
  }, [gameState]);
  
  // Drop anchor
  const dropAnchor = useCallback(() => {
    if (!gameState) {
      console.log('dropAnchor: No game state available');
      return;
    }
    
    console.log('dropAnchor called, current anchored state:', gameState.player.isAnchored);
    
    // Toggle anchor state
    setGameState(prev => {
      if (!prev) return null;
      
      const newAnchorState = !prev.player.isAnchored;
      console.log(`Setting anchor state to: ${newAnchorState ? 'anchored' : 'unanchored'}`);
      
      // Create the new state
      const newState = {
        ...prev,
        player: {
          ...prev.player,
          isAnchored: newAnchorState,
          // If we're dropping anchor, set speed to 0 and stop moving
          // If we're raising anchor, we still need speed 0 initially
          speed: 0,
          isMoving: false,
          destination: undefined // Clear any destination when toggling anchor
        }
      };
      
      console.log('New player state will be:', newState.player);
      return newState;
    });
    
    // Send update to server
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('Sending anchor update to WebSocket server');
      wsRef.current.send(JSON.stringify({
        type: 'anchor_toggle',
        payload: {
          isAnchored: !gameState.player.isAnchored
        }
      }));
    } else {
      console.log('Cannot send anchor update: WebSocket not connected');
    }
  }, [gameState]);
  
  // Return to hub
  const returnToHub = useCallback(() => {
    if (!gameState) return;
    
    // Find the hub island
    const hub = gameState.world.islands.find(island => island.isHub);
    if (!hub) return;
    
    // Teleport to hub
    setGameState(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        player: {
          ...prev.player,
          position: { x: hub.positionX, y: hub.positionY },
          isAnchored: true,
          isMoving: false,
          speed: 0
        }
      };
    });
    
    toast({
      title: 'Teleported',
      description: 'You have returned to the harbor hub',
    });
  }, [gameState, toast]);
  
  // Open world map
  const openMap = useCallback(() => {
    // This is handled by the UI component
  }, []);
  
  // This function is no longer needed since we're removing click-to-navigate
  const setDestination = useCallback(() => {
    // Functionality removed as requested
    console.log('Click-to-navigate has been removed from the game');
  }, []);
  
  return {
    gameState,
    otherPlayers,
    isConnected,
    initialize,
    saveGame,
    startFishing,
    endFishing,
    catchFish,
    dropAnchor,
    returnToHub,
    openMap,
    setDestination
  };
}
