import { useState, useEffect } from 'react';
import { logger } from '../utils/logger';

/**
 * Custom hook for managing debug mode.
 * @returns An object containing the debug mode state and a toggle function.
 */
export function useDebugMode() {
  const [isDebugMode, setIsDebugMode] = useState(false);

  useEffect(() => {
    logger.debug('Debug mode toggled', { isDebugMode });
  }, [isDebugMode]);

  const toggleDebugMode = () => {
    setIsDebugMode((prev) => !prev);
  };

  return { isDebugMode, toggleDebugMode };
}
