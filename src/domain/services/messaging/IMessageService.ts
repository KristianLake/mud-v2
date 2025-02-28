/**
 * Interface for message services
 * Follows Interface Segregation Principle
 */
export interface IMessageService {
  /**
   * Add a system message
   * @param content Message content
   */
  addSystemMessage(content: string): void;
  
  /**
   * Add a message with type
   * @param content Message content
   * @param type Message type
   * @param sender Optional message sender
   */
  addMessage(content: string, type: string, sender?: string): void;
  
  /**
   * Add an error message
   * @param content Error message content
   */
  addErrorMessage(content: string): void;
  
  /**
   * Get all messages
   * @returns Array of messages
   */
  getMessages(): any[];
  
  /**
   * Subscribe to message changes
   * @param callback Function to call when messages change
   * @returns Unsubscribe function
   */
  subscribe(callback: (messages: any[]) => void): () => void;
  
  /**
   * Clear all messages
   */
  clearMessages(): void;
}
