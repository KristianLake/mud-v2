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
      logger.debug(`Processing command: ${command}`);
      setLastCommand(command);
      
      // Add player command to message log
      addMessage(command, 'player');
      
      // Use GameMaster to process command if available
      if (gameMaster) {
        const response = gameMaster.processCommand(command);
        addMessage(response, 'system');
      } else {
        throw new Error('Game not fully initialized');
      }
    } catch (error) {
      logger.error('Error processing command', { command, error });
      const errorMessage = error instanceof Error ? error.message : String(error);
      addMessage(`Error: ${errorMessage}`, 'error');
    }
  }, [addMessage, gameMaster]);
  
  /**
   * Process a movement command
   * @param direction Direction to move
   */
  const moveDirection = useCallback((direction: string) => {
    if (!state || !state.playerLocation) {
      logger.error('Cannot move - player location not set');
      addMessage('Cannot determine your current location.', 'error');
      return;
    }
    
    // Check if direction is valid from current room
    const currentRoom = state.rooms[state.playerLocation];
    if (!currentRoom || !currentRoom.exits || !currentRoom.exits[direction]) {
      logger.debug(`Invalid direction: ${direction} from room ${state.playerLocation}`);
      addMessage(`You cannot go ${direction} from here.`, 'system');
      return;
    }
    
    // Process move command
    processCommand(`go ${direction}`);
  }, [state, processCommand, addMessage]);
  
  return {
    processCommand,
    executeCommand,
    moveDirection,
    lastCommand
  };
}
