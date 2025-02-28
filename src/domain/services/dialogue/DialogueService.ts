import { BaseGameService } from '../BaseGameService';
import { IDialogueService } from './IDialogueService';
import { IStateService } from '../state/IStateService';
import { IEntityService } from '../entity/IEntityService';
import { IEventService } from '../event/IEventService';
import { IMessageService } from '../messaging/IMessageService';
import { INPC, IDialogueOption } from '../../entities/interfaces/INPC';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for managing NPC dialogues
 * Single Responsibility: Handles conversations with NPCs
 */
export class DialogueService extends BaseGameService implements IDialogueService {
  // Conversation state
  private inConversation = false;
  private currentNpcId: string | null = null;
  private conversationHistory: Array<{
    speaker: string;
    text: string;
    timestamp: number;
  }> = [];
  private currentOptions: IDialogueOption[] = [];
  
  constructor(
    stateService: IStateService,
    entityService: IEntityService,
    eventService: IEventService,
    messageService: IMessageService
  ) {
    super(
      stateService,
      entityService,
      eventService,
      messageService,
      'DialogueService'
    );
  }
  
  /**
   * Initialize the service
   */
  protected async onInitialize(): Promise<void> {
    // No async initialization needed
    return Promise.resolve();
  }
  
  /**
   * Clean up the service
   */
  protected async onDispose(): Promise<void> {
    // End any active conversation
    if (this.inConversation) {
      this.endConversation();
    }
    
    return Promise.resolve();
  }
  
  /**
   * Start a conversation with an NPC
   */
  startConversation(npcId: string): boolean {
    // Check if already in a conversation
    if (this.inConversation) {
      this.messageService.addWarningMessage("You're already talking to someone.");
      return false;
    }
    
    // Get the NPC
    const npc = this.entityService.getNPC(npcId);
    if (!npc) {
      this.messageService.addErrorMessage("That character doesn't exist.");
      return false;
    }
    
    // Check if NPC is in the same room
    const currentRoomId = this.stateService.getState().playerLocation;
    if (npc.currentRoomId !== currentRoomId) {
      this.messageService.addWarningMessage(`${npc.name} is not here.`);
      return false;
    }
    
    // Start conversation
    this.inConversation = true;
    this.currentNpcId = npcId;
    this.conversationHistory = [];
    
    // Get greeting
    const greeting = npc.getRandomGreeting ? 
      npc.getRandomGreeting() : 
      npc.dialogue.greeting[0] || "Hello.";
    
    // Add greeting to conversation history
    this.addToConversationHistory(npc.name, greeting);
    
    // Set current dialogue options
    this.currentOptions = npc.dialogue.options || [];
    
    // Emit event
    this.eventService.emit('conversation:started', { npcId, npc });
    
    // Add message
    this.messageService.addDialogueMessage(npc.name, greeting);
    
    this.log('debug', `Started conversation with NPC ${npcId}`);
    return true;
  }
  
  /**
   * End the current conversation
   */
  endConversation(): void {
    if (!this.inConversation || !this.currentNpcId) {
      return;
    }
    
    const npc = this.entityService.getNPC(this.currentNpcId);
    
    // Get farewell
    let farewell = "Goodbye.";
    if (npc) {
      farewell = npc.getRandomFarewell ? 
        npc.getRandomFarewell() : 
        npc.dialogue.farewell[0] || "Goodbye.";
        
      // Add farewell to conversation history
      this.addToConversationHistory(npc.name, farewell);
      
      // Add message
      this.messageService.addDialogueMessage(npc.name, farewell);
    }
    
    // Emit event
    this.eventService.emit('conversation:ended', { 
      npcId: this.currentNpcId,
      history: this.conversationHistory
    });
    
    // Reset conversation state
    this.inConversation = false;
    this.currentNpcId = null;
    this.currentOptions = [];
    
    this.log('debug', 'Ended conversation');
  }
  
