export function renderShip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  direction: number,
  isAnchored: boolean,
  username: string
) {
  // Save context state
  ctx.save();
  
  // Translate to ship position and rotate
  ctx.translate(x, y);
  ctx.rotate(direction * Math.PI / 180);
  
  // Draw ship body
  ctx.fillStyle = '#795548'; // wood-brown
  ctx.fillRect(-16, -8, 32, 16);
  
  // Draw ship border (pixel effect)
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeRect(-16, -8, 32, 16);
  
  // Draw ship cabin
  ctx.fillStyle = '#424242'; // gray-700
  ctx.fillRect(4, -3, 8, 6);
  ctx.strokeRect(4, -3, 8, 6);
  
  // Draw ship mast
  ctx.fillStyle = '#212121'; // gray-800
  ctx.fillRect(-2, -8, 4, -8);
  
  // Draw ship sail
  ctx.fillStyle = '#FFFFFF'; // white
  ctx.fillRect(-6, -24, 12, 16);
  ctx.strokeRect(-6, -24, 12, 16);
  
  // Draw anchor when anchored
  if (isAnchored) {
    ctx.fillStyle = '#9E9E9E'; // gray-500
    ctx.beginPath();
    ctx.arc(-18, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = '#757575'; // gray-600
    ctx.fillRect(-18, -10, 2, 10);
    ctx.strokeRect(-18, -10, 2, 10);
  }
  
  // Draw username above ship
  ctx.fillStyle = '#FFFFFF'; // white
  ctx.font = '8px "Press Start 2P", cursive';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(username, 0, -30);
  
  // Restore context state
  ctx.restore();
}
