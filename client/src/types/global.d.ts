// Global types declaration for the application

// Add debugKeyPress to Window interface
interface Window {
  debugKeyPress?: (direction: 'up' | 'down' | 'left' | 'right') => void;
}