# Edge Cron Refresh MV

Objective: Refresh materialized views (mv_events_daily, mv_parcel_price_grid) and record refresh timestamp flag.

## Pseudo Edge Function (TypeScript / Deno)
```
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const client = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  const { error: e1 } = await client.rpc('refresh_mv_events');
  const { error: e2 } = await client.rpc('refresh_mv_price_grid');

  const now = new Date().toISOString();
  await client.from('feature_flags').upsert({ key: 'mv_last_refresh', description: 'Dernier refresh MV', enabled: true, audience: { ts: now } });

  return new Response(JSON.stringify({ ok: true, errors: [e1, e2].filter(Boolean) }), { headers: { 'Content-Type': 'application/json' } });
});
```

## SQL Helpers
```
CREATE OR REPLACE FUNCTION refresh_mv_events() RETURNS void AS $$ BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_events_daily; END; $$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION refresh_mv_price_grid() RETURNS void AS $$ BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_parcel_price_grid; END; $$ LANGUAGE plpgsql;
```

Schedule via Supabase dashboard (cron) every hour.
