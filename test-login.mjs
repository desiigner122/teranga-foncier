import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin(email, password) {
  console.log(`🔐 Test de connexion pour: ${email}`);
  
  try {
    // Tentative de connexion
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('❌ Erreur d\'authentification:', authError.message);
      return;
    }

    console.log('✅ Connexion réussie!');
    console.log('👤 Utilisateur:', authData.user.email);
    console.log('🎫 Session:', authData.session ? 'Active' : 'Inactive');

    // Récupération du profil utilisateur
    if (authData.user) {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('email', authData.user.email)
        .single();

      if (profileError) {
        console.error('⚠️ Erreur profil:', profileError.message);
      } else {
        console.log('📋 Profil:');
        console.log(`   - Nom: ${profile.full_name}`);
        console.log(`   - Type: ${profile.type}`);
        console.log(`   - Rôle: ${profile.role}`);
        console.log(`   - Statut: ${profile.verification_status}`);
      }
    }

    // Déconnexion après le test
    await supabase.auth.signOut();
    console.log('🚪 Déconnexion effectuée\n');

  } catch (error) {
    console.error('💥 Erreur générale:', error);
  }
}

async function runTests() {
  console.log('🧪 Test de connexion pour tous les comptes\n');
  
  const testAccounts = [
    { email: 'admin@terangafoncier.com', password: 'admin123' },
    { email: 'particulier@terangafoncier.com', password: 'particulier123' },
    { email: 'banque@terangafoncier.com', password: 'banque123' },
    { email: 'notaire@terangafoncier.com', password: 'notaire123' },
    { email: 'mairie@terangafoncier.com', password: 'mairie123' }
  ];

  for (const account of testAccounts) {
    await testLogin(account.email, account.password);
    // Pause entre les tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('🎉 Tests terminés!');
}

runTests();
