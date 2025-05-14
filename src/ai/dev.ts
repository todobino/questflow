
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-session-summary.ts';
import '@/ai/flows/generate-character-name.ts';
import '@/ai/flows/generate-battle-map.ts'; 
import '@/ai/flows/generate-character-backstory.ts';
import '@/ai/flows/generate-character-image.ts'; // Added new flow
// Removed: import '@/ai/flows/generate-random-character.ts'; // This AI flow is no longer used for the primary randomize button.

