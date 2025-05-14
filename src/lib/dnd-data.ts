// src/lib/dnd-data.ts

export const RACES = [
  "Dragonborn", "Dwarf", "Elf", "Gnome", "Half-Elf", "Halfling", "Half-Orc", "Human", "Tiefling"
] as const;
export type Race = typeof RACES[number];

export const CLASSES = [
  "Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"
] as const;
export type DndClass = typeof CLASSES[number];

export const SUBCLASSES: Record<DndClass, readonly string[]> = {
  Barbarian: ["Path of the Totem Warrior", "Path of the Zealot", "Path of the Berserker", "Path of the Ancestral Guardian"],
  Bard: ["College of Lore", "College of Valor", "College of Glamour", "College of Swords"],
  Cleric: ["Life Domain", "Light Domain", "Trickery Domain", "War Domain", "Knowledge Domain", "Nature Domain", "Tempest Domain", "Forge Domain", "Grave Domain", "Order Domain", "Peace Domain", "Twilight Domain"],
  Druid: ["Circle of the Moon", "Circle of the Land", "Circle of Dreams", "Circle of Spores", "Circle of Stars", "Circle of Wildfire"],
  Fighter: ["Battle Master", "Champion", "Eldritch Knight", "Samurai", "Arcane Archer", "Cavalier", "Psi Warrior", "Rune Knight"],
  Monk: ["Way of the Open Hand", "Way of Shadow", "Way of Mercy", "Way of the Drunken Master", "Way of the Ascendant Dragon", "Way of the Four Elements"],
  Paladin: ["Oath of Devotion", "Oath of the Ancients", "Oath of Vengeance", "Oathbreaker", "Oath of Conquest", "Oath of Redemption", "Oath of Glory", "Oath of the Watchers"],
  Ranger: ["Hunter", "Beast Master", "Gloom Stalker", "Fey Wanderer", "Drake Warden", "Monster Slayer"],
  Rogue: ["Thief", "Assassin", "Arcane Trickster", "Mastermind", "Swashbuckler", "Inquisitive", "Phantom", "Soulknife"],
  Sorcerer: ["Draconic Bloodline", "Wild Magic", "Divine Soul", "Shadow Magic", "Storm Sorcery", "Aberrant Mind", "Clockwork Soul"],
  Warlock: ["The Fiend", "The Great Old One", "The Archfey", "The Celestial", "The Fathomless", "The Genie", "The Undead"],
  Wizard: ["School of Evocation", "School of Abjuration", "School of Illusion", "School of Divination", "School of Enchantment", "School of Necromancy", "School of Transmutation", "School of Conjuration", "Order of Scribes", "Bladesinging", "Chronurgy Magic", "Graviturgy Magic", "War Magic"],
};

export const BACKGROUNDS = [
  "Acolyte", "Charlatan", "Criminal", "Entertainer", "Folk Hero", "Guild Artisan", "Hermit", "Noble", "Outlander", "Sage", "Sailor", "Soldier", "Urchin"
] as const;
export type Background = typeof BACKGROUNDS[number];
