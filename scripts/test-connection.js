import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Configuration silencieuse de dotenv
dotenv.config({ debug: false });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function testConnection() {
  try {
    console.log('🔗 Test de connexion à Supabase...');
    
    // Test simple: compter les utilisateurs
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Erreur:', error.message);
      return;
    }
    
    console.log(`✅ Connexion réussie !`);
    console.log(`📊 Nombre d'utilisateurs: ${count}`);
    
    // Test: lister quelques utilisateurs
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, type, full_name')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Erreur utilisateurs:', usersError.message);
      return;
    }
    
    console.log('\n👥 Échantillon d\'utilisateurs:');
    console.table(users);
    
  } catch (err) {
    console.error('❌ Erreur de connexion:', err.message);
  }
}

testConnection();
