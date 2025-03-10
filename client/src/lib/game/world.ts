import { GameState } from '@shared/schema';

let waterOffset = 0;

export function renderWater(
  ctx: CanvasRenderingContext2D,
  gameState: GameState,
  cameraX: number,
  cameraY: number,
  deltaTime: number
) {
  // Update water animation
  waterOffset += deltaTime * 0.02;
  if (waterOffset > 40) waterOffset = 0;
  
  // Create water pattern
  const worldWidth = gameState.world.width;
  const worldHeight = gameState.world.height;
  
  // Draw water background
  ctx.fillStyle = '#1E88E5'; // ocean-blue
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Draw water wave pattern
  const gridSize = 40;
  const visibleLeft = Math.max(0, -cameraX);
  const visibleTop = Math.max(0, -cameraY);
  const visibleRight = Math.min(worldWidth, -cameraX + ctx.canvas.width);
  const visibleBottom = Math.min(worldHeight, -cameraY + ctx.canvas.height);
  
  // Calculate grid boundaries based on visible area
  const startCol = Math.floor(visibleLeft / gridSize);
  const endCol = Math.ceil(visibleRight / gridSize);
  const startRow = Math.floor(visibleTop / gridSize);
  const endRow = Math.ceil(visibleBottom / gridSize);
  
  ctx.strokeStyle = '#64B5F6'; // lighter blue
  ctx.lineWidth = 2;
  
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const x = col * gridSize + cameraX;
      const y = row * gridSize + cameraY + (waterOffset % 40);
      
      // Draw wave pattern
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(
        x + gridSize * 0.25, y - 4,
        x + gridSize * 0.75, y - 4,
        x + gridSize, y
      );
      ctx.stroke();
    }
  }
}

export function renderIslands(
  ctx: CanvasRenderingContext2D,
  gameState: GameState,
  cameraX: number,
  cameraY: number
) {
  const islands = gameState.world.islands;
  
  islands.forEach(island => {
    const screenX = island.positionX + cameraX;
    const screenY = island.positionY + cameraY;
    
    // Only render if on screen
    if (
      screenX + island.size / 2 < 0 ||
      screenX - island.size / 2 > ctx.canvas.width ||
      screenY + island.size / 2 < 0 ||
      screenY - island.size / 2 > ctx.canvas.height
    ) {
      return;
    }
    
    // Draw island
    ctx.save();
    ctx.translate(screenX, screenY);
    
    // Draw island base (circle)
    ctx.fillStyle = island.isHub ? '#FFC107' : '#8BC34A'; // sand-yellow or island-green
    ctx.beginPath();
    ctx.arc(0, 0, island.size / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw island outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Draw beach for hub
    if (island.isHub) {
      ctx.fillStyle = '#8D6E63'; // wood-brown
      ctx.fillRect(-island.size * 0.4, island.size * 0.3, island.size * 0.8, island.size * 0.15);
      ctx.strokeRect(-island.size * 0.4, island.size * 0.3, island.size * 0.8, island.size * 0.15);
      
      // Draw buildings
      ctx.fillStyle = '#424242'; // gray-700
      ctx.fillRect(-island.size * 0.2, island.size * 0.1, island.size * 0.3, island.size * 0.2);
      ctx.strokeRect(-island.size * 0.2, island.size * 0.1, island.size * 0.3, island.size * 0.2);
      
      // Draw sign
      ctx.fillStyle = '#FFC107'; // sand-yellow
      ctx.fillRect(-island.size * 0.15, island.size * 0.05, island.size * 0.2, island.size * 0.05);
      ctx.strokeRect(-island.size * 0.15, island.size * 0.05, island.size * 0.2, island.size * 0.05);
    } else {
      // Draw trees for regular islands
      ctx.fillStyle = '#5D4037'; // dark wood
      ctx.fillRect(-island.size * 0.1, -island.size * 0.2, island.size * 0.05, island.size * 0.2);
      ctx.strokeRect(-island.size * 0.1, -island.size * 0.2, island.size * 0.05, island.size * 0.2);
      
      ctx.fillStyle = '#2E7D32'; // dark green
      ctx.beginPath();
      ctx.arc(-island.size * 0.075, -island.size * 0.25, island.size * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Another tree
      ctx.fillStyle = '#5D4037'; // dark wood
      ctx.fillRect(island.size * 0.15, -island.size * 0.15, island.size * 0.05, island.size * 0.15);
      ctx.strokeRect(island.size * 0.15, -island.size * 0.15, island.size * 0.05, island.size * 0.15);
      
      ctx.fillStyle = '#2E7D32'; // dark green
      ctx.beginPath();
      ctx.arc(island.size * 0.175, -island.size * 0.2, island.size * 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    
    // Draw island name
    ctx.fillStyle = '#FFFFFF'; // white
    ctx.font = '10px "Press Start 2P", cursive';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(island.name, 0, island.size / 2 + 10);
    
    ctx.restore();
  });
}
