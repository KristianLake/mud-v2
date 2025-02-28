import { ICommandStrategy } from './ICommandStrategy';
import { DialogueService } from '../../DialogueService';
import { ServiceTokens } from '../../di/ServiceTokens';
import { Container } from '../../di/Container';
import { IStateService } from '../../state/IStateService';
import { IMessageService } from '../../messaging/IMessageService';
import { logger } from '../../../../utils/logger';

export class NPCStrategy implements ICommandStrategy {
  private dialogueService: DialogueService;
  private stateService: IStateService;
  private messageService: IMessageService;
  private container: Container;

  constructor() {
    this.container = Container.getInstance();
    this.stateService = this.container.resolve<IStateService>(ServiceTokens.StateService);
    this.messageService = this.container.resolve<IMessageService>(ServiceTokens.MessageService);
    this.dialogueService = new DialogueService();
  }

  execute(args?: string[]): string {
    if (!args || args.length === 0) {
      return this.listAvailableNPCs();
    }

    const targetName = args.join(' ').toLowerCase();
    const gameState = this.stateService.getState();
    const currentRoom = gameState.rooms[gameState.playerLocation];
    
    // Find the NPC by name in the current room
    const npcId = this.findNPCByName(targetName, currentRoom.npcs, gameState);
    
    if (!npcId) {
      return `There's no one named "${args.join(' ')}" here.`;
    }

    // Start dialogue with the NPC
    const dialogueResult = this.dialogueService.startDialogue(npcId);
    
    // If there are dialogue options, add them to the message service
    if (dialogueResult.options && dialogueResult.options.length > 0) {
      this.messageService.addMessage({
        content: dialogueResult.message,
        type: 'dialogue',
        options: dialogueResult.options.map(option => ({
          text: option.text,
          action: option.action || '',
          id: option.id
        }))
      });
      return '';
    }
    
    return dialogueResult.message;
  }

  private findNPCByName(name: string, npcIds: string[], gameState: any): string | null {
    const lowerName = name.toLowerCase();
    
    for (const npcId of npcIds) {
      const npc = gameState.npcs[npcId];
      if (npc && npc.name.toLowerCase() === lowerName) {
        return npcId;
      }
    }
    
    // Try partial match
    for (const npcId of npcIds) {
      const npc = gameState.npcs[npcId];
      if (npc && npc.name.toLowerCase().includes(lowerName)) {
        return npcId;
      }
    }
    
    return null;
  }

  private listAvailableNPCs(): string {
    const gameState = this.stateService.getState();
    const currentRoom = gameState.rooms[gameState.playerLocation];
    
    if (!currentRoom.npcs || currentRoom.npcs.length === 0) {
      return "There's no one here to talk to.";
    }
    
    const npcs = currentRoom.npcs.map(npcId => {
      const npc = gameState.npcs[npcId];
      return npc ? npc.name : 'Unknown';
    });
    
    this.messageService.addMessage({
      content: "Who would you like to talk to?",
      type: 'system',
      options: npcs.map(name => ({
        text: name,
        action: `talk ${name}`,
        id: `talk_${name.toLowerCase().replace(/\s+/g, '_')}`
      }))
    });
    
    return '';
  }

  handleDialogueOption(npcId: string, optionId: string): string {
    const dialogueResponse = this.dialogueService.getDialogueResponse(npcId, optionId);
    
    // If there are dialogue options, add them to the message service
    if (dialogueResponse.options && dialogueResponse.options.length > 0) {
      this.messageService.addMessage({
        content: dialogueResponse.message,
        type: 'dialogue',
        options: dialogueResponse.options.map(option => ({
          text: option.text,
          action: option.action || '',
          id: option.id
        }))
      });
      return '';
    }
    
    return dialogueResponse.message;
  }
}
