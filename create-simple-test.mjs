import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createSimpleTestAccount() {
  console.log('🏗️ Création d\'un compte de test simple...\n');
  
  const email = 'test@terangafoncier.com';
  const password = 'test123456';
  
  try {
    // 1. Supprimer le compte existant s'il existe
    console.log('🗑️ Nettoyage des comptes existants...');
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('email', email);
    
    if (deleteError && deleteError.code !== 'PGRST116') {
      console.log(`⚠️ Avertissement suppression: ${deleteError.message}`);
    }

    // 2. Créer le nouveau compte
    console.log('📧 Création du compte auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: 'Utilisateur Test',
          type: 'Particulier'
        }
      }
    });

    if (authError) {
      console.error(`❌ Erreur création auth:`, authError);
      return;
    }

    console.log('✅ Compte auth créé avec succès!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Mot de passe: ${password}`);
    console.log(`🆔 ID: ${authData.user?.id}`);
    
    // 3. Créer/mettre à jour le profil
    if (authData.user) {
      console.log('👤 Création du profil...');
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: authData.user.id,
          email: email,
          full_name: 'Utilisateur Test',
          type: 'Particulier',
          role: 'user',
          verification_status: 'verified',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error(`❌ Erreur profil:`, profileError);
      } else {
        console.log('✅ Profil créé avec succès!');
      }
    }

    // 4. Test de connexion immédiat
    console.log('\n🔐 Test de connexion immédiat...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (loginError) {
      console.error(`❌ Erreur de connexion:`, loginError.message);
      if (loginError.message.includes('Email not confirmed')) {
        console.log('📧 Le compte nécessite une confirmation d\'email.');
        console.log('💡 Dans un environnement de développement, cela peut être ignoré en configurant Supabase.');
      }
    } else {
      console.log('✅ Connexion réussie!');
      console.log(`👤 Utilisateur connecté: ${loginData.user.email}`);
      
      // Déconnexion
      await supabase.auth.signOut();
      console.log('🚪 Déconnexion effectuée');
    }

    console.log('\n🎉 Compte de test créé!');
    console.log('\n📋 Informations de connexion:');
    console.log(`   Email: ${email}`);
    console.log(`   Mot de passe: ${password}`);
    console.log('\n🔗 Testez sur: http://localhost:5173/test');

  } catch (error) {
    console.error('💥 Erreur générale:', error);
  }
}

createSimpleTestAccount();
