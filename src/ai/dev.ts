
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-session-summary.ts';
import '@/ai/flows/generate-character-name.ts';
import '@/ai/flows/generate-battle-map.ts'; // Updated from generate-overworld-map.ts
import '@/ai/flows/generate-character-backstory.ts';
