import { createClient } from '@supabase/supabase-js';

// Public project config. The publishable (anon) key is meant to ship in the
// browser — data access is enforced server-side by Row Level Security
// (see supabase/schema.sql). Environment variables override these defaults.
const DEFAULT_URL = 'https://uwmydcfhedcquktxqsis.supabase.co';
const DEFAULT_ANON_KEY = 'sb_publishable_I-rCKddomQKyqaIFrSzyJQ_mEczWRKl';

const url = import.meta.env.VITE_SUPABASE_URL || DEFAULT_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

export const supabaseEnabled = Boolean(url && anonKey);

export const supabase = supabaseEnabled
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
