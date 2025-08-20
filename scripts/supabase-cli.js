#!/usr/bin/env node
/**
 * 🗄️ Supabase Database CLI
 * Utilitaire pour exécuter des requêtes directement sur la base de données
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ debug: false });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL, 
  process.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

class SupabaseCLI {
  
  /**
   * 📊 Statistiques globales
   */
  static async stats() {
    console.log('\n📊 STATISTIQUES DE LA BASE DE DONNÉES\n');
    
    const tables = [
      'users', 'parcels', 'parcel_submissions', 'transactions', 
      'favorites', 'messages', 'notifications', 'user_type_change_requests'
    ];
    
    for (const table of tables) {
      try {
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        console.log(`📋 ${table.padEnd(25)} : ${count || 0} enregistrements`);
      } catch (err) {
        console.log(`❌ ${table.padEnd(25)} : Erreur d'accès`);
      }
    }
  }
  
  /**
   * 👁️ Aperçu d'une table
   */
  static async show(table, limit = 10) {
    console.log(`\n🔍 APERÇU DE LA TABLE "${table.toUpperCase()}" (${limit} enregistrements)\n`);
    
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(limit);
      
      if (error) throw error;
      
      if (data.length === 0) {
        console.log('📭 Table vide');
        return;
      }
      
      console.table(data);
      console.log(`\n✅ ${data.length} enregistrements affichés`);
      
    } catch (err) {
      console.error(`❌ Erreur: ${err.message}`);
    }
  }
  
  /**
   * 🔎 Rechercher dans une table
   */
  static async search(table, column, value) {
    console.log(`\n🔍 RECHERCHE DANS "${table}" - ${column} = "${value}"\n`);
    
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq(column, value);
      
      if (error) throw error;
      
      if (data.length === 0) {
        console.log('📭 Aucun résultat trouvé');
        return;
      }
      
      console.table(data);
      console.log(`\n✅ ${data.length} résultat(s) trouvé(s)`);
      
    } catch (err) {
      console.error(`❌ Erreur: ${err.message}`);
    }
  }
  
  /**
   * ➕ Insérer des données
   */
  static async insert(table, data) {
    console.log(`\n➕ INSERTION DANS "${table.toUpperCase()}"\n`);
    console.log('📝 Données à insérer:', data);
    
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select();
      
      if (error) throw error;
      
      console.log('\n✅ Insertion réussie:');
      console.table(result);
      
      return result;
      
    } catch (err) {
      console.error(`❌ Erreur d'insertion: ${err.message}`);
    }
  }
  
  /**
   * ✏️ Mettre à jour des données
   */
  static async update(table, id, data) {
    console.log(`\n✏️ MISE À JOUR DANS "${table.toUpperCase()}" (ID: ${id})\n`);
    console.log('📝 Nouvelles données:', data);
    
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      if (result.length === 0) {
        console.log('❌ Aucun enregistrement trouvé avec cet ID');
        return;
      }
      
      console.log('\n✅ Mise à jour réussie:');
      console.table(result);
      
      return result;
      
    } catch (err) {
      console.error(`❌ Erreur de mise à jour: ${err.message}`);
    }
  }
  
  /**
   * 🗑️ Supprimer des données
   */
  static async delete(table, id) {
    console.log(`\n🗑️ SUPPRESSION DANS "${table.toUpperCase()}" (ID: ${id})\n`);
    
    try {
      const { data: result, error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      if (result.length === 0) {
        console.log('❌ Aucun enregistrement trouvé avec cet ID');
        return;
      }
      
      console.log('\n✅ Suppression réussie:');
      console.table(result);
      
      return result;
      
    } catch (err) {
      console.error(`❌ Erreur de suppression: ${err.message}`);
    }
  }
  
  /**
   * 📈 Analyser les données
   */
  static async analyze(table) {
    console.log(`\n📈 ANALYSE DE LA TABLE "${table.toUpperCase()}"\n`);
    
    try {
      // Compter total
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      console.log(`📊 Total des enregistrements: ${count}`);
      
      // Si c'est la table users, analyser par type
      if (table === 'users') {
        const { data: typeStats } = await supabase
          .from('users')
          .select('type')
          .not('type', 'is', null);
        
        const typeCounts = {};
        typeStats.forEach(user => {
          typeCounts[user.type] = (typeCounts[user.type] || 0) + 1;
        });
        
        console.log('\n👥 Répartition par type:');
        Object.entries(typeCounts).forEach(([type, count]) => {
          console.log(`   ${type}: ${count}`);
        });
      }
      
      // Si c'est la table parcels, analyser par statut
      if (table === 'parcels') {
        const { data: statusStats } = await supabase
          .from('parcels')
          .select('status')
          .not('status', 'is', null);
        
        const statusCounts = {};
        statusStats.forEach(parcel => {
          statusCounts[parcel.status] = (statusCounts[parcel.status] || 0) + 1;
        });
        
        console.log('\n🏡 Répartition par statut:');
        Object.entries(statusCounts).forEach(([status, count]) => {
          console.log(`   ${status}: ${count}`);
        });
      }
      
    } catch (err) {
      console.error(`❌ Erreur d'analyse: ${err.message}`);
    }
  }
}

