import { NPC, DialogueOption } from '../entities/NPC';
import { IEventService } from './event/IEventService';
import { IStateService } from './state/IStateService';
import { ServiceTokens } from './di/ServiceTokens';
import { Container } from './di/Container';
import { BaseGameService } from './BaseGameService';
import { logger } from '../../utils/logger';

export class DialogueService extends BaseGameService {
  private stateService: IStateService;

  constructor() {
    super();
    this.stateService = this.container.resolve<IStateService>(ServiceTokens.StateService);
  }

  startDialogue(npcId: string): { message: string, options?: DialogueOption[] } {
    const gameState = this.stateService.getState();
    const npc = gameState.npcs[npcId];

    if (!npc) {
      logger.warn(`NPC not found: ${npcId}`);
      return { message: "There's no one here by that name." };
    }

    logger.info(`Starting dialogue with NPC: ${npc.name}`);
    
    // Handle the case where greeting is an array
    let greeting = '';
    if (Array.isArray(npc.dialogue.greeting)) {
      greeting = npc.dialogue.greeting.join('\n');
    } else {
      greeting = npc.dialogue.greeting;
    }

    // Get dialogue options based on NPC type
    const options = this.getDialogueOptions(npc);
    
    return { 
      message: `${npc.name}: "${greeting}"`, 
      options 
    };
  }

  getDialogueOptions(npc: NPC): DialogueOption[] {
    const options: DialogueOption[] = [];
    
    // Add specific dialogue topics if available
    if (npc.dialogue.topics) {
      Object.keys(npc.dialogue.topics).forEach(topic => {
        options.push({
          id: `topic_${topic}`,
          text: `Ask about ${topic}`,
          action: `topic ${topic}`
        });
      });
    }
    
    // Add predefined options if available
    if (npc.dialogue.options) {
      options.push(...npc.dialogue.options);
    }
    
    // Add merchant-specific options
    if (npc.isMerchant) {
      options.push(
        { id: 'buy', text: 'Buy items', action: 'buy' },
        { id: 'sell', text: 'Sell items', action: 'sell' }
      );
    }
    
    // Add quest giver options
    if (npc.isQuestGiver) {
      options.push(
        { id: 'quest_ask', text: 'Ask about quests', action: 'quest ask' },
        { id: 'quest_status', text: 'Check quest status', action: 'quest status' }
      );
    }
    
    // Add farewell option
    options.push({ id: 'farewell', text: 'Goodbye', action: 'farewell' });
    
    return options;
  }

  // Method to get a specific dialogue option (e.g., response to a player's choice)
  getDialogueResponse(npcId: string, optionKey: string): { message: string, options?: DialogueOption[] } {
    const gameState = this.stateService.getState();
    const npc = gameState.npcs[npcId];

    if (!npc) {
      logger.warn(`NPC not found: ${npcId}`);
      return { message: "There's no one here by that name." };
    }

    // Handle topic discussions
    if (optionKey.startsWith('topic_')) {
      const topic = optionKey.replace('topic_', '');
      if (npc.dialogue.topics && npc.dialogue.topics[topic]) {
        const topicText = Array.isArray(npc.dialogue.topics[topic]) 
          ? npc.dialogue.topics[topic].join('\n') 
          : npc.dialogue.topics[topic];
        
        return { 
          message: `${npc.name}: "${topicText}"`,
          options: this.getDialogueOptions(npc)
        };
      }
    }

    // Handle farewell
    if (optionKey === 'farewell') {
      return { message: this.endDialogue(npcId) || `${npc.name} waves goodbye.` };
    }
    
    return { message: `${npc.name} doesn't seem to understand.` };
  }

  endDialogue(npcId: string): string | null {
    const gameState = this.stateService.getState();
    const npc = gameState.npcs[npcId];

    if (!npc) {
      logger.warn(`NPC not found: ${npcId}`);
      return null;
    }

    logger.info(`Ending dialogue with NPC: ${npc.name}`);
    
    // Handle the case where farewell is an array
    if (Array.isArray(npc.dialogue.farewell)) {
      const randomIndex = Math.floor(Math.random() * npc.dialogue.farewell.length);
      return `${npc.name}: "${npc.dialogue.farewell[randomIndex]}"`;
    }
    
    // Handle the case where farewell is a string
    return `${npc.name}: "${npc.dialogue.farewell}"`;
  }
}
