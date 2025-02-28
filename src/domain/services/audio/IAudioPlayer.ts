import { SoundEffectType } from '../../../types/audio';

export interface IAudioPlayer {
  playSound(soundEffect: SoundEffectType): Promise<void>;
  stopSound(soundEffect: SoundEffectType): void; // Consider removing if not supported
  setVolume(soundEffect: SoundEffectType, volume: number): void; // Consider removing if not supported
}
