// Smoke test for pay_transaction RPC
// Usage: SUPABASE_URL=... SUPABASE_ANON_KEY=... node tests/pay_transaction_smoke.mjs <transaction_id> <method>
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const [,, txArg, method='mobile'] = process.argv;

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY; // prefer service for RPC if RLS restricted
if(!url || !key){
  console.error('Missing SUPABASE_URL or key (SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

(async()=>{
  try {
    // Fetch actor (first admin) for actor id; fallback to first user
    const { data: admins, error: adminsErr } = await supabase.from('users').select('id').eq('role','admin').limit(1);
    if(adminsErr) throw adminsErr;
    let actor = admins?.[0]?.id;
    if(!actor){
      const { data: anyUser } = await supabase.from('users').select('id').limit(1);
      actor = anyUser?.[0]?.id;
    }
    if(!actor){
      console.error('No user available to act as actor.');
      process.exit(3);
    }

    let targetTxId = txArg;
    if(!targetTxId){
      console.log('No transaction id provided: creating pending fixture...');
      // Create a minimal pending transaction record
      const ref = 'SMOKE-' + Date.now().toString(36);
      const insertPayload = { reference: ref, amount: 1000, status: 'pending', user_id: actor, description: 'Smoke test payment' };
      const { data: created, error: createErr } = await supabase.from('transactions').insert(insertPayload).select('*').single();
      if(createErr) throw createErr;
      targetTxId = created.id;
      console.log('Created transaction:', targetTxId, created.reference);
    }

    const { data, error } = await supabase.rpc('pay_transaction', { p_transaction_id: targetTxId, p_actor: actor, p_method: method });
    if(error) throw error;
    console.log('Payment successful:', data);
    process.exit(0);
  } catch (e) {
    console.error('Payment RPC failed:', e.message || e);
    process.exit(2);
  }
})();
