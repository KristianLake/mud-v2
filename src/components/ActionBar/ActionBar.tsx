import React from 'react';
import { IRoom } from '../../domain/entities/interfaces/IRoom';
import { INPC } from '../../domain/entities/interfaces/INPC';
import { IItem } from '../../domain/entities/interfaces/IItem';
import ActionButton from './ActionButton';
import ItemMenu from './ItemMenu';
import NPCInteractions from './NPCInteractions';

interface ActionBarProps {
  currentRoom?: IRoom;
  npcs: INPC[];
  items: IItem[];
  executeCommand: (command: string) => void;
}

/**
 * Action Bar component that shows context-sensitive actions
 * based on the current room, NPCs present, items, etc.
 */
const ActionBar: React.FC<ActionBarProps> = ({
  currentRoom,
  npcs,
  items,
  executeCommand
}) => {
  // Don't render if no room data
  if (!currentRoom) {
    return null;
  }

  // Handle talking to an NPC
  const handleTalkToNPC = (npc: INPC) => {
    executeCommand(`talk to ${npc.name.toLowerCase()}`);
  };

  // Handle examining an item
  const handleExamineItem = (item: IItem) => {
    executeCommand(`examine ${item.name.toLowerCase()}`);
  };

  // Handle taking an item
  const handleTakeItem = (item: IItem) => {
    executeCommand(`take ${item.name.toLowerCase()}`);
  };

  return (
    <div className="action-bar flex flex-col gap-2">
      {/* NPC interactions */}
      {npcs.length > 0 && (
        <div className="npc-actions">
          <h4 className="text-sm font-semibold mb-1">Characters:</h4>
          <div className="flex flex-wrap gap-1">
            {npcs.map(npc => (
              <ActionButton
                key={npc.id}
                label={`Talk to ${npc.name}`}
                onClick={() => handleTalkToNPC(npc)}
                icon="chat"
              />
            ))}
          </div>
        </div>
      )}

      {/* Item interactions */}
      {items.length > 0 && (
        <div className="item-actions">
          <h4 className="text-sm font-semibold mb-1">Items:</h4>
          <div className="flex flex-wrap gap-1">
            {items.map(item => (
              <React.Fragment key={item.id}>
                <ActionButton
                  label={`Examine ${item.name}`}
                  onClick={() => handleExamineItem(item)}
                  icon="search"
                />
                <ActionButton
                  label={`Take ${item.name}`}
                  onClick={() => handleTakeItem(item)}
                  icon="arrow-up"
                />
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Room-specific actions */}
      <div className="room-actions">
        <h4 className="text-sm font-semibold mb-1">Room Actions:</h4>
        <div className="flex flex-wrap gap-1">
          <ActionButton
            label="Look around"
            onClick={() => executeCommand('look')}
            icon="eye"
          />
          {/* Could add more room-specific actions based on room type */}
        </div>
      </div>
    </div>
  );
};

export default ActionBar;
