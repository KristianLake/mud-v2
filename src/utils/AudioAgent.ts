import { IAudioSystem } from '../domain/services/audio/IAudioSystem';
import { logger } from './logger';
import { Room } from '../types';

/**
 * AudioAgent for managing audio playback.
 */
export class AudioAgent {
  private static instance: AudioAgent | null = null;
  private audioSystem: IAudioSystem;

  private constructor(audioSystem: IAudioSystem) {
    this.audioSystem = audioSystem;
    logger.debug('AudioAgent initialized');
  }

  /**
   * Initializes the AudioAgent with an IAudioSystem.
   * @param audioSystem The IAudioSystem instance.
   * @returns The AudioAgent instance.
   */
  static initialize(audioSystem: IAudioSystem): AudioAgent {
    if (!AudioAgent.instance) {
      AudioAgent.instance = new AudioAgent(audioSystem);
    } else {
      logger.warn('AudioAgent already initialized');
    }
    return AudioAgent.instance;
  }

  /**
   * Gets the AudioAgent instance.
   * @returns The AudioAgent instance.
   * @throws Error if AudioAgent is not initialized.
   */
  static getInstance(): AudioAgent {
    if (!AudioAgent.instance) {
      throw new Error('AudioAgent not initialized');
    }
    return AudioAgent.instance;
  }

  /**
   * Plays a sound.
   * @param soundId The ID of the sound to play.
   * @param room The room where the sound is played.
   * @param options Playback options.
   */
  async playSound(soundId: string, room: Room, options?: any): Promise<void> {
    try {
      await this.audioSystem.playSound(soundId, room, options);
    } catch (error) {
      logger.error(`Failed to play sound ${soundId}: ${error}`);
    }
  }

  /**
   * Stops a sound.
   * @param soundId The ID of the sound to stop.
   */
  stopSound(soundId: string): void {
    try {
      this.audioSystem.stopSound(soundId);
    } catch (error) {
      logger.error(`Failed to stop sound ${soundId}: ${error}`);
    }
  }
}
