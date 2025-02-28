import { IAudioSystem } from '../domain/services/audio/IAudioSystem';
import { logger } from './logger';

/**
 * SoundManager for managing sound effects.
 */
export class SoundManager {
  private static instance: SoundManager | null = null;
  private audioSystem: IAudioSystem;

  private constructor(audioSystem: IAudioSystem) {
    this.audioSystem = audioSystem;
    logger.debug('SoundManager initialized');
  }

  /**
   * Initializes the SoundManager with an IAudioSystem.
   * @param audioSystem The IAudioSystem instance.
   * @returns The SoundManager instance.
   */
  static initialize(audioSystem: IAudioSystem): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager(audioSystem);
    } else {
      logger.warn('SoundManager already initialized');
    }
    return SoundManager.instance;
  }

  /**
   * Gets the SoundManager instance.
   * @returns The SoundManager instance.
   * @throws Error if SoundManager is not initialized.
   */
  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      throw new Error('SoundManager not initialized');
    }
    return SoundManager.instance;
  }

  /**
   * Plays a sound effect.
   * @param soundId The ID of the sound effect to play.
   * @param options Playback options.
   */
  async playSoundEffect(soundId: string, options?: any): Promise<void> {
    try {
      await this.audioSystem.playSound(soundId, options);
    } catch (error) {
      logger.error(`Failed to play sound effect ${soundId}: ${error}`);
    }
  }

  /**
   * Stops a sound effect.
   * @param soundId The ID of the sound effect to stop.
   */
  stopSoundEffect(soundId: string): void {
    try {
      this.audioSystem.stopSound(soundId);
    } catch (error) {
      logger.error(`Failed to stop sound effect ${soundId}: ${error}`);
    }
  }
}
