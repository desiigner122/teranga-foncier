import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kjriscftfduyllerhnvr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqcmlzY2Z0ZmR1eWxsZXJobnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MjY3NjIsImV4cCI6MjA2OTIwMjc2Mn0.rtcjWgB8b1NNByH8ZFpfUDQ63OEFCvnMu6S0PNHELtk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExistingTables() {
  console.log('🔍 Vérification des tables existantes...');
  
  // Liste des tables que nous voulons créer
  const expectedTables = [
    'profiles', 'regions', 'departments', 'communes', 
    'parcels', 'parcel_submissions', 'notifications', 
    'transactions', 'fraud_alerts', 'conversations', 
    'conversation_participants', 'messages', 'roles', 'institutions'
  ];
  
  for (const tableName of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table '${tableName}': ${error.message}`);
      } else {
        console.log(`✅ Table '${tableName}': existe (${data?.length || 0} enregistrements échantillon)`);
      }
    } catch (err) {
      console.log(`💥 Table '${tableName}': erreur - ${err.message}`);
    }
  }
}

// Test simple de création d'une table basique
async function testTableCreation() {
  console.log('\n🧪 Test de création d\'une table simple...');
  
  try {
    // Essayons de créer une table de test
    const { data, error } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS test_migration (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });
    
    if (error) {
      console.log('❌ Impossible de créer une table de test:', error.message);
    } else {
      console.log('✅ Table de test créée avec succès');
    }
  } catch (err) {
    console.log('💥 Erreur lors du test:', err.message);
  }
}

await checkExistingTables();
await testTableCreation();
