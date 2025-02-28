import React from 'react';
import { useGameContext } from '../../context/GameContext';

const SecondaryActions: React.FC = () => {
  const { gameState } = useGameContext();

  return (
    <div className="secondary-actions">
      {/* Render secondary actions content here */}
      <p>Secondary Actions</p>
    </div>
  );
};

export default SecondaryActions;
