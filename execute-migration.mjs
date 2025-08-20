import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration Supabase depuis .env
const supabaseUrl = 'https://kjriscftfduyllerhnvr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqcmlzY2Z0ZmR1eWxsZXJobnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MjY3NjIsImV4cCI6MjA2OTIwMjc2Mn0.rtcjWgB8b1NNByH8ZFpfUDQ63OEFCvnMu6S0PNHELtk';

// Note: Pour les migrations, nous aurions besoin de la service_role key, mais essayons d'abord avec anon
const supabase = createClient(supabaseUrl, supabaseKey);

async function executeMigration() {
  try {
    console.log('🚀 Début de la migration Supabase...');
    
    // Lire le fichier SQL
    const sqlPath = join(__dirname, 'database', '01_MIGRATION_CRITIQUE_COMBINEE.sql');
    const sqlContent = readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Fichier SQL lu avec succès');
    console.log(`📊 Taille du script: ${sqlContent.length} caractères`);
    
    // Diviser le script en sections pour une exécution séquentielle
    const sections = sqlContent.split('-- =================================================================');
    
    console.log(`🔧 Script divisé en ${sections.length} sections`);
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();
      if (!section || section.startsWith('--') || section.length < 10) {
        continue;
      }
      
      console.log(`\n⚡ Exécution section ${i + 1}/${sections.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: section 
        });
        
        if (error) {
          console.error(`❌ Erreur section ${i + 1}:`, error.message);
          // Continuons avec les autres sections même en cas d'erreur
        } else {
          console.log(`✅ Section ${i + 1} exécutée avec succès`);
        }
      } catch (err) {
        console.error(`💥 Exception section ${i + 1}:`, err.message);
      }
    }
    
    console.log('\n🎉 Migration terminée !');
    
    // Vérification finale
    console.log('\n🔍 Vérification des tables créées...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', [
        'profiles', 'regions', 'departments', 'communes', 
        'parcels', 'parcel_submissions', 'notifications', 
        'transactions', 'fraud_alerts', 'conversations', 
        'conversation_participants', 'messages', 'roles'
      ]);
    
    if (tablesError) {
      console.error('❌ Erreur lors de la vérification:', tablesError.message);
    } else {
      console.log('✅ Tables trouvées:', tables?.map(t => t.table_name) || []);
    }
    
  } catch (error) {
    console.error('💥 Erreur fatale:', error.message);
    process.exit(1);
  }
}

// Alternative: Exécution directe du SQL complet
async function executeFullMigration() {
  try {
    console.log('🚀 Exécution directe de la migration complète...');
    
    const sqlPath = join(__dirname, 'database', '01_MIGRATION_CRITIQUE_COMBINEE.sql');
    const sqlContent = readFileSync(sqlPath, 'utf8');
    
    // Essayons d'exécuter directement via l'API REST de Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({ sql_query: sqlContent })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur HTTP:', response.status, errorText);
      return;
    }
    
    const result = await response.json();
    console.log('✅ Migration exécutée avec succès:', result);
    
  } catch (error) {
    console.error('💥 Erreur lors de l\'exécution:', error.message);
  }
}

// Tentative simple de connexion
async function testConnection() {
  try {
    console.log('🔍 Test de connexion Supabase...');
    
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(5);
    
    if (error) {
      console.error('❌ Erreur de connexion:', error.message);
      console.log('ℹ️  La clé anon ne permet peut-être pas l\'accès aux métadonnées');
    } else {
      console.log('✅ Connexion réussie, tables trouvées:', data);
    }
    
  } catch (error) {
    console.error('💥 Erreur de test:', error.message);
  }
}

// Exécution
console.log('🔧 Script de migration Teranga Foncier');
console.log('📡 URL Supabase:', supabaseUrl);
console.log('🔑 Utilisation de la clé anon (limitée)');

// Commençons par tester la connexion
await testConnection();

// Puis essayons la migration
await executeMigration();
