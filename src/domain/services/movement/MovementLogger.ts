import { logger } from '../../../utils/logger';

export interface IMovementLogger {
    logMovement(entityId: string, fromRoomId: string, toRoomId: string): void;
    logAttemptedMovement(entityId: string, direction: string, roomId: string): void;
    logBlockedMovement(entityId: string, direction: string, roomId: string, reason: string): void;
}

export class MovementLogger implements IMovementLogger {
    logMovement(entityId: string, fromRoomId: string, toRoomId: string): void {
        logger.info(`Entity ${entityId} moved from room ${fromRoomId} to ${toRoomId}.`);
    }

    logAttemptedMovement(entityId: string, direction: string, roomId: string): void {
        logger.debug(`Entity ${entityId} attempted to move ${direction} from room ${roomId}.`);
    }

    logBlockedMovement(entityId: string, direction: string, roomId: string, reason: string): void {
        logger.warn(`Entity ${entityId} blocked from moving ${direction} from room ${roomId}. Reason: ${reason}.`);
    }
}
