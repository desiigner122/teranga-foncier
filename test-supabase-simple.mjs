// Test de connexion Supabase simple
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kjriscftfduyllerhnvr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqcmlzY2Z0ZmR1eWxsZXJobnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MjY3NjIsImV4cCI6MjA2OTIwMjc2Mn0.rtcjWgB8b1NNByH8ZFpfUDQ63OEFCvnMu6S0PNHELtk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔗 Test de connexion à Supabase...');
  
  try {
    // Test 1: Vérifier la connexion
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.log('❌ Erreur de connexion:', error.message);
      console.log('Code:', error.code);
      console.log('Details:', error.details);
      
      if (error.code === '42P01') {
        console.log('📋 La table profiles n\'existe pas encore');
        console.log('✅ Connexion Supabase OK - Il faut juste exécuter le script SQL');
      }
    } else {
      console.log('✅ Connexion Supabase OK');
      console.log('📊 Données:', data);
    }
    
    // Test 2: Vérifier l'utilisateur admin
    const { data: adminData, error: adminError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', '986ad46b-e990-4642-b12e-3ef5466197ff')
      .single();
    
    if (adminError) {
      console.log('⚠️ Profil admin introuvable:', adminError.message);
    } else {
      console.log('✅ Profil admin trouvé:', adminData);
    }
    
  } catch (err) {
    console.error('💥 Erreur générale:', err);
  }
}

testConnection();
