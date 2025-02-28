import { logger } from '../../../../utils/logger';

export class EnvironmentEffectManager {
  private activeEffects: { [key: string]: any } = {};

  async initialize(): Promise<void> {
    logger.debug('Initializing EnvironmentEffectManager');
    // No specific initialization logic needed for now, but keep the method for future use
    return Promise.resolve();
  }

  applyEffect(roomId: string, effectName: string, effectData: any): void {
    if (!this.activeEffects[roomId]) {
      this.activeEffects[roomId] = {};
    }

    this.activeEffects[roomId][effectName] = effectData;
    logger.info(`Applied effect ${effectName} to room ${roomId} with data:`, effectData);
  }

  removeEffect(roomId: string, effectName: string): void {
    if (this.activeEffects[roomId] && this.activeEffects[roomId][effectName]) {
      delete this.activeEffects[roomId][effectName];
      logger.info(`Removed effect ${effectName} from room ${roomId}.`);
    } else {
      logger.warn(`Effect ${effectName} not found in room ${roomId}.`);
    }
  }

  getEffects(roomId: string): any {
    return this.activeEffects[roomId] || {};
  }

  hasEffect(roomId: string, effectName: string): boolean {
    return !!(this.activeEffects[roomId] && this.activeEffects[roomId][effectName]);
  }

  clearEffects(roomId: string): void {
    delete this.activeEffects[roomId];
    logger.info(`Cleared all effects from room ${roomId}.`);
  }
}
