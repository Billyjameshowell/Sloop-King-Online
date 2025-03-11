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

// Debug function kept for backward compatibility but functionality disabled
export function debugKeyPress(direction: 'up' | 'down' | 'left' | 'right') {
  // Function is maintained for interface compatibility but doesn't do anything
  console.log('Debug controls have been disabled');
}

export function handleKeyDown(e: KeyboardEvent, gameState: GameState) {
  if (gameState.player.isFishing) {
    console.log('Key event ignored - player is fishing');
    return;
  }
  
  if (gameState.player.isAnchored) {
    console.log('Key ignored - player is anchored');
    return;
  }
  
  console.log('Key down event fired:', e.code);
  
  switch (e.code) {
    case 'KeyW':
    case 'ArrowUp':
      keys.up = true;
      console.log('UP key pressed, keys state:', keys);
      break;
    case 'KeyS':
    case 'ArrowDown':
      keys.down = true;
      console.log('DOWN key pressed, keys state:', keys);
      break;
    case 'KeyA':
    case 'ArrowLeft':
      keys.left = true;
      console.log('LEFT key pressed, keys state:', keys);
      break;
    case 'KeyD':
    case 'ArrowRight':
      keys.right = true;
      console.log('RIGHT key pressed, keys state:', keys);
      break;
    case 'Space':
      keys.space = true;
      console.log('SPACE key pressed, keys state:', keys);
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
  if (gameState.player.isFishing) {
    console.log('Key up ignored - player is fishing');
    return;
  }
  
  if (gameState.player.isAnchored) {
    console.log('Key up ignored - player is anchored');
    return;
  }
  
  console.log('Key up event fired:', e.code);
  
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
  
  // Debug physics update
  console.log('Physics update - delta:', deltaTime, 'Player state:', {
    position: player.position, 
    direction: player.direction,
    speed: player.speed,
    isMoving: player.isMoving,
    isAnchored: player.isAnchored,
    isFishing: player.isFishing,
    destination: player.destination,
    keysState: {...keys}
  });
  
  // Skip physics update if fishing
  if (player.isFishing) {
    console.log('Physics update skipped: Player is fishing');
    return;
  }
  
  // Only allow movement if not anchored
  if (!player.isAnchored) {
    console.log('Player is not anchored, movement allowed');
    // Auto-pilot to destination if set
    if (player.destination) {
      console.log('Following destination:', player.destination);
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
      
      // Set movement direction based on keypresses
      const movementX = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      const movementY = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
      
      // Only adjust values if there's movement input
      if (movementX !== 0 || movementY !== 0) {
        // Determine the movement direction based on key inputs
        // We'll directly apply the movement rather than using the ship's direction
        const moveSpeed = MAX_SPEED * 0.7; // Slightly slower than max speed
        
        // Update player position directly
        player.position.x += movementX * moveSpeed * (deltaTime / 16);
        player.position.y += movementY * moveSpeed * (deltaTime / 16);
        
        // Constrain to world bounds
        if (player.position.x < 0) player.position.x = 0;
        if (player.position.x > gameState.world.width) player.position.x = gameState.world.width;
        if (player.position.y < 0) player.position.y = 0;
        if (player.position.y > gameState.world.height) player.position.y = gameState.world.height;
        
        // Set player direction for visual rotation only if moving
        if (movementX !== 0 || movementY !== 0) {
          // Calculate direction based on movement
          // 0 = right, 90 = down, 180 = left, 270 = up
          let newDirection = 0;
          
          if (movementX > 0 && movementY === 0) newDirection = 0;       // Right
          else if (movementX < 0 && movementY === 0) newDirection = 180; // Left
          else if (movementX === 0 && movementY > 0) newDirection = 90;  // Down
          else if (movementX === 0 && movementY < 0) newDirection = 270; // Up
          else if (movementX > 0 && movementY > 0) newDirection = 45;    // Down-right
          else if (movementX > 0 && movementY < 0) newDirection = 315;   // Up-right
          else if (movementX < 0 && movementY > 0) newDirection = 135;   // Down-left
          else if (movementX < 0 && movementY < 0) newDirection = 225;   // Up-left
          
          // Set the direction for rendering
          player.direction = newDirection;
        }
        
        player.isMoving = true;
      } else {
        // No movement input
        player.isMoving = false;
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
