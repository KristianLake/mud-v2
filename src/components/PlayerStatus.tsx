import React, { useState } from 'react';
import { useGameContext } from '../context/GameContext';

export const PlayerStatus: React.FC = () => {
  const { state } = useGameContext();
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!state || !state.playerStats) {
    return (
      <button 
        className="w-full p-3 bg-gray-700 text-white rounded-t-md font-semibold"
        disabled
      >
        Loading player information...
      </button>
    );
  }
  
  const playerStats = state.playerStats;
  
  // Calculate health percentage for progress bar
  const healthPercentage = Math.floor((playerStats.health / playerStats.maxHealth) * 100);
  
  // Calculate experience percentage for progress bar (assuming 100 XP per level)
  const levelExpRequired = playerStats.level * 100;
  const expPercentage = Math.floor((playerStats.experience % levelExpRequired) / levelExpRequired * 100);
  
  // Toggle expanded view
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div className="bg-gray-800 rounded-t-md overflow-hidden">
      {/* Status Button */}
      <button 
        onClick={toggleExpanded}
        className="w-full p-3 flex justify-between items-center bg-gray-700 hover:bg-gray-600 text-white font-semibold transition-colors"
      >
        <span>Player Status</span>
        <div className="flex items-center space-x-4">
          <span className={`${healthPercentage < 30 ? 'text-red-500' : healthPercentage < 70 ? 'text-yellow-400' : 'text-green-500'}`}>
            HP: {playerStats.health}/{playerStats.maxHealth}
          </span>
          <span className="text-blue-400">LVL: {playerStats.level}</span>
          <span className="text-yellow-400">Gold: {playerStats.gold}</span>
          <span>{isExpanded ? '▲' : '▼'}</span>
        </div>
      </button>
      
      {/* Expanded Status Panel */}
      {isExpanded && (
        <div className="p-4">
          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <span>Health:</span>
              <span>{playerStats.health}/{playerStats.maxHealth}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${healthPercentage < 30 ? 'bg-red-500' : healthPercentage < 70 ? 'bg-yellow-400' : 'bg-green-500'}`} 
                style={{ width: `${healthPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <span>Level:</span>
              <span>{playerStats.level}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Experience:</span>
              <span>{playerStats.experience}/{levelExpRequired}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className="h-2.5 rounded-full bg-blue-500" 
                style={{ width: `${expPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="flex justify-between">
              <span>Gold:</span>
              <span className="text-yellow-400">{playerStats.gold}</span>
            </div>
          </div>
          
          <div className="mb-3">
            <h4 className="font-medium mb-1">Inventory:</h4>
            {state.inventory && state.inventory.length > 0 ? (
              <ul className="list-disc list-inside">
                {state.inventory.map((itemId: string) => {
                  const item = state.items[itemId];
                  return item ? (
                    <li key={itemId} className="text-sm">{item.name}</li>
                  ) : (
                    <li key={itemId} className="text-sm">{itemId}</li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No items in inventory</p>
            )}
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Active Quests:</h4>
            {state.quests && state.quests.filter((q: any) => q.isActive).length > 0 ? (
              <ul className="list-disc list-inside">
                {state.quests
                  .filter((q: any) => q.isActive)
                  .map((quest: any) => (
                    <li key={quest.id} className="text-sm">
                      {quest.name}
                      {quest.canComplete && (
                        <span className="text-green-400 ml-2">(Ready to complete)</span>
                      )}
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No active quests</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerStatus;
