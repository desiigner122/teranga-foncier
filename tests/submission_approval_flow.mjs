// E2E-ish flow: submission -> approve (SQL function) -> parcel
import 'dotenv/config';
import assert from 'assert/strict';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) { console.error('Missing SUPABASE env'); process.exit(1); }
const admin = createClient(url, serviceKey, { auth:{ autoRefreshToken:false, persistSession:false }});

async function run(){
  const owner = crypto.randomUUID();
  const reviewer = crypto.randomUUID();
  await admin.from('users').upsert([
    { id: owner, email:`owner_${Date.now()}@flow.test`, full_name:'Owner Flow', type:'vendeur', role:'user' },
    { id: reviewer, email:`reviewer_${Date.now()}@flow.test`, full_name:'Reviewer Flow', type:'mairie', role:'admin' }
  ]);

  const ref = 'FLOWREF'+Date.now();
  const { data: sub, error } = await admin.from('parcel_submissions').insert({ owner_id: owner, reference: ref, type:'terrain', surface:150, price:5000000, location:'Z Test', documents:[] }).select().single();
  assert.ok(sub && !error, 'Inserted submission');
  assert.equal(sub.status, 'pending');

  const { data: parcelId, error: approveErr } = await admin.rpc('approve_parcel_submission', { p_submission: sub.id, p_reviewer: reviewer });
  assert.ok(parcelId && !approveErr, 'Approve RPC');

  const { data: refreshed } = await admin.from('parcel_submissions').select('*').eq('id', sub.id).single();
  assert.equal(refreshed.status, 'approved');
  assert.ok(refreshed.parcel_id, 'parcel_id linked');

  const { data: parcel } = await admin.from('parcels').select('*').eq('id', refreshed.parcel_id).single();
  assert.equal(parcel.reference, ref, 'Parcel created with same reference');
  console.log('Flow OK:', { submission: refreshed.id, parcel: parcel.id });
}

run().then(()=>{ console.log('submission_approval_flow complete'); }).catch(e=>{ console.error(e); process.exit(1); });
