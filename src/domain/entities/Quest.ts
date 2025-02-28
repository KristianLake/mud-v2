export interface Quest {
    id: string;
    name: string;
    description: string;
    objectives: QuestObjective[];
    rewards: QuestReward[];
    isCompleted: boolean;
}

export interface QuestObjective {
    description: string;
    isCompleted: boolean;
    type: string; // e.g., 'collect', 'defeat', 'explore'
    target?: string; // e.g., item ID, NPC ID, room ID
    count?: number; // e.g., number of items to collect
}

export interface QuestReward {
    type: string; // e.g., 'item', 'gold', 'xp'
    target?: string; // e.g., item ID
    count?: number; // e.g., amount of gold
}
