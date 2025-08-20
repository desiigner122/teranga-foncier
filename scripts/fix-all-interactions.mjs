#!/usr/bin/env node
/**
 * 🔧 SCRIPT DE CORRECTION COMPLÈTE - TERANGA FONCIER
 * Corrige toutes les interactions entre composants et services
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 CORRECTION COMPLÈTE DES INTERACTIONS TERANGA FONCIER');
console.log('='.repeat(70));

/**
 * PROBLÈMES IDENTIFIÉS ET SOLUTIONS
 */
const FIXES = {
  // 1. Context Imports inconsistants
  contextImports: {
    from: [
      "from '@/context/AuthContext'",
      "from '@/contexts/SupabaseAuthContext'", 
      "from '../../contexts/SupabaseAuthContext'",
      "from '../../context/AuthContext'"
    ],
    to: "from '@/contexts/AuthContext'"
  },
  
  // 2. Service Imports inconsistants
  serviceImports: {
    from: [
      "from '@/services/supabaseDataService'",
      "import SupabaseDataService from '@/services/supabaseDataService'",
      "import { SupabaseDataService } from '@/services/supabaseDataService'"
    ],
    to: "import { SupabaseDataService } from '@/services/supabaseDataService'"
  },
  
  // 3. Spinner Imports inconsistants
  spinnerImports: {
    from: [
      "from '@/components/ui/spinner'",
      "from '../../components/ui/spinner'",
      "import LoadingSpinner from '@/components/ui/spinner'",
      "import { LoadingSpinner } from '@/components/ui/loading-spinner'"
    ],
    to: "import { LoadingSpinner } from '@/components/ui/loading-spinner'"
  },
  
  // 4. Toast Imports inconsistants
  toastImports: {
    from: [
      'from "@/components/ui/use-toast"',
      'from "@/hooks/use-toast"'
    ],
    to: 'from "@/hooks/use-toast"'
  },
  
  // 5. Supabase Client Import
  supabaseImports: {
    from: [
      "from '@/lib/supabaseClient'",
      "from '../../lib/supabaseClient'"
    ],
    to: "from '@/lib/supabaseClient'"
  }
};

/**
 * PATTERNS À CORRIGER DANS LES COMPOSANTS
 */
