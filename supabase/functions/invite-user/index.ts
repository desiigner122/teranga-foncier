// @ts-ignore
// Edge Function: invite-user
// Purpose: Send invitation email & create auth.user (if using admin API) or send magic link
// Deployment: supabase functions deploy invite-user --no-verify-jwt (if you secure with service key header instead)
// Security: Protect with a custom header containing the SERVICE_ROLE key hash or a secret.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

interface InvitePayload {
  email: string;
  role?: string; // application-level role
  metadata?: Record<string, unknown>;
}

const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  // Basic auth via header x-service-key (hash or full key) - adjust as needed
  const provided = req.headers.get('x-service-key');
  if (!provided || provided !== SERVICE_KEY) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body: InvitePayload = await req.json();
    if (!body.email) {
      return new Response(JSON.stringify({ error: 'email requis' }), { status: 400 });
    }

    // Call Supabase admin API to generate invite
    const resp = await fetch(`${SUPABASE_URL}/auth/v1/admin/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY
      },
      body: JSON.stringify({ email: body.email, data: { app_role: body.role || 'user', ...body.metadata } })
    });

    const data = await resp.json();
    if (!resp.ok) {
      return new Response(JSON.stringify({ error: 'Invite failed', details: data }), { status: resp.status });
    }

    return new Response(JSON.stringify({ success: true, user: data }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || 'Unexpected error' }), { status: 500 });
  }
});
