import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '../utils/logger';
import { GameMasterAgent } from '../agents/GameMasterAgent';
import { GameInitializationService } from '../domain/services/GameInitializationService';

/**
 * Hook for initializing the game
 * Following the Single Responsibility Principle by focusing only on game initialization
 */
export function useGameInitialization() {
  const [gameMaster, setGameMaster] = useState<GameMasterAgent | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const initializationAttempted = useRef(false);
  
  const initializeGame = useCallback(async () => {
    if (isInitializing) return;
    
    setIsInitializing(true);
    setError(null);
    
    try {
      // Only log on first attempt to reduce console spam
      if (!initializationAttempted.current) {
        logger.info('Starting game initialization via hook');
        initializationAttempted.current = true;
      }
      
      const initService = GameInitializationService.getInstance();
      const gameMasterInstance = await initService.initialize();
      setGameMaster(gameMasterInstance);
      
      // Only log success on first successful initialization
      if (!gameMaster) {
        logger.info('Game initialization completed successfully');
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      logger.error('Game initialization failed:', errorObj);
      setError(errorObj);
    } finally {
      setIsInitializing(false);
    }
  }, [isInitializing, gameMaster]);
  
  useEffect(() => {
    let isMounted = true;
    
    // Async function to initialize game
    const initialize = async () => {
      if (!isMounted) return;
      await initializeGame();
    };
    
    initialize();
    
    return () => {
      // Cleanup when the component unmounts
      isMounted = false;
      logger.debug('Unmounting game initialization hook');
    };
  }, [initializeGame]);
  
  return {
    gameMaster,
    isInitializing,
    error,
    reinitialize: initializeGame
  };
}