const COMPONENT_PATTERNS = {
  // Real-time hooks à ajouter
  realtimeHooks: {
    search: /const \[([a-zA-Z]+), set([a-zA-Z]+)\] = useState\(\[\]\);.*?useEffect\(\(\) => \{/gs,
    replace: (match, stateName, setterName) => {
      const hookName = stateName.includes('user') ? 'useRealtimeUsers' :
                       stateName.includes('parcel') ? 'useRealtimeParcels' :
                       stateName.includes('request') ? 'useRealtimeRequests' :
                       stateName.includes('submission') ? 'useRealtimeParcelSubmissions' :
                       'useRealtimeTable';
      
      return `const { data: ${stateName}, loading, error, refetch } = ${hookName}();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (${stateName}) {
      setFilteredData(${stateName});
    }
  }, [${stateName}]);
  
  useEffect(() => {`;
    }
  },
  
  // Correction du loading state
  loadingState: {
    search: /const \[loading, setLoading\] = useState\(true\);/g,
    replace: "// Loading géré par le hook temps réel"
  },
  
  // Correction des useEffect de chargement data
  useEffectLoading: {
    search: /useEffect\(\(\) => \{[\s\S]*?load.*?Data\(\);[\s\S]*?\}, \[\]\);/g,
    replace: "// Chargement géré par les hooks temps réel"
  }
};

/**
 * Corriger un fichier spécifique
 */
function fixFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf8');
    let hasChanges = false;
    const fileName = filePath.split(/[\\/]/).pop();
    
    console.log(`\n🔄 Traitement: ${fileName}`);
    
    // 1. Corriger les imports
    Object.entries(FIXES).forEach(([fixName, fix]) => {
      if (Array.isArray(fix.from)) {
        fix.from.forEach(fromPattern => {
          if (content.includes(fromPattern)) {
            content = content.replace(new RegExp(fromPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.to);
            hasChanges = true;
            console.log(`  ✅ ${fixName}: ${fromPattern} → ${fix.to}`);
          }
        });
      } else {
        if (content.includes(fix.from)) {
          content = content.replace(new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.to);
          hasChanges = true;
          console.log(`  ✅ ${fixName}: ${fix.from} → ${fix.to}`);
        }
      }
    });
    
    // 2. Ajouter les imports temps réel si nécessaire
    if (content.includes('useState') && content.includes('useEffect') && 
        (fileName.includes('Dashboard') || fileName.includes('Page'))) {
      
      if (!content.includes('useRealtimeTable') && !content.includes('useRealtime')) {
        const importMatch = content.match(/import.*?from.*?;/);
        if (importMatch) {
          const insertPoint = content.indexOf(importMatch[0]) + importMatch[0].length;
          const realtimeImport = "\nimport { useRealtimeTable, useRealtimeUsers, useRealtimeParcels, useRealtimeParcelSubmissions } from '@/hooks/useRealtimeTable';";
          content = content.slice(0, insertPoint) + realtimeImport + content.slice(insertPoint);
          hasChanges = true;
          console.log(`  ✅ Ajout import temps réel`);
        }
      }
    }
    
    // 3. Ajouter useRealtimeContext si nécessaire
    if (content.includes('Dashboard') && !content.includes('useRealtimeContext')) {
      const importMatch = content.match(/import.*?from.*?;/);
      if (importMatch) {
        const insertPoint = content.indexOf(importMatch[0]) + importMatch[0].length;
        const contextImport = "\nimport { useRealtimeContext } from '@/contexts/RealtimeContext';";
        content = content.slice(0, insertPoint) + contextImport + content.slice(insertPoint);
        hasChanges = true;
        console.log(`  ✅ Ajout RealtimeContext`);
      }
    }
    
    // 4. Corriger les patterns de composants
    Object.entries(COMPONENT_PATTERNS).forEach(([patternName, pattern]) => {
      if (pattern.search.test(content)) {
        if (typeof pattern.replace === 'function') {
          content = content.replace(pattern.search, pattern.replace);
        } else {
          content = content.replace(pattern.search, pattern.replace);
        }
        hasChanges = true;
        console.log(`  ✅ Pattern corrigé: ${patternName}`);
      }
    });
    
    // 5. Sauvegarder si des changements ont été faits
    if (hasChanges) {
      writeFileSync(filePath, content, 'utf8');
      console.log(`  💾 Fichier sauvegardé avec succès`);
      return true;
    } else {
      console.log(`  ✨ Aucune correction nécessaire`);
      return false;
    }
    
  } catch (error) {
    console.error(`  ❌ Erreur: ${error.message}`);
    return false;
  }
}

/**
 * Trouver tous les fichiers à corriger
 */
function findFiles(dir, extensions = ['.jsx', '.js']) {
  const files = [];
  
  function traverse(currentDir) {
    try {
      const items = readdirSync(currentDir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = join(currentDir, item.name);
        
        if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
          traverse(fullPath);
        } else if (item.isFile() && extensions.some(ext => item.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignorer les erreurs d'accès aux dossiers
    }
  }
  
  traverse(dir);
  return files;
}

/**
 * Créer un fichier de hooks temps réel amélioré
 */
function createEnhancedRealtimeHooks() {
  const hookContent = `import { useState, useEffect, useCallback } from 'react';
import { realtimeStore } from '../lib/realtimeStore';

/**
 * Hook générique pour les tables avec temps réel
 */
export function useRealtimeTable(tableName, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await realtimeStore.primeTable(tableName, options);
      const cachedData = realtimeStore.getCache(tableName) || [];
      setData(cachedData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [tableName, options]);

  useEffect(() => {
    // S'abonner aux changements temps réel
    const unsubscribe = realtimeStore.subscribeToTable(tableName, (newData) => {
      setData(newData || []);
      setLoading(false);
    });

    // Charger les données initiales
    refetch();

    return () => {
      unsubscribe?.();
    };
  }, [tableName, refetch]);

  return { data, loading, error, refetch };
}

/**
 * Hooks spécialisés pour chaque entité
 */
export const useRealtimeUsers = (options) => useRealtimeTable('users', options);
export const useRealtimeParcels = (options) => useRealtimeTable('parcels', options);
export const useRealtimeRequests = (options) => useRealtimeTable('requests', options);
export const useRealtimeParcelSubmissions = (options) => useRealtimeTable('parcel_submissions', options);
export const useRealtimeTransactions = (options) => useRealtimeTable('transactions', options);
export const useRealtimeNotifications = (options) => useRealtimeTable('notifications', options);
export const useRealtimeConversations = (options) => useRealtimeTable('conversations', options);
export const useRealtimeMessages = (options) => useRealtimeTable('messages', options);

/**
 * Hook pour les statistiques en temps réel
 */
export function useRealtimeStats(queries = []) {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateStats = async () => {
      const newStats = {};
      
      for (const query of queries) {
        try {
          const data = realtimeStore.getCache(query.table) || [];
          if (query.aggregate) {
            newStats[query.key] = query.aggregate(data);
          } else {
            newStats[query.key] = data.length;
          }
        } catch (error) {
          console.error('Erreur calcul stats:', error);
          newStats[query.key] = 0;
        }
      }
      
      setStats(newStats);
      setLoading(false);
    };

    // Mettre à jour les stats initialement
    updateStats();

    // S'abonner aux changements de toutes les tables concernées
    const unsubscribes = queries.map(query => 
      realtimeStore.subscribeToTable(query.table, updateStats)
    );

    return () => {
      unsubscribes.forEach(unsub => unsub?.());
    };
  }, [queries]);

  return { stats, loading };
}
`;

  const hooksPath = join(__dirname, '..', 'src', 'hooks', 'useRealtimeTable.js');
  writeFileSync(hooksPath, hookContent, 'utf8');
  console.log('✅ Hook temps réel amélioré créé');
}

/**
 * Créer un service unifié pour les données
 */
function createUnifiedDataService() {
  const serviceContent = `import { supabase } from '@/lib/supabaseClient';
import { realtimeStore } from '@/lib/realtimeStore';

/**
 * Service unifié pour toutes les opérations de données
 * Intègre le cache temps réel et les opérations CRUD
 */
export class SupabaseDataService {
  
  /**
   * Opérations génériques
   */
  static async getAll(tableName, options = {}) {
    try {
      // Essayer le cache d'abord
      const cached = realtimeStore.getCache(tableName);
      if (cached && cached.length > 0 && !options.forceRefresh) {
        return cached;
      }

      // Requête à la base
      let query = supabase.from(tableName).select('*');
      
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending });
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Mettre à jour le cache
      realtimeStore.updateCache(tableName, data);
      
      return data || [];
    } catch (error) {
      console.error(\`Erreur getAll \${tableName}:\`, error);
      return [];
    }
  }

  static async getById(tableName, id) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(\`Erreur getById \${tableName}:\`, error);
      return null;
    }
  }

  static async create(tableName, record) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert(record)
        .select()
        .single();
      
      if (error) throw error;
      
      // Invalider le cache pour déclencher un rechargement
      realtimeStore.invalidateCache(tableName);
      
      return data;
    } catch (error) {
      console.error(\`Erreur create \${tableName}:\`, error);
      throw error;
    }
  }

  static async update(tableName, id, updates) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Invalider le cache
      realtimeStore.invalidateCache(tableName);
      
      return data;
    } catch (error) {
      console.error(\`Erreur update \${tableName}:\`, error);
      throw error;
    }
  }

  static async delete(tableName, id) {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Invalider le cache
      realtimeStore.invalidateCache(tableName);
      
      return true;
    } catch (error) {
      console.error(\`Erreur delete \${tableName}:\`, error);
      throw error;
    }
  }

  /**
   * Méthodes spécialisées legacy (pour compatibilité)
   */
  static async getUsers(filters = {}) {
    return this.getAll('users', { filters });
  }

  static async getParcels(filters = {}) {
    return this.getAll('parcels', { filters });
  }

  static async getParcelSubmissions(filters = {}) {
    return this.getAll('parcel_submissions', { filters });
  }

  static async getFeaturedParcels(limit = 6) {
    return this.getAll('parcels', { 
      filters: { is_featured: true }, 
      limit,
      orderBy: { column: 'created_at', ascending: false }
    });
  }

  static async searchParcels(options = {}) {
    return this.getAll('parcels', options);
  }

  static async getRequests(filters = {}) {
    return this.getAll('requests', { filters });
  }

  static async getTransactions(filters = {}) {
    return this.getAll('transactions', { filters });
  }

  static async getNotifications(userId) {
    return this.getAll('notifications', { 
      filters: { user_id: userId },
      orderBy: { column: 'created_at', ascending: false }
    });
  }

  /**
   * Statistiques optimisées
   */
  static async getDashboardStats(userType, userId) {
    const cacheKey = \`stats_\${userType}_\${userId}\`;
    
    try {
      // Vérifier le cache local
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Cache valable 5 minutes
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          return data;
        }
      }

      // Calculer les stats depuis le cache temps réel
      const users = realtimeStore.getCache('users') || [];
      const parcels = realtimeStore.getCache('parcels') || [];
      const requests = realtimeStore.getCache('requests') || [];
      
      const stats = {
        totalUsers: users.length,
        totalParcels: parcels.length,
        totalRequests: requests.length,
        userStats: this._getUserStats(users),
        parcelStats: this._getParcelStats(parcels),
        requestStats: this._getRequestStats(requests)
      };

      // Mettre en cache
      localStorage.setItem(cacheKey, JSON.stringify({
        data: stats,
        timestamp: Date.now()
      }));

      return stats;
    } catch (error) {
      console.error('Erreur getDashboardStats:', error);
      return {};
    }
  }

  static _getUserStats(users) {
    const byType = {};
    users.forEach(user => {
      byType[user.type] = (byType[user.type] || 0) + 1;
    });
    return byType;
  }

  static _getParcelStats(parcels) {
    const byStatus = {};
    parcels.forEach(parcel => {
      byStatus[parcel.status] = (byStatus[parcel.status] || 0) + 1;
    });
    return byStatus;
  }

  static _getRequestStats(requests) {
    const byStatus = {};
    requests.forEach(request => {
      byStatus[request.status] = (byStatus[request.status] || 0) + 1;
    });
    return byStatus;
  }
}

// Export par défaut pour compatibilité
export default SupabaseDataService;
`;

  const servicePath = join(__dirname, '..', 'src', 'services', 'supabaseDataService.js');
  writeFileSync(servicePath, serviceContent, 'utf8');
  console.log('✅ Service de données unifié créé');
}

/**
 * Fonction principale
 */
async function main() {
  console.log('\n🔍 ANALYSE DES FICHIERS À CORRIGER...');
  
  const srcDir = join(__dirname, '..', 'src');
  const files = findFiles(srcDir);
  
  console.log(`\n📊 ${files.length} fichiers trouvés`);
  
  // Créer les services améliorés
  console.log('\n🛠️  CRÉATION DES SERVICES AMÉLIORÉS...');
  createEnhancedRealtimeHooks();
  createUnifiedDataService();
  
  // Corriger tous les fichiers
  console.log('\n🔧 CORRECTION DES FICHIERS...');
  let fixedCount = 0;
  
  for (const file of files) {
    if (fixFile(file)) {
      fixedCount++;
    }
  }
  
  console.log('\n🎉 CORRECTION COMPLÈTE TERMINÉE');
  console.log('='.repeat(70));
  console.log(`📊 Fichiers traités: ${files.length}`);
  console.log(`✅ Fichiers corrigés: ${fixedCount}`);
  console.log(`⚡ Services créés: 2`);
  
  console.log('\n📋 RÉSUMÉ DES CORRECTIONS:');
  console.log('✅ Imports unifiés (Context, Services, Composants)');
  console.log('✅ Hooks temps réel ajoutés automatiquement');
  console.log('✅ Patterns de chargement optimisés');
  console.log('✅ Service de données centralisé');
  console.log('✅ Cache intelligent intégré');
  
  console.log('\n🚀 PROCHAINES ÉTAPES:');
  console.log('1. Compiler l\'application: npm run build');
  console.log('2. Tester les dashboards: npm run dev');
  console.log('3. Vérifier les fonctions temps réel');
  console.log('4. Valider les interactions utilisateur');
}

// Exécution
main().catch(console.error);
