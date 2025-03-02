import { useState, useCallback } from 'react';
import { useGameContext } from '../context/GameContext';
import { logger } from '../utils/logger';

/**
 * Hook for processing game commands
 * @returns Object with command functions
 */
export function useGameCommands() {
  const { state, addMessage, gameMaster } = useGameContext();
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  
  /**
   * Process a command and return the response
   * @param command Command to process
   * @returns Response from the game master
   */
  const executeCommand = useCallback((command: string): string => {
    if (!command.trim() || !gameMaster) {
      return 'Cannot process command at this time.';
    }
    
    try {
      logger.debug(`Executing command: ${command}`);
      setLastCommand(command);
      
      // Use GameMaster to process command
      const response = gameMaster.processCommand(command);
      return response;
    } catch (error) {
      logger.error('Error executing command', { command, error });
      const errorMessage = error instanceof Error ? error.message : String(error);
      return `Error: ${errorMessage}`;
    }
  }, [gameMaster]);
  
  /**
   * Process a command and add it to the message log
   * @param command Command to process
   */
  const processCommand = useCallback((command: string) => {
    if (!command.trim()) return;
    
    try {
      // Make sure we're using the clean command
      const cleanCommand = command.replace(/You see$/i, '').trim();
      
      logger.debug(`Processing command: ${cleanCommand}`);
      setLastCommand(cleanCommand);
      
      // Add player command to message log
      addMessage(`> ${cleanCommand}`, 'player');
      
      // Use GameMaster to process command if available
      if (gameMaster) {
        // Extract command and args
        const [cmd, ...args] = cleanCommand.toLowerCase().split(/\s+/);
        
        // Handle movement commands
        if (cmd === 'go' || ['north', 'south', 'east', 'west', 'up', 'down', 'n', 's', 'e', 'w', 'u', 'd'].includes(cmd)) {
          let direction = '';
          
          if (cmd === 'go' && args.length > 0) {
            direction = args[0].toLowerCase();
          } else {
            direction = cmd;
          }
          
          // Normalize single-letter directions
          const dirMap = { 'n': 'north', 's': 'south', 'e': 'east', 'w': 'west', 'u': 'up', 'd': 'down' };
          direction = dirMap[direction as keyof typeof dirMap] || direction;
          
          // Move the player
          handleMovement(direction);
          return;
        }
        
        // Handle item commands
        if (cmd === 'take' || cmd === 'get') {
          const itemName = args.join(' ').toLowerCase();
          handleTakeItem(itemName);
          return;
        }
        
        if (cmd === 'examine' || cmd === 'look') {
          if (args.length === 0) {
            // Look at the room if no target specified
            handleLookRoom();
            return;
          } else {
            const target = args.join(' ').toLowerCase();
            handleExamine(target);
            return;
          }
        }
        
        if (cmd === 'inventory' || cmd === 'i') {
          handleInventory();
          return;
        }
        
        // Handle NPC commands
        if (cmd === 'talk' && args.length >= 2 && args[0] === 'to') {
          const npcName = args.slice(1).join(' ').toLowerCase();
          handleTalkToNPC(npcName);
          return;
        }
        
        // Handle trade commands
        if (cmd === 'buy') {
          const itemName = args.join(' ').toLowerCase();
          handleBuyItem(itemName);
          return;
        }
        
        if (cmd === 'sell') {
          const itemName = args.join(' ').toLowerCase();
          handleSellItem(itemName);
          return;
        }
        
        // Handle quest commands
        if (cmd === 'quest' || cmd === 'quests') {
          handleQuestList();
          return;
        }
        
        if (cmd === 'accept' && args.length > 0) {
          const questName = args.join(' ').toLowerCase();
          handleAcceptQuest(questName);
          return;
        }
        
        if (cmd === 'complete' && args.length > 0) {
          const questName = args.join(' ').toLowerCase();
          handleCompleteQuest(questName);
          return;
        }
        
        if (cmd === 'help') {
          handleHelp();
          return;
        }
        
        // For other commands, let the game master process them
        const response = gameMaster.processCommand(cleanCommand);
        
        // Don't show "You typed: command" messages
        if (response && !response.startsWith('You typed:')) {
          addMessage(response, 'system');
        } else {
          addMessage(`Command not recognized. Type 'help' for a list of commands.`, 'system');
        }
      } else {
        throw new Error('Game not fully initialized');
      }
    } catch (error) {
      logger.error('Error processing command', { command, error });
      const errorMessage = error instanceof Error ? error.message : String(error);
      addMessage(`Error: ${errorMessage}`, 'error');
    }
  }, [addMessage, gameMaster, state]);
  
  /**
   * Process a movement command
   * @param direction Direction to move
   */
  const moveDirection = useCallback((direction: string) => {
    processCommand(`go ${direction}`);
  }, [processCommand]);
  
  // Helper function to handle movement
  const handleMovement = (direction: string) => {
    if (!state || !state.playerLocation) {
      addMessage('Cannot determine your current location.', 'error');
      return;
    }
    
    const currentRoom = state.rooms[state.playerLocation];
    
    if (currentRoom && currentRoom.exits && currentRoom.exits[direction]) {
      const destRoomId = currentRoom.exits[direction];
      const destRoom = state.rooms[destRoomId];
      
      if (destRoom) {
        // Move the player
        if (gameMaster?.movePlayer(direction)) {
          // Display movement and room description
          addMessage(`You move ${direction} to ${destRoom.name}.`, 'system');
          
          // Show room description
          const exitsStr = Object.keys(destRoom.exits || {}).join(', ');
          let roomDesc = `[ ${destRoom.name} ] ${destRoom.description}\n\nExits: ${exitsStr || 'none'}`;
          
          // Add items and NPCs to room description if present
          if (destRoom.items && destRoom.items.length > 0) {
            const itemsList = destRoom.items.map(id => state.items[id].name).join(', ');
            roomDesc += `\n\nItems: ${itemsList}`;
          }
          
          if (destRoom.npcs && destRoom.npcs.length > 0) {
            const npcsList = destRoom.npcs.map(id => state.npcs[id].name).join(', ');
            roomDesc += `\n\nYou see: ${npcsList}`;
          }
          
          addMessage(roomDesc, 'system');
        }
      }
    } else {
      addMessage(`You can't go ${direction} from here.`, 'system');
    }
  };
  
  // Handle looking at the current room
  const handleLookRoom = () => {
    if (!state || !state.playerLocation) {
      addMessage('Cannot determine your current location.', 'error');
      return;
    }
    
    const currentRoom = state.rooms[state.playerLocation];
    
    if (currentRoom) {
      // Show room description
      const exitsStr = Object.keys(currentRoom.exits || {}).join(', ');
      let roomDesc = `[ ${currentRoom.name} ] ${currentRoom.description}\n\nExits: ${exitsStr || 'none'}`;
      
      // Add items and NPCs to room description if present
      if (currentRoom.items && currentRoom.items.length > 0) {
        const itemsList = currentRoom.items.map(id => state.items[id].name).join(', ');
        roomDesc += `\n\nItems: ${itemsList}`;
      }
      
      if (currentRoom.npcs && currentRoom.npcs.length > 0) {
        const npcsList = currentRoom.npcs.map(id => state.npcs[id].name).join(', ');
        roomDesc += `\n\nYou see: ${npcsList}`;
      }
      
      addMessage(roomDesc, 'system');
    }
  };
  
  // Helper function to handle examining items or NPCs
  const handleExamine = (target: string) => {
    if (!state || !state.playerLocation) {
      addMessage('Cannot determine your current location.', 'error');
      return;
    }
    
    // Check if it's an item in the room
    const currentRoom = state.rooms[state.playerLocation];
    if (currentRoom.items) {
      const roomItem = currentRoom.items.find(id => 
        state.items[id] && state.items[id].name.toLowerCase() === target
      );
      
      if (roomItem) {
        const item = state.items[roomItem];
        addMessage(`${item.name}: ${item.description}`, 'system');
        return;
      }
    }
    
    // Check if it's an item in inventory
    if (state.inventory) {
      const inventoryItem = state.inventory.find(id => 
        state.items[id] && state.items[id].name.toLowerCase() === target
      );
      
      if (inventoryItem) {
        const item = state.items[inventoryItem];
        addMessage(`${item.name}: ${item.description}`, 'system');
        return;
      }
    }
    
    // Check if it's an NPC in the room
    if (currentRoom.npcs) {
      const roomNPC = currentRoom.npcs.find(id => 
        state.npcs[id] && state.npcs[id].name.toLowerCase() === target
      );
      
      if (roomNPC) {
        const npc = state.npcs[roomNPC];
        addMessage(`${npc.name}: ${npc.description}`, 'system', [
          { label: 'Talk', command: `talk to ${npc.name}`, style: 'primary' },
          { label: 'Trade', command: `trade with ${npc.name}`, style: 'secondary' }
        ]);
        return;
      }
    }
    
    // Not found
    addMessage(`You don't see any "${target}" here.`, 'system');
  };
  
  // Helper function to handle taking items
  const handleTakeItem = (itemName: string) => {
    if (!state || !state.playerLocation) {
      addMessage('Cannot determine your current location.', 'error');
      return;
    }
    
    const currentRoom = state.rooms[state.playerLocation];
    
    if (currentRoom.items && currentRoom.items.length > 0) {
      // Find the item by name
      const itemId = currentRoom.items.find(id => 
        state.items[id] && state.items[id].name.toLowerCase() === itemName
      );
      
      if (itemId) {
        const item = state.items[itemId];
        
        if (!item.isCarryable) {
          addMessage(`You can't take the ${item.name}.`, 'system');
          return;
        }
        
        // Take the item through game master
        if (gameMaster?.takeItem(itemId)) {
          addMessage(`You take the ${item.name}.`, 'system');
          
          // Check if this completes a quest objective
          if (gameMaster.checkQuestItemCollected && gameMaster.checkQuestItemCollected(itemId)) {
            addMessage('This item is needed for one of your quests!', 'system', [
              { label: 'Check Quests', command: 'quests', style: 'primary' }
            ]);
          }
        } else {
          addMessage(`You couldn't take the ${item.name}.`, 'system');
        }
      } else {
        addMessage(`You don't see any "${itemName}" here.`, 'system');
      }
    } else {
      addMessage(`There's nothing here to take.`, 'system');
    }
  };
  
  // Helper function to display inventory
  const handleInventory = () => {
    if (!state || !state.inventory) {
      addMessage('You are not carrying anything.', 'system');
      return;
    }
    
    if (state.inventory.length === 0) {
      addMessage('You are not carrying anything.', 'system');
      return;
    }
    
    const items = state.inventory.map(id => {
      const item = state.items[id];
      return item ? item.name : id;
    });
    
    addMessage(`You are carrying: ${items.join(', ')}`, 'system', 
      items.map(itemName => ({
        label: `Examine ${itemName}`,
        command: `examine ${itemName}`,
        style: 'info'
      }))
    );
  };
  
  // Helper function to talk to NPCs
  const handleTalkToNPC = (npcName: string) => {
    if (!state || !state.playerLocation) {
      addMessage('Cannot determine your current location.', 'error');
      return;
    }
    
    const currentRoom = state.rooms[state.playerLocation];
    
    if (!currentRoom.npcs || currentRoom.npcs.length === 0) {
      addMessage(`There's nobody here to talk to.`, 'system');
      return;
    }
    
    // Find the NPC by name
    const npcId = currentRoom.npcs.find(id => 
      state.npcs[id] && state.npcs[id].name.toLowerCase() === npcName
    );
    
    if (!npcId) {
      addMessage(`You don't see any "${npcName}" here.`, 'system');
      return;
    }
    
    const npc = state.npcs[npcId];
    
    // Get conversation state from game master
    if (gameMaster?.startConversation) {
      const convo = gameMaster.startConversation(npcId);
      
      // Show greeting
      addMessage(`${npc.name}: ${npc.dialogue.greeting}`, 'system');
      
      // Show dialogue options as buttons
      const options = [];
      
      // Basic dialogue options
      options.push({ label: 'Ask about town', command: `say tell me about the town`, style: 'primary' });
      options.push({ label: 'Ask about yourself', command: `say who are you`, style: 'info' });
      
      // Trade option if NPC can trade
      if (npc.canTrade) {
        options.push({ label: 'Trade', command: `trade with ${npc.name}`, style: 'secondary' });
      }
      
      // Quest option if NPC has a quest
      if (npc.hasQuest) {
        options.push({ label: 'Ask about tasks', command: `say do you have any tasks`, style: 'success' });
      }
      
      // Add all options
      addMessage('What would you like to talk about?', 'system', options);
    } else {
      // Fallback if game master doesn't support conversations
      addMessage(`${npc.name}: ${npc.dialogue.greeting}`, 'system', [
        { label: 'End conversation', command: 'leave', style: 'secondary' }
      ]);
    }
  };
  
  // Helper function to buy items
  const handleBuyItem = (itemName: string) => {
    // This requires the game master to have trading functionality
    if (gameMaster?.buyItem) {
      const success = gameMaster.buyItem(itemName);
      if (success) {
        addMessage(`You purchased ${itemName}.`, 'system');
      } else {
        addMessage(`You couldn't purchase ${itemName}.`, 'system');
      }
    } else {
      addMessage('Shopping is not implemented yet.', 'system');
    }
  };
  
  // Helper function to sell items
  const handleSellItem = (itemName: string) => {
    // This requires the game master to have trading functionality
    if (gameMaster?.sellItem) {
      const success = gameMaster.sellItem(itemName);
      if (success) {
        addMessage(`You sold ${itemName}.`, 'system');
      } else {
        addMessage(`You couldn't sell ${itemName}.`, 'system');
      }
    } else {
      addMessage('Selling items is not implemented yet.', 'system');
    }
  };
  
  // Helper function to list quests
  const handleQuestList = () => {
    if (!state || !state.quests) {
      addMessage('You don\'t have any quests yet.', 'system');
      return;
    }
    
    if (state.quests.length === 0) {
      addMessage('You don\'t have any quests yet.', 'system');
      return;
    }
    
    addMessage('Your quests:', 'system');
    
    state.quests.forEach((quest: any) => {
      // Create a quest display with objectives
      let questMessage = `- ${quest.name}: ${quest.description}`;
      
      if (quest.objectives && quest.objectives.length > 0) {
        questMessage += '\nObjectives:';
        quest.objectives.forEach((obj: any) => {
          const status = obj.isCompleted ? '✓' : '○';
          questMessage += `\n  ${status} ${obj.description}`;
        });
      }
      
      // Generate buttons for quest actions
      const actions = [];
      
      if (!quest.isActive && !quest.isCompleted) {
        actions.push({ label: 'Accept', command: `accept ${quest.name}`, style: 'primary' });
      }
      
      if (quest.isActive && quest.canComplete) {
        actions.push({ label: 'Complete', command: `complete ${quest.name}`, style: 'success' });
      }
      
      addMessage(questMessage, 'system', actions);
    });
  };
  
  // Helper function to accept quests
  const handleAcceptQuest = (questName: string) => {
    if (gameMaster?.acceptQuest) {
      const success = gameMaster.acceptQuest(questName);
      if (success) {
        addMessage(`You accepted the quest: ${questName}`, 'system');
      } else {
        addMessage(`You couldn't accept the quest: ${questName}`, 'system');
      }
    } else {
      addMessage('Quest system is not implemented yet.', 'system');
    }
  };
  
  // Helper function to complete quests
  const handleCompleteQuest = (questName: string) => {
    if (gameMaster?.completeQuest) {
      const success = gameMaster.completeQuest(questName);
      if (success) {
        addMessage(`You completed the quest: ${questName}!`, 'system');
      } else {
        addMessage(`You couldn't complete the quest: ${questName}. Have you finished all objectives?`, 'system');
      }
    } else {
      addMessage('Quest system is not implemented yet.', 'system');
    }
  };
  
  // Helper function to show help
  const handleHelp = () => {
    addMessage('Available commands:', 'system');
    addMessage('- Movement: go [direction], or simply type north, south, east, west', 'system');
    addMessage('- Items: take [item], examine [item], inventory', 'system');
    addMessage('- NPCs: talk to [npc], trade with [npc]', 'system');
    addMessage('- Trading: buy [item], sell [item]', 'system');
    addMessage('- Quests: quests, accept [quest], complete [quest]', 'system');
    addMessage('- General: look, help', 'system');
  };
  
  return {
    processCommand,
    executeCommand,
    moveDirection,
    lastCommand
  };
}
