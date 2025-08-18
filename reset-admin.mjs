import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function resetAdminPassword() {
  console.log('🔐 Réinitialisation du mot de passe admin...\n');
  
  const adminEmail = 'admin@terangafoncier.com';
  const newPassword = 'admin123456'; // Plus sécurisé
  
  try {
    console.log('🗑️ Suppression de l\'ancien compte admin...');
    
    // Supprimer l'ancien profil
    const { error: deleteProfileError } = await supabase
      .from('users')
      .delete()
      .eq('email', adminEmail);
    
    console.log('📧 Création du nouveau compte admin...');
    
    // Créer le nouveau compte admin
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminEmail,
      password: newPassword,
      options: {
        data: {
          full_name: 'Administrateur Principal',
          type: 'Administrateur',
          role: 'admin'
        }
      }
    });

    if (authError) {
      console.error(`❌ Erreur création admin:`, authError);
      return;
    }

    console.log('✅ Compte admin créé!');
    console.log(`🆔 ID: ${authData.user?.id}`);
    
    // Créer le profil admin
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: authData.user.id,
          email: adminEmail,
          full_name: 'Administrateur Principal',
          type: 'Administrateur',
          role: 'admin',
          verification_status: 'verified',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error(`❌ Erreur profil admin:`, profileError);
      } else {
        console.log('✅ Profil admin créé!');
      }
    }

    console.log('\n🎉 Nouveau compte admin créé!');
    console.log('\n📋 Informations de connexion:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Mot de passe: ${newPassword}`);
    console.log('\n💡 Note: Ce compte peut avoir besoin de confirmation d\'email.');
    console.log('🔗 Testez sur: http://localhost:5173/login');

  } catch (error) {
    console.error('💥 Erreur générale:', error);
  }
}

resetAdminPassword();
