import { ICommandHandler } from '../../interfaces/ICommandHandler';
import { ICommand } from '../command/ICommand';
import { DialogueService } from '../DialogueService';
import { ServiceTokens } from '../di/ServiceTokens';
import { Container } from '../di/Container';
import { BaseGameService } from '../BaseGameService';
import { logger } from '../../../utils/logger';
import { IStateService } from '../state/IStateService';

export class DialogueHandler extends BaseGameService implements ICommandHandler {
    private dialogueService: DialogueService;
    private stateService: IStateService;

    constructor() {
        super();
        this.dialogueService = new DialogueService(); // No need for DI
        this.stateService = this.container.resolve<IStateService>(ServiceTokens.StateService);
    }

    handle(command: ICommand): void {
        if (command.getName() !== 'talk') {
            return;
        }

        const args = command.getArgs();
        
        // If no arguments provided, we need to check if there are NPCs in the current room
        if (!args || args.length === 0) {
            const state = this.stateService.getState();
            const currentRoom = state.rooms[state.playerLocation];
            
            if (!currentRoom || !currentRoom.npcs || currentRoom.npcs.length === 0) {
                logger.info('No NPCs in the current room to talk to');
                return;
            }
            
            if (currentRoom.npcs.length === 1) {
                // If only one NPC in the room, automatically talk to that NPC
                const npcId = currentRoom.npcs[0];
                this.startDialogueWithNPC(npcId);
            } else {
                // If multiple NPCs, we'll handle this in the UI layer
                logger.info('Multiple NPCs in the room, showing selection in UI');
                return;
            }
            return;
        }

        const npcId = args[0];
        this.startDialogueWithNPC(npcId);
    }

    private startDialogueWithNPC(npcId: string): void {
        const dialogue = this.dialogueService.startDialogue(npcId);
        if (dialogue) {
            logger.info(`Dialogue started with NPC: ${npcId}`);
        } else {
            logger.warn(`Failed to start dialogue with NPC: ${npcId}`);
        }
    }
}
