import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const loadSubclasses = async () => {
  const filePath = path.join(process.cwd(), '5e-database', 'src', '2014', '5e-SRD-Subclasses.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  const subclasses = JSON.parse(raw);

  for (const item of subclasses) {
    const payload = {
      index: item.index,
      name: item.name,
      class: item.class || null,
      subclass_flavor: item.subclass_flavor || null,
      desc: item.desc || null,
      url: item.url || null,
      data: item,
    };

    const { error } = await supabase.from('subclasses').insert(payload);

    if (error) {
      console.error(`❌ Error inserting ${item.index}:`, error);
      console.log('Payload:', JSON.stringify(payload, null, 2));
    } else {
      console.log(`✅ Inserted: ${item.index}`);
    }
  }
};

loadSubclasses();
