import { useEffect } from 'react';
import { logger } from '../utils/logger';

export const useLifecycleLogging = (componentName: string) => {
  useEffect(() => {
    logger.debug(`${componentName} mounted`);

    return () => {
      logger.debug(`${componentName} unmounted`);
    };
  }, [componentName]);
};
