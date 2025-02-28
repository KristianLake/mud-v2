import React from 'react';
import { useGameContext } from '../../context/GameContext';

const QuestButton: React.FC = () => {
    const { gameState } = useGameContext();

  return (
    <button className="quest-button">
      {gameState?.activeQuests && gameState.activeQuests.length > 0 ? `Active Quests (${gameState.activeQuests.length})` : 'No Active Quests'}
    </button>
  );
};

export default QuestButton;
