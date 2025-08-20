// src/hooks/useRealtimeTable.js
import { useState, useEffect, useRef } from 'react';
import { realtimeStore } from '../lib/realtimeStore';

/**
 * Hook pour gérer une table en temps réel avec cache automatique
 * @param {string} table - Nom de la table
 * @param {object} options - Configuration
 * @returns {object} { data, loading, error, refresh, stats }
 */
export function useRealtimeTable(table, options = {}) {
  const {
    select = '*',
    pk = 'id',
    filter = null,
    orderBy = 'created_at',
    ascending = false,
    limit = 1000,
    enabled = true,
    autoLoad = true
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState(null);
  const unsubscribeRef = useRef(null);
  const initializedRef = useRef(false);

  const cacheKey = `table:${table}:${filter || '__all__'}`;

  // Fonction de refresh manuel
  const refresh = async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await realtimeStore.primeTable(table, {
        select,
        pk,
        filter,
        orderBy,
        ascending,
        limit
      });
      
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) {
      setData([]);
      setLoading(false);
      return;
    }

    // S'abonner aux changements
    const unsubscribe = realtimeStore.subscribe(cacheKey, (newData) => {
      setData(newData || []);
      if (initializedRef.current) {
        setLoading(false);
      }
    });

    unsubscribeRef.current = unsubscribe;

    // Charger les données initiales si autoLoad
    if (autoLoad && !initializedRef.current) {
      refresh().then(() => {
        initializedRef.current = true;
      });
    } else if (!autoLoad) {
      setLoading(false);
      initializedRef.current = true;
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [table, select, pk, filter, orderBy, ascending, limit, enabled, autoLoad]);

  return {
    data,
    loading,
    error,
    refresh,
    stats: realtimeStore.getStats()
  };
}

/**
 * Hook pour gérer un élément unique par ID
 */
export function useRealtimeItem(table, id, options = {}) {
  const { pk = 'id', enabled = true } = options;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled || !id) {
      setItem(null);
      setLoading(false);
      return;
    }

    // Vérifier d'abord le cache
    const cachedItem = realtimeStore.getById(table, id, pk);
    if (cachedItem) {
      setItem(cachedItem);
      setLoading(false);
    }

    // S'abonner aux changements de la table
    const unsubscribe = realtimeStore.subscribe(`table:${table}:__all__`, (data) => {
      const foundItem = data?.find(item => item[pk] === id);
      setItem(foundItem || null);
      setLoading(false);
    });

    // Si pas trouvé en cache, charger la table
    if (!cachedItem) {
      realtimeStore.primeTable(table).catch(setError);
    }

    return unsubscribe;
  }, [table, id, pk, enabled]);

  return { item, loading, error };
}

/**
 * Hook pour les données utilisateur en temps réel
 */
export function useRealtimeUsers(options = {}) {
  const { type = null, active = null, limit = 500 } = options;
  
  let filter = null;
  if (type && active !== null) {
    filter = `type.eq.${type},is_active.eq.${active}`;
  } else if (type) {
    filter = `type.eq.${type}`;
  } else if (active !== null) {
    filter = `is_active.eq.${active}`;
  }

  return useRealtimeTable('users', {
    select: '*',
    filter,
    orderBy: 'created_at',
    ascending: false,
    limit
  });
}

/**
 * Hook pour les parcelles en temps réel
 */
export function useRealtimeParcels(options = {}) {
  const { status = null, ownerId = null, limit = 500 } = options;
  
  let filter = null;
  if (status && ownerId) {
    filter = `status.eq.${status},owner_id.eq.${ownerId}`;
  } else if (status) {
    filter = `status.eq.${status}`;
  } else if (ownerId) {
    filter = `owner_id.eq.${ownerId}`;
  }

  return useRealtimeTable('parcels', {
    select: '*',
    filter,
    orderBy: 'created_at',
    ascending: false,
    limit
  });
}

/**
 * Hook pour les soumissions de parcelles
 */
export function useRealtimeParcelSubmissions(options = {}) {
  const { status = null, ownerId = null, limit = 200 } = options;
  
  let filter = null;
  if (status && ownerId) {
    filter = `status.eq.${status},owner_id.eq.${ownerId}`;
  } else if (status) {
    filter = `status.eq.${status}`;
  } else if (ownerId) {
    filter = `owner_id.eq.${ownerId}`;
  }

  return useRealtimeTable('parcel_submissions', {
    select: '*',
    filter,
    orderBy: 'created_at',
    ascending: false,
    limit
  });
}

/**
 * Hook pour les messages en temps réel
 */
export function useRealtimeMessages(userId, options = {}) {
  const { limit = 100 } = options;
  
  const filter = userId ? `or(sender_id.eq.${userId},recipient_id.eq.${userId})` : null;

  return useRealtimeTable('messages', {
    select: '*',
    filter,
    orderBy: 'created_at',
    ascending: false,
    limit
  });
}

/**
 * Hook pour les notifications en temps réel
 */
export function useRealtimeNotifications(userId, options = {}) {
  const { unreadOnly = false, limit = 50 } = options;
  
  let filter = userId ? `user_id.eq.${userId}` : null;
  if (unreadOnly && filter) {
    filter += ',read.eq.false';
  }

  return useRealtimeTable('notifications', {
    select: '*',
    filter,
    orderBy: 'created_at',
    ascending: false,
    limit
  });
}

/**
 * Hook pour les transactions en temps réel
 */
export function useRealtimeTransactions(options = {}) {
  const { status = null, userId = null, limit = 200 } = options;
  
  let filter = null;
  if (status && userId) {
    filter = `status.eq.${status},or(buyer_id.eq.${userId},seller_id.eq.${userId})`;
  } else if (status) {
    filter = `status.eq.${status}`;
  } else if (userId) {
    filter = `or(buyer_id.eq.${userId},seller_id.eq.${userId})`;
  }

  return useRealtimeTable('transactions', {
    select: '*',
    filter,
    orderBy: 'created_at',
    ascending: false,
    limit
  });
}

/**
 * Hook pour les demandes municipales
 */
export function useRealtimeMunicipalRequests(options = {}) {
  const { status = null, requesterId = null, mairieId = null, limit = 100 } = options;
  
  let filter = null;
  const conditions = [];
  if (status) conditions.push(`status.eq.${status}`);
  if (requesterId) conditions.push(`requester_id.eq.${requesterId}`);
  if (mairieId) conditions.push(`mairie_id.eq.${mairieId}`);
  
  if (conditions.length > 0) {
    filter = conditions.join(',');
  }

  return useRealtimeTable('municipal_requests', {
    select: '*',
    filter,
    orderBy: 'created_at',
    ascending: false,
    limit
  });
}

/**
 * Hook pour invalider le cache
 */
export function useInvalidateCache() {
  const invalidateTable = (table, filter = null) => {
    return realtimeStore.invalidateTable(table, filter);
  };

  const invalidateAll = () => {
    return realtimeStore.invalidateAll();
  };

  return {
    invalidateTable,
    invalidateAll
  };
}
