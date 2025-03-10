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
    // Check for stored username and user ID
    const storedUsername = localStorage.getItem("sloopking_username");
    const storedUserId = localStorage.getItem("sloopking_userid");
    
    // Create a new user function
    const createNewUser = () => {
      const guestName = `Captain_${Math.floor(Math.random() * 1000)}`;
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
          console.log(`Created new user: ${guestName} with ID: ${data.id}`);
        }
      })
      .catch(err => console.error("Failed to create guest user:", err));
    };
    
    // Verify user ID if we have both stored values
    if (storedUsername && storedUserId) {
      // Set initial values
      setUsername(storedUsername);
      const userId = parseInt(storedUserId);
      
      // Verify this user exists
      fetch(`/api/users/${userId}`)
        .then(res => {
          if (res.ok) {
            // User exists, set the ID
            setUserId(userId);
          } else {
            // User doesn't exist, create a new one
            console.log("Stored user ID not found, creating new user");
            createNewUser();
          }
        })
        .catch(() => {
          // Error checking user, create a new one
          console.log("Error verifying user, creating new user");
          createNewUser();
        });
    } else {
      // No stored values, create a new user
      createNewUser();
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
