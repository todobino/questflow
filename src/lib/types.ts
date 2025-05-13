export interface Campaign {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  bannerImageUrl?: string;
  // Optional: image, gameSystem
}

export interface Character {
  id: string;
  name: string;
  race?: string;
  class?: string;
  backstory?: string;
  imageUrl?: string; // URL or data URI
  // Optional: stats, inventory, notes
}

export interface SessionNote {
  id: string;
  campaignId: string; // Link to campaign
  date: string; // ISO date string
  title: string;
  notes: string;
  summary?: string; // AI generated
}

export interface Combatant {
  id: string;
  name: string;
  type: 'player' | 'enemy';
  hp: number;
  maxHp: number;
  initiative?: number;
  conditions: string[]; // e.g., "poisoned", "stunned"
  // Optional: armorClass, attackBonus, damage
}

export interface OverworldMapData {
  mapImage: string; // Data URI
  description: string;
}

export interface PartyMember {
  id: string;
  name: string;
  avatarUrl: string;
  level: number;
  race: string;
  class: string;
  currentHp: number;
  maxHp: number;
}
