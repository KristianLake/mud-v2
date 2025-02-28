import { GameState } from '../types';

export const initialState: GameState = {
  playerLocation: 'inn',
  playerInventory: [], // Renamed from 'inventory' to match validation
  playerGold: 100, // Added required property
  playerHealth: 100, // Added directly at top level to match validation
  timeOfDay: 'morning', // Added required property
  questLog: {}, // Added required property
  playerStats: {
    maxHealth: 100,
    level: 1,
    experience: 0,
    nextLevelExp: 100,
    strength: 10,
    agility: 10,
    intelligence: 10,
    baseAttack: 5, // Added required stat
    baseDefense: 5 // Added required stat
  },
  rooms: {
    'inn': {
      id: 'inn',
      name: 'Village Inn',
      description: 'A cozy inn with a roaring fireplace. The innkeeper stands behind the counter, and a few patrons sit at tables enjoying their drinks.',
      exits: {
        south: 'village-square'
      },
      items: ['bread', 'mug'],
      npcs: ['innkeeper']
    },
    'village-square': {
      id: 'village-square',
      name: 'Village Square',
      description: 'The central square of the village, with a well in the middle. Villagers mill about, and you can see shops and houses surrounding the area.',
      exits: {
        north: 'inn',
        east: 'general-store',
        west: 'blacksmith',
        south: 'village-gate'
      },
      items: ['coin'],
      npcs: ['villager']
    },
    'general-store': {
      id: 'general-store',
      name: 'General Store',
      description: 'A small shop filled with various goods. Shelves line the walls, stocked with supplies for travelers.',
      exits: {
        west: 'village-square'
      },
      items: ['backpack', 'torch'],
      npcs: ['shopkeeper']
    },
    'blacksmith': {
      id: 'blacksmith',
      name: 'Blacksmith Shop',
      description: 'The heat from the forge warms the room. The blacksmith hammers away at a piece of metal on the anvil.',
      exits: {
        east: 'village-square'
      },
      items: ['sword', 'shield'],
      npcs: ['blacksmith']
    },
    'village-gate': {
      id: 'village-gate',
      name: 'Village Gate',
      description: 'A sturdy wooden gate marks the entrance to the village. A path leads into the forest beyond.',
      exits: {
        north: 'village-square',
        south: 'forest-path'
      },
      items: [],
      npcs: ['guard']
    },
    'forest-path': {
      id: 'forest-path',
      name: 'Forest Path',
      description: 'A narrow path winding through tall trees. The forest is dense, with occasional sounds of wildlife.',
      exits: {
        north: 'village-gate',
        east: 'forest-clearing'
      },
      items: ['stick', 'berry'],
      npcs: []
    },
    'forest-clearing': {
      id: 'forest-clearing',
      name: 'Forest Clearing',
      description: 'A small clearing in the forest. Sunlight streams down through the opening in the canopy.',
      exits: {
        west: 'forest-path'
      },
      items: ['flower', 'mushroom'],
      npcs: ['traveler']
    }
  },
  items: {
    'bread': {
      id: 'bread',
      name: 'Loaf of Bread',
      description: 'A freshly baked loaf of bread.',
      value: 2,
      weight: 0.5,
      isUsable: true,
      isEquippable: false
    },
    'mug': {
      id: 'mug',
      name: 'Wooden Mug',
      description: 'A sturdy wooden mug for drinking.',
      value: 1,
      weight: 0.3,
      isUsable: true,
      isEquippable: false
    },
    'coin': {
      id: 'coin',
      name: 'Gold Coin',
      description: 'A shiny gold coin.',
      value: 1,
      weight: 0.1,
      isUsable: false,
      isEquippable: false
    },
    'backpack': {
      id: 'backpack',
      name: 'Leather Backpack',
      description: 'A sturdy leather backpack with multiple pockets.',
      value: 10,
      weight: 1.0,
      isUsable: false,
      isEquippable: true,
      slot: 'back'
    },
    'torch': {
      id: 'torch',
      name: 'Torch',
      description: 'A wooden torch soaked in pitch, good for illumination.',
      value: 5,
      weight: 0.5,
      isUsable: true,
      isEquippable: true,
      slot: 'hand'
    },
    'sword': {
      id: 'sword',
      name: 'Iron Sword',
      description: 'A well-crafted iron sword with a leather grip.',
      value: 25,
      weight: 3.0,
      isUsable: false,
      isEquippable: true,
      slot: 'hand',
      stats: {
        attack: 5
      }
    },
    'shield': {
      id: 'shield',
      name: 'Wooden Shield',
      description: 'A round wooden shield reinforced with iron.',
      value: 15,
      weight: 4.0,
      isUsable: false,
      isEquippable: true,
      slot: 'hand',
      stats: {
        defense: 3
      }
    },
    'stick': {
      id: 'stick',
      name: 'Wooden Stick',
      description: 'A sturdy wooden stick, could be used as a simple weapon.',
      value: 1,
      weight: 0.5,
      isUsable: false,
      isEquippable: true,
      slot: 'hand',
      stats: {
        attack: 1
      }
    },
    'berry': {
      id: 'berry',
      name: 'Forest Berry',
      description: 'A small red berry, looks edible.',
      value: 1,
      weight: 0.1,
      isUsable: true,
      isEquippable: false
    },
    'flower': {
      id: 'flower',
      name: 'Wild Flower',
      description: 'A beautiful wild flower with vibrant petals.',
      value: 2,
      weight: 0.1,
      isUsable: false,
      isEquippable: false
    },
    'mushroom': {
      id: 'mushroom',
      name: 'Forest Mushroom',
      description: 'A small brown mushroom growing in the forest.',
      value: 2,
      weight: 0.1,
      isUsable: true,
      isEquippable: false
    }
  },
  npcs: {
    'innkeeper': {
      id: 'innkeeper',
      name: 'Innkeeper',
      description: 'A friendly middle-aged man with a well-kept beard.',
      dialogue: {
        greeting: 'Welcome to my inn, traveler! Can I get you something to drink?',
        topics: {
          village: 'Our village is small but peaceful. We get the occasional traveler passing through.',
          rumors: 'I\'ve heard there\'s been some strange noises coming from the forest at night...'
        }
      },
      isMerchant: true
    },
    'villager': {
      id: 'villager',
      name: 'Villager',
      description: 'A local resident going about their daily business.',
      dialogue: {
        greeting: 'Hello there! You must be new around here.',
        topics: {
          life: 'Life in the village is simple but good. We farm, fish, and trade with merchants.'
        }
      }
    },
    'shopkeeper': {
      id: 'shopkeeper',
      name: 'Shopkeeper',
      description: 'An elderly woman with spectacles and a kind smile.',
      dialogue: {
        greeting: 'Browse all you like, dear. Let me know if you need any help.',
        topics: {
          goods: 'I stock all sorts of useful items for adventurers. Take a look around!'
        }
      },
      isMerchant: true
    },
    'blacksmith': {
      id: 'blacksmith',
      name: 'Blacksmith',
      description: 'A muscular man with soot-covered arms and a leather apron.',
      dialogue: {
        greeting: 'Need a weapon or armor? You\'ve come to the right place.',
        topics: {
          weapons: 'I make the finest swords in the region. Balanced and sharp, they\'ll serve you well.'
        }
      },
      isMerchant: true
    },
    'guard': {
      id: 'guard',
      name: 'Village Guard',
      description: 'A stern-looking guard in leather armor.',
      dialogue: {
        greeting: 'Keep out of trouble while you\'re here, stranger.',
        warning: 'The forest can be dangerous at night. Be careful if you head that way.'
      }
    },
    'traveler': {
      id: 'traveler',
      name: 'Weary Traveler',
      description: 'A tired-looking traveler resting in the clearing.',
      dialogue: {
        greeting: 'Ah, another soul braving the forest paths. Be careful as you travel.',
        topics: {
          journey: 'I\'ve been on the road for weeks. There\'s a town a few days journey to the east.',
          danger: 'I spotted what looked like goblin tracks not far from here. Keep your wits about you.'
        }
      }
    }
  },
  gameFlags: {}
};
