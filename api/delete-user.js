// Vercel Serverless Function: /api/delete-user.js
// Place your Supabase service_role key in the Vercel dashboard as env var SUPABASE_SERVICE_ROLE_KEY

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE;
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Supabase env vars missing' });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // 1. Delete from Auth
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  if (authError) {
    return res.status(500).json({ error: 'Failed to delete user from Auth', details: authError.message });
  }

  // 2. Anonymize/delete in users table
  await supabase
    .from('users')
    .update({
      status: 'deleted',
      deleted_at: new Date().toISOString(),
      is_active: false,
      email: `deleted_${Date.now()}@deleted.com`
    })
    .eq('id', userId);

  return res.status(200).json({ success: true });
}
