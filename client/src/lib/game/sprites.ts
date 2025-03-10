// Simple sprite management for the pixel art game

/**
 * Creates a canvas pattern for water animation
 * @param ctx Canvas rendering context
 * @returns CanvasPattern that can be used for fillStyle
 */
export function createWaterPattern(ctx: CanvasRenderingContext2D): CanvasPattern | null {
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = 40;
  patternCanvas.height = 40;
  const patternCtx = patternCanvas.getContext('2d');
  
  if (!patternCtx) return null;
  
  // Draw water pattern
  patternCtx.fillStyle = '#1E88E5'; // ocean-blue
  patternCtx.fillRect(0, 0, 40, 40);
  
  // Draw wavy lines
  patternCtx.strokeStyle = '#64B5F6'; // lighter blue
  patternCtx.lineWidth = 2;
  patternCtx.beginPath();
  patternCtx.moveTo(0, 20);
  patternCtx.bezierCurveTo(10, 15, 30, 15, 40, 20);
  patternCtx.stroke();
  
  return ctx.createPattern(patternCanvas, 'repeat');
}

/**
 * Creates a ship sprite
 * @param ctx Canvas rendering context
 * @param width Ship width
 * @param height Ship height
 * @param color Ship color (defaults to brown)
 * @returns Canvas element with the ship sprite
 */
export function createShipSprite(
  ctx: CanvasRenderingContext2D,
  width: number = 32,
  height: number = 16,
  color: string = '#795548'
): HTMLCanvasElement {
  const shipCanvas = document.createElement('canvas');
  shipCanvas.width = width;
  shipCanvas.height = height;
  const shipCtx = shipCanvas.getContext('2d');
  
  if (!shipCtx) return shipCanvas;
  
  // Draw ship body
  shipCtx.fillStyle = color;
  shipCtx.fillRect(0, 0, width, height);
  
  // Draw ship border (pixel effect)
  shipCtx.strokeStyle = '#000';
  shipCtx.lineWidth = 2;
  shipCtx.strokeRect(0, 0, width, height);
  
  // Draw ship cabin
  shipCtx.fillStyle = '#424242'; // gray-700
  shipCtx.fillRect(width * 0.7, height * 0.2, width * 0.2, height * 0.4);
  shipCtx.strokeRect(width * 0.7, height * 0.2, width * 0.2, height * 0.4);
  
  // Draw ship mast
  shipCtx.fillStyle = '#212121'; // gray-800
  shipCtx.fillRect(width * 0.5 - 1, -height, 2, height);
  
  // Draw ship sail
  shipCtx.fillStyle = '#FFFFFF'; // white
  shipCtx.fillRect(width * 0.3, -height, width * 0.4, height * 0.8);
  shipCtx.strokeRect(width * 0.3, -height, width * 0.4, height * 0.8);
  
  return shipCanvas;
}

/**
 * Creates an anchor sprite
 * @param ctx Canvas rendering context
 * @param width Anchor width
 * @param height Anchor height
 * @returns Canvas element with the anchor sprite
 */
export function createAnchorSprite(
  ctx: CanvasRenderingContext2D,
  width: number = 6,
  height: number = 20
): HTMLCanvasElement {
  const anchorCanvas = document.createElement('canvas');
  anchorCanvas.width = width;
  anchorCanvas.height = height;
  const anchorCtx = anchorCanvas.getContext('2d');
  
  if (!anchorCtx) return anchorCanvas;
  
  // Draw anchor chain
  anchorCtx.fillStyle = '#757575'; // gray-600
  anchorCtx.fillRect(width / 2 - 1, 0, 2, height * 0.5);
  
  // Draw anchor circle
  anchorCtx.fillStyle = '#9E9E9E'; // gray-500
  anchorCtx.beginPath();
  anchorCtx.arc(width / 2, height * 0.8, width / 2, 0, Math.PI * 2);
  anchorCtx.fill();
  anchorCtx.strokeStyle = '#000';
  anchorCtx.lineWidth = 1;
  anchorCtx.stroke();
  
  return anchorCanvas;
}

/**
 * Creates a fish sprite
 * @param ctx Canvas rendering context
 * @param width Fish width
 * @param height Fish height
 * @param color Fish color
 * @returns Canvas element with the fish sprite
 */
