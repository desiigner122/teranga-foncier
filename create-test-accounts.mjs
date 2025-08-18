// Script pour créer des comptes de test
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://kjriscftfduyllerhnvr.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqcmlzY2Z0ZmR1eWxsZXJobnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MjY3NjIsImV4cCI6MjA2OTIwMjc2Mn0.rtcjWgB8b1NNByH8ZFpfUDQ63OEFCvnMu6S0PNHELtk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const testAccounts = [
  {
    email: 'admin@terangafoncier.com',
    password: 'admin123',
    profile: {
      full_name: 'Administrateur Principal',
      type: 'Administrateur', 
      role: 'admin',
      verification_status: 'verified'
    }
  },
  {
    email: 'particulier@terangafoncier.com',
    password: 'particulier123',
    profile: {
      full_name: 'Fatou Ndiaye',
      type: 'Particulier',
      role: 'user',
      verification_status: 'verified'
    }
  },
  {
    email: 'banque@terangafoncier.com', 
    password: 'banque123',
    profile: {
      full_name: 'Banque Atlantique',
      type: 'Banque',
      role: 'user',
      verification_status: 'verified'
    }
  },
  {
    email: 'notaire@terangafoncier.com',
    password: 'notaire123', 
    profile: {
      full_name: 'Maître Diallo',
      type: 'Notaire',
      role: 'user',
      verification_status: 'verified'
    }
  },
  {
    email: 'mairie@terangafoncier.com',
    password: 'mairie123',
    profile: {
      full_name: 'Mairie de Dakar',
      type: 'Mairie',
      role: 'user', 
      verification_status: 'verified'
    }
  }
];

async function createTestAccounts() {
  console.log('🏗️ Création des comptes de test...');
  
  for (const account of testAccounts) {
    try {
      console.log(`\n📧 Création du compte: ${account.email}`);
      
      // Créer le compte d'authentification
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
        options: {
          data: account.profile
        }
      });
      
      if (authError) {
        if (authError.message.includes('already been registered')) {
          console.log(`⚠️ Compte déjà existant: ${account.email}`);
          continue;
        } else {
          console.error(`❌ Erreur création auth:`, authError);
          continue;
        }
      }
      
      console.log(`✅ Compte auth créé pour: ${account.email}`);
      
      // Ajouter/mettre à jour le profil dans la table users
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: authData.user.id,
            email: account.email,
            ...account.profile,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (profileError) {
          console.error(`❌ Erreur profil:`, profileError);
        } else {
          console.log(`✅ Profil créé pour: ${account.email}`);
        }
      }
      
    } catch (error) {
      console.error(`💥 Erreur générale pour ${account.email}:`, error);
    }
  }
  
  console.log('\n🎉 Création des comptes terminée!');
  console.log('\n📋 Comptes de test disponibles:');
  testAccounts.forEach(account => {
    console.log(`   ${account.profile.type}: ${account.email} / ${account.password}`);
  });
}

createTestAccounts();
