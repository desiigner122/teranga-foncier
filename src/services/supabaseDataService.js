import { supabase } from '@/lib/supabaseClient';
import { useRealtimeContext } from '@/context/RealtimeContext.jsx';
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
      console.error(`Erreur getAll ${tableName}:`, error);
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
      console.error(`Erreur getById ${tableName}:`, error);
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
      console.error(`Erreur create ${tableName}:`, error);
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
      console.error(`Erreur update ${tableName}:`, error);
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
      console.error(`Erreur delete ${tableName}:`, error);
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
    const cacheKey = `stats_${userType}_${userId}`;
    
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
