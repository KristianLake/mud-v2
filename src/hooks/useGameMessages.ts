import { useEffect, useState } from 'react';
import { Container } from '../domain/services/di/Container';
import { ServiceTokens } from '../domain/services/di/ServiceTokens';
import { IMessageService } from '../domain/services/messaging/IMessageService';
import { logger } from '../utils/logger';

/**
 * Hook to access game messages
 * Provides a clean interface for components to display messages
 */
export function useGameMessages() {
  const [messages, setMessages] = useState<Array<{id: string; content: string; type?: string; timestamp: number}>>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    try {
      // Get container instance
      const container = Container.getInstance();
      
      // Get message service
      const messageService = container.resolve<IMessageService>(ServiceTokens.MessageService);
      
      // Subscribe to messages
      unsubscribe = messageService.subscribe(newMessages => {
        setMessages(newMessages);
      });
    } catch (err) {
      logger.error('Error in useGameMessages hook', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
    
    // Cleanup subscription
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Add a new message
  const addMessage = (content: string, type: string = 'info') => {
    try {
      // Get container instance
      const container = Container.getInstance();
      
      // Get message service
      const messageService = container.resolve<IMessageService>(ServiceTokens.MessageService);
      
      // Add message
      messageService.addMessage(content, type);
    } catch (err) {
      logger.error('Error adding message', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  // Clear all messages
  const clearMessages = () => {
    try {
      // Get container instance
      const container = Container.getInstance();
      
      // Get message service
      const messageService = container.resolve<IMessageService>(ServiceTokens.MessageService);
      
      // Clear messages
      messageService.clearMessages();
    } catch (err) {
      logger.error('Error clearing messages', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  return {
    messages,
    error,
    addMessage,
    clearMessages
  };
}
