import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const loadBackgrounds = async () => {
  const filePath = path.join(process.cwd(), '5e-database', 'src', '2014', '5e-SRD-Backgrounds.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  const backgrounds = JSON.parse(raw);

  for (const item of backgrounds) {
    const { error } = await supabase.from('backgrounds').insert({
      index: item.index,
      name: item.name,
      data: item,
      url: item.url,
    });

    if (error) {
      console.error(`❌ Error inserting ${item.index}:`, error.message);
    } else {
      console.log(`✅ Inserted: ${item.index}`);
    }
  }
};

loadBackgrounds();
