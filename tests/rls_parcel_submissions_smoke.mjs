// Basic RLS smoke tests for parcel_submissions
import 'dotenv/config';
import assert from 'assert/strict';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // needs service role for setup
if (!url || !serviceKey) {
  console.error('Missing SUPABASE env vars');
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { autoRefreshToken:false, persistSession:false } });

async function main(){
  // Create two users (if not exist) minimal stub in users table (assuming auth already created elsewhere)
  const uidOwner = crypto.randomUUID();
  const uidOther = crypto.randomUUID();
  await admin.from('users').upsert([
    { id: uidOwner, email:`owner_${Date.now()}@test.local`, full_name:'Owner Test', type:'vendeur', role:'user' },
    { id: uidOther, email:`other_${Date.now()}@test.local`, full_name:'Other Test', type:'vendeur', role:'user' }
  ]);

  // Insert submission as owner (bypass RLS via service role)
  const { data: sub, error } = await admin.from('parcel_submissions').insert({ owner_id: uidOwner, reference:'REFRLS'+Date.now(), type:'terrain', surface:100, price:1000, location:'Test', documents:[] }).select().single();
  assert.ok(sub && !error, 'Submission insert');

  // Try to read as other user (anon key limited) - create client with anon KEY
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!anonKey) throw new Error('Missing anon key');
  const otherClient = createClient(url, anonKey, { global:{ headers:{ Authorization:`Bearer fake-${uidOther}` }}});
  // NOTE: Without a real JWT impersonation not possible here; this is a placeholder scaffold.
  console.log('RLS test scaffold created (needs real JWT simulation).');
}

main().then(()=>{ console.log('RLS smoke scaffold complete'); }).catch(e=>{ console.error(e); process.exit(1); });
