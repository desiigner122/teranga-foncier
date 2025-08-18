import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAfterEmailConfirmationDisabled() {
  console.log('🧪 Test après désactivation de la confirmation d\'email...\n');
  
  const testAccounts = [
    { email: 'admin@terangafoncier.com', password: 'admin123456', type: 'Admin' },
    { email: 'test@terangafoncier.com', password: 'test123456', type: 'Test' }
  ];

  for (const account of testAccounts) {
    console.log(`🔐 Test de connexion: ${account.email} (${account.type})`);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      });

      if (authError) {
        console.log(`❌ Échec: ${authError.message}`);
        
        // Si le mot de passe est incorrect, essayons de recréer le compte
        if (authError.message.includes('Invalid login credentials')) {
          console.log(`🔄 Tentative de recréation du compte...`);
          
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: account.email,
            password: account.password
          });
          
          if (signUpError) {
            console.log(`❌ Erreur recréation: ${signUpError.message}`);
          } else {
            console.log(`✅ Compte recréé pour: ${account.email}`);
            
            // Test de connexion immédiat
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
              email: account.email,
              password: account.password
            });
            
            if (loginError) {
              console.log(`❌ Connexion après création: ${loginError.message}`);
            } else {
              console.log(`✅ Connexion réussie après recréation!`);
              await supabase.auth.signOut();
            }
          }
        }
      } else {
        console.log(`✅ Connexion réussie pour: ${account.email}`);
        console.log(`   Email confirmé: ${authData.user.email_confirmed_at ? 'Oui' : 'Non'}`);
        console.log(`   ID: ${authData.user.id}`);
        
        // Déconnexion
        await supabase.auth.signOut();
      }
      
      console.log(''); // Ligne vide pour la lisibilité
      
    } catch (error) {
      console.error(`💥 Erreur inattendue pour ${account.email}:`, error.message);
    }
  }
  
  console.log('🎉 Tests terminés!');
  console.log('\n🔗 Si les connexions fonctionnent, testez sur:');
  console.log('   - Page de test: http://localhost:5173/test');
  console.log('   - Page de connexion: http://localhost:5173/login');
}

testAfterEmailConfirmationDisabled();
