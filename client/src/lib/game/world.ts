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

import { renderIsland } from './island';

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
    
    // Use the renderIsland function from island.ts
    renderIsland(ctx, island, screenX, screenY);
  });
}
