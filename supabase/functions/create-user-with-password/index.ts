// @ts-ignore
// Fonction Edge Supabase pour créer un utilisateur avec mot de passe
// À déployer dans Supabase Edge Functions

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Initialiser le client Supabase avec clé service
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

Deno.serve(async (req) => {
  // Vérifier la méthode HTTP
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Méthode non autorisée' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Parser les données de la requête
    const userData = await req.json();
    
    // Valider les données requises
    if (!userData.email || !userData.password || !userData.full_name) {
      return new Response(JSON.stringify({ error: 'Données incomplètes' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 1. Créer l'utilisateur dans auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: userData.verification_status === 'verified',
      user_metadata: {
        full_name: userData.full_name,
        type: userData.type,
        role: userData.role
      }
    });

    if (authError) {
      console.error('Erreur création auth:', authError);
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Créer le profil dans la table users
    if (authUser?.user) {
      const userProfile = {
        id: authUser.user.id,
        email: userData.email,
        full_name: userData.full_name,
        type: userData.type,
        role: userData.role,
        verification_status: userData.verification_status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: userData.metadata || {}
      };

      const { data: profile, error: profileError } = await supabaseAdmin
        .from('users')
        .insert([userProfile])
        .select()
        .single();

      if (profileError) {
        console.error('Erreur création profil:', profileError);
        return new Response(JSON.stringify({ error: profileError.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 3. Logger l'événement (facultatif)
      try {
        await supabaseAdmin.from('events').insert([{
          entity_type: 'user',
          entity_id: profile.id,
          event_type: 'user.created_via_edge',
          importance: 1,
          source: 'edge_function',
          data: { type: userData.type }
        }]);
      } catch (logError) {
        console.warn('Erreur log:', logError);
        // Ne pas bloquer si le logging échoue
      }

      return new Response(JSON.stringify(profile), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Erreur inconnue' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error('Erreur edge function:', e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
