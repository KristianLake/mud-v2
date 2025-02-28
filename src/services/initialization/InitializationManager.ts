import { logger } from '../../utils/logger';
import { GameInitializationService } from '../GameInitializationService';
import { MessageService } from '../MessageService';

type InitStatus = 'idle' | 'initializing' | 'initialized' | 'error';

export class InitializationManager {
  private static instance: InitializationManager | null = null;
  private status: InitStatus = 'idle';
  private error: string | null = null;
  private messageService: MessageService;
  private mountedInstances: Set<string> = new Set();
  private gameInitService: GameInitializationService;

  private constructor(messageService: MessageService) {
    this.messageService = messageService;
    this.gameInitService = GameInitializationService.getInstance(messageService);
    logger.debug('InitializationManager created');
  }

  public static getInstance(messageService: MessageService): InitializationManager {
    if (!InitializationManager.instance) {
      InitializationManager.instance = new InitializationManager(messageService);
    }
    return InitializationManager.instance;
  }

  public mount(instanceId: string): void {
    this.mountedInstances.add(instanceId);
    logger.debug('Component mounted to InitializationManager', { instanceId });
    
    // If this is the first instance, start initialization
    if (this.mountedInstances.size === 1 && this.status === 'idle') {
      this.initialize();
    }
  }

  public unmount(instanceId: string): void {
    this.mountedInstances.delete(instanceId);
    logger.debug('Component unmounted from InitializationManager', { instanceId });
    
    // If no more instances are mounted, we could clean up resources
    if (this.mountedInstances.size === 0) {
      // Optional: Reset state or clean up resources
      logger.debug('No more components mounted, could clean up resources');
    }
  }

  private async initialize(): Promise<void> {
    if (this.status === 'initializing' || this.status === 'initialized') {
      return;
    }
    
    this.status = 'initializing';
    this.error = null;
    
    try {
      logger.info('Starting game initialization process');
      await this.gameInitService.initialize();
      this.status = 'initialized';
      logger.info('Game initialization completed successfully');
    } catch (error) {
      this.status = 'error';
      this.error = error instanceof Error ? error.message : 'Unknown initialization error';
      logger.error('Game initialization failed', { error: this.error });
    }
  }

  public isInitialized(): boolean {
    return this.status === 'initialized';
  }

  public getStatus(): InitStatus {
    return this.status;
  }

  public getError(): string | null {
    return this.error;
  }
}
