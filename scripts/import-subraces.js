import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const loadSubraces = async () => {
  const filePath = path.join(process.cwd(), '5e-database', 'src', '2014', '5e-SRD-Subraces.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  const subraces = JSON.parse(raw);

  for (const item of subraces) {
    const payload = {
      index: item.index,
      name: item.name,
      race: item.race || null,
      desc: item.desc || null,
      ability_bonuses: item.ability_bonuses || null,
      starting_proficiencies: item.starting_proficiencies || null,
      languages: item.languages || null,
      racial_traits: item.racial_traits || null,
      url: item.url || null,
      data: item,
    };

    const { error } = await supabase.from('subraces').insert(payload);

    if (error) {
      console.error(`❌ Error inserting ${item.index}:`, error);
      console.log('Payload:', JSON.stringify(payload, null, 2));
    } else {
      console.log(`✅ Inserted: ${item.index}`);
    }
  }
};

loadSubraces();
