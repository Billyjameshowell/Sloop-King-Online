import WebSocket, { WebSocketServer } from "ws";
import { Server } from "http";
import { IStorage } from "./storage";

type ClientMessage = {
  type: string;
  payload: any;
};

type ServerMessage = {
  type: string;
  payload: any;
};

interface GameClient {
  userId: number;
  username: string;
  ws: WebSocket;
  position: { x: number; y: number };
  isMoving: boolean;
  isAnchored: boolean;
  isFishing: boolean;
}

export function setupWebsocketServer(httpServer: Server, storage: IStorage) {
  // Use a specific path for game WebSockets to avoid conflicts with Vite's WebSocket
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/gamews',
    // Additional options to improve connection reliability
    perMessageDeflate: false,
    clientTracking: true,
    // Lower these values to avoid timeout issues
    maxPayload: 1024 * 1024, // 1MB
  });
  
  // Store connected clients
  const clients: Map<number, GameClient> = new Map();
  
  console.log('WebSocket server initialized at path: /gamews');
  
  // Set up WebSocket server error handling
  wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
  });
  
  wss.on("connection", (ws, req) => {
    console.log(`New WebSocket connection from ${req.socket.remoteAddress}`);
    
    // Set up ping/pong to keep connection alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 30000); // Send ping every 30 seconds
    let client: GameClient | null = null;
    
    ws.on("message", async (message) => {
      try {
        const data: ClientMessage = JSON.parse(message.toString());
        
        switch (data.type) {
          case "auth":
            // Authenticate the client
            const { userId, username } = data.payload;
            
            // Get player stats or create new ones
            let stats = await storage.getPlayerStats(userId);
            
            if (!stats) {
              // The player is new, so initialize stats with default values
              try {
                stats = await storage.createPlayerStats({
                  userId,
                  fishCaught: 0,
                  largestFish: 0,
                  rareFinds: 0,
                  positionX: 500, // Default starting position
                  positionY: 500
                });
                console.log(`Created new stats for user ${userId}`);
              } catch (error) {
                console.error("Failed to create player stats:", error);
                sendError(ws, "Failed to create player stats");
                return;
              }
            }
            
            // Create client
            client = {
              userId,
              username,
              ws,
              position: { x: stats.positionX, y: stats.positionY },
              isMoving: false,
              isAnchored: false, // Start unanchored to allow movement
              isFishing: false
            };
            
            // Add to clients
            clients.set(userId, client);
            
            // Send world data
            const islands = await storage.getAllIslands();
            sendMessage(ws, { 
              type: "world_data", 
              payload: {
                islands
              }
            });
            
            // Broadcast new player to other clients
            broadcastToOthers(client, {
              type: "player_joined",
              payload: {
                userId,
                username,
                position: client.position,
                isMoving: client.isMoving,
                isAnchored: client.isAnchored,
                isFishing: client.isFishing
              }
            });
            
            // Send existing players to new client
            const existingPlayers: any[] = [];
            clients.forEach(c => {
              if (c.userId !== userId) {
                existingPlayers.push({
                  userId: c.userId,
                  username: c.username,
                  position: c.position,
                  isMoving: c.isMoving,
                  isAnchored: c.isAnchored,
                  isFishing: c.isFishing
                });
              }
            });
            
            sendMessage(ws, {
              type: "existing_players",
              payload: existingPlayers
            });
            break;
            
          case "position_update":
            if (!client) {
              sendError(ws, "Not authenticated");
              return;
            }
            
            const positionUpdate = data.payload;
            client.position = positionUpdate.position;
            client.isMoving = positionUpdate.isMoving;
            client.isAnchored = positionUpdate.isAnchored;
            client.isFishing = positionUpdate.isFishing;
            
            // Update position in storage
            await storage.updatePlayerStats(client.userId, {
              positionX: positionUpdate.position.x,
              positionY: positionUpdate.position.y
            });
            
            // Broadcast position update to other clients
            broadcastToOthers(client, {
              type: "player_update",
              payload: {
                userId: client.userId,
                position: positionUpdate.position,
                isMoving: positionUpdate.isMoving,
                isAnchored: positionUpdate.isAnchored,
                isFishing: positionUpdate.isFishing
              }
            });
            break;
            
          case "fishing_start":
            if (!client) {
              sendError(ws, "Not authenticated");
              return;
            }
            
            client.isFishing = true;
            
            // Broadcast fishing status to other clients
            broadcastToOthers(client, {
              type: "player_update",
              payload: {
                userId: client.userId,
                position: client.position,
                isMoving: client.isMoving,
                isAnchored: client.isAnchored,
                isFishing: true
              }
            });
            break;
            
          case "fishing_end":
            if (!client) {
              sendError(ws, "Not authenticated");
              return;
            }
            
            client.isFishing = false;
            
            // Broadcast fishing status to other clients
            broadcastToOthers(client, {
              type: "player_update",
              payload: {
                userId: client.userId,
                position: client.position,
                isMoving: client.isMoving,
                isAnchored: client.isAnchored,
                isFishing: false
              }
            });
            break;
            
          case "anchor_toggle":
            if (!client) {
              sendError(ws, "Not authenticated");
              return;
            }
            
            console.log(`Player ${client.username} (ID: ${client.userId}) toggled anchor state`);
            
            // Toggle anchor state
            const anchorState = data.payload.isAnchored;
            client.isAnchored = anchorState;
            
            // If anchoring, also stop movement
            if (anchorState) {
              client.isMoving = false;
            }
            
            console.log(`Updated client state: isAnchored=${client.isAnchored}, isMoving=${client.isMoving}`);
            
            // Broadcast anchor state to other clients
            broadcastToOthers(client, {
              type: "player_update",
              payload: {
                userId: client.userId,
                position: client.position,
                isMoving: client.isMoving,
                isAnchored: client.isAnchored,
                isFishing: client.isFishing
              }
            });
            break;
            
          case "set_destination":
            if (!client) {
              sendError(ws, "Not authenticated");
              return;
            }
            
            console.log(`Player ${client.username} (ID: ${client.userId}) set new destination`);
            
            // Update client state with new destination info
            const destination = data.payload;
            client.isMoving = true;
            
            // Broadcast update to other clients
            broadcastToOthers(client, {
              type: "player_update",
              payload: {
                userId: client.userId,
                position: client.position,
                isMoving: true,
                isAnchored: client.isAnchored,
                isFishing: client.isFishing
              }
            });
            break;
          
          case "catch_fish":
            if (!client) {
              sendError(ws, "Not authenticated");
              return;
            }
            
            // Record the catch
            const { fishSpeciesId, size } = data.payload;
            await storage.createPlayerCatch({
              userId: client.userId,
              fishSpeciesId,
              size
            });
            
            // Get updated stats
            const updatedStats = await storage.getPlayerStats(client.userId);
            
            // Send updated stats to client
            sendMessage(ws, {
              type: "stats_update",
              payload: {
                fishCaught: updatedStats?.fishCaught || 0,
                largestFish: updatedStats?.largestFish || 0,
                rareFinds: updatedStats?.rareFinds || 0
              }
            });
            
            // Get today's leaderboard
            const today = new Date();
            const biggestFishLeaderboard = await storage.getDailyLeaderboard("biggest_fish", today);
            const mostFishLeaderboard = await storage.getDailyLeaderboard("most_fish", today);
            
            // Format leaderboard entries
            const formatLeaderboard = (entries: any[]) => entries.map(entry => ({
              username: entry.user.username,
              value: entry.value
            }));
            
            // Broadcast leaderboard updates to all clients
            broadcastToAll({
              type: "leaderboard_update",
              payload: {
                biggestFish: formatLeaderboard(biggestFishLeaderboard),
                mostFish: formatLeaderboard(mostFishLeaderboard)
              }
            });
            break;
        }
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
        sendError(ws, "Invalid message format");
      }
    });
    
    ws.on("close", () => {
      // Clear ping interval
      clearInterval(pingInterval);
      
      if (client) {
        console.log(`Client disconnected: ${client.username} (ID: ${client.userId})`);
        
        // Remove client from list
        clients.delete(client.userId);
        
        // Broadcast player left message
        broadcastToAll({
          type: "player_left",
          payload: {
            userId: client.userId
          }
        });
      } else {
        console.log("Unauthenticated client disconnected");
      }
    });
    
    // Handle WebSocket errors
    ws.on("error", (error) => {
      console.error("WebSocket connection error:", error);
      clearInterval(pingInterval);
    });
  });
  
  function sendMessage(ws: WebSocket, message: ServerMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
  
  function sendError(ws: WebSocket, errorMessage: string) {
    sendMessage(ws, { type: "error", payload: { message: errorMessage } });
  }
  
  function broadcastToOthers(client: GameClient, message: ServerMessage) {
    clients.forEach((c) => {
      if (c.userId !== client.userId) {
        sendMessage(c.ws, message);
      }
    });
  }
  
  function broadcastToAll(message: ServerMessage) {
    clients.forEach((client) => {
      sendMessage(client.ws, message);
    });
  }
}
