// Smoke test: parcel submission workflow (requires parcel_submissions table & bucket parcel-docs)
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY; // ensure available when running node directly
if (!url || !serviceRole) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(url, serviceRole, { auth: { autoRefreshToken: false, persistSession: false } });

async function run() {
  try {
    // 1. Pick first existing user as owner
    const { data: user, error: uErr } = await supabase.from('users').select('id').limit(1).single();
    if (uErr || !user) throw new Error('No user found for test');

    const reference = 'TEST-' + Date.now();

    // 2. Insert submission directly (simulate service)
    const { data: submission, error: sErr } = await supabase.from('parcel_submissions').insert([
      { owner_id: user.id, reference, location: 'Test City', type: 'terrain', surface: 100, price: 123456, documents: [{key:'titre_foncier',name:'tf.pdf'}] }
    ]).select().single();
    if (sErr) throw sErr;
    console.log('Created submission', submission.id);

    // 3. Approve (simulate Stored logic – create parcel then update submission)
    const { data: parcel, error: pErr } = await supabase.from('parcels').insert([
      { reference: submission.reference, location_name: submission.location, type: submission.type, area_sqm: submission.surface, price: submission.price, status: 'available', owner_id: user.id, owner_type: 'Vendeur', verification_status: 'verified' }
    ]).select().single();
    if (pErr) throw pErr;

    const { error: updErr } = await supabase.from('parcel_submissions').update({ status:'approved', parcel_id: parcel.id, approved_at: new Date().toISOString() }).eq('id', submission.id);
    if (updErr) throw updErr;

    // 4. Verify linkage
    const { data: check } = await supabase.from('parcel_submissions').select('id,status,parcel_id').eq('id', submission.id).single();
    if (check.status !== 'approved' || !check.parcel_id) throw new Error('Approval linkage failed');

    console.log('OK submission approved & linked to parcel', check.parcel_id);
    process.exit(0);
  } catch (e) {
    console.error('Smoke test failed:', e.message || e);
    process.exit(1);
  }
}

run();
