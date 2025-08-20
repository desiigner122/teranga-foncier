// Basic smoke tests for new service methods (run with: node tests/service_smoke.test.mjs)
import { createClient } from '@supabase/supabase-js';
import { SupabaseDataService } from '../src/services/supabaseDataService.js';

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
if(!url||!key) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}
global.supabase = createClient(url, key);

async function main(){
  const dummyId = '00000000-0000-0000-0000-000000000000';
  try {
    console.log('Testing banking update methods (expect graceful failures if IDs not found)...');
    try { await SupabaseDataService.updateFinancingRequestStatus(dummyId,'approved'); } catch { console.log('Financing OK (expected)'); }
    try { await SupabaseDataService.updateBankGuaranteeStatus(dummyId,'active'); } catch { console.log('Guarantee OK (expected)'); }
    try { await SupabaseDataService.completeLandEvaluation(dummyId,null); } catch { console.log('Evaluation OK (expected)'); }
    console.log('Testing favorites helper isParcelFavorite false path');
    const fav = await SupabaseDataService.isParcelFavorite(dummyId,dummyId);
    console.log('isParcelFavorite result:', fav);
    console.log('Smoke tests finished.');
  } catch (e) {
    console.error('Smoke tests failed', e);
    process.exit(1);
  }
}
main();
