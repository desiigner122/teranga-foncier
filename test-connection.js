// Test de connexion Supabase
import { supabase } from './src/lib/supabaseClient.js';

async function testSupabaseConnection() {
  console.log("🔍 Test de connexion Supabase...");
  
  try {
    // Test de base de données
    console.log("📊 Test de la base de données...");
    const { data, error } = await supabase
      .from('users')
      .select('id, email, type')
      .limit(5);
    
    if (error) {
      console.error("❌ Erreur base de données:", error);
      return;
    }
    
    console.log("✅ Connexion base de données réussie!");
    console.log("👥 Utilisateurs trouvés:", data?.length || 0);
    
    // Test d'authentification
    console.log("🔐 Test d'authentification...");
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error("❌ Erreur authentification:", authError);
      return;
    }
    
    console.log("✅ Service d'authentification opérationnel!");
    console.log("🔒 Session actuelle:", authData.session ? "Connecté" : "Déconnecté");
    
    // Test des tables principales
    console.log("📋 Test des tables principales...");
    const tables = ['users', 'parcels', 'requests', 'blog_posts'];
    
    for (const table of tables) {
      try {
        const { count, error: countError } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          console.error(`❌ Erreur table ${table}:`, countError);
        } else {
          console.log(`✅ Table ${table}: ${count || 0} enregistrements`);
        }
      } catch (err) {
        console.error(`❌ Erreur table ${table}:`, err);
      }
    }
    
    console.log("🎉 Tests terminés!");
    
  } catch (error) {
    console.error("💥 Erreur générale:", error);
  }
}

testSupabaseConnection();
