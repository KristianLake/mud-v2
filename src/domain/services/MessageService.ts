import { Message } from '../../types';
import { IEventService } from './event/IEventService';
import { ServiceTokens } from './di/ServiceTokens';
import { Container } from './di/Container';
import { BaseGameService } from './BaseGameService';
import { logger } from '../../utils/logger';

export class MessageService extends BaseGameService {
  private messages: Message[] = [];
  private subscribers: ((messages: Message[]) => void)[] = [];

  constructor() {
    super();
  }

  addMessage(text: string, type: Message['type'], sender?: string): void {
    const newMessage: Message = { text, type, sender };
    this.messages.push(newMessage);
    logger.info(`New message added: ${text}`, { type, sender });
    this.notifySubscribers();
  }

  getMessages(): Message[] {
    return [...this.messages]; // Return a copy to prevent external modification
  }

  subscribe(callback: (messages: Message[]) => void): () => void {
    this.subscribers.push(callback);
    logger.debug('New message subscriber added');

    // Immediately notify the new subscriber with the current messages
    callback(this.getMessages());

    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
      logger.debug('Message subscriber removed');
    };
  }

  private notifySubscribers(): void {
    const messages = this.getMessages();
    for (const subscriber of this.subscribers) {
      subscriber(messages);
    }
  }

  clearMessages(): void {
      this.messages = [];
      this.notifySubscribers();
      logger.info('Message history cleared');
    }
}
