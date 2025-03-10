import { forwardRef, useEffect, useRef } from 'react';
import { GameState } from '@shared/schema';
import { renderWorld, handleKeyDown, handleKeyUp } from '@/lib/game/engine';

interface GameCanvasProps {
  gameState: GameState;
}

const GameCanvas = forwardRef<HTMLCanvasElement, GameCanvasProps>(({ gameState }, ref) => {
  const animationRef = useRef<number | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  
  useEffect(() => {
    const canvas = ref as React.RefObject<HTMLCanvasElement>;
    if (!canvas.current) return;
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      if (canvas.current) {
        canvas.current.width = canvas.current.offsetWidth;
        canvas.current.height = canvas.current.offsetHeight;
      }
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Get context
    const ctx = canvas.current.getContext('2d');
    if (!ctx) return;
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
    
    // Set up key event listeners
    const keyDownHandler = (e: KeyboardEvent) => handleKeyDown(e, gameState);
    const keyUpHandler = (e: KeyboardEvent) => handleKeyUp(e, gameState);
    
    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
    
    // Clean up
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
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
