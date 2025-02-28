import { IEnvironmentService } from './IEnvironmentService';
import { IStateService } from '../state/IStateService';
import { ServiceTokens } from '../di/ServiceTokens';
import { Container } from '../di/Container';
import { BaseGameService } from '../BaseGameService';
import { logger } from '../../../utils/logger';

// NOTE: This class seems to duplicate functionality in StateService and StatePersistence.
//       It should likely be removed or significantly refactored.  Keeping it
//       temporarily to satisfy the "continue" instruction.

export class EnvironmentPersistence extends BaseGameService {
    private environmentService: IEnvironmentService;
    private stateService: IStateService;

    constructor() {
        super();
        this.environmentService = this.container.resolve<IEnvironmentService>(ServiceTokens.EnvironmentService);
        this.stateService = this.container.resolve<IStateService>(ServiceTokens.StateService);
    }

    // Saves the current environment state.
    saveEnvironmentState(): void {
        const environmentState = this.environmentService.getEnvironmentState();
        this.stateService.updateState({ environment: environmentState }); // Assuming 'environment' is a part of the game state
        logger.info('Environment state saved');
    }

    // Loads the environment state.
    loadEnvironmentState(): void {
        const gameState = this.stateService.getState();
        if (gameState.environment) {
            this.environmentService.setEnvironmentState(gameState.environment);
            logger.info('Environment state loaded');
        } else {
            logger.warn('No environment state found in game state');
        }
    }
}
