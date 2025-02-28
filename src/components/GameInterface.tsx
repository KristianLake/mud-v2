import React, { useState, useEffect } from 'react';
import CommandInput from './CommandInput';
import MessageList from './MessageList';
import StatusBar from './StatusBar';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import PlayerStatus from './PlayerStatus';
import { useGameContext } from '../context/GameContext';
import { logger } from '../utils/logger';

const GameInterface: React.FC = () => {
  const { 
    gameMaster, 
    isInitializing, 
    error, 
    state,
    messages, 
    addMessage 
  } = useGameContext();
  
  const [commandInputValue, setCommandInputValue] = useState('');
  
  // Log component lifecycle
  useEffect(() => {
    logger.debug('GameInterface component mounted');
    return () => {
      logger.debug('GameInterface component unmounted');
    };
  }, []);
  
  // Handle command submission
  const handleCommandSubmit = (command: string) => {
    if (!command.trim() || !gameMaster) return;
    
    // Process command and add as player message
    addMessage(command, 'player');
    
    try {
      // Get response from game master
      const response = gameMaster.processCommand(command);
      // Add response as system message
      addMessage(response, 'system');
    } catch (err) {
      // Handle errors
      const errorMsg = err instanceof Error ? err.message : String(err);
      addMessage(`Error: ${errorMsg}`, 'error');
      logger.error('Error processing command:', err);
    }
    
    // Clear input
    setCommandInputValue('');
  };
  
  // Show loading state
  if (isInitializing) {
    return (
      <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
        <LoadingSpinner message="Initializing game..." />
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <ErrorDisplay 
          title="Game Initialization Error" 
          error={error}
        />
      </div>
    );
  }
  
  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Status bar (top) */}
      <StatusBar />
      
      {/* Main content area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Message display area */}
        <div className="flex-1 overflow-y-auto p-4">
          <MessageList 
            messages={messages} 
            onMessageAction={handleCommandSubmit}
          />
        </div>
        
        {/* Command input area */}
        <div className="p-2 bg-gray-800 border-t border-gray-700">
          <CommandInput
            value={commandInputValue}
            onChange={setCommandInputValue}
            onSubmit={handleCommandSubmit}
          />
        </div>
      </div>
      
      {/* Player status button */}
      <PlayerStatus 
        playerStats={state?.playerStats}
        inventory={state?.inventory}
        onCommandExecute={handleCommandSubmit}
      />
    </div>
  );
};

export default GameInterface;
