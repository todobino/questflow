import { config } from 'dotenv';
config();

import '@/ai/flows/generate-session-summary.ts';
import '@/ai/flows/generate-character-name.ts';
import '@/ai/flows/generate-overworld-map.ts';
import '@/ai/flows/generate-character-backstory.ts';