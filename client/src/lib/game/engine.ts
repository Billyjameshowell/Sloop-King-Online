import { GameState } from '@shared/schema';
import { renderShip } from './ship';
import { renderWater, renderIslands } from './world';
import { drawPixelatedCircle } from './sprites';

// Movement constants
const ACCELERATION = 0.1;
const DECELERATION = 0.05;
const MAX_SPEED = 3;
const TURN_SPEED = 2;

// Key states
let keys = {
  up: false,
  down: false,
  left: false,
  right: false,
  space: false,
  e: false,
  i: false
};

export function handleKeyDown(e: KeyboardEvent, gameState: GameState) {
  if (gameState.player.isFishing) return;
  
  switch (e.code) {
    case 'KeyW':
    case 'ArrowUp':
      keys.up = true;
      break;
    case 'KeyS':
    case 'ArrowDown':
      keys.down = true;
      break;
    case 'KeyA':
    case 'ArrowLeft':
      keys.left = true;
      break;
    case 'KeyD':
    case 'ArrowRight':
      keys.right = true;
      break;
    case 'Space':
      keys.space = true;
      break;
    case 'KeyE':
      keys.e = true;
      break;
    case 'KeyI':
      keys.i = true;
      break;
  }
}

export function handleKeyUp(e: KeyboardEvent, gameState: GameState) {
  if (gameState.player.isFishing) return;
  
  switch (e.code) {
    case 'KeyW':
    case 'ArrowUp':
      keys.up = false;
      break;
    case 'KeyS':
    case 'ArrowDown':
      keys.down = false;
      break;
    case 'KeyA':
    case 'ArrowLeft':
      keys.left = false;
      break;
    case 'KeyD':
    case 'ArrowRight':
      keys.right = false;
      break;
    case 'Space':
      keys.space = false;
      break;
    case 'KeyE':
      keys.e = false;
      break;
    case 'KeyI':
      keys.i = false;
      break;
  }
}

export function updateShipPhysics(gameState: GameState, deltaTime: number) {
  const player = gameState.player;
  
  // Skip physics update if fishing
  if (player.isFishing) return;
  
  // Only allow movement if not anchored
  if (!player.isAnchored) {
    // Auto-pilot to destination if set
    if (player.destination) {
      // Calculate angle to destination
      const dx = player.destination.x - player.position.x;
      const dy = player.destination.y - player.position.y;
      const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI);
      const currentAngleDeg = player.direction;
      
      // Get the angle in radians
      const angleDiff = ((targetAngle - currentAngleDeg + 180) % 360) - 180;
      
      // Auto-steer gradually toward destination
      if (Math.abs(angleDiff) > 5) {
        // Need to turn
        if (angleDiff > 0) {
          player.direction += Math.min(TURN_SPEED * (deltaTime / 16), angleDiff);
        } else {
          player.direction -= Math.min(TURN_SPEED * (deltaTime / 16), Math.abs(angleDiff));
        }
      }
      
      // Calculate distance to destination
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Adjust speed based on distance
      if (distance > 100) {
        // Far away, go full speed
        player.speed = Math.min(player.speed + ACCELERATION * (deltaTime / 16), MAX_SPEED);
      } else if (distance > 50) {
        // Getting closer, medium speed
        const targetSpeed = MAX_SPEED * 0.7;
        if (player.speed > targetSpeed) {
          player.speed = Math.max(player.speed - DECELERATION * (deltaTime / 16), targetSpeed);
        } else {
          player.speed = Math.min(player.speed + ACCELERATION * (deltaTime / 16), targetSpeed);
        }
      } else if (distance > 20) {
        // Close, slow down
        const targetSpeed = MAX_SPEED * 0.4;
        if (player.speed > targetSpeed) {
          player.speed = Math.max(player.speed - DECELERATION * (deltaTime / 16), targetSpeed);
        } else {
          player.speed = Math.min(player.speed + ACCELERATION * (deltaTime / 16), targetSpeed);
        }
      } else {
        // Very close, slow down significantly
        const targetSpeed = MAX_SPEED * 0.2;
        if (player.speed > targetSpeed) {
          player.speed = Math.max(player.speed - DECELERATION * 2 * (deltaTime / 16), targetSpeed);
        }
      }
      
      // If very close to destination, stop
      if (distance < 5) {
        player.speed = 0;
        player.isMoving = false;
        player.destination = undefined;
      }
    } else {
      // Normal keyboard controls when no destination is set
      // Handle turning
      if (keys.left) {
        player.direction -= TURN_SPEED * (deltaTime / 16);
      }
      if (keys.right) {
        player.direction += TURN_SPEED * (deltaTime / 16);
      }
      
      // Handle acceleration
      if (keys.up) {
        player.speed += ACCELERATION * (deltaTime / 16);
        if (player.speed > MAX_SPEED) {
          player.speed = MAX_SPEED;
        }
        player.isMoving = true;
      } else if (keys.down) {
        player.speed -= ACCELERATION * (deltaTime / 16) * 0.5; // Slower reverse
        if (player.speed < -MAX_SPEED * 0.5) {
          player.speed = -MAX_SPEED * 0.5;
        }
        player.isMoving = true;
      } else {
        // Decelerate if no input
        if (player.speed > 0) {
          player.speed -= DECELERATION * (deltaTime / 16);
          if (player.speed < 0) {
            player.speed = 0;
          }
        } else if (player.speed < 0) {
          player.speed += DECELERATION * (deltaTime / 16);
          if (player.speed > 0) {
            player.speed = 0;
          }
        }
        
        player.isMoving = player.speed !== 0;
      }
    }
    
    // Normalize direction to 0-360
    player.direction = (player.direction + 360) % 360;
    
    // Move player based on direction and speed
    if (player.speed !== 0) {
      // Convert direction from 90° = up to standard math angles
      const radians = (player.direction - 90) * (Math.PI / 180);
      player.position.x += Math.cos(radians) * player.speed * (deltaTime / 16);
      player.position.y += Math.sin(radians) * player.speed * (deltaTime / 16);
      
      // Constrain to world bounds
      if (player.position.x < 0) player.position.x = 0;
      if (player.position.x > gameState.world.width) player.position.x = gameState.world.width;
      if (player.position.y < 0) player.position.y = 0;
      if (player.position.y > gameState.world.height) player.position.y = gameState.world.height;
    }
  }
  
  // Start fishing if at rest and space bar pressed
  if (player.speed === 0 && player.isAnchored && keys.space) {
    keys.space = false; // Prevent multiple activations
    player.isFishing = true;
  }
}

