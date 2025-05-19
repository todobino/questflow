import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const loadRaces = async () => {
  const filePath = path.join(process.cwd(), '5e-database', 'src', '2014', '5e-SRD-Races.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  const races = JSON.parse(raw);

  for (const item of races) {
    const payload = {
      index: item.index,
      name: item.name,
      speed: item.speed || null,
      ability_bonuses: item.ability_bonuses || null,
      alignment: item.alignment || null,
      age: item.age || null,
      size: item.size || null,
      size_description: item.size_description || null,
      languages: item.languages || null,
      traits: item.traits || null,
      subraces: item.subraces || null,
      url: item.url || null,
      data: item,
    };

    const { error } = await supabase.from('races').insert(payload);

    if (error) {
      console.error(`❌ Error inserting ${item.index}:`, error);
      console.log('Payload:', JSON.stringify(payload, null, 2));
    } else {
      console.log(`✅ Inserted: ${item.index}`);
    }
  }
};

loadRaces();
