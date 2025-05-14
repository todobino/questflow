// src/lib/random-tables-data.ts

export interface TableItem {
  id: string;
  value: string; // The actual text of the random result
}

export interface RandomTable {
  id: string;
  name: string;
  description: string;
  items: TableItem[];
}

export const PREDEFINED_TABLES: RandomTable[] = [
  {
    id: 'weather-conditions',
    name: 'Weather Conditions',
    description: 'Randomly generate the current weather.',
    items: [
      { id: 'wc1', value: 'Clear skies, gentle breeze.' },
      { id: 'wc2', value: 'Partly cloudy with a pleasant temperature.' },
      { id: 'wc3', value: 'Overcast and cool.' },
      { id: 'wc4', value: 'Light drizzle, dampening the ground.' },
      { id: 'wc5', value: 'Heavy rain, visibility reduced.' },
      { id: 'wc6', value: 'Thunderstorm approaching, distant rumbles.' },
      { id: 'wc7', value: 'Thick fog, eerie silence.' },
      { id: 'wc8', value: 'Strong winds, whipping through trees and cloaks.' },
      { id: 'wc9', value: 'Sweltering heat, air is still.' },
      { id: 'wc10', value: 'Crisp and cold, frost on the ground.' },
      { id: 'wc11', value: 'Light snowfall, picturesque.' },
      { id: 'wc12', value: 'Blizzard conditions, treacherous travel.' },
    ],
  },
  {
    id: 'tavern-events',
    name: 'Tavern Events',
    description: 'Spice up a visit to the local watering hole.',
    items: [
      { id: 'te1', value: 'A bar fight erupts over a spilled drink.' },
      { id: 'te2', value: 'A travelling merchant tries to sell exotic goods.' },
      { id: 'te3', value: 'A group of local toughs are harassing the staff.' },
      { id: 'te4', value: 'A bard starts playing a surprisingly good (or terrible) song.' },
      { id: 'te5', value: 'A mysterious stranger in a dark corner seems to be watching the party.' },
      { id: 'te6', value: 'Someone recognizes a party member and greets them warmly (or with hostility).' },
      { id: 'te7', value: 'The tavern runs out of a popular drink or food item.' },
      { id: 'te8', value: 'A local challenges someone to a drinking contest.' },
      { id: 'te9', value: 'Guards enter, looking for someone specific.' },
      { id: 'te10', value: 'A pet (dog, cat, parrot) belonging to a patron causes a minor disturbance.' },
      { id: 'te11', value: 'A secret note is discreetly passed to a party member.' },
      { id: 'te12', value: 'The tavern keeper announces a special discount or a new menu item.' },
    ],
  },
  {
    id: 'wild-magic-surges',
    name: 'Wild Magic Surges',
    description: 'Unpredictable magical effects for sorcerers or strange magical zones.',
    items: [
      { id: 'wms1', value: 'For the next minute, you can only speak in shouts.' },
      { id: 'wms2', value: 'Your hair falls out but grows back within 24 hours.' },
      { id: 'wms3', value: 'You float 1 foot off the ground for 1 minute.' },
      { id: 'wms4', value: 'A burst of colorful, harmless sparks erupts from your fingertips.' },
      { id: 'wms5', value: 'You turn invisible for 1 minute or until you attack or cast a spell.' },
      { id: 'wms6', value: 'All unlocked doors and windows within 30 feet of you fly open.' },
      { id: 'wms7', value: 'You smell faintly of cinnamon for the next hour.' },
      { id: 'wms8', value: 'Your skin changes color to a vibrant blue for 10 minutes.' },
      { id: 'wms9', value: 'A nearby potted plant grows to twice its size.' },
      { id: 'wms10', value: 'You cast "Grease" centered on yourself.' },
      { id: 'wms11', value: 'Illusory butterflies flutter around you for 1 minute.' },
      { id: 'wms12', value: 'You regain 1d4 hit points.' },
    ],
  },
  {
    id: 'npc-quirks',
    name: 'NPC Quirks',
    description: 'Add memorable traits to your non-player characters.',
    items: [
      { id: 'nq1', value: 'Always speaks in rhymes or riddles.' },
      { id: 'nq2', value: 'Constantly fidgets with a small object (coin, ring, etc.).' },
      { id: 'nq3', value: 'Has an unusually strong (and strange) scent.' },
      { id: 'nq4', value: 'Collects mundane items (buttons, smooth stones, bits of string).' },
      { id: 'nq5', value: 'Refers to themselves in the third person.' },
      { id: 'nq6', value: 'Has a noticeable lisp or an unusual accent.' },
      { id: 'nq7', value: 'Is terrified of a common animal (e.g., squirrels, pigeons).' },
      { id: 'nq8', value: 'Laughs at inappropriate times.' },
      { id: 'nq9', value: 'Insists on being paid in a specific type of coin or good.' },
      { id: 'nq10', value: 'Mispronounces common words frequently.' },
    ],
  },
  {
    id: 'minor-loot',
    name: 'Minor Loot & Trinkets',
    description: 'Small, interesting items found on enemies or in chests.',
    items: [
      { id: 'ml1', value: 'A tarnished silver locket with a faded portrait inside.' },
      { id: 'ml2', value: 'A pouch containing 3d6 copper pieces and a smooth river stone.' },
      { id: 'ml3', value: 'A well-made but heavily used whetstone.' },
      { id: 'ml4', value: 'A small, intricately carved wooden bird.' },
      { id: 'ml5', value: 'A half-empty flask of cheap, potent ale.' },
      { id: 'ml6', value: 'A single, perfumed glove made of fine silk.' },
      { id: 'ml7', value: 'A map of a place you don\'t recognize, drawn on a piece of leather.' },
      { id: 'ml8', value: 'A set of loaded dice.' },
      { id: 'ml9', value: 'A dog-eared book of bawdy poetry.' },
      { id: 'ml10', value: 'A mummified goblin hand.' },
    ],
  },
  {
    id: 'plot-hooks',
    name: 'Rumors & Plot Hooks',
    description: 'Quick ideas to spark new adventures.',
    items: [
      { id: 'ph1', value: 'They say the old mill on the edge of town is haunted by its former owner.' },
      { id: 'ph2', value: 'A wealthy merchant is looking for brave adventurers to guard a caravan to the next city.' },
      { id: 'ph3', value: 'Children have been going missing from the nearby village, and the locals are desperate.' },
      { id: 'ph4', value: 'A strange glowing meteorite is said to have fallen in the nearby woods.' },
      { id: 'ph5', value: 'The local lord has offered a bounty for the head of a troublesome bandit leader.' },
      { id: 'ph6', value: 'Whispers speak of an ancient ruin recently unearthed by a landslide.' },
      { id: 'ph7', value: 'A scholar is seeking rare herbs that only grow in a dangerous swamp.' },
      { id: 'ph8', value: 'The annual harvest festival is approaching, but a vital component is missing or stolen.' },
      { id: 'ph9', value: 'A plea for help, scrawled on a piece of parchment, was found tied to a carrier pigeon.' },
      { id: 'ph10', value: 'Someone claims to have seen a dragon flying over the distant mountains.' },
    ],
  },
];
