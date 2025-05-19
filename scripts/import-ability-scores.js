// scripts/import-ability-scores.js

import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const loadAbilityScores = async () => {
  const filePath = path.join(process.cwd(), '5e-database', 'src', '2014', '5e-SRD-Ability-Scores.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  const abilityScores = JSON.parse(raw);

  for (const item of abilityScores) {
    const { error } = await supabase.from('ability_scores').insert({
      index: item.index,
      name: item.name,
      full_name: item.full_name,
      desc: item.desc,
      skills: item.skills,
      url: item.url,
    });

    if (error) {
      console.error(`Error inserting ${item.index}:`, error.message);
    } else {
      console.log(`Inserted: ${item.index}`);
    }
  }
};

loadAbilityScores();
