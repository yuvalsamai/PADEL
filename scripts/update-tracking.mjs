// Daily tracking updater — run by GitHub Actions (see
// .github/workflows/update-tracking.yml) or manually with `node scripts/update-tracking.mjs`.
//
// For every shipment that has a tracking number and is still in transit, it asks
// the official 17TRACK API for the latest status and, when the parcel is
// delivered, flips the shipment (and its order) to "delivered" in Supabase.
// The admin dashboard reads straight from Supabase, so statuses appear there
// automatically on the next load.
//
// Required env vars (set as GitHub Actions secrets):
//   SUPABASE_URL                 e.g. https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY    server-only key (full DB access)
//   SEVENTEENTRACK_API_KEY       free key from https://api.17track.net (Security → Access Key)

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_KEY = process.env.SEVENTEENTRACK_API_KEY;
const API_BASE = 'https://api.17track.net/track/v2.2';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !API_KEY) {
  console.error('Missing env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SEVENTEENTRACK_API_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// 17TRACK "latest_status.status" → our shipment status. Anything not listed
// stays as-is (still in transit), so we never regress a status by accident.
const STATUS_MAP = {
  Delivered: 'delivered',
};

async function api(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', '17token': API_KEY },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || json.code !== 0) {
    console.warn(`17TRACK ${path} returned`, res.status, JSON.stringify(json).slice(0, 300));
  }
  return json;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function main() {
  // Only shipments that are actually on their way and have a number to track.
  const { data: shipments, error } = await supabase
    .from('shipments')
    .select('id, order_id, tracking_number, status')
    .not('tracking_number', 'is', null)
    .eq('status', 'shipped');

  if (error) {
    console.error('Failed to read shipments:', error.message);
    process.exit(1);
  }
  if (!shipments?.length) {
    console.log('No in-transit shipments to check.');
    return;
  }
  console.log(`Checking ${shipments.length} shipment(s)…`);

  const numbers = [...new Set(shipments.map((s) => s.tracking_number.trim()).filter(Boolean))];

  // Map tracking number → latest status text across all API batches.
  const statusByNumber = new Map();
  for (const batch of chunk(numbers, 40)) {
    const payload = batch.map((number) => ({ number }));
    // Register is idempotent for our purposes — already-registered numbers are
    // simply rejected and still returned by gettrackinfo below.
    await api('/register', payload);
    const info = await api('/gettrackinfo', payload);
    for (const item of info?.data?.accepted || []) {
      const status = item?.track_info?.latest_status?.status || null;
      if (item.number && status) statusByNumber.set(item.number, status);
    }
  }

  let updated = 0;
  for (const s of shipments) {
    const raw = statusByNumber.get(s.tracking_number.trim());
    const mapped = raw && STATUS_MAP[raw];
    if (!mapped || mapped === s.status) continue;

    const { error: upErr } = await supabase
      .from('shipments').update({ status: mapped }).eq('id', s.id);
    if (upErr) {
      console.warn(`Shipment ${s.id}: update failed — ${upErr.message}`);
      continue;
    }
    // Keep the order in sync when the parcel is delivered.
    if (mapped === 'delivered' && s.order_id) {
      await supabase.from('orders').update({ status: 'delivered' }).eq('id', s.order_id);
    }
    updated += 1;
    console.log(`Shipment ${s.id} (${s.tracking_number}): ${s.status} → ${mapped} [17TRACK: ${raw}]`);
  }

  console.log(`Done. Updated ${updated} shipment(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
