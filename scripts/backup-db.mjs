// Daily database backup — run by GitHub Actions (.github/workflows/backup-db.yml).
// Dumps each table to a JSON file under ./backup/. The workflow uploads that
// folder as a (private) build artifact — NOT committed to git, to keep customer
// PII out of the repository history.
//
// Required env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (GitHub secrets).

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, KEY, { auth: { persistSession: false } });
const TABLES = ['customers', 'orders', 'shipments', 'analytics_events'];

fs.mkdirSync('backup', { recursive: true });
const stamp = new Date().toISOString().slice(0, 10);

let failed = false;
for (const t of TABLES) {
  const { data, error } = await supabase.from(t).select('*');
  if (error) {
    console.error(`Failed to read ${t}: ${error.message}`);
    failed = true;
    continue;
  }
  const file = `backup/${t}-${stamp}.json`;
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log(`${t}: ${data.length} rows → ${file}`);
}

process.exit(failed ? 1 : 0);
