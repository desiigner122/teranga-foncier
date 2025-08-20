// Extension du service SupabaseDataService avec la méthode createUserWithPassword
// Ce fichier sera importé et fusionné avec le import { supabase } from '../lib/supabaseClient.js';

// Extension pour le service SupabaseDataService
export async function createUserWithPassword(userData) {
  try {
    // Option 1: Utiliser directement l'API Supabase Auth (nécessite des permissions)
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Si auto-vérification
      user_metadata: {
        full_name: userData.full_name,
        type: userData.type,
        role: userData.role
      }
    });

    if (authError) {
      // Essayer l'option 2 si option 1 échoue pour des raisons de permissions
      console.warn("Création directe d'utilisateur auth échouée, essai via RPC:", authError);
      throw authError;
    }

    // Si création auth réussie, créer l'entrée dans la table users
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

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert([userProfile])
        .select()
        .single();

      if (profileError) throw profileError;
      return profile;
    }
  } catch (error) {
    // Option 2: Utiliser une fonction RPC côté serveur pour créer l'utilisateur
    try {
      const { data, error } = await supabase.rpc('create_user_with_password', {
        p_email: userData.email,
        p_password: userData.password,
        p_full_name: userData.full_name,
        p_type: userData.type,
        p_role: userData.role,
        p_verification_status: userData.verification_status,
        p_metadata: userData.metadata || {}
      });

      if (error) throw error;
      return data;
    } catch (rpcError) {
      console.error("Erreur lors de la création de l'utilisateur avec mot de passe:", rpcError);
      
      // Option 3: Utiliser un Edge Function comme fallback
      try {
        const endpoint = `${import.meta.env.VITE_EDGE_BASE_URL || ''}/create-user-with-password`;
        if (!endpoint) throw new Error('EDGE endpoint non configuré');
        
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Échec création utilisateur: ${errText}`);
        }
        
        return await res.json();
      } catch (edgeError) {
        console.error("Toutes les méthodes de création d'utilisateur ont échoué:", edgeError);
        throw new Error("Impossible de créer l'utilisateur. Contactez l'administrateur système.");
      }
    }
  }
}

// Étendre le service SupabaseDataService
export function extendSupabaseDataService(SupabaseDataService) {
  SupabaseDataService.createUserWithPassword = createUserWithPassword;
  return SupabaseDataService;
}
