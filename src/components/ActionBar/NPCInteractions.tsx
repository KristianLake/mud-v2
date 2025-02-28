import React, { useState } from 'react';
import { useGameContext } from '../../context/GameContext';

const NPCInteractions: React.FC = () => {
  const { gameState, executeCommand } = useGameContext();
  const [activeNpcId, setActiveNpcId] = useState<string | null>(null);
  
  const currentRoom = gameState?.rooms?.[gameState.playerLocation];
  const npcs = currentRoom?.npcs || [];

  const handleTalkToNPC = (npcId: string) => {
    setActiveNpcId(npcId); // Track which NPC is actively being talked to
    const npc = gameState.npcs[npcId];
    if (npc) {
      executeCommand(`talk ${npc.name}`);
    }
  };

  const handleNPCAction = (action: string, npcId: string) => {
    executeCommand(`${action} ${npcId}`);
  };

  const isNPCMerchant = (npcId: string) => {
    return gameState.npcs[npcId]?.isMerchant || false;
  };

  const isNPCQuestGiver = (npcId: string) => {
    return gameState.npcs[npcId]?.isQuestGiver || false;
  };

  if (!npcs.length) {
    return (
      <div className="npc-interactions p-2 text-gray-400">
        No NPCs in this room.
      </div>
    );
  }

  return (
    <div className="npc-interactions p-2">
      <h3 className="text-sm font-semibold mb-2">NPCs:</h3>
      <div className="flex flex-wrap gap-2 mb-2">
        {npcs.map((npcId) => {
          const npc = gameState.npcs[npcId];
          if (!npc) return null;
          
          const isActive = activeNpcId === npcId;
          
          return (
            <button
              key={npcId}
              className={`${isActive ? 'bg-green-700' : 'bg-gray-700 hover:bg-gray-600'} text-green-300 px-3 py-1 rounded text-xs`}
              onClick={() => handleTalkToNPC(npcId)}
              title={npc.description}
            >
              {npc.name}
            </button>
          );
        })}
      </div>
      
      {/* Show action buttons for the active NPC */}
      {activeNpcId && (
        <div className="npc-actions bg-gray-800 p-2 rounded">
          <div className="flex flex-wrap gap-2">
            {isNPCMerchant(activeNpcId) && (
              <>
                <button
                  className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded text-xs"
                  onClick={() => handleNPCAction('buy from', activeNpcId)}
                >
                  Buy Items
                </button>
                <button
                  className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded text-xs"
                  onClick={() => handleNPCAction('sell to', activeNpcId)}
                >
                  Sell Items
                </button>
              </>
            )}
            
            {isNPCQuestGiver(activeNpcId) && (
              <button
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs"
                onClick={() => handleNPCAction('quest', activeNpcId)}
              >
                Quests
              </button>
            )}
            
            <button
              className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-xs"
              onClick={() => setActiveNpcId(null)}
            >
              End Conversation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NPCInteractions;
