import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { debugKeyPress } from "./lib/game/engine";

// Make debug function available globally for UI integration
declare global {
  interface Window {
    debugKeyPress?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  }
}

// Assign the debug function to window
window.debugKeyPress = debugKeyPress;

// Make sure the game runs on production build
if (import.meta.env.PROD) {
  // Disable console.log in production
  console.log = () => {};
}

createRoot(document.getElementById("root")!).render(<App />);
