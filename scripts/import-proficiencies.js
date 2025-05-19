import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const loadProficiencies = async () => {
  const filePath = path.join(process.cwd(), '5e-database', 'src', '2014', '5e-SRD-Proficiencies.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  const proficiencies = JSON.parse(raw);

  for (const item of proficiencies) {
    const payload = {
      index: item.index,
      name: item.name,
      type: item.type || null,
      classes: item.classes || null,
      races: item.races || null,
      url: item.url || null,
      data: item,
    };

    const { error } = await supabase.from('proficiencies').insert(payload);

    if (error) {
      console.error(`❌ Error inserting ${item.index}:`, error);
      console.log('Payload:', JSON.stringify(payload, null, 2));
    } else {
      console.log(`✅ Inserted: ${item.index}`);
    }
  }
};

loadProficiencies();
