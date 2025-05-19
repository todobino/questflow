import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const loadAlignments = async () => {
  const filePath = path.join(process.cwd(), '5e-database', 'src', '2014', '5e-SRD-Alignments.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  const alignments = JSON.parse(raw);

  for (const item of alignments) {
    const { error } = await supabase.from('alignments').insert({
      index: item.index,
      name: item.name,
      abbreviation: item.abbreviation,
      desc: item.desc,
      url: item.url,
    });

    if (error) {
      console.error(`❌ Error inserting ${item.index}:`, error.message);
    } else {
      console.log(`✅ Inserted: ${item.index}`);
    }
  }
};

loadAlignments();
