import React from 'react';
import { useGameContext } from '../context/GameContext';

export const StatusBar: React.FC = () => {
  const { state } = useGameContext();
  
  if (!state) {
    return (
      <div className="bg-gray-800 p-2 border-b border-gray-700 text-center">
        <span className="text-gray-400">Location: Unknown</span>
      </div>
    );
  }
  
  const currentRoom = state.rooms[state.playerLocation];
  const locationName = currentRoom ? currentRoom.name : 'Unknown';
  
  return (
    <div className="bg-gray-800 p-2 border-b border-gray-700 text-center">
      <span className="text-purple-400 font-medium">
        Location: {locationName}
      </span>
    </div>
  );
};

export default StatusBar;
