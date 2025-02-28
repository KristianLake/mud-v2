import { Message } from '../types';
import { logger } from '../utils/logger';

export class MessageService {
  private static instance: MessageService | null = null;
  private messages: Message[] = [];
  private listeners: Array<(messages: Message[]) => void> = [];

  private constructor() {
    logger.debug('MessageService initialized');
  }

  public static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  public getMessages(): Message[] {
    return [...this.messages];
  }

  public addMessage(text: string, type: string, sender?: string): void {
    const newMessage: Message = { text, type, sender };
    this.messages.push(newMessage);
    logger.debug('Message added', { message: newMessage });
    this.notifyListeners();
  }

  public clearMessages(): void {
    this.messages = [];
    logger.debug('Messages cleared');
    this.notifyListeners();
  }

  public addListener(listener: (messages: Message[]) => void): void {
    this.listeners.push(listener);
    // Immediately notify the new listener with current messages
    listener([...this.messages]);
  }

  public removeListener(listener: (messages: Message[]) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyListeners(): void {
    const messagesCopy = [...this.messages];
    this.listeners.forEach(listener => {
      try {
        listener(messagesCopy);
      } catch (error) {
        logger.error('Error in message listener', { error });
      }
    });
  }
}
