
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
  campaignId: string; // Link to campaign
  name: string;
  race?: string;
  class?: string;
  subclass?: string; 
  background?: string; 
  level?: number; // Added level
  backstory?: string;
  imageUrl?: string; // URL or data URI
  currentHp?: number;
  maxHp?: number;
  armorClass?: number;
  initiativeModifier?: number;
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

export interface PartyMember { // This might be redundant if Character type now covers party members fully
  id: string;
  name: string;
  avatarUrl: string; // Consider aligning with Character's imageUrl
  level: number;
  race: string;
  class: string;
  currentHp: number;
  maxHp: number;
  dataAiHint?: string;
}

