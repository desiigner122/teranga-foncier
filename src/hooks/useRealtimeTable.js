import { useState, useEffect, useCallback } from 'react';
import { realtimeStore } from '../lib/realtimeStore';

/**
 * Hook générique pour les tables avec temps réel
 */
export function useRealtimeTable(tableName, options = {}) {
  const { data: data, loading: dataLoading, error: dataError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (data) {
      setFilteredData(data);
    }
  }, [data]);
  
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
  // Loading géré par le hook temps réel

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
