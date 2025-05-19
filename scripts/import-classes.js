import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const loadClasses = async () => {
  const filePath = path.join(process.cwd(), '5e-database', 'src', '2014', '5e-SRD-Classes.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  const classes = JSON.parse(raw);

  for (const item of classes) {
    const payload = {
      index: item.index,
      name: item.name,
      data: item,
      url: item.url || null,
    };

    const { error } = await supabase.from('classes').insert(payload);

    if (error) {
      console.error(`❌ Error inserting ${item.index}:`, error);
      console.log('Payload:', JSON.stringify(payload, null, 2));
    } else {
      console.log(`✅ Inserted: ${item.index}`);
    }
  }
};

loadClasses();
