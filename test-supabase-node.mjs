// Test de connexion Supabase avec Node.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://kjriscftfduyllerhnvr.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqcmlzY2Z0ZmR1eWxsZXJobnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MjY3NjIsImV4cCI6MjA2OTIwMjc2Mn0.rtcjWgB8b1NNByH8ZFpfUDQ63OEFCvnMu6S0PNHELtk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  console.log("🔍 Test de connexion Supabase...");
  console.log("🌐 URL:", supabaseUrl);
  console.log("🔑 Key:", supabaseAnonKey.substring(0, 20) + "...");
  
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
    if (data && data.length > 0) {
      console.log("📄 Premier utilisateur:", {
        id: data[0].id,
        email: data[0].email,
        type: data[0].type
      });
    }
    
    // Test d'authentification
    console.log("🔐 Test d'authentification...");
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error("❌ Erreur authentification:", authError);
    } else {
      console.log("✅ Service d'authentification opérationnel!");
      console.log("🔒 Session actuelle:", authData.session ? "Connecté" : "Déconnecté");
    }
    
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
