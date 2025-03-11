import { Island } from "@shared/schema";

// Constants for island rendering
const ISLAND_COLORS = {
  regular: {
    base: '#8BC34A', // island-green
    beach: '#FFC107', // sand-yellow
    tree_trunk: '#5D4037', // dark wood
    tree_leaves: '#2E7D32', // dark green
    outline: '#000000', // black
  },
  hub: {
    base: '#FFC107', // sand-yellow
    dock: '#8D6E63', // wood-brown
    building: '#424242', // gray-700
    sign: '#FFC107', // sand-yellow
    outline: '#000000', // black
  }
};

/**
 * Renders an island on the canvas
 * @param ctx Canvas rendering context
 * @param island Island data to render
 * @param x Screen x-coordinate
 * @param y Screen y-coordinate
 */
export function renderIsland(
  ctx: CanvasRenderingContext2D,
  island: Island,
  x: number,
  y: number
) {
  const { size, isHub, name } = island;
  const radius = size / 2;

  // Save context state
  ctx.save();
  
  // Translate to island position
  ctx.translate(x, y);
  
  // Draw island base (circle)
  ctx.fillStyle = isHub ? ISLAND_COLORS.hub.base : ISLAND_COLORS.regular.base;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw island outline
  ctx.strokeStyle = ISLAND_COLORS.regular.outline;
  ctx.lineWidth = 4;
  ctx.stroke();
  
  if (isHub) {
    renderHubIsland(ctx, size);
  } else {
    renderRegularIsland(ctx, size);
  }
  
  // Draw island name
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '10px "Press Start 2P", cursive';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(name, 0, radius + 10);
  
  // Restore context state
  ctx.restore();
}

/**
 * Renders a regular (non-hub) island with trees
 * @param ctx Canvas rendering context
 * @param size Island size
 */
function renderRegularIsland(
  ctx: CanvasRenderingContext2D,
  size: number
) {
  const colors = ISLAND_COLORS.regular;
  
  // Draw palm trees
  // Palm Tree 1
  const drawPalmTree = (x: number, y: number, height: number, scale: number) => {
    // Tapered trunk
    ctx.fillStyle = colors.tree_trunk;
    ctx.beginPath();
    ctx.moveTo(x - scale * 0.03 * size, y);
    ctx.lineTo(x + scale * 0.03 * size, y);
    ctx.lineTo(x + scale * 0.02 * size, y - height);
    ctx.lineTo(x - scale * 0.02 * size, y - height);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Palm leaves (5-7 fronds spreading outward)
    ctx.fillStyle = colors.tree_leaves;
    
    // Draw palm fronds in different directions
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
      ctx.beginPath();
      ctx.moveTo(x, y - height);
      
      // Create curved palm frond
      ctx.quadraticCurveTo(
        x + Math.cos(angle) * scale * 0.1 * size,
        y - height + Math.sin(angle) * scale * 0.1 * size,
        x + Math.cos(angle) * scale * 0.2 * size,
        y - height + Math.sin(angle) * scale * 0.05 * size
      );
      
      // Make frond wider at the end
      ctx.lineTo(
        x + Math.cos(angle) * scale * 0.22 * size,
        y - height + Math.sin(angle) * scale * 0.08 * size
      );
      
      // Return to trunk
      ctx.quadraticCurveTo(
        x + Math.cos(angle) * scale * 0.12 * size,
        y - height + Math.sin(angle) * scale * 0.12 * size,
        x, y - height
      );
      
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  };
  
  // Draw two palm trees
  drawPalmTree(-size * 0.1, size * 0, size * 0.3, 1.2);
  drawPalmTree(size * 0.15, size * 0.05, size * 0.25, 1);
  
  // Beach area
  ctx.fillStyle = colors.beach;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.3, size * 0.4, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Renders a hub island with buildings and dock
 * @param ctx Canvas rendering context
 * @param size Island size
 */
function renderHubIsland(
  ctx: CanvasRenderingContext2D,
  size: number
) {
  const colors = ISLAND_COLORS.hub;
  
  // Draw dock
  ctx.fillStyle = colors.dock;
  ctx.fillRect(-size * 0.4, size * 0.3, size * 0.8, size * 0.15);
  ctx.strokeRect(-size * 0.4, size * 0.3, size * 0.8, size * 0.15);
  
  // Draw shop building
  ctx.fillStyle = colors.building;
  ctx.fillRect(-size * 0.2, size * 0.1, size * 0.3, size * 0.2);
  ctx.strokeRect(-size * 0.2, size * 0.1, size * 0.3, size * 0.2);
  
  // Draw shop sign
  ctx.fillStyle = colors.sign;
  ctx.fillRect(-size * 0.15, size * 0.05, size * 0.2, size * 0.05);
  ctx.strokeRect(-size * 0.15, size * 0.05, size * 0.2, size * 0.05);
  
  // Add "SHOP" text
  ctx.fillStyle = '#000000';
  ctx.font = '8px "Press Start 2P", cursive';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText("SHOP", 0, size * 0.075);
}

/**
 * Checks if a point is within an island's area
 * @param island Island data
 * @param x X-coordinate
 * @param y Y-coordinate
 * @returns Boolean indicating if point is inside island
 */
export function isPointInIsland(
  island: Island,
  x: number,
  y: number
): boolean {
  const dx = island.positionX - x;
  const dy = island.positionY - y;
  const distanceSquared = dx * dx + dy * dy;
  const radiusSquared = (island.size / 2) * (island.size / 2);
  
  return distanceSquared <= radiusSquared;
}

/**
 * Gets the closest island to a point
 * @param islands Array of islands
 * @param x X-coordinate
 * @param y Y-coordinate
 * @param maxDistance Maximum distance to consider (optional)
 * @returns The closest island or null if none within maxDistance
 */
export function getClosestIsland(
  islands: Island[],
  x: number,
  y: number,
  maxDistance?: number
): Island | null {
  let closestIsland = null;
  let closestDistance = maxDistance !== undefined ? maxDistance * maxDistance : Infinity;
  
  for (const island of islands) {
    const dx = island.positionX - x;
    const dy = island.positionY - y;
    const distanceSquared = dx * dx + dy * dy;
    
    if (distanceSquared < closestDistance) {
      closestDistance = distanceSquared;
      closestIsland = island;
    }
  }
  
  return closestIsland;
}
