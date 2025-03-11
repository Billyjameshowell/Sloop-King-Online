import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Keep the interface for backward compatibility but don't implement the function
declare global {
  interface Window {
    debugKeyPress?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  }
}

// Make sure the game runs on production build
if (import.meta.env.PROD) {
  // Disable console.log in production
  console.log = () => {};
}

createRoot(document.getElementById("root")!).render(<App />);