  /**
   * Say something to the current NPC
   */
  say(text: string): boolean {
    if (!this.inConversation || !this.currentNpcId) {
      this.messageService.addWarningMessage("You're not talking to anyone.");
      return false;
    }
    
    const npc = this.entityService.getNPC(this.currentNpcId);
    if (!npc) {
      this.endConversation();
      this.messageService.addErrorMessage("The character you were talking to is gone.");
      return false;
    }
    
    // Add player's statement to history
    this.addToConversationHistory('You', text);
    
    // Add message for player's statement
    this.messageService.addDialogueMessage('You', text);
    
    // Check if this matches a known topic
    const topics = npc.dialogue.topics || {};
    let responded = false;
    
    // Check if the text contains any topic keywords
    for (const topic in topics) {
      if (text.toLowerCase().includes(topic.toLowerCase())) {
        // Get a random response for this topic
        const responses = topics[topic];
        if (responses && responses.length > 0) {
          const response = responses[Math.floor(Math.random() * responses.length)];
          
          // Add NPC's response to history
          this.addToConversationHistory(npc.name, response);
          
          // Add message for NPC's response
          this.messageService.addDialogueMessage(npc.name, response);
          
          responded = true;
          break;
        }
      }
    }
    
    // If no topic matched, give a generic response
    if (!responded) {
      const genericResponses = [
        "I don't know anything about that.",
        "Hmm, interesting.",
        "I'm not sure what you mean.",
        "I can't help you with that."
      ];
      
      const response = genericResponses[Math.floor(Math.random() * genericResponses.length)];
      
      // Add NPC's response to history
      this.addToConversationHistory(npc.name, response);
      
      // Add message for NPC's response
      this.messageService.addDialogueMessage(npc.name, response);
    }
    
    // Emit event
    this.eventService.emit('conversation:message', {
      npcId: this.currentNpcId,
      playerText: text,
      npcResponse: this.conversationHistory[this.conversationHistory.length - 1].text
    });
    
    return true;
  }
  
  /**
   * Select a dialogue option
   */
  selectOption(optionId: string): boolean {
    if (!this.inConversation || !this.currentNpcId) {
      this.messageService.addWarningMessage("You're not talking to anyone.");
      return false;
    }
    
    // Find the option
    const option = this.currentOptions.find(opt => opt.id === optionId);
    if (!option) {
      this.messageService.addWarningMessage("That's not a valid option.");
      return false;
    }
    
    const npc = this.entityService.getNPC(this.currentNpcId);
    if (!npc) {
      this.endConversation();
      this.messageService.addErrorMessage("The character you were talking to is gone.");
      return false;
    }
    
    // Add player's choice to history
    this.addToConversationHistory('You', option.text);
    
    // Add message for player's choice
    this.messageService.addDialogueMessage('You', option.text);
    
    // Execute action if any
    if (option.action) {
      // Emit action event
      this.eventService.emit('conversation:action', {
        npcId: this.currentNpcId,
        action: option.action,
        option
      });
    }
    
    // Update available options
    this.currentOptions = option.nextOptions || [];
    
    // If no next options, give a response and end conversation
    if (this.currentOptions.length === 0) {
      const farewell = npc.getRandomFarewell ? 
        npc.getRandomFarewell() : 
        npc.dialogue.farewell[0] || "Goodbye.";
      
      // Add NPC's farewell to history
      this.addToConversationHistory(npc.name, farewell);
      
      // Add message for NPC's farewell
      this.messageService.addDialogueMessage(npc.name, farewell);
      
      // End conversation
      this.inConversation = false;
      this.currentNpcId = null;
      
      // Emit event
      this.eventService.emit('conversation:ended', { 
        npcId: npc.id,
        history: this.conversationHistory
      });
    }
    
    return true;
  }
  
  /**
   * Get available dialogue options
   */
  getDialogueOptions(): IDialogueOption[] {
    return [...this.currentOptions];
  }
  
  /**
   * Get the current NPC in conversation
   */
  getCurrentNPC(): INPC | undefined {
    if (!this.currentNpcId) {
      return undefined;
    }
    
    return this.entityService.getNPC(this.currentNpcId);
  }
  
  /**
   * Check if player is in a conversation
   */
  isInConversation(): boolean {
    return this.inConversation;
  }
  
  /**
   * Get conversation history
   */
  getConversationHistory(): Array<{
    speaker: string;
    text: string;
    timestamp: number;
  }> {
    return [...this.conversationHistory];
  }
  
  /**
   * Add an entry to the conversation history
   */
  private addToConversationHistory(speaker: string, text: string): void {
    this.conversationHistory.push({
      speaker,
      text,
      timestamp: Date.now()
    });
  }
}
