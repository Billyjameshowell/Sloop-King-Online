import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Game from "@/pages/Game";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";

function Router() {
  // Basic authentication - in a real app, this would be more sophisticated
  const [username, setUsername] = useState<string>("");
  const [userId, setUserId] = useState<number | null>(null);
  
  useEffect(() => {
    // Check for stored username
    const storedUsername = localStorage.getItem("sloopking_username");
    if (storedUsername) {
      setUsername(storedUsername);
      const storedUserId = localStorage.getItem("sloopking_userid");
      if (storedUserId) {
        setUserId(parseInt(storedUserId));
      }
    } else {
      // Create a guest username
      const guestName = `Captain_${Math.floor(Math.random() * 9999)}`;
      setUsername(guestName);
      
      // Create a user account
      fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: guestName,
          password: `guest_${Math.random().toString(36).slice(2, 10)}`
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setUserId(data.id);
          localStorage.setItem("sloopking_username", guestName);
          localStorage.setItem("sloopking_userid", data.id.toString());
        }
      })
      .catch(err => console.error("Failed to create guest user:", err));
    }
  }, []);
  
  return (
    <Switch>
      <Route path="/">
        {userId ? (
          <Game username={username} userId={userId} />
        ) : (
          <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-white font-pixel text-center">
              <h1 className="text-xl mb-4 text-sand-yellow">SLOOP KING</h1>
              <p>Loading your adventure...</p>
            </div>
          </div>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
