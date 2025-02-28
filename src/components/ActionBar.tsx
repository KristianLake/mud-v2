import React from 'react';

interface ActionBarProps {
  onDirectionClick: (direction: string) => void;
  availableDirections?: string[]; // Made optional with ? operator
}

const ActionBar: React.FC<ActionBarProps> = ({ 
  onDirectionClick, 
  availableDirections = [] // Add default empty array
}) => {
  const directions = [
    { name: 'North', value: 'north', icon: '↑' },
    { name: 'East', value: 'east', icon: '→' },
    { name: 'South', value: 'south', icon: '↓' },
    { name: 'West', value: 'west', icon: '←' }
  ];

  return (
    <div className="p-2 bg-gray-800 border-t border-gray-700 flex justify-center">
      <div className="grid grid-cols-4 gap-2 max-w-md">
        {directions.map((dir) => (
          <button
            key={dir.value}
            onClick={() => onDirectionClick(dir.value)}
            disabled={!availableDirections.includes(dir.value)}
            className={`
              px-4 py-2 rounded flex items-center justify-center
              ${availableDirections.includes(dir.value)
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
            `}
          >
            <span className="mr-1">{dir.icon}</span>
            <span>{dir.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActionBar;
