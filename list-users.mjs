import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listUsers() {
  console.log('👥 Liste des utilisateurs existants:\n');
  
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }

    if (users && users.length > 0) {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.full_name || 'Sans nom'}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   👤 Type: ${user.type || 'Non défini'}`);
        console.log(`   🔑 Rôle: ${user.role || 'Non défini'}`);
        console.log(`   ✅ Statut: ${user.verification_status || 'Non défini'}`);
        console.log(`   📅 Créé: ${user.created_at}\n`);
      });
      
      console.log(`📊 Total: ${users.length} utilisateur(s)`);
    } else {
      console.log('🔍 Aucun utilisateur trouvé');
    }
    
  } catch (error) {
    console.error('💥 Erreur générale:', error);
  }
}

listUsers();
