import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const loadSpells = async () => {
  const filePath = path.join(process.cwd(), '5e-database', 'src', '2014', '5e-SRD-Spells.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  const spells = JSON.parse(raw);

  for (const item of spells) {
    const payload = {
      index: item.index,
      name: item.name,
      level: item.level,
      school: item.school || null,
      desc: item.desc || null,
      higher_level: item.higher_level || null,
      classes: item.classes || null,
      subclasses: item.subclasses || null,
      url: item.url || null,
      data: item,
    };

    const { error } = await supabase.from('spells').insert(payload);

    if (error) {
      console.error(`❌ Error inserting ${item.index}:`, error);
      console.log('Payload:', JSON.stringify(payload, null, 2));
    } else {
      console.log(`✅ Inserted: ${item.index}`);
    }
  }
};

loadSpells();
