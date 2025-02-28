import React from 'react';
import { useGameState } from '../hooks/useGameState';

export const StatusBar: React.FC = () => {
  const { gameState } = useGameState();
  
  if (!gameState) {
    return (
      <div className="flex justify-between bg-gray-800 p-2 border-b border-gray-700">
        <div>Health: --/--</div>
        <div>Level: --</div>
        <div>Location: Unknown</div>
      </div>
    );
  }
  
  const { playerStats } = gameState;
  const currentRoom = gameState.rooms[gameState.playerLocation];
  const locationName = currentRoom ? currentRoom.name : 'Unknown';
  
  // Calculate health percentage for color coding
  const healthPercentage = (playerStats.health / playerStats.maxHealth) * 100;
  let healthColor = 'text-green-400';
  
  if (healthPercentage < 30) {
    healthColor = 'text-red-500';
  } else if (healthPercentage < 70) {
    healthColor = 'text-yellow-400';
  }
  
  return (
    <div className="flex justify-between bg-gray-800 p-2 border-b border-gray-700 text-sm md:text-base">
      <div className={healthColor}>
        Health: {playerStats.health}/{playerStats.maxHealth}
      </div>
      <div className="text-blue-400">
        Level: {playerStats.level} ({playerStats.experience}/{playerStats.nextLevelExp} XP)
      </div>
      <div className="text-purple-400">
        Location: {locationName}
      </div>
    </div>
  );
};
export default StatusBar;
