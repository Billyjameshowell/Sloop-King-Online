import { useState, useCallback } from 'react';

export interface FishingLogEntry {
  message: string;
  timestamp: number;
  type: 'catch' | 'release' | 'info';
}

export function useFishingLog(maxEntries = 10) {
  const [logEntries, setLogEntries] = useState<FishingLogEntry[]>([]);
  
  const addLogEntry = useCallback((message: string, type: 'catch' | 'release' | 'info' = 'info') => {
    const newEntry: FishingLogEntry = {
      message,
      timestamp: Date.now(),
      type
    };
    
    setLogEntries(prev => {
      // Add new entry at the beginning and keep only the last maxEntries
      const updated = [newEntry, ...prev];
      if (updated.length > maxEntries) {
        return updated.slice(0, maxEntries);
      }
      return updated;
    });
  }, [maxEntries]);
  
  const clearLog = useCallback(() => {
    setLogEntries([]);
  }, []);
  
  return {
    logEntries,
    addLogEntry,
    clearLog
  };
}