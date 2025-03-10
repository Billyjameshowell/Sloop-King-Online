import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Make sure the game runs on production build
if (import.meta.env.PROD) {
  // Disable console.log in production
  console.log = () => {};
}

createRoot(document.getElementById("root")!).render(<App />);
