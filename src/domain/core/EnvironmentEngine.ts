import { IEnvironmentEngine } from './IEnvironmentEngine';
import { IEventService } from '../services/event/IEventService';
import { IEnvironmentService } from '../services/environment/IEnvironmentService';
import { ServiceTokens } from '../services/di/ServiceTokens';
import { Container } from '../services/di/Container';
import { logger } from '../../utils/logger';

export class EnvironmentEngine implements IEnvironmentEngine {
  private eventService: IEventService;
  private environmentService: IEnvironmentService;
  private container: Container;

  constructor() {
    this.container = Container.getInstance();
    this.eventService = this.container.resolve<IEventService>(ServiceTokens.EventService);
    this.environmentService = this.container.resolve<IEnvironmentService>(ServiceTokens.EnvironmentService);
    this.initializeListeners();
  }

  private initializeListeners(): void {
    // Example: Listen for a time change event and trigger environment updates
    this.eventService.on('timeChange', (data: any) => {
      logger.debug('EnvironmentEngine received timeChange event', { data });
      this.environmentService.updateEnvironment(data.timeOfDay);
    });
  }

  // Placeholder for start method if needed
  start(): void {
    logger.info('EnvironmentEngine started');
  }

  // Placeholder for stop method if needed
  stop(): void {
    logger.info('EnvironmentEngine stopped');
  }
}
