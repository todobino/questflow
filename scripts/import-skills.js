import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const loadSkills = async () => {
  const filePath = path.join(process.cwd(), '5e-database', 'src', '2014', '5e-SRD-Skills.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  const skills = JSON.parse(raw);

  for (const item of skills) {
    const payload = {
      index: item.index,
      name: item.name,
      desc: item.desc || null,
      ability_score: item.ability_score || null,
      url: item.url || null,
    };

    const { error } = await supabase.from('skills').insert(payload);

    if (error) {
      console.error(`❌ Error inserting ${item.index}:`, error);
      console.log('Payload:', JSON.stringify(payload, null, 2));
    } else {
      console.log(`✅ Inserted: ${item.index}`);
    }
  }
};

loadSkills();
