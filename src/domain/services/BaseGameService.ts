import { IGameService } from './IGameService';
import { IEventService } from './event/IEventService';
import { IStateService } from './state/IStateService';
import { IEntityService } from './entity/IEntityService';
import { IMessageService } from './messaging/IMessageService';
import { logger } from '../../utils/logger';

/**
 * Base class for all game services
 * Implements common functionality for game services
 * Follows Template Method pattern
 */
export abstract class BaseGameService implements IGameService {
  private initialized = false;
  
  constructor(
    protected readonly stateService: IStateService,
    protected readonly entityService: IEntityService,
    protected readonly eventService: IEventService,
    protected readonly messageService: IMessageService,
    private readonly serviceName: string
  ) {
    logger.debug(`${this.serviceName} created`);
  }
  
  /**
   * Initialize the service
   * Template method pattern - calls onInitialize for specific initialization
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    
    try {
      logger.debug(`Initializing ${this.serviceName}`);
      await this.onInitialize();
      this.initialized = true;
      this.eventService.emit(`service:${this.serviceName}:initialized`);
      logger.debug(`${this.serviceName} initialized successfully`);
    } catch (error) {
      logger.error(`Failed to initialize ${this.serviceName}`, error);
      throw error;
    }
  }
  
  /**
   * Service-specific initialization logic
   * To be implemented by derived classes
   */
  protected abstract onInitialize(): Promise<void>;
  
  /**
   * Get the name of the service
   */
  getServiceName(): string {
    return this.serviceName;
  }
  
  /**
   * Check if the service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
  
  /**
   * Dispose the service
   * Template method pattern - calls onDispose for specific cleanup
   */
  async dispose(): Promise<void> {
    if (!this.initialized) {
      return;
    }
    
    try {
      logger.debug(`Disposing ${this.serviceName}`);
      await this.onDispose();
      this.initialized = false;
      this.eventService.emit(`service:${this.serviceName}:disposed`);
      logger.debug(`${this.serviceName} disposed successfully`);
    } catch (error) {
      logger.error(`Failed to dispose ${this.serviceName}`, error);
      throw error;
    }
  }
  
  /**
   * Service-specific disposal logic
   * To be implemented by derived classes
   */
  protected abstract onDispose(): Promise<void>;
  
  /**
   * Log a message with service context
   */
  protected log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
    const contextMessage = `[${this.serviceName}] ${message}`;
    logger[level](contextMessage, data);
  }
}
