import React, { useState, useEffect } from 'react';
import { GameMasterAgent } from '../agents/GameMasterAgent';
import { logger } from '../utils/logger';

interface DebugPanelProps {
  gameMasterAgent: GameMasterAgent | null;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ gameMasterAgent }) => {
  const [gameState, setGameState] = useState<any>(null);

  useEffect(() => {
    if (gameMasterAgent) {
      const fetchGameState = () => {
        try {
          const state = gameMasterAgent.getGameState();
          setGameState(state);
        } catch (error) {
          logger.error('Failed to fetch game state:', error);
        }
      };

      fetchGameState();
    }
  }, [gameMasterAgent]);

  return (
    <div className="debug-panel">
      <h3>Debug Panel</h3>
      {gameState ? (
        <pre>{JSON.stringify(gameState, null, 2)}</pre>
      ) : (
        <p>Loading game state...</p>
      )}
    </div>
  );
};

export default DebugPanel;
