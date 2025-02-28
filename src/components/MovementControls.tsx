import React from 'react';
import { useGameContext } from '../context/GameContext';
import { useGameCommands } from '../hooks/useGameCommands';

/**
 * Movement controls component for directional navigation
 */
const MovementControls: React.FC = () => {
  const { state } = useGameContext();
  const { moveDirection } = useGameCommands();
  
  // Determine available directions
  const availableDirections = React.useMemo(() => {
    if (!state || !state.playerLocation) return [];
    
    const currentRoom = state.rooms[state.playerLocation];
    if (!currentRoom || !currentRoom.exits) return [];
    
    return Object.keys(currentRoom.exits);
  }, [state]);
  
  // Define all possible directions
  const directions = [
    { label: 'North', value: 'north', icon: '↑', position: 'top' },
    { label: 'East', value: 'east', icon: '→', position: 'right' },
    { label: 'South', value: 'south', icon: '↓', position: 'bottom' },
    { label: 'West', value: 'west', icon: '←', position: 'left' }
  ];
  
  return (
    <div className="p-3 bg-gray-800 border-t border-gray-700">
      <div className="relative h-32 w-32 mx-auto">
        {directions.map(dir => (
          <button
            key={dir.value}
            onClick={() => moveDirection(dir.value)}
            disabled={!availableDirections.includes(dir.value)}
            className={`
              absolute w-10 h-10 rounded-full flex items-center justify-center
              ${dir.position === 'top' ? 'top-0 left-1/2 transform -translate-x-1/2' : ''}
              ${dir.position === 'right' ? 'right-0 top-1/2 transform -translate-y-1/2' : ''}
              ${dir.position === 'bottom' ? 'bottom-0 left-1/2 transform -translate-x-1/2' : ''}
              ${dir.position === 'left' ? 'left-0 top-1/2 transform -translate-y-1/2' : ''}
              ${availableDirections.includes(dir.value)
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
            `}
            aria-label={`Go ${dir.label}`}
          >
            {dir.icon}
          </button>
        ))}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
          <span className="text-xs text-gray-400">You</span>
        </div>
      </div>
    </div>
  );
};

export default MovementControls;
