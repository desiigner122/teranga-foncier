import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnoseAuthProblem() {
  console.log('🔍 Diagnostic complet du problème d\'authentification...\n');
  
  const testEmail = 'admin@terangafoncier.com';
  const testPassword = 'admin123456';
  
  try {
    // 1. Test de connexion
    console.log('🔐 Test de connexion...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (loginError) {
      console.error(`❌ Erreur de connexion: ${loginError.message}`);
      console.log(`📄 Code d'erreur: ${loginError.status}`);
      
      if (loginError.message.includes('Email not confirmed')) {
        console.log('\n💡 Solution possible: Email non confirmé');
        console.log('🔧 Options de résolution:');
        console.log('   1. Aller dans Supabase Dashboard > Authentication > Users');
        console.log('   2. Trouver l\'utilisateur et confirmer manuellement');
        console.log('   3. Ou désactiver la confirmation d\'email en développement');
        
        // Tentative de récupération de l'utilisateur sans connexion
        console.log('\n📋 Vérification du profil utilisateur...');
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('email', testEmail)
          .single();
        
        if (profileError) {
          console.error(`❌ Erreur profil: ${profileError.message}`);
        } else {
          console.log('✅ Profil trouvé dans la base:');
          console.log(`   - Nom: ${profile.full_name}`);
          console.log(`   - Type: ${profile.type}`);
          console.log(`   - Rôle: ${profile.role}`);
          console.log(`   - Statut: ${profile.verification_status}`);
        }
      }
    } else {
      console.log('✅ Connexion réussie!');
      console.log(`👤 Utilisateur: ${loginData.user.email}`);
      console.log(`🆔 ID: ${loginData.user.id}`);
      console.log(`📧 Email confirmé: ${loginData.user.email_confirmed_at ? 'Oui' : 'Non'}`);
      
      // Test de récupération du profil
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', loginData.user.id)
        .single();
      
      if (profileError) {
        console.error(`❌ Erreur profil: ${profileError.message}`);
      } else {
        console.log('✅ Profil récupéré:');
        console.log(`   - Nom: ${profile.full_name}`);
        console.log(`   - Type: ${profile.type}`);
        console.log(`   - Rôle: ${profile.role}`);
      }
      
      await supabase.auth.signOut();
    }

    // 2. Vérification de la configuration Supabase
    console.log('\n⚙️ Test de configuration Supabase...');
    const { data: tables, error: tablesError } = await supabase
      .from('users')
      .select('count(*)', { count: 'exact' });
    
    if (tablesError) {
      console.error(`❌ Erreur accès table: ${tablesError.message}`);
    } else {
      console.log(`✅ Connexion DB fonctionnelle - ${tables.length} enregistrements accessibles`);
    }

    // 3. Suggestion de solution
    console.log('\n🎯 Résumé du diagnostic:');
    if (loginError && loginError.message.includes('Email not confirmed')) {
      console.log('❌ Problème: Emails non confirmés dans Supabase Auth');
      console.log('🔧 Solution recommandée:');
      console.log('   1. Aller sur https://supabase.com/dashboard/project/kjriscftfduyllerhnvr');
      console.log('   2. Authentication > Users');
      console.log('   3. Confirmer manuellement les emails des utilisateurs de test');
      console.log('   4. Ou configurer un serveur SMTP pour les emails');
      console.log('   5. Ou désactiver la confirmation email en mode développement');
    } else if (!loginError) {
      console.log('✅ Authentification fonctionnelle!');
      console.log('🎉 Le système est prêt à être testé');
    }

  } catch (error) {
    console.error('💥 Erreur générale:', error);
  }
}

diagnoseAuthProblem();
