import { SoundEffectType } from '../../../types/audio';
import { IAudioPlayer } from './IAudioPlayer';
import { AudioPlayer } from './AudioPlayer'; // Assuming you have an AudioPlayer class
import { BaseGameService } from '../BaseGameService';
import { logger } from '../../../utils/logger';

export class AudioEffectService extends BaseGameService {
    private audioPlayer: IAudioPlayer;

    constructor() {
        super();
        this.audioPlayer = new AudioPlayer(); // No need for DI here
    }

    // Plays a specific sound effect.
    async playSoundEffect(soundEffect: SoundEffectType): Promise<void> {
        try {
            await this.audioPlayer.playSound(soundEffect);
            logger.info(`Playing sound effect: ${soundEffect.url}`);
        } catch (error) {
            logger.error(`Error playing sound effect: ${soundEffect.url}`, { error });
        }
    }

    // Stops a currently playing sound effect.
    stopSoundEffect(soundEffect: SoundEffectType): void {
        this.audioPlayer.stopSound(soundEffect);
        logger.info(`Stopped sound effect: ${soundEffect.url}`);
    }

    // Adjusts the volume of a sound effect.
    setVolume(soundEffect: SoundEffectType, volume: number): void {
        this.audioPlayer.setVolume(soundEffect, volume);
        logger.info(`Set volume for ${soundEffect.url} to ${volume}`);
    }
}