/**
 * 🖥️ Interface en ligne de commande
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🗄️ SUPABASE DATABASE CLI

Usage:
  node supabase-cli.js [command] [options]

Commands:
  stats                                    - Statistiques globales de la base
  show <table> [limit]                     - Afficher les données d'une table
  search <table> <column> <value>          - Rechercher dans une table
  insert <table> <json_data>               - Insérer des données (JSON)
  update <table> <id> <json_data>          - Mettre à jour un enregistrement
  delete <table> <id>                      - Supprimer un enregistrement
  analyze <table>                          - Analyser une table

Examples:
  node supabase-cli.js stats
  node supabase-cli.js show users 5
  node supabase-cli.js search users type "Particulier"
  node supabase-cli.js analyze users
  node supabase-cli.js insert parcels '{"reference":"TEST-001","location":"Dakar"}'
    `);
    return;
  }
  
  const command = args[0];
  
  try {
    switch (command) {
      case 'stats':
        await SupabaseCLI.stats();
        break;
        
      case 'show':
        const table = args[1];
        const limit = args[2] ? parseInt(args[2]) : 10;
        if (!table) {
          console.error('❌ Nom de table requis');
          return;
        }
        await SupabaseCLI.show(table, limit);
        break;
        
      case 'search':
        const searchTable = args[1];
        const column = args[2];
        const value = args[3];
        if (!searchTable || !column || !value) {
          console.error('❌ Usage: search <table> <column> <value>');
          return;
        }
        await SupabaseCLI.search(searchTable, column, value);
        break;
        
      case 'insert':
        const insertTable = args[1];
        const insertData = args[2];
        if (!insertTable || !insertData) {
          console.error('❌ Usage: insert <table> <json_data>');
          return;
        }
        try {
          const data = JSON.parse(insertData);
          await SupabaseCLI.insert(insertTable, data);
        } catch (e) {
          console.error('❌ JSON invalide:', e.message);
        }
        break;
        
      case 'update':
        const updateTable = args[1];
        const updateId = args[2];
        const updateData = args[3];
        if (!updateTable || !updateId || !updateData) {
          console.error('❌ Usage: update <table> <id> <json_data>');
          return;
        }
        try {
          const data = JSON.parse(updateData);
          await SupabaseCLI.update(updateTable, updateId, data);
        } catch (e) {
          console.error('❌ JSON invalide:', e.message);
        }
        break;
        
      case 'delete':
        const deleteTable = args[1];
        const deleteId = args[2];
        if (!deleteTable || !deleteId) {
          console.error('❌ Usage: delete <table> <id>');
          return;
        }
        await SupabaseCLI.delete(deleteTable, deleteId);
        break;
        
      case 'analyze':
        const analyzeTable = args[1];
        if (!analyzeTable) {
          console.error('❌ Nom de table requis');
          return;
        }
        await SupabaseCLI.analyze(analyzeTable);
        break;
        
      default:
        console.error('❌ Commande inconnue:', command);
        console.log('Utilisez "node supabase-cli.js" pour voir l\'aide');
    }
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }
}

main();
