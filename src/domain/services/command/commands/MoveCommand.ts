import { BaseCommand } from '../BaseCommand';
import { GameState } from '../../../core/GameStateFactory';
import { IEventService } from '../../event/IEventService';
import { IStateService } from '../../state/IStateService';
import { EventTypes } from '../../event/types';
import { logger } from '../../../../utils/logger';

/**
 * Command to move the player in a direction
 */
export class MoveCommand extends BaseCommand {
  constructor(
    eventService: IEventService,
    private stateService: IStateService
  ) {
    super(eventService);
    logger.debug('MoveCommand initialized');
  }

  /**
   * Execute the move command
   * @param state Current game state
   * @param args Command arguments
   */
  async execute(state: GameState, ...args: string[]): Promise<void> {
    if (args.length === 0) {
      this.sendError('Move in which direction?');
      return;
    }
    
    const direction = args[0].toLowerCase();
    logger.debug(`Executing move command in direction: ${direction}`);
    
    const currentRoomId = state.player.currentRoom;
    const room = state.world.rooms[currentRoomId];
    
    if (!room) {
      this.sendError('You are in an unknown location.');
      return;
    }
    
    // Check if the direction is valid
    if (!room.exits || !room.exits[direction]) {
      this.sendError(`You can't go ${direction} from here.`);
      return;
    }
    
    const destinationRoomId = room.exits[direction];
    const destinationRoom = state.world.rooms[destinationRoomId];
    
    if (!destinationRoom) {
      this.sendError(`Something is wrong with the exit ${direction}.`);
      return;
    }
    
    // Update the player's current room
    const newState = {
      ...state,
      player: {
        ...state.player,
        currentRoom: destinationRoomId
      }
    };
    
    // Update the state
    this.stateService.setState(newState);
    
    // Emit the move event
    this.eventService.emit(EventTypes.PLAYER_MOVE, {
      from: currentRoomId,
      to: destinationRoomId,
      direction
    });
    
    // Send a message about the movement
    this.sendMessage(`You move ${direction} to ${destinationRoom.name}.`);
    
    // Automatically look at the new room
    const lookCommand = this.commandRegistry.getCommand('look');
    if (lookCommand) {
      if (typeof lookCommand === 'object' && 'execute' in lookCommand) {
        await lookCommand.execute(newState);
      }
    }
  }

  getName(): string {
    return 'move';
  }

  getDescription(): string {
    return 'Move in a direction';
  }

  getAliases(): string[] {
    return ['go', 'walk', 'run', 'north', 'south', 'east', 'west', 'up', 'down', 'n', 's', 'e', 'w', 'u', 'd'];
  }

  getUsage(): string[] {
    return [
      'move <direction> - Move in the specified direction',
      'go <direction> - Same as move',
      '<direction> - Shorthand for move <direction>'
    ];
  }
}
