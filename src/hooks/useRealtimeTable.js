import { useState, useEffect, useCallback, useRef } from 'react';
import { realtimeStore } from '../lib/realtimeStore';

/**
 * Hook générique temps réel basé sur realtimeStore
 * Corrige la récursion infinie précédente et fournit un contrat stable:
 *  - data: tableau (vide par défaut)
 *  - loading: bool
 *  - error: objet ou null
 *  - refetch(): force un rafraîchissement depuis l'API
 */
export function useRealtimeTable(tableName, options = {}) {
  const {
    select = '*',
    filter = null,          // String PostgREST pour .or() éventuel
    orderBy = 'created_at',
    ascending = false,
    limit = 1000,
    pk = 'id'
  } = options;

  const [state, setState] = useState({ data: [], loading: !!tableName, error: null });
  const filterKey = filter || '__all__';
  const cacheKey = tableName ? `table:${tableName}:${filterKey}` : null;
  const mountedRef = useRef(true);

  useEffect(() => () => { mountedRef.current = false; }, []);

  useEffect(() => {
    if (!tableName) {
      // Pas de table -> fournir un état neutre (évite crash des usages existants sans param)
      setState({ data: [], loading: false, error: null });
      return;
    }

    let unsubscribe;
    let primed = false;
    let cancelled = false;

    const prime = async () => {
      setState(s => ({ ...s, loading: true, error: null }));
      try {
        const { error } = await realtimeStore.primeTable(tableName, { select, pk, filter, orderBy, ascending, limit });
        if (error && !cancelled) {
          setState({ data: [], loading: false, error });
        }
        primed = true;
      } catch (e) {
        if (!cancelled) setState({ data: [], loading: false, error: e });
      }
    };

    prime();

    if (cacheKey) {
      unsubscribe = realtimeStore.subscribe(cacheKey, (data) => {
        if (!mountedRef.current) return;
        setState(prev => ({ ...prev, data: data || [], loading: false }));
      });
    }

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [tableName, select, filter, orderBy, ascending, limit, pk, cacheKey]);

  const refetch = useCallback(async () => {
    if (!tableName) return;
    setState(s => ({ ...s, loading: true }));
    await realtimeStore.invalidateTable(tableName, filter);
  }, [tableName, filter]);

  return { data: state.data, loading: state.loading, error: state.error, refetch };
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