export function createFishSprite(
  ctx: CanvasRenderingContext2D,
  width: number = 16,
  height: number = 8,
  color: string = '#1E88E5'
): HTMLCanvasElement {
  const fishCanvas = document.createElement('canvas');
  fishCanvas.width = width;
  fishCanvas.height = height;
  const fishCtx = fishCanvas.getContext('2d');
  
  if (!fishCtx) return fishCanvas;
  
  // Draw fish body (oval)
  fishCtx.fillStyle = color;
  fishCtx.beginPath();
  fishCtx.ellipse(width * 0.4, height / 2, width * 0.4, height / 2, 0, 0, Math.PI * 2);
  fishCtx.fill();
  
  // Draw fish tail
  fishCtx.beginPath();
  fishCtx.moveTo(width * 0.8, height / 2);
  fishCtx.lineTo(width, height * 0.2);
  fishCtx.lineTo(width, height * 0.8);
  fishCtx.closePath();
  fishCtx.fill();
  
  // Draw fish eye
  fishCtx.fillStyle = '#FFFFFF';
  fishCtx.beginPath();
  fishCtx.arc(width * 0.25, height * 0.4, height * 0.15, 0, Math.PI * 2);
  fishCtx.fill();
  
  fishCtx.fillStyle = '#000000';
  fishCtx.beginPath();
  fishCtx.arc(width * 0.25, height * 0.4, height * 0.075, 0, Math.PI * 2);
  fishCtx.fill();
  
  return fishCanvas;
}

/**
 * Creates a bubble sprite
 * @param ctx Canvas rendering context
 * @param radius Bubble radius
 * @returns Canvas element with the bubble sprite
 */
export function createBubbleSprite(
  ctx: CanvasRenderingContext2D,
  radius: number = 4
): HTMLCanvasElement {
  const bubbleCanvas = document.createElement('canvas');
  bubbleCanvas.width = radius * 2;
  bubbleCanvas.height = radius * 2;
  const bubbleCtx = bubbleCanvas.getContext('2d');
  
  if (!bubbleCtx) return bubbleCanvas;
  
  // Draw bubble
  bubbleCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  bubbleCtx.beginPath();
  bubbleCtx.arc(radius, radius, radius * 0.8, 0, Math.PI * 2);
  bubbleCtx.fill();
  
  // Add highlight
  bubbleCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  bubbleCtx.beginPath();
  bubbleCtx.arc(radius * 0.7, radius * 0.7, radius * 0.3, 0, Math.PI * 2);
  bubbleCtx.fill();
  
  return bubbleCanvas;
}

/**
 * Draws a pixelated circle
 * @param ctx Canvas rendering context
 * @param x Center x-coordinate
 * @param y Center y-coordinate
 * @param radius Circle radius
 * @param color Circle color
 */
export function drawPixelatedCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string
) {
  // Create a temporary canvas for pixelation
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = radius * 2;
  tempCanvas.height = radius * 2;
  const tempCtx = tempCanvas.getContext('2d');
  
  if (!tempCtx) return;
  
  // Draw circle on temporary canvas (low resolution)
  tempCtx.fillStyle = color;
  tempCtx.beginPath();
  tempCtx.arc(radius, radius, radius, 0, Math.PI * 2);
  tempCtx.fill();
  
  // Draw pixelated version on main canvas
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    tempCanvas,
    0, 0, tempCanvas.width, tempCanvas.height,
    x - radius, y - radius, radius * 2, radius * 2
  );
}

/**
 * Draws a pixelated rectangle with a border
 * @param ctx Canvas rendering context
 * @param x Top-left x-coordinate
 * @param y Top-left y-coordinate
 * @param width Rectangle width
 * @param height Rectangle height
 * @param fillColor Fill color
 * @param borderColor Border color
 * @param borderWidth Border width
 */
export function drawPixelatedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  fillColor: string,
  borderColor: string = '#000000',
  borderWidth: number = 2
) {
  // Fill
  ctx.fillStyle = fillColor;
  ctx.fillRect(x, y, width, height);
  
  // Border
  if (borderWidth > 0) {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(x, y, width, height);
  }
}
