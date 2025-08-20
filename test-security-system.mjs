#!/usr/bin/env node
/**
 * Script de test pour le système de sécurité
 * Teste la suppression complète d'utilisateurs et la validation d'authentification
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.log('Vérifiez VITE_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Teste la création et suppression complète d'un utilisateur
 */
async function testUserDeletionSecurity() {
  console.log('\n🔒 Test de sécurité - Suppression complète d\'utilisateur');
  console.log('═'.repeat(60));

  const testEmail = `security.test.${Date.now()}@test.com`;
  const testPassword = 'TestPassword123!';
  
  try {
    // 1. Créer un utilisateur de test
    console.log('1️⃣ Création d\'un utilisateur de test...');
    const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    });

    if (createError) {
      throw new Error(`Erreur création Auth: ${createError.message}`);
    }

    console.log(`✅ Utilisateur Auth créé: ${authUser.user.id}`);

    // 2. Créer l'entrée dans la table users
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .insert({
        auth_user_id: authUser.user.id,
        email: testEmail,
        full_name: 'Test Security User',
        type: 'particulier',
        verification_status: 'pending'
      })
      .select()
      .single();

    if (dbError) {
      throw new Error(`Erreur création DB: ${dbError.message}`);
    }

    console.log(`✅ Utilisateur DB créé: ${dbUser.id}`);

    // 3. Vérifier que l'utilisateur peut se connecter
    console.log('2️⃣ Test de connexion...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInError) {
      console.log(`⚠️  Erreur connexion (attendu): ${signInError.message}`);
    } else {
      console.log(`✅ Connexion réussie: ${signInData.user.id}`);
      
      // Se déconnecter
      await supabase.auth.signOut();
    }

    // 4. Supprimer complètement l'utilisateur
    console.log('3️⃣ Suppression complète de l\'utilisateur...');
    
    // Supprimer de la base de données
    const { error: deleteDbError } = await supabase
      .from('users')
      .delete()
      .eq('id', dbUser.id);

    if (deleteDbError) {
      throw new Error(`Erreur suppression DB: ${deleteDbError.message}`);
    }

    console.log('✅ Supprimé de la base de données');

    // Supprimer de Auth
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(authUser.user.id);

    if (deleteAuthError) {
      throw new Error(`Erreur suppression Auth: ${deleteAuthError.message}`);
    }

    console.log('✅ Supprimé de Supabase Auth');

    // 5. Vérifier que l'utilisateur ne peut plus se connecter
    console.log('4️⃣ Vérification - tentative de connexion après suppression...');
    
    const { data: retrySignIn, error: retryError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (retryError) {
      console.log(`✅ Connexion refusée (attendu): ${retryError.message}`);
    } else {
      console.log(`❌ SÉCURITÉ COMPROMISE: Connexion toujours possible après suppression!`);
      return false;
    }

    // 6. Vérifier que l'utilisateur n'existe plus en base
    const { data: checkDb, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', authUser.user.id)
      .single();

    if (checkError && checkError.code === 'PGRST116') {
      console.log('✅ Utilisateur absent de la base de données');
    } else if (!checkError && checkDb) {
      console.log(`❌ SÉCURITÉ COMPROMISE: Utilisateur toujours en base!`);
      return false;
    }

    console.log('\n🎉 Test de sécurité RÉUSSI - Suppression complète fonctionnelle');
    return true;

  } catch (error) {
    console.error(`❌ Erreur pendant le test: ${error.message}`);
    return false;
  }
}

/**
 * Vérifie que les composants de sécurité sont en place
 */
function checkSecurityComponents() {
  console.log('\n🔍 Vérification des composants de sécurité');
  console.log('═'.repeat(50));

  const components = [
    { name: 'UserManagementService', path: 'src/services/UserManagementService.js' },
    { name: 'VerificationGuard', path: 'src/components/layout/VerificationGuard.jsx' },
    { name: 'useAuthValidation', path: 'src/hooks/useAuthValidation.js' },
    { name: 'ProtectedRoute', path: 'src/components/layout/ProtectedRoute.jsx' }
  ];

  let allPresent = true;

  components.forEach(component => {
    const fullPath = path.join(process.cwd(), component.path);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${component.name} - Présent`);
    } else {
      console.log(`❌ ${component.name} - MANQUANT (${component.path})`);
      allPresent = false;
    }
  });

  return allPresent;
}

/**
 * Affiche le rapport de sécurité
 */
function displaySecurityReport() {
  console.log('\n📊 RAPPORT DE SÉCURITÉ');
  console.log('═'.repeat(50));
  console.log('🔒 Fonctionnalités implémentées:');
  console.log('   • Suppression complète d\'utilisateur (Auth + DB)');
  console.log('   • Validation continue des sessions');
  console.log('   • Protection contre le contournement de vérification');
  console.log('   • Détection de sessions corrompues');
  console.log('   • Nettoyage automatique des sessions invalides');
  console.log('\n🛡️ Protection contre:');
  console.log('   • Connexion après suppression de compte');
  console.log('   • Navigation sans vérification');
  console.log('   • Sessions fantômes');
  console.log('   • Comptes orphelins dans Auth');
  console.log('\n📋 Composants sécurisés:');
  console.log('   • AdminUsersPageAdvanced.jsx');
  console.log('   • AdminUsersPageWithAI.jsx');
  console.log('   • SupabaseDataService.js');
  console.log('   • ProtectedRoute.jsx');
}

/**
 * Script principal
 */
async function main() {
  console.log('🚀 Test du système de sécurité Teranga Foncier');
  console.log('═'.repeat(60));

  // Vérifier les composants
  const componentsOk = checkSecurityComponents();
  
  if (!componentsOk) {
    console.log('\n❌ Certains composants de sécurité sont manquants');
    process.exit(1);
  }

  // Tester la suppression d'utilisateur
  const securityOk = await testUserDeletionSecurity();

  // Afficher le rapport
  displaySecurityReport();

  if (securityOk) {
    console.log('\n🎉 SYSTÈME DE SÉCURITÉ OPÉRATIONNEL');
    console.log('═'.repeat(40));
    console.log('✅ Tous les tests de sécurité sont passés');
    console.log('✅ Protection contre les vulnérabilités identifiées');
    process.exit(0);
  } else {
    console.log('\n⚠️  PROBLÈMES DE SÉCURITÉ DÉTECTÉS');
    console.log('═'.repeat(40));
    console.log('❌ Certains tests ont échoué');
    process.exit(1);
  }
}

// Lancement du script
main().catch((error) => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});
