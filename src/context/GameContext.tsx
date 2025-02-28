import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Message, MessageAction } from '../types';
import { GameMasterAgent } from '../agents/GameMasterAgent';
import { initialState } from '../data/initialState';
import { logger } from '../utils/logger';

// Define the context shape
interface GameContextType {
  messages: Message[];
  addMessage: (content: string, type: Message['type'], actions?: MessageAction[]) => void;
  clearMessages: () => void;
  gameMaster: GameMasterAgent | null;
  state: any;
  isInitializing: boolean;
  error: Error | null;
}

// Create the context with default values
const GameContext = createContext<GameContextType>({
  messages: [],
  addMessage: () => {},
  clearMessages: () => {},
  gameMaster: null,
  state: null,
  isInitializing: true,
  error: null
});

// Provider component
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [gameMaster, setGameMaster] = useState<GameMasterAgent | null>(null);
  const [state, setState] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Add a message to the message list
  const addMessage = (content: string, type: Message['type'], actions: MessageAction[] = []) => {
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
  
  // Initialize the game
  useEffect(() => {
    const initGame = async () => {
      try {
        logger.info('Initializing game...');
        
        // Create game master agent
        const agent = new GameMasterAgent();
        
        // Initialize with initial state
        await agent.initialize(initialState);
        
        // Set game master and state
        setGameMaster(agent);
        setState(agent.getState());
        
        // Add welcome message
        addMessage('Welcome to the adventure! The world lives and breathes - watch as time flows and the environment changes around you.', 'system');
        
        // Add initial room description
        const initialRoom = agent.processCommand('look');
        addMessage(initialRoom, 'system');
        
        setIsInitializing(false);
        logger.info('Game initialized successfully');
      } catch (err) {
        logger.error('Failed to initialize game', err);
        setError(err instanceof Error ? err : new Error('Unknown error during initialization'));
        setIsInitializing(false);
      }
    };
    
    initGame();
  }, []);
  
  // Update state when game master state changes
  useEffect(() => {
    if (gameMaster) {
      const handleStateChange = () => {
        setState(gameMaster.getState());
      };
      
      // Subscribe to state changes
      gameMaster.onStateChange(handleStateChange);
      
      // Unsubscribe on cleanup
      return () => {
        gameMaster.offStateChange(handleStateChange);
      };
    }
  }, [gameMaster]);
  
  return (
    <GameContext.Provider value={{
      messages,
      addMessage,
      clearMessages,
      gameMaster,
      state,
      isInitializing,
      error
    }}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGameContext = () => useContext(GameContext);
