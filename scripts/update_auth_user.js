#!/usr/bin/env node
/**
 * Simple script to update an auth user via Supabase admin endpoint.
 * Usage:
 *   SERVICE_ROLE_KEY=your_service_role_key VITE_SUPABASE_URL=https://<proj>.supabase.co \
 *     node scripts/update_auth_user.js <USER_ID> "Full Name" "+911234567890"
 *
 * This will call the Admin API to set `phone` and `raw_user_meta_data` (full_name).
 * Keep the service role key secret and run this only on a trusted machine.
 */

const fetch = require('node-fetch');

async function main() {
  const [,, userId, fullName, phone] = process.argv;
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!userId || !fullName) {
    console.error('Usage: SERVICE_ROLE_KEY=... VITE_SUPABASE_URL=... node scripts/update_auth_user.js <USER_ID> "Full Name" "+911234..."');
    process.exit(1);
  }
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Missing VITE_SUPABASE_URL or SERVICE_ROLE_KEY env var');
    process.exit(1);
  }

  const url = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users/${userId}`;
  const body = {
    phone: phone || null,
    raw_user_meta_data: { full_name: fullName }
  };

  console.log('Calling admin update for user', userId);

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  console.log('Status:', res.status);
  try {
    console.log('Response:', JSON.parse(text));
  } catch (e) {
    console.log('Response text:', text);
  }
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
