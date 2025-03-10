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
    path: '/gamews'
  });
  
  // Store connected clients
  const clients: Map<number, GameClient> = new Map();
  
  wss.on("connection", (ws) => {
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
              isAnchored: true,
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
            
            const { position, isMoving, isAnchored, isFishing } = data.payload;
            client.position = position;
            client.isMoving = isMoving;
            client.isAnchored = isAnchored;
            client.isFishing = isFishing;
            
            // Update position in storage
            await storage.updatePlayerStats(client.userId, {
              positionX: position.x,
              positionY: position.y
            });
            
            // Broadcast position update to other clients
            broadcastToOthers(client, {
              type: "player_update",
              payload: {
                userId: client.userId,
                position,
                isMoving,
                isAnchored,
                isFishing
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
      if (client) {
        // Remove client from list
        clients.delete(client.userId);
        
        // Broadcast player left message
        broadcastToAll({
          type: "player_left",
          payload: {
            userId: client.userId
          }
        });
      }
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
