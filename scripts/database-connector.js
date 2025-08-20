#!/usr/bin/env node

/**
 * Script de connexion directe à la base de données Supabase PostgreSQL
 * Permet d'exécuter des requêtes SQL directement depuis VS Code
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erreur: Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Exécuter une requête SQL directement
 */
async function executeSQL(query, params = []) {
  try {
    console.log('\n🔄 Exécution de la requête SQL...');
    console.log('📝 Requête:', query);
    
    const { data, error } = await supabase.rpc('execute_sql', {
      query: query,
      params: params
    });
    
    if (error) {
      console.error('❌ Erreur SQL:', error);
      return { success: false, error };
    }
    
    console.log('✅ Requête exécutée avec succès');
    console.log('📊 Résultats:', data);
    
    return { success: true, data };
  } catch (err) {
    console.error('❌ Erreur d\'exécution:', err);
    return { success: false, error: err };
  }
}

/**
 * Lister toutes les tables
 */
async function listTables() {
  const query = `
    SELECT 
      table_name,
      table_schema
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;
  
  return executeSQL(query);
}

/**
 * Décrire une table
 */
async function describeTable(tableName) {
  const query = `
    SELECT 
      column_name,
      data_type,
      is_nullable,
      column_default
    FROM information_schema.columns 
    WHERE table_name = $1 AND table_schema = 'public'
    ORDER BY ordinal_position;
  `;
  
  return executeSQL(query, [tableName]);
}

/**
 * Interface en ligne de commande
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🗄️  Database Connector - Supabase PostgreSQL

Usage:
  node database-connector.js [command] [options]

Commands:
  tables                    - Lister toutes les tables
  describe <table>         - Décrire une table
  sql "<query>"           - Exécuter une requête SQL directe
  
Examples:
  node database-connector.js tables
  node database-connector.js describe users
  node database-connector.js sql "SELECT * FROM users LIMIT 5"
    `);
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case 'tables':
      await listTables();
      break;
      
    case 'describe':
      if (args[1]) {
        await describeTable(args[1]);
      } else {
        console.error('❌ Nom de table requis');
      }
      break;
      
    case 'sql':
      if (args[1]) {
        await executeSQL(args[1]);
      } else {
        console.error('❌ Requête SQL requise');
      }
      break;
      
    default:
      console.error('❌ Commande inconnue:', command);
  }
}

// Export pour utilisation en module
export { executeSQL, listTables, describeTable };

// Exécution si script appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
