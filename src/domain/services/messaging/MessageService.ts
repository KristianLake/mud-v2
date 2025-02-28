import { IMessageService } from './IMessageService';
import { logger } from '../../../utils/logger';

type MessageType = 'system' | 'user' | 'error' | 'command' | 'ambient' | 'response' | string;

interface Message {
  type: MessageType;
  content: string;
  timestamp: number;
  sender?: string;
}

type MessageCallback = (messages: Message[]) => void;

/**
 * Service for message management
 * Implements IMessageService interface
 */
export class MessageService implements IMessageService {
  private messages: Message[] = [];
  private subscribers: MessageCallback[] = [];
  private id: string;
  
  constructor() {
    this.id = `msg-service-${Math.random().toString(36).substring(2, 9)}`;
    logger.debug(`MessageService initialized with id: ${this.id}`);
  }
  
  /**
   * Add a system message
   * @param content Content of the message
   */
  addSystemMessage(content: string): void {
    this.addMessage(content, 'system');
  }
  
  /**
   * Add a user message
   * @param content Content of the message
   */
  addUserMessage(content: string): void {
    this.addMessage(content, 'user');
  }
  
  /**
   * Add an error message
   * @param content Content of the message
   */
  addErrorMessage(content: string): void {
    this.addMessage(content, 'error');
  }
  
  /**
   * Add a custom message with type
   * @param content Content of the message
   * @param type Type of the message
   * @param sender Optional sender of the message
   */
  addMessage(content: string, type: MessageType, sender?: string): void {
    const message: Message = {
      type,
      content,
      timestamp: Date.now(),
      sender
    };
    
    this.messages.push(message);
    this.notifySubscribers();
    
    logger.debug(`Added ${type} message: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`);
  }
  
  /**
   * Get all messages
   * @returns Array of messages
   */
  getMessages(): Message[] {
    return [...this.messages];
  }
  
  /**
   * Clear all messages
   */
  clearMessages(): void {
    this.messages = [];
    this.notifySubscribers();
    
    logger.debug('Cleared all messages');
  }
  
  /**
   * Subscribe to message changes
   * @param callback Function to call when messages change
   * @returns Function to unsubscribe
   */
  subscribe(callback: MessageCallback): () => void {
    this.subscribers.push(callback);
    
    // Call immediately with current messages
    callback(this.getMessages());
    
    logger.debug('Added message subscriber', { 
      subscriberCount: this.subscribers.length 
    });
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      
      if (index !== -1) {
        this.subscribers.splice(index, 1);
        logger.debug('Removed message subscriber', { 
          subscriberCount: this.subscribers.length 
        });
      }
    };
  }
  
  /**
   * Notify all subscribers of message changes
   */
  private notifySubscribers(): void {
    const messages = this.getMessages();
    
    this.subscribers.forEach(callback => {
      try {
        callback(messages);
      } catch (error) {
        logger.error('Error in message subscriber', error);
      }
    });
  }
}
