import { SoundEffectType } from '../../../types/audio';
import { IAudioPlayer } from './IAudioPlayer';
import { logger } from '../../../utils/logger';

export class AudioPlayer implements IAudioPlayer {
    private audioContext: AudioContext;
    private soundBuffers: Map<string, AudioBuffer>;

    constructor() {
        this.audioContext = new AudioContext();
        this.soundBuffers = new Map();
    }

    async playSound(soundEffect: SoundEffectType): Promise<void> {
        const buffer = await this.getSoundBuffer(soundEffect.url);
        if (!buffer) {
            logger.error(`Failed to play sound: ${soundEffect.url}`);
            return;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;

        // Create gain node for volume control
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = soundEffect.volume;

        // Connect source to gain node, and gain node to destination
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        source.start();
    }

    stopSound(soundEffect: SoundEffectType): void {
      // Web Audio API doesn't have a direct way to stop a specific sound
      // if you used `createBufferSource`. You'd need to track the source nodes
      // and call `stop()` on them. This is a simplification.
      logger.warn('Stopping specific sounds is not fully supported in this implementation.');
    }

    setVolume(soundEffect: SoundEffectType, volume: number): void {
        // Similar to stopSound, you'd need to track the gain nodes to adjust volume
        // after the sound has started. This is a simplification.
        logger.warn('Adjusting volume after starting is not fully supported in this implementation.');
    }

    private async getSoundBuffer(url: string): Promise<AudioBuffer | null> {
        if (this.soundBuffers.has(url)) {
            return this.soundBuffers.get(url) || null;
        }

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.soundBuffers.set(url, audioBuffer);
            return audioBuffer;
        } catch (error) {
            logger.error(`Error loading or decoding sound: ${url}`, { error });
            return null;
        }
    }
}
