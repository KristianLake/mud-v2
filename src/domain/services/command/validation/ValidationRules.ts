import { IValidationRule } from './IValidationRule';
import { ICommand } from '../ICommand';
import { IStateService } from '../../state/IStateService';
import { ServiceTokens } from '../../di/ServiceTokens';
import { Container } from '../../di/Container';

// Example validation rule: Check if the player has enough gold
export class HasEnoughGold implements IValidationRule {
    private stateService: IStateService;
    private container: Container;
    private requiredGold: number;

    constructor(requiredGold: number) {
        this.container = Container.getInstance();
        this.stateService = this.container.resolve<IStateService>(ServiceTokens.StateService);
        this.requiredGold = requiredGold;
    }
    validate(command: ICommand): boolean {
        const gameState = this.stateService.getState();
        return gameState.playerGold >= this.requiredGold;
    }
}

// Example validation rule: Check if the target NPC exists in the current room

export class TargetNPCExists implements IValidationRule {
    private stateService: IStateService;
    private container: Container;

    constructor() {
        this.container = Container.getInstance();
        this.stateService = this.container.resolve<IStateService>(ServiceTokens.StateService);
    }

  validate(command: ICommand): boolean {
    const gameState = this.stateService.getState();
    const targetNpcName = command.getArgs()[0]; // Assumes the first argument is the NPC name

    if (!targetNpcName) {
      return false; // No NPC name provided
    }

    const currentRoom = gameState.rooms[gameState.playerLocation];
    return currentRoom.npcs.some(npcId => gameState.npcs[npcId].name.toLowerCase() === targetNpcName.toLowerCase());
  }
}

// Example: Check if the target room exists and is accessible from the current room
export class ValidMoveDirection implements IValidationRule {
    private stateService: IStateService;
    private container: Container;
    constructor() {
        this.container = Container.getInstance();
        this.stateService = this.container.resolve<IStateService>(ServiceTokens.StateService);
    }

    validate(command: ICommand): boolean {
        const gameState = this.stateService.getState();
        const direction = command.getArgs()[0]; // Assumes the first argument is the direction
        const currentRoom = gameState.rooms[gameState.playerLocation];
        return !!currentRoom.exits[direction];
    }
}
