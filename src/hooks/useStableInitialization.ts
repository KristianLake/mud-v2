import { useRef, useEffect, useState, DependencyList } from 'react';
    import { logger } from '../utils/logger';

    /**
    * Custom hook for ensuring initialization only happens once.
    * @param initializer The initialization function.
    * @param deps The dependencies of the initializer.
    * @returns The initialized value.
    */
    export function useStableInitialization<T>(
      initializer: () => T, // initializer should be a function
      deps: DependencyList
    ): { isInitializing: boolean; error: Error | null; gameMaster: T | null } {
      const [gameMaster, setGameMaster] = useState<T | null>(null);
      const [isInitializing, setIsInitializing] = useState<boolean>(true);
      const [error, setError] = useState<Error | null>(null);

      useEffect(() => {
        const initialize = async () => {
          try {
            const initializedValue = initializer(); // Call the initializer function
            setGameMaster(initializedValue);
          } catch (err) {
            setError(err as Error);
          } finally {
            setIsInitializing(false);
          }
        };
        initialize();
      }, deps);

      return { isInitializing, error, gameMaster };
    }
