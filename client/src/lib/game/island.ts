import { Island } from "@shared/schema";

/**
 * Reference for pixel-art techniques and color palettes:
 * https://lospec.com/
 */

const ISLAND_COLORS = {
  regular: {
    base: "#7CB342", // medium green
    beachLight: "#FDD835", // lighter sand
    beachDark: "#FFC107", // darker sand
    treeTrunkLight: "#6D4C41", // lighter trunk
    treeTrunkDark: "#4E342E", // darker trunk
    treeLeavesLight: "#558B2F", // lighter leaves
    treeLeavesDark: "#33691E", // darker leaves
    outline: "#000000", // black
  },
  hub: {
    base: "#FFC107", // main sand
    dock: "#8D6E63", // wood-brown
    building: "#424242", // gray-700
    sign: "#FFC107", // sign color
    outline: "#000000", // black
  },
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
  y: number,
) {
  const { size, isHub, name } = island;
  const radius = size / 2;

  // Save context state
  ctx.save();
  ctx.translate(x, y);

  // Draw the irregular island shape
  if (isHub) {
    drawIrregularIslandShape(ctx, radius, ISLAND_COLORS.hub.base);
    ctx.strokeStyle = ISLAND_COLORS.hub.outline;
  } else {
    drawIrregularIslandShape(ctx, radius, ISLAND_COLORS.regular.base);
    ctx.strokeStyle = ISLAND_COLORS.regular.outline;
  }
  ctx.lineWidth = 2;
  ctx.stroke();

  // Render hub or regular features
  if (isHub) {
    renderHubIsland(ctx, size);
  } else {
    renderRegularIsland(ctx, size);
  }

  // Draw island name
  ctx.fillStyle = "#FFFFFF";
  ctx.font = '10px "Press Start 2P", cursive';
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(name, 0, radius + 10);

  // Restore context state
  ctx.restore();
}

/**
 * Draws an irregular island shape (semi-random perimeter) and fills it
 * @param ctx Canvas context
 * @param radius Island radius
 * @param fillColor Fill color for the island base
 */
function drawIrregularIslandShape(
  ctx: CanvasRenderingContext2D,
  radius: number,
  fillColor: string,
) {
  ctx.fillStyle = fillColor;
  ctx.beginPath();

  const steps = 24; // number of segments around the island
  for (let i = 0; i < steps; i++) {
    const angle = (Math.PI * 2 * i) / steps;
    // Slight random offset for the radius
    const offset = Math.random() * 0.15 * radius;
    const r = radius - offset;
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.fill();
}

/**
 * Renders a regular (non-hub) island: beach layering + palm trees
 * @param ctx Canvas rendering context
 * @param size Island size
 */
function renderRegularIsland(ctx: CanvasRenderingContext2D, size: number) {
  const c = ISLAND_COLORS.regular;

  // Draw layered beach arcs
  const outerBeachRadius = size * 0.48;
  const innerBeachRadius = size * 0.35;

  // Outer beach (lighter sand)
  ctx.save();
  ctx.fillStyle = c.beachLight;
  ctx.beginPath();
  ctx.arc(0, 0, outerBeachRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Inner beach (darker sand)
  ctx.save();
  ctx.fillStyle = c.beachDark;
  ctx.beginPath();
  ctx.arc(0, 0, innerBeachRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Draw palm trees
  drawDetailedPalmTree(ctx, -size * 0.15, size * 0.1, size * 0.25);
  drawDetailedPalmTree(ctx, size * 0.15, 0, size * 0.2);
}

/**
 * Draws a more detailed palm tree (with slight trunk shading and layered leaves)
 * @param ctx Canvas rendering context
 * @param x X-coordinate
 * @param y Y-coordinate
 * @param height Palm tree height
 */
function drawDetailedPalmTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  height: number,
) {
  const c = ISLAND_COLORS.regular;
  const trunkWidth = height * 0.08;

  // Trunk - gradient from lighter to darker
  const trunkGradient = ctx.createLinearGradient(x, y - height, x, y);
  trunkGradient.addColorStop(0, c.treeTrunkLight);
  trunkGradient.addColorStop(1, c.treeTrunkDark);
  ctx.fillStyle = trunkGradient;
  ctx.fillRect(x - trunkWidth / 2, y - height, trunkWidth, height);

  // Palm leaves
  const frondCount = 6;
  const frondLength = height * 0.7;

  // Two-tone leaves for a simple retro shading
  for (let i = 0; i < frondCount; i++) {
    const angle = (Math.PI * 2 * i) / frondCount;
    const midAngle = angle + 0.2; // offset for second color
    ctx.save();

    // Draw main frond (darker)
    ctx.fillStyle = c.treeLeavesDark;
    ctx.beginPath();
    ctx.moveTo(x, y - height);
    ctx.lineTo(
      x + Math.cos(angle) * frondLength,
      y - height + Math.sin(angle) * frondLength,
    );
    ctx.lineTo(
      x + Math.cos(angle + 0.15) * (frondLength * 0.7),
      y - height + Math.sin(angle + 0.15) * (frondLength * 0.7),
    );
    ctx.closePath();
    ctx.fill();

    // Draw second layer (lighter)
    ctx.fillStyle = c.treeLeavesLight;
    ctx.beginPath();
    ctx.moveTo(x, y - height);
    ctx.lineTo(
      x + Math.cos(midAngle) * (frondLength * 0.8),
      y - height + Math.sin(midAngle) * (frondLength * 0.8),
    );
    ctx.lineTo(
      x + Math.cos(midAngle + 0.15) * (frondLength * 0.5),
      y - height + Math.sin(midAngle + 0.15) * (frondLength * 0.5),
    );
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Top cluster of leaves (small circle) for palm top
  ctx.fillStyle = c.treeLeavesDark;
  ctx.beginPath();
  ctx.arc(x, y - height, trunkWidth * 2, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Renders a hub island with a similar irregular shape, plus dock and building
 * @param ctx Canvas rendering context
 * @param size Island size
 */
function renderHubIsland(ctx: CanvasRenderingContext2D, size: number) {
  const colors = ISLAND_COLORS.hub;

  // Dock
  ctx.fillStyle = colors.dock;
  ctx.fillRect(-size * 0.4, size * 0.3, size * 0.8, size * 0.15);
  ctx.strokeRect(-size * 0.4, size * 0.3, size * 0.8, size * 0.15);

  // Shop building
  ctx.fillStyle = colors.building;
  ctx.fillRect(-size * 0.2, size * 0.05, size * 0.3, size * 0.25);
  ctx.strokeRect(-size * 0.2, size * 0.05, size * 0.3, size * 0.25);

  // Shop sign
  ctx.fillStyle = colors.sign;
  ctx.fillRect(-size * 0.15, 0, size * 0.2, size * 0.05);
  ctx.strokeRect(-size * 0.15, 0, size * 0.2, size * 0.05);

  // "SHOP" text
  ctx.fillStyle = "#000000";
  ctx.font = '8px "Press Start 2P", cursive';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SHOP", -size * 0.05, size * 0.025);
}

/**
 * Checks if a point is within an island's area
 * @param island Island data
 * @param x X-coordinate
 * @param y Y-coordinate
 * @returns Boolean indicating if point is inside island
 */
export function isPointInIsland(island: Island, x: number, y: number): boolean {
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
  maxDistance?: number,
): Island | null {
  let closestIsland = null;
  let closestDistance =
    maxDistance !== undefined ? maxDistance * maxDistance : Infinity;

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
