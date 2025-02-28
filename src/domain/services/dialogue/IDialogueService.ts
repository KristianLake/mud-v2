import { INPC } from '../../entities/interfaces/INPC';
import { IDialogueOption } from '../../entities/interfaces/INPC';

/**
 * Interface for dialogue service
 * Follows Interface Segregation with focused methods
 */
export interface IDialogueService {
  /**
   * Start a conversation with an NPC
   */
  startConversation(npcId: string): boolean;
  
  /**
   * End the current conversation
   */
  endConversation(): void;
  
  /**
   * Say something to the current NPC
   */
  say(text: string): boolean;
  
  /**
   * Select a dialogue option
   */
  selectOption(optionId: string): boolean;
  
  /**
   * Get available dialogue options
   */
  getDialogueOptions(): IDialogueOption[];
  
  /**
   * Get the current NPC in conversation
   */
  getCurrentNPC(): INPC | undefined;
  
  /**
   * Check if player is in a conversation
   */
  isInConversation(): boolean;
  
  /**
   * Get conversation history
   */
  getConversationHistory(): Array<{
    speaker: string;
    text: string;
    timestamp: number;
  }>;
}
