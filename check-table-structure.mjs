import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kjriscftfduyllerhnvr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqcmlzY2Z0ZmR1eWxsZXJobnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MjY3NjIsImV4cCI6MjA2OTIwMjc2Mn0.rtcjWgB8b1NNByH8ZFpfUDQ63OEFCvnMu6S0PNHELtk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructures() {
  console.log('🔍 Vérification des structures de tables...');
  
  const tablesToCheck = ['parcels', 'parcel_submissions', 'transactions', 'notifications', 'fraud_alerts', 'messages'];
  
  for (const tableName of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table '${tableName}': ${error.message}`);
      } else {
        console.log(`✅ Table '${tableName}': existe`);
        if (data && data.length > 0) {
          console.log(`   Colonnes détectées:`, Object.keys(data[0]).join(', '));
        } else {
          console.log(`   Table vide - impossible de voir les colonnes via SELECT`);
        }
      }
    } catch (err) {
      console.log(`💥 Table '${tableName}': erreur - ${err.message}`);
    }
  }
}

await checkTableStructures();
