import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixTestAccounts() {
  console.log('🔧 Correction des comptes de test...\n');

  const testAccounts = [
    { email: 'admin@terangafoncier.com', name: 'Administrateur Principal', type: 'Administrateur', role: 'admin' },
    { email: 'particulier@terangafoncier.com', name: 'Fatou Ndiaye', type: 'Particulier', role: 'user' },
    { email: 'banque@terangafoncier.com', name: 'Banque Atlantique', type: 'Banque', role: 'user' },
    { email: 'notaire@terangafoncier.com', name: 'Maître Diallo', type: 'Notaire', role: 'user' },
    { email: 'mairie@terangafoncier.com', name: 'Mairie de Dakar', type: 'Mairie', role: 'user' }
  ];

  for (const account of testAccounts) {
    try {
      console.log(`📧 Traitement: ${account.email}`);

      // Récupérer l'utilisateur existant dans la table users
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', account.email)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.error(`❌ Erreur récupération user:`, userError.message);
        continue;
      }

      if (existingUser) {
        // Mettre à jour le profil dans la table users
        const { error: updateError } = await supabase
          .from('users')
          .update({
            full_name: account.name,
            type: account.type,
            role: account.role,
            verification_status: 'verified',
            updated_at: new Date().toISOString()
          })
          .eq('email', account.email);

        if (updateError) {
          console.error(`❌ Erreur mise à jour:`, updateError.message);
        } else {
          console.log(`✅ Profil mis à jour: ${account.email}`);
        }
      } else {
        console.log(`⚠️ Utilisateur non trouvé dans la table users: ${account.email}`);
      }

    } catch (error) {
      console.error(`💥 Erreur générale pour ${account.email}:`, error);
    }
  }

  console.log('\n🎉 Correction terminée!');
  console.log('\n📋 Pour tester la connexion, utilisez:');
  console.log('- Email: admin@terangafoncier.com');
  console.log('- Mot de passe: admin123');
  console.log('\nOu allez sur http://localhost:5173/test pour tester avec l\'interface.');
}

fixTestAccounts();
