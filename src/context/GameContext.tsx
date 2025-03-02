import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { GameMasterAgent } from '../agents/GameMasterAgent';
import { logger } from '../utils/logger';

// Message types
export type MessageType = 'system' | 'player' | 'error' | 'command' | 'ambient' | 'npc' | 'inventory' | 'quest';

// Message action
export interface MessageAction {
  label: string;
  command: string;
  style?: string;
}

// Message structure
export interface Message {
  content: string;
  type: MessageType;
  timestamp?: number;
  actions?: MessageAction[];
}

// Game state interface
export interface GameContextState {
  gameMaster: GameMasterAgent | null;
  isInitializing: boolean;
  error: Error | null;
  messages: Message[];
  state: any;
  addMessage: (content: string, type: MessageType, actions?: MessageAction[]) => void;
  clearMessages: () => void;
}

// Create context with default values
const GameContext = createContext<GameContextState>({
  gameMaster: null,
  isInitializing: true,
  error: null,
  messages: [],
  state: null,
  addMessage: () => {},
  clearMessages: () => {}
});

// Sample initial game state for testing
const sampleInitialState = {
  playerLocation: 'room1',
  inventory: ['Potion', 'Map'],
  playerStats: {
    health: 100,
    maxHealth: 100,
    level: 1,
    experience: 0,
    gold: 100
  },
  rooms: {
    'room1': {
      id: 'room1',
      name: 'Town Square',
      description: 'A bustling town square with merchants and citizens.',
      exits: {
        'north': 'room2',
        'east': 'room3',
        'south': 'room4',
        'west': 'room5'
      },
      items: ['Coin', 'Loaf of Bread'],
      npcs: ['Merchant']
    },
    'room2': {
      id: 'room2',
      name: 'North Market',
      description: 'The northern market with exotic goods.',
      exits: {
        'south': 'room1'
      }
    },
    'room3': {
      id: 'room3',
      name: 'Blacksmith',
      description: 'The town blacksmith\'s forge is burning bright.',
      exits: {
        'west': 'room1'
      }
    },
    'room4': {
      id: 'room4',
      name: 'South Gate',
      description: 'The southern entrance to the town.',
      exits: {
        'north': 'room1'
      }
    },
    'room5': {
      id: 'room5',
      name: 'Tavern',
      description: 'A cozy tavern with the smell of ale and good food.',
      exits: {
        'east': 'room1'
      }
    }
  },
  items: {
    'Coin': {
      id: 'Coin',
      name: 'Gold Coin',
      description: 'A shiny gold coin.',
      location: 'room1',
      isCarryable: true,
      value: 5
    },
    'Loaf of Bread': {
      id: 'Loaf of Bread',
      name: 'Loaf of Bread',
      description: 'A freshly baked loaf of bread.',
      location: 'room1',
      isCarryable: true,
      value: 2,
      type: 'consumable',
      properties: {
        healthBonus: 10
      }
    },
    'Potion': {
      id: 'Potion',
      name: 'Health Potion',
      description: 'A small vial of red liquid that restores health.',
      location: 'inventory',
      isCarryable: true,
      value: 20,
      type: 'consumable',
      properties: {
        healthBonus: 25
      }
    },
    'Map': {
      id: 'Map',
      name: 'Town Map',
      description: 'A detailed map of the town showing various locations.',
      location: 'inventory',
      isCarryable: true,
      value: 10
    },
    'HealthPotion': {
      id: 'HealthPotion',
      name: 'Large Health Potion',
      description: 'A large vial of potent healing elixir.',
      location: 'merchant',
      isCarryable: true,
      value: 30,
      type: 'consumable',
      properties: {
        healthBonus: 50
      }
    },
    'Sword': {
      id: 'Sword',
      name: 'Steel Sword',
      description: 'A well-crafted steel sword.',
      location: 'merchant',
      isCarryable: true,
      value: 75
    },
    'Shield': {
      id: 'Shield',
      name: 'Wooden Shield',
      description: 'A sturdy wooden shield with metal bindings.',
      location: 'merchant',
      isCarryable: true,
      value: 50
    }
  },
  npcs: {
    'Merchant': {
      id: 'Merchant',
      name: 'Friendly Merchant',
      description: 'A merchant selling various goods.',
      location: 'room1',
      canTrade: true,
      inventory: ['HealthPotion', 'Sword', 'Shield'],
      dialogue: {
        'greeting': 'Hello traveler! Looking to buy something?',
        'farewell': 'Safe travels, friend!',
        'aboutTown': 'This town is known for its markets and friendly people.',
        'aboutSelf': 'I\'ve been a merchant for over 20 years, trading goods from all corners of the land.'
      }
    }
  }
};

