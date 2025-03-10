import { forwardRef, useEffect, useRef } from 'react';
import { GameState } from '@shared/schema';
import { renderWorld, handleKeyDown, handleKeyUp } from '@/lib/game/engine';

interface GameCanvasProps {
  gameState: GameState;
}

const GameCanvas = forwardRef<HTMLCanvasElement, GameCanvasProps>(({ gameState }, ref) => {
  const animationRef = useRef<number | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref as React.RefObject<HTMLCanvasElement>;
    if (!canvas.current) return;
    
    // Store canvas reference and focus it
    canvasRef.current = canvas.current;
    canvasRef.current.focus(); // Explicitly focus the canvas for keyboard events
    
    // Log that the component mounted
    console.log('GameCanvas mounted and initialized', {
      canvasExists: !!canvasRef.current,
      gameStateExists: !!gameState,
      playerAnchored: gameState.player.isAnchored
    });
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      if (canvas.current) {
        canvas.current.width = canvas.current.offsetWidth;
        canvas.current.height = canvas.current.offsetHeight;
        console.log('Canvas resized to:', canvas.current.width, 'x', canvas.current.height);
      }
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Get context
    const ctx = canvas.current.getContext('2d');
    if (!ctx) {
      console.error('Failed to get canvas context');
      return;
    }
    contextRef.current = ctx;
    
    // Enable pixel scaling for retro appearance
    ctx.imageSmoothingEnabled = false;
    
    // Animation loop
    let lastTime = 0;
    const animate = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.current!.width, canvas.current!.height);
      
      // Render game world
      renderWorld(ctx, gameState, deltaTime);
      
      // Continue animation
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate);
    
    // Set up key event listeners with direct debugging
    const keyDownHandler = (e: KeyboardEvent) => {
      console.log('Key down event fired:', e.code);
      
      // Skip if player is anchored or fishing
      if (gameState.player.isAnchored) {
        console.log('Key ignored - player is anchored');
        return;
      }
      
      if (gameState.player.isFishing) {
        console.log('Key ignored - player is fishing');
        return;
      }
      
      handleKeyDown(e, gameState);
    };
    
    const keyUpHandler = (e: KeyboardEvent) => {
      console.log('Key up event fired:', e.code);
      handleKeyUp(e, gameState);
    };
    
    // Attach listeners to the canvas specifically
    canvas.current.addEventListener('keydown', keyDownHandler);
    canvas.current.addEventListener('keyup', keyUpHandler);
    
    // Also attach to window as a fallback
    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
    
    // Clean up
    return () => {
      console.log('GameCanvas unmounting, cleaning up event listeners');
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
      
      // Clean up both sets of event listeners
      if (canvas.current) {
        canvas.current.removeEventListener('keydown', keyDownHandler);
        canvas.current.removeEventListener('keyup', keyUpHandler);
      }
      window.removeEventListener('keydown', keyDownHandler);
      window.removeEventListener('keyup', keyUpHandler);
    };
  }, [ref, gameState]);
  
  return (
    <canvas 
      ref={ref} 
      className="w-full h-full bg-ocean-blue outline-none" 
      tabIndex={0}
    />
  );
});

GameCanvas.displayName = 'GameCanvas';

export default GameCanvas;
