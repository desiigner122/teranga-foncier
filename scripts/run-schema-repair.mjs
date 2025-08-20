// run-schema-repair.mjs
// Script Node.js pour exécuter les réparations de schéma dans Supabase

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Récupérer le répertoire actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement depuis les arguments ou utiliser les valeurs par défaut
const SUPABASE_URL = process.env.SUPABASE_URL || process.argv[2];
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.argv[3];

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('\x1b[31m%s\x1b[0m', 'Erreur: URL Supabase et clé de service requises.');
  console.log('\x1b[33m%s\x1b[0m', 'Usage: node run-schema-repair.mjs <SUPABASE_URL> <SUPABASE_SERVICE_KEY>');
  console.log('Ou définissez les variables d\'environnement SUPABASE_URL et SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// Initialiser le client Supabase avec la clé de service
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Chemin vers le script SQL de réparation
const repairScriptPath = path.join(__dirname, '..', 'database', 'REPAIR_MESSAGES_TABLE.sql');
const verifyScriptPath = path.join(__dirname, '..', 'database', 'VERIFY_AND_FIX_SCHEMA.sql');

async function runRepairScript() {
  try {
    console.log('\x1b[36m%s\x1b[0m', '🔧 Début de la réparation du schéma de la base de données...');
    
    // Lire le contenu des scripts SQL
    const repairScript = fs.readFileSync(repairScriptPath, 'utf8');
    
    // Exécuter la réparation rapide de la table messages
    console.log('\x1b[36m%s\x1b[0m', '⚙️ Exécution du script de réparation de la table messages...');
    const { error: repairError } = await supabase.rpc('exec_sql', { sql: repairScript });
    
    if (repairError) {
      console.error('\x1b[31m%s\x1b[0m', '❌ Erreur lors de la réparation rapide:', repairError.message);
    } else {
      console.log('\x1b[32m%s\x1b[0m', '✅ Script de réparation rapide exécuté avec succès.');
    }
    
    // Exécuter le script de vérification et réparation complète
    console.log('\x1b[36m%s\x1b[0m', '⚙️ Exécution du script de vérification complète du schéma...');
    const verifyScript = fs.readFileSync(verifyScriptPath, 'utf8');
    const { error: verifyError } = await supabase.rpc('exec_sql', { sql: verifyScript });
    
    if (verifyError) {
      console.error('\x1b[31m%s\x1b[0m', '❌ Erreur lors de la vérification complète:', verifyError.message);
    } else {
      console.log('\x1b[32m%s\x1b[0m', '✅ Script de vérification et réparation complète exécuté avec succès.');
    }

    // Vérifier que la table messages existe maintenant
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .eq('tablename', 'messages');
    
    if (tablesError) {
      console.error('\x1b[31m%s\x1b[0m', '❌ Erreur lors de la vérification des tables:', tablesError.message);
    } else if (!tables || tables.length === 0) {
      console.error('\x1b[31m%s\x1b[0m', '⚠️ La table messages n\'existe toujours pas après réparation!');
    } else {
      console.log('\x1b[32m%s\x1b[0m', '✅ Table messages vérifiée avec succès.');
    }

    console.log('\x1b[36m%s\x1b[0m', '🎉 Processus de réparation terminé.');
    
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Erreur inattendue:', error.message);
    process.exit(1);
  }
}

runRepairScript();