export function renderWorld(
  ctx: CanvasRenderingContext2D, 
  gameState: GameState, 
  deltaTime: number
) {
  // Update ship physics
  updateShipPhysics(gameState, deltaTime);
  
  // Calculate camera offset to center on player
  const cameraX = ctx.canvas.width / 2 - gameState.player.position.x;
  const cameraY = ctx.canvas.height / 2 - gameState.player.position.y;
  
  // Clear canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Render water background
  renderWater(ctx, gameState, cameraX, cameraY, deltaTime);
  
  // Render islands
  renderIslands(ctx, gameState, cameraX, cameraY);
  
  // Render destination marker if there is one
  if (gameState.player.destination && !gameState.player.isAnchored) {
    const { x, y } = gameState.player.destination;
    const screenX = x + cameraX;
    const screenY = y + cameraY;
    
    // Draw destination marker (animated circle)
    const pulseAmount = Math.sin(Date.now() / 200) * 2 + 4; // Pulse between sizes
    drawPixelatedCircle(ctx, screenX, screenY, 8 + pulseAmount, 'rgba(255, 255, 100, 0.7)');
    drawPixelatedCircle(ctx, screenX, screenY, 4, 'rgba(255, 255, 100, 0.9)');
    
    // Calculate distance to destination
    const dx = x - gameState.player.position.x;
    const dy = y - gameState.player.position.y;
    const distanceToDestination = Math.sqrt(dx * dx + dy * dy);
    
    // If we're close to destination, remove it
    if (distanceToDestination < 10) {
      // This doesn't directly modify the state - that's handled in the hook
      // But we can signal to slow down when reaching destination
      gameState.player.speed = Math.max(0.5, gameState.player.speed * 0.95);
      
      if (distanceToDestination < 5) {
        // Really close, stop moving (will be handled in setDestination)
        gameState.player.destination = undefined;
      }
    }
  }
  
  // Render player's ship
  renderShip(
    ctx, 
    gameState.player.position.x + cameraX, 
    gameState.player.position.y + cameraY, 
    gameState.player.direction, 
    gameState.player.isAnchored,
    gameState.player.username
  );
  
  // Other players would be rendered here in multiplayer
}
