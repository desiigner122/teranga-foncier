import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testExistingAccounts() {
  console.log('🧪 Test des comptes existants...\n');
  
  // Récupérer tous les utilisateurs
  const { data: users, error } = await supabase
    .from('users')
    .select('email, full_name, type, role, verification_status')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  console.log('👥 Utilisateurs trouvés:');
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.email}`);
    console.log(`   - Nom: ${user.full_name || 'Sans nom'}`);
    console.log(`   - Type: ${user.type || 'Non défini'}`);
    console.log(`   - Rôle: ${user.role || 'Non défini'}`);
    console.log(`   - Statut: ${user.verification_status || 'Non défini'}\n`);
  });

  // Test de connexion avec les comptes qui ont l'air les plus récents
  const accountsToTest = [
    { email: 'palaye1220@hotmail.fr', password: 'test123' },
    { email: 'palaye122@gmail.com', password: 'test123' },
    { email: 'palaye122@hotmail.fr', password: 'test123' }
  ];

  for (const account of accountsToTest) {
    console.log(`🔐 Test de connexion: ${account.email}`);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      });

      if (authError) {
        console.log(`❌ Échec: ${authError.message}\n`);
      } else {
        console.log(`✅ Succès! Session active pour: ${authData.user.email}`);
        console.log(`   ID: ${authData.user.id}`);
        console.log(`   Confirmé: ${authData.user.email_confirmed_at ? 'Oui' : 'Non'}\n`);
        
        // Déconnexion après test
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.log(`💥 Erreur: ${error.message}\n`);
    }
  }
}

testExistingAccounts();
