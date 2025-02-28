// src/config/sounds.ts

import { SoundEffectType } from '../types/audio';

export const soundEffects: Record<string, SoundEffectType> = {
    step: {
        url: '/sounds/step.wav', // Replace with your actual sound file path
        volume: 0.5,
    },
    itemPickup: {
        url: '/sounds/item_pickup.wav',
        volume: 0.7,
    },
    doorOpen: {
        url: '/sounds/door_open.wav',
        volume: 0.6,
    },
    // Add more sound effects as needed
};
