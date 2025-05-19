import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const loadLanguages = async () => {
  const filePath = path.join(process.cwd(), '5e-database', 'src', '2014', '5e-SRD-Languages.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  const languages = JSON.parse(raw);

  for (const item of languages) {
    const payload = {
      index: item.index,
      name: item.name,
      desc: item.desc || null,
      type: item.type || null,
      typical_speakers: item.typical_speakers || null,
      script: item.script || null,
      url: item.url || null,
    };

    const { error } = await supabase.from('languages').insert(payload);

    if (error) {
      console.error(`❌ Error inserting ${item.index}:`, error);
      console.log('Payload:', JSON.stringify(payload, null, 2));
    } else {
      console.log(`✅ Inserted: ${item.index}`);
    }
  }
};

loadLanguages();
