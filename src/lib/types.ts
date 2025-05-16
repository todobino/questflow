
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
  currentExp?: number; // Added for EXP tracking
  nextLevelExp?: number; // Added for EXP tracking
  abilities?: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  // Optional: stats, inventory, notes, factionId
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
  type: 'player' | 'enemy' | 'ally';
  hp: number;
  maxHp: number;
  initiative?: number;
  conditions: string[]; // e.g., "poisoned", "stunned"
  initiativeModifier?: number; // For players, from character sheet
  isPlayerCharacter?: boolean; // True if this combatant represents a Character from the party
  originalCharacterId?: string; // ID of the Character if isPlayerCharacter is true
  armorClass?: number;
  displayColor?: string;
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

export interface EncounterLogEntry {
  id: string;
  timestamp: string; // ISO date string
  campaignId?: string;
  roundsFought: number;
  survivingPlayerCharacters: Array<{
    name: string;
    currentHp: number;
    maxHp: number;
  }>;
  defeatedCombatants: Array<{ // Renamed to vanquishedCombatants in display, type remains same for data
    name:string;
    type: 'enemy' | 'player' | 'ally';
  }>;
}

export interface Faction {
  id: string;
  name: string;
  description: string;
  campaignId: string; // Link to a specific campaign
}

export interface FactionReputation {
  factionId: string;
  campaignId: string; // Ensure reputation is per-campaign
  score: number; // Range: -20 to +20
}

export interface SessionLog {
  id: string;
  campaignId: string;
  sessionNumber: number;
  startTime: string; // ISO string
  endTime?: string; // ISO string, optional if session is active or paused
  status: 'active' | 'completed' | 'paused'; // Added 'paused'
  pausedTime?: string; // ISO string, set when session is paused
}

// Types for D&D 5e API
export interface MonsterListItem {
  index: string;
  name: string;
  url: string;
}

export interface MonsterListResponse {
  count: number;
  results: MonsterListItem[];
}

export interface ArmorClass {
  type: string;
  value: number;
  desc?: string;
}

export interface MonsterDetails {
  index: string;
  name: string;
  size: string;
  type: string;
  alignment: string;
  armor_class: ArmorClass[];
  hit_points: number;
  hit_dice: string;
  challenge_rating: number;
  // Add other fields as needed, e.g., speed, stats, actions, legendary_actions
  desc?: string; // Some monsters have descriptions
  image?: string; // e.g. /api/images/monsters/aboleth.png (relative to base API URL)
}

// Simplified Monster for display in Encounter Builder
export interface EncounterMonster extends MonsterListItem {
  cr: number;
  // other quick access fields if needed
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'potion' | 'scroll' | 'gear' | 'treasure' | 'misc';
  quantity: number;
  description?: string;
  notes?: string;
  // Could also include: weight, cost, properties (e.g., for weapons/armor), rarity, attuned (boolean)
}
