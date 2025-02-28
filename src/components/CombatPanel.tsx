import React from 'react';
import { useGame } from '../context/GameContext';
import { useLifecycleLogging } from '../hooks/useLifecycleLogging';

const CombatPanel: React.FC = () => {
  const { gameState } = useGame();

  useLifecycleLogging("CombatPanel", { gameState });

  // Render combat-related information and controls here
  return (
    <div className="combat-panel">
      {/* Combat content */}
    </div>
  );
};

export default CombatPanel;
