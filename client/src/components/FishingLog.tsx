import { FishingLogEntry } from '@/hooks/useFishingLog';

interface FishingLogProps {
  entries: FishingLogEntry[];
}

export default function FishingLog({ entries }: FishingLogProps) {
  if (entries.length === 0) {
    return (
      <div className="text-white font-pixel-body text-center py-2 text-xs">
        No recent fishing activity.
      </div>
    );
  }

  return (
    <div className="max-h-32 overflow-y-auto">
      {entries.map((entry, index) => (
        <div 
          key={`${entry.timestamp}-${index}`} 
          className={`text-xs mb-1 py-1 px-2 rounded ${
            entry.type === 'catch' 
              ? 'bg-green-800 bg-opacity-50' 
              : entry.type === 'release' 
                ? 'bg-red-800 bg-opacity-50' 
                : 'bg-blue-800 bg-opacity-30'
          }`}
        >
          <p className="text-white font-pixel-body">{entry.message}</p>
        </div>
      ))}
    </div>
  );
}