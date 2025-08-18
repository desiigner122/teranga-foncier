// Test de connexion Supabase et exploration des tables
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  console.log('🧪 Test de connexion à Supabase...');

  try {
    // Test 1: Vérifier la connexion avec une requête simple
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Erreur de connexion:', testError.message);
      
      // Si users n'existe pas, essayons d'autres tables
      console.log('\n🔍 Tentative d\'exploration des tables...');
      
      const tables = ['parcels', 'transactions', 'requests', 'blog_posts', 'notifications', 'documents'];
      
      for (const tableName of tables) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (!error) {
            console.log(`✅ Table '${tableName}' trouvée avec ${data?.length || 0} résultats`);
            if (data?.[0]) {
              console.log(`   Structure: ${Object.keys(data[0]).join(', ')}`);
            }
          } else {
            console.log(`❌ Table '${tableName}': ${error.message}`);
          }
        } catch (e) {
          console.log(`💥 Erreur sur table '${tableName}':`, e.message);
        }
      }
      return;
    }

    console.log('✅ Connexion Supabase réussie!');

    // Test 2: Explorer les tables disponibles
    console.log('\n📊 Exploration des données:');

    // Users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(3);
    
    console.log('👥 Users:', users?.length || 0, 'enregistrements');
    if (users?.[0]) {
      console.log('   Colonnes:', Object.keys(users[0]).join(', '));
    }

    // Parcels
    const { data: parcels, error: parcelsError } = await supabase
      .from('parcels')
      .select('*')
      .limit(3);
    
    console.log('🏞️ Parcels:', parcels?.length || 0, 'enregistrements');
    if (parcels?.[0]) {
      console.log('   Colonnes:', Object.keys(parcels[0]).join(', '));
    }

    // Transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .limit(3);
    
    console.log('💳 Transactions:', transactions?.length || 0, 'enregistrements');
    if (transactions?.[0]) {
      console.log('   Colonnes:', Object.keys(transactions[0]).join(', '));
    }

    // Requests
    const { data: requests, error: requestsError } = await supabase
      .from('requests')
      .select('*')
      .limit(3);
    
    console.log('📋 Requests:', requests?.length || 0, 'enregistrements');
    if (requests?.[0]) {
      console.log('   Colonnes:', Object.keys(requests[0]).join(', '));
    }

    // Blog posts
    const { data: blogPosts, error: blogError } = await supabase
      .from('blog_posts')
      .select('*')
      .limit(3);
    
    console.log('📝 Blog Posts:', blogPosts?.length || 0, 'enregistrements');
    if (blogPosts?.[0]) {
      console.log('   Colonnes:', Object.keys(blogPosts[0]).join(', '));
    }

  } catch (error) {
    console.error('💥 Erreur lors du test:', error);
  }
}

testSupabaseConnection();
