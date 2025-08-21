// Edge Function: price-predict (stub)
// Input: { parcel_id }
// Returns cached prediction or placeholder; to be replaced by real model logic.
// If using Deno, ensure you have the correct Deno environment and types installed.
// If using Node.js, switch to a compatible HTTP server, e.g. 'serve' from 'npm:std/http/server':
// import { serve } from 'npm:std/http/server';
// For Deno, you can also try updating the import to a newer version if available:
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { config } from 'https://deno.land/x/dotenv@v3.2.2/mod.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }
  try {
    const { parcel_id } = await req.json();
    if (!parcel_id) return new Response(JSON.stringify({ error: 'parcel_id requis' }), { status: 400 });

    // Try fetch existing prediction
    const existing = await fetch(`${SUPABASE_URL}/rest/v1/parcel_price_predictions?parcel_id=eq.${parcel_id}&select=*`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
    });
    const rows = await existing.json();
    if (Array.isArray(rows) && rows.length > 0) {
      return new Response(JSON.stringify({ source: 'cache', prediction: rows[0] }), { status: 200 });
    }

    // Placeholder logic: random baseline
    const base = 10000000 + Math.floor(Math.random()*5000000);
    const pred = {
      parcel_id,
      predicted_price: base,
      conf_low: Math.round(base*0.9),
      conf_high: Math.round(base*1.1),
      model_version: 'stub-v1'
    };

    // Insert prediction
    await fetch(`${SUPABASE_URL}/rest/v1/parcel_price_predictions`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
      body: JSON.stringify(pred)
    });

    return new Response(JSON.stringify({ source: 'generated', prediction: pred }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || 'Unexpected' }), { status: 500 });
  }
});
