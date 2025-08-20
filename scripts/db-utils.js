#!/usr/bin/env node

/**
 * Utilitaire de base de données pour Supabase
 * Connexion directe et exécution de requêtes depuis VS Code
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

/**
 * Utilitaires de base de données
 */
class DatabaseUtils {
  
  /**
   * Lister toutes les tables publiques
   */
  static async listTables() {
    try {
      console.log('\n📋 Tables principales de l\'application:');
      
      const mainTables = [
        'users', 'parcels', 'parcel_submissions', 'transactions', 
        'favorites', 'messages', 'notifications', 'user_type_change_requests',
        'bank_guarantees', 'land_evaluations', 'financing_requests'
      ];
      
      console.log('Tables identifiées:');
      mainTables.forEach((table, index) => {
        console.log(`${index + 1}. ${table}`);
      });
      
      return mainTables;
      
    } catch (err) {
      console.error('❌ Erreur:', err.message);
    }
  }
  
  /**
   * Compter les enregistrements d'une table
   */
  static async countRecords(tableName) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error(`❌ Erreur pour ${tableName}:`, error);
        return 0;
      }
      
      console.log(`📊 ${tableName}: ${count} enregistrements`);
      return count;
    } catch (err) {
      console.error(`❌ Erreur ${tableName}:`, err.message);
      return 0;
    }
  }
  
  /**
   * Afficher un aperçu d'une table
   */
  static async previewTable(tableName, limit = 5) {
    try {
      console.log(`\n🔍 Aperçu de ${tableName} (${limit} premiers enregistrements):`);
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(limit);
      
      if (error) {
        console.error('❌ Erreur:', error);
        return;
      }
      
      if (data.length === 0) {
        console.log('📭 Table vide');
        return;
      }
      
      console.table(data);
      
    } catch (err) {
      console.error('❌ Erreur:', err.message);
    }
  }
  
  /**
   * Exécuter une requête de sélection
   */
  static async select(tableName, options = {}) {
    try {
      const {
        columns = '*',
        filter = {},
        limit = null,
        orderBy = null
      } = options;
      
      let query = supabase.from(tableName).select(columns);
      
      // Appliquer les filtres
      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      // Appliquer l'ordre
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending || true });
      }
      
      // Appliquer la limite
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Erreur:', error);
        return null;
      }
      
      console.log(`✅ ${data.length} enregistrements trouvés`);
      console.table(data);
      
      return data;
      
    } catch (err) {
      console.error('❌ Erreur:', err.message);
      return null;
    }
  }
  
  /**
   * Insérer des données
   */
  static async insert(tableName, data) {
    try {
      console.log(`\n➕ Insertion dans ${tableName}:`);
      console.log('📝 Données:', data);
      
      const { data: result, error } = await supabase
        .from(tableName)
        .insert(data)
        .select();
      
      if (error) {
        console.error('❌ Erreur:', error);
        return null;
      }
      
      console.log('✅ Insertion réussie');
      console.table(result);
      
      return result;
      
    } catch (err) {
      console.error('❌ Erreur:', err.message);
      return null;
    }
  }
  
  /**
   * Mettre à jour des données
   */
  static async update(tableName, filter, data) {
    try {
      console.log(`\n✏️  Mise à jour de ${tableName}:`);
      console.log('🔍 Filtre:', filter);
      console.log('📝 Nouvelles données:', data);
      
      let query = supabase.from(tableName).update(data);
      
      // Appliquer les filtres
      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      const { data: result, error } = await query.select();
      
      if (error) {
        console.error('❌ Erreur:', error);
        return null;
      }
      
      console.log(`✅ ${result.length} enregistrements mis à jour`);
      console.table(result);
      
      return result;
      
    } catch (err) {
      console.error('❌ Erreur:', err.message);
      return null;
    }
  }
  
  /**
   * Supprimer des données
   */
  static async delete(tableName, filter) {
    try {
      console.log(`\n🗑️  Suppression dans ${tableName}:`);
      console.log('🔍 Filtre:', filter);
      
      let query = supabase.from(tableName).delete();
      
      // Appliquer les filtres
      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      const { data: result, error } = await query.select();
      
      if (error) {
        console.error('❌ Erreur:', error);
        return null;
      }
      
      console.log(`✅ ${result.length} enregistrements supprimés`);
      console.table(result);
      
      return result;
      
    } catch (err) {
      console.error('❌ Erreur:', err.message);
      return null;
    }
  }
  
  /**
   * Statistiques globales de la base
   */
  static async stats() {
    console.log('\n📊 Statistiques de la base de données:');
    
    const tables = ['users', 'parcels', 'parcel_submissions', 'transactions', 'favorites', 'messages'];
    
    for (const table of tables) {
      await this.countRecords(table);
    }
  }
}

/**
 * Interface en ligne de commande
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🗄️  Database Utils - Supabase Direct Connection

Commands:
  node db-utils.js tables                              - Lister toutes les tables
  node db-utils.js stats                               - Statistiques globales
  node db-utils.js preview <table> [limit]            - Aperçu d'une table
  node db-utils.js count <table>                       - Compter les enregistrements
  node db-utils.js select <table> [options]           - Sélectionner des données
  
Examples:
  node db-utils.js tables
  node db-utils.js preview users 10
  node db-utils.js count parcels
  node db-utils.js stats
    `);
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case 'tables':
      await DatabaseUtils.listTables();
      break;
      
    case 'stats':
      await DatabaseUtils.stats();
      break;
      
    case 'preview':
      const tableName = args[1];
      const limit = args[2] ? parseInt(args[2]) : 5;
      if (tableName) {
        await DatabaseUtils.previewTable(tableName, limit);
      } else {
        console.error('❌ Nom de table requis');
      }
      break;
      
    case 'count':
      if (args[1]) {
        await DatabaseUtils.countRecords(args[1]);
      } else {
        console.error('❌ Nom de table requis');
      }
      break;
      
    case 'select':
      if (args[1]) {
        await DatabaseUtils.select(args[1]);
      } else {
        console.error('❌ Nom de table requis');
      }
      break;
      
    default:
      console.error('❌ Commande inconnue:', command);
  }
}

// Export pour utilisation
export default DatabaseUtils;

// Exécution directe
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
