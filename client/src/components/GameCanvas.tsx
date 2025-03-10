import { forwardRef, useEffect, useRef, useCallback } from 'react';
import { GameState } from '@shared/schema';
import { renderWorld, handleKeyDown, handleKeyUp } from '@/lib/game/engine';

interface GameCanvasProps {
  gameState: GameState;
  onSetDestination?: (x: number, y: number) => void;
}

const GameCanvas = forwardRef<HTMLCanvasElement, GameCanvasProps>(({ gameState, onSetDestination }, ref) => {
  const animationRef = useRef<number | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Handle canvas click to set ship destination
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('Canvas clicked!', e);
    console.log('Current game state:', gameState);
    console.log('Canvas ref exists:', !!canvasRef.current);
    console.log('onSetDestination exists:', !!onSetDestination);
    console.log('Is player anchored:', gameState.player.isAnchored);
    
    if (!canvasRef.current || !onSetDestination) {
      console.log('Canvas click ignored: missing canvas ref or destination handler');
      return;
    }
    
    if (gameState.player.isAnchored) {
      console.log('Canvas click ignored: player is anchored');
      return;
    }
    
    // Get canvas-relative coordinates
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    console.log('Canvas dimensions:', {
      width: canvasRef.current.width,
      height: canvasRef.current.height,
      rectWidth: rect.width,
      rectHeight: rect.height,
      scaleX,
      scaleY
    });
    
    // Calculate world coordinates (accounting for camera position)
    const worldX = (e.clientX - rect.left) * scaleX + gameState.player.position.x - canvasRef.current.width / 2;
    const worldY = (e.clientY - rect.top) * scaleY + gameState.player.position.y - canvasRef.current.height / 2;
    
    console.log('Setting destination to:', worldX, worldY);
    onSetDestination(worldX, worldY);
  }, [gameState.player.position, gameState.player.isAnchored, onSetDestination]);

  useEffect(() => {
    const canvas = ref as React.RefObject<HTMLCanvasElement>;
    if (!canvas.current) return;
    
    // Store canvas reference
    canvasRef.current = canvas.current;
    
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
      className="w-full h-full bg-ocean-blue outline-none cursor-pointer" 
      tabIndex={0}
      onClick={handleCanvasClick}
    />
  );
});

GameCanvas.displayName = 'GameCanvas';

export default GameCanvas;