// Provider component
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameMaster, setGameMaster] = useState<GameMasterAgent | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [gameState, setGameState] = useState<any>(null);

  // Add message to the message list
  const addMessage = (content: string, type: MessageType = 'system', actions: MessageAction[] = []) => {
    setMessages(prev => [...prev, {
      content,
      type,
      timestamp: Date.now(),
      actions
    }]);
  };

  // Clear all messages
  const clearMessages = () => {
    setMessages([]);
  };

  // Initialize game on component mount
  useEffect(() => {
    const initializeGame = async () => {
      try {
        logger.debug('Initializing game...');
        
        // Create game master with sample state
        const agent = new GameMasterAgent(sampleInitialState);
        setGameMaster(agent);
        
        // Get initial state and set it
        const initialState = agent.getState();
        setGameState(initialState);
        
        // Add welcome message
        addMessage('Welcome to the Text Adventure Game!', 'system');
        
        // Add initial room description
        const currentRoomId = initialState.playerLocation;
        const currentRoom = initialState.rooms[currentRoomId];
        
        if (currentRoom) {
          const exits = Object.keys(currentRoom.exits || {}).join(', ');
          let roomDesc = `[ ${currentRoom.name} ] ${currentRoom.description}\n\nExits: ${exits || 'none'}`;
          
          // Add items and NPCs to room description if present
          if (currentRoom.items && currentRoom.items.length > 0) {
            const itemsList = currentRoom.items.map(id => initialState.items[id].name).join(', ');
            roomDesc += `\n\nItems: ${itemsList}`;
          }
          
          if (currentRoom.npcs && currentRoom.npcs.length > 0) {
            const npcsList = currentRoom.npcs.map(id => initialState.npcs[id].name).join(', ');
            roomDesc += `\n\nYou see: ${npcsList}`;
          }
          
          addMessage(roomDesc, 'system');
        }
        
        // Subscribe to state changes
        agent.on('stateChanged', (newState: any) => {
          setGameState(newState);
        });
        
        // Subscribe to other game events
        agent.on('playerMoved', (data: any) => {
          logger.debug('Player moved event', data);
        });
        
        agent.on('itemTaken', (data: any) => {
          logger.debug('Item taken event', data);
        });
        
        agent.on('itemDropped', (data: any) => {
          logger.debug('Item dropped event', data);
        });
        
        setIsInitializing(false);
        logger.debug('Game initialized successfully');
      } catch (err) {
        logger.error('Error initializing game', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsInitializing(false);
      }
    };

    initializeGame();
    
    // Cleanup function
    return () => {
      if (gameMaster) {
        // Unsubscribe from events when component unmounts
        gameMaster.off('stateChanged', setGameState);
        gameMaster.off('playerMoved', logger.debug);
        gameMaster.off('itemTaken', logger.debug);
        gameMaster.off('itemDropped', logger.debug);
      }
    };
  }, []);

  return (
    <GameContext.Provider
      value={{
        gameMaster,
        isInitializing,
        error,
        messages,
        state: gameState,
        addMessage,
        clearMessages
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGameContext = () => useContext(GameContext);

export default GameContext;
