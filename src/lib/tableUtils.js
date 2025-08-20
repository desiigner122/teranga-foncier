import { supabase } from '../lib/supabaseClient';
// src/lib/tableUtils.import { supabase } from './supabaseClient';

/**
 * Vérifie si une table existe dans Supabase
 * @param {string} tableName - Nom de la table à vérifier
 * @returns {Promise<boolean>} - true si la table existe, false sinon
 */
export const checkTableExists = async (tableName) => {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
      .limit(0);
    
    return !error;
  } catch (err) {
    return false;
  }
};

/**
 * Execute une requête seulement si la table existe
 * @param {string} tableName - Nom de la table
 * @param {Function} queryFunction - Fonction qui retourne la requête Supabase
 * @returns {Promise<{data: any, error: any}>} - Résultat de la requête ou erreur
 */
export const safeTableQuery = async (tableName, queryFunction) => {
  try {
    const tableExists = await checkTableExists(tableName);
    
    if (!tableExists) {      return { data: [], error: null };
    }
    
    return await queryFunction();
  } catch (error) {    return { data: [], error };
  }
};
