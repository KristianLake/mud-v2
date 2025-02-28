import { useState, useCallback } from 'react';
import { logger } from '../utils/logger';

/**
 * Custom hook for implementing retry logic.
 * @param operation The operation to retry.
 * @param maxRetries The maximum number of retries.
 * @returns An object containing the retry function, loading state, error state, and retry count.
 */
export function useRetry<T extends (...args: any[]) => Promise<any>>(
  operation: T,
  maxRetries: number = 3
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
    setLoading(true);
    setError(null);
    setRetryCount(0);

    for (let i = 0; i < maxRetries; i++) {
      setRetryCount(i + 1);
      try {
        const result = await operation(...args);
        setLoading(false);
        return result;
      } catch (err: any) {
        setError(err);
        logger.warn(`Retry attempt ${i + 1} failed: ${err.message}`);
        if (i === maxRetries - 1) {
          logger.error(`Max retries (${maxRetries}) reached for operation`);
          setLoading(false);
          return null;
        }
      }
    }
    setLoading(false);
    return null;
  }, [operation, maxRetries]);

  return { retry, loading, error, retryCount };
}
