import { ICommand } from './ICommand';
import { logger } from '../../../utils/logger';

export class CommandQueue {
  private queue: ICommand[] = [];
  private isProcessing: boolean = false;
  private readonly MAX_QUEUE_SIZE = 100;

  async enqueue(command: ICommand): Promise<string> {
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      logger.warn('Command queue full, dropping oldest command');
      this.queue.shift();
    }

    this.queue.push(command);
    logger.debug('Command enqueued', { 
      commandType: command.constructor.name,
      queueSize: this.queue.length 
    });

    return this.processQueue();
  }

  private async processQueue(): Promise<string> {
    if (this.isProcessing || this.queue.length === 0) {
      return '';
    }

    this.isProcessing = true;
    let result = '';

    try {
      const command = this.queue[0];
      result = await command.execute();
      
      logger.debug('Command processed', {
        commandType: command.constructor.name,
        success: true
      });

    } catch (error) {
      logger.error('Error processing command:', error);
      result = 'An error occurred while processing the command.';
    } finally {
      this.queue.shift(); // Remove processed command
      this.isProcessing = false;

      // Process next command if any
      if (this.queue.length > 0) {
        await this.processQueue();
      }
    }

    return result;
  }

  clear(): void {
    this.queue = [];
    this.isProcessing = false;
    logger.debug('Command queue cleared');
  }

  size(): number {
    return this.queue.length;
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }
}
