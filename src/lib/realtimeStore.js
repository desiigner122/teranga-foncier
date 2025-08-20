// src/lib/realtimeStore.import { supabase } from './supabaseClient';

/**
 * Gestionnaire centralisé des données temps réel et cache
 * - Cache unifié pour toutes les entités
 * - Souscriptions Realtime consolidées
 * - Auto-refresh et reconnexion
 * - Invalidation intelligente
 */
class RealtimeStore {
  constructor() {
    this.cache = new Map();           // key -> data
    this.listeners = new Map();       // key -> Set(callback)
    this.channels = new Map();        // table -> channel
    this.tableConfigs = new Map();    // table -> { pk, select, filters }
    this.connected = false;
    this.retryCount = 0;
    this.maxRetries = 5;
    this.retryInterval = null;
    this.refreshInterval = null;
    this.initialized = false;
    
    // Stats pour debug
    this.stats = {
      cacheHits: 0,
      cacheMisses: 0,
      realtimeEvents: 0,
      reconnections: 0
    };

    this._init();
  }

  _init() {
    // Auto-refresh périodique (toutes les 2 minutes)
    this.refreshInterval = setInterval(() => {
      this._refreshAllCachedData();
    }, 120000);

    // Refresh sur focus window
    window.addEventListener('focus', () => {
      this._refreshAllCachedData();
    });

    // Surveillance de la connexion
    this._setupConnectionMonitoring();
    
    this.initialized = true;
  }

  _setupConnectionMonitoring() {
    // Écoute les changements de statut réseau
    window.addEventListener('online', () => {
      if (!this.connected) {
        console.log('[RealtimeStore] Reconnexion détectée');
        this._reconnectAll();
      }
    });

    window.addEventListener('offline', () => {
      console.log('[RealtimeStore] Connexion perdue');
      this.connected = false;
    });
  }

  async _reconnectAll() {
    console.log('[RealtimeStore] Reconnexion de tous les channels...');
    this.stats.reconnections++;
    
    // Fermer tous les channels existants
    for (const [table, channel] of this.channels) {
      await supabase.removeChannel(channel);
    }
    this.channels.clear();

    // Recréer les channels pour les tables actives
    for (const table of this.tableConfigs.keys()) {
      this._ensureChannel(table);
    }

    // Rafraîchir toutes les données
    await this._refreshAllCachedData();
    this.connected = true;
    this.retryCount = 0;
  }

  async _refreshAllCachedData() {
    const promises = [];
    for (const [cacheKey, data] of this.cache) {
      if (cacheKey.startsWith('table:')) {
        const [, table, filterKey] = cacheKey.split(':');
        const config = this.tableConfigs.get(table);
        if (config) {
          const filter = filterKey === '__all__' ? null : filterKey;
          promises.push(this._fetchAndCache(table, config, filter));
        }
      }
    }
    
    if (promises.length > 0) {
      console.log(`[RealtimeStore] Refresh ${promises.length} cached datasets`);
      await Promise.allSettled(promises);
    }
  }

  /**
   * Subscribe à une clé de cache et retourne la fonction de désabonnement
   */
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    
    this.listeners.get(key).add(callback);
    
    // Envoyer la valeur actuelle si disponible
    if (this.cache.has(key)) {
      this.stats.cacheHits++;
      callback(this.cache.get(key));
    } else {
      this.stats.cacheMisses++;
    }

    // Retourner la fonction de désabonnement
    return () => {
      const set = this.listeners.get(key);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  /**
   * Notifier tous les listeners d'une clé
   */
  _notify(key, data) {
    const listeners = this.listeners.get(key);
    if (listeners) {
      for (const callback of listeners) {
        try {
          callback(data);
        } catch (error) {
          console.error(`[RealtimeStore] Erreur callback pour ${key}:`, error);
        }
      }
    }
  }

  /**
   * Configuration et chargement initial d'une table
   */
  async primeTable(table, options = {}) {
    const {
      select = '*',
      pk = 'id',
      filter = null,
      orderBy = 'created_at',
      ascending = false,
      limit = 1000
    } = options;

    // Enregistrer la configuration
    if (!this.tableConfigs.has(table)) {
      this.tableConfigs.set(table, {
        pk,
        select,
        filters: new Set(),
        orderBy,
        ascending,
        limit
      });
    }

    const config = this.tableConfigs.get(table);
    const filterKey = filter || '__all__';
    config.filters.add(filterKey);

    // S'assurer que le channel existe
    this._ensureChannel(table);

    // Charger les données
    return this._fetchAndCache(table, config, filter);
  }

  async _fetchAndCache(table, config, filter) {
    try {
      let query = supabase
        .from(table)
        .select(config.select)
        .order(config.orderBy, { ascending: config.ascending });

      if (config.limit) {
        query = query.limit(config.limit);
      }

      if (filter) {
        // Supposer que filter est une string PostgREST valide
        query = query.or(filter);
      }

      const { data, error } = await query;

      if (error) {
        console.error(`[RealtimeStore] Erreur fetch ${table}:`, error);
        return { data: null, error };
      }

      const cacheKey = this._getCacheKey(table, filter);
      this.cache.set(cacheKey, data || []);
      this._notify(cacheKey, data || []);

      console.log(`[RealtimeStore] Cached ${(data || []).length} rows for ${cacheKey}`);
      return { data, error: null };

    } catch (error) {
      console.error(`[RealtimeStore] Exception fetch ${table}:`, error);
      return { data: null, error };
    }
  }

  _getCacheKey(table, filter) {
    return `table:${table}:${filter || '__all__'}`;
  }

  /**
   * S'assurer qu'un channel Realtime existe pour une table
   */
  _ensureChannel(table) {
    if (this.channels.has(table)) {
      return this.channels.get(table);
    }

    console.log(`[RealtimeStore] Création channel pour ${table}`);
    
    const channel = supabase
      .channel(`realtime_${table}_${Date.now()}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: table 
        },
        (payload) => this._handleRealtimeEvent(table, payload)
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[RealtimeStore] Channel ${table} souscrit`);
          this.connected = true;
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`[RealtimeStore] Erreur channel ${table}`);
          this._scheduleRetry(table);
        }
      });

    this.channels.set(table, channel);
    return channel;
  }

  _scheduleRetry(table) {
    if (this.retryCount >= this.maxRetries) {
      console.error(`[RealtimeStore] Max retries atteint pour ${table}`);
      return;
    }

    this.retryCount++;
    const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);
    
    setTimeout(() => {
      console.log(`[RealtimeStore] Retry ${this.retryCount} pour ${table}`);
      const oldChannel = this.channels.get(table);
      if (oldChannel) {
        supabase.removeChannel(oldChannel);
      }
      this.channels.delete(table);
      this._ensureChannel(table);
    }, delay);
  }

  /**
   * Gestionnaire d'événements Realtime
   */
  _handleRealtimeEvent(table, payload) {
    this.stats.realtimeEvents++;
    console.log(`[RealtimeStore] Event ${payload.eventType} sur ${table}:`, payload);

    const config = this.tableConfigs.get(table);
    if (!config) return;

    const pk = config.pk;

    // Mettre à jour chaque variante de cache pour cette table
    for (const filterKey of config.filters) {
      const cacheKey = this._getCacheKey(table, filterKey === '__all__' ? null : filterKey);
      const currentData = this.cache.get(cacheKey);
      
      if (!currentData) continue;

      let newData = [...currentData];

      switch (payload.eventType) {
        case 'INSERT':
          // Ajouter au début (supposant order desc par created_at)
          newData.unshift(payload.new);
          // Respecter la limite
          if (config.limit && newData.length > config.limit) {
            newData = newData.slice(0, config.limit);
          }
          break;

        case 'UPDATE':
          const updateIndex = newData.findIndex(item => item[pk] === payload.new[pk]);
          if (updateIndex >= 0) {
            newData[updateIndex] = payload.new;
          }
          break;

        case 'DELETE':
          newData = newData.filter(item => item[pk] !== payload.old[pk]);
          break;
      }

      this.cache.set(cacheKey, newData);
      this._notify(cacheKey, newData);
    }
  }

  /**
   * Obtenir les données depuis le cache
   */
  getList(table, filter = null) {
    const cacheKey = this._getCacheKey(table, filter);
    return this.cache.get(cacheKey) || [];
  }

  /**
   * Obtenir un élément par ID depuis le cache
   */
  getById(table, id, pk = 'id') {
    // Chercher dans toutes les variantes de cache pour cette table
    for (const [cacheKey, data] of this.cache) {
      if (cacheKey.startsWith(`table:${table}:`)) {
        const item = data.find(item => item[pk] === id);
        if (item) return item;
      }
    }
    return null;
  }

  /**
   * Invalider le cache pour une table
   */
  async invalidateTable(table, filter = null) {
    const config = this.tableConfigs.get(table);
    if (!config) return;

    if (filter) {
      // Invalider seulement une variante
      await this._fetchAndCache(table, config, filter);
    } else {
      // Invalider toutes les variantes
      for (const filterKey of config.filters) {
        const f = filterKey === '__all__' ? null : filterKey;
        await this._fetchAndCache(table, config, f);
      }
    }
  }

  /**
   * Invalider tout le cache
   */
  async invalidateAll() {
    console.log('[RealtimeStore] Invalidation complète du cache');
    await this._refreshAllCachedData();
  }

  /**
   * Méthodes de cache direct (pour des données custom)
   */
  setCache(key, data) {
    this.cache.set(key, data);
    this._notify(key, data);
  }

  getCache(key) {
    return this.cache.get(key);
  }

  deleteCache(key) {
    this.cache.delete(key);
    this._notify(key, null);
  }

  /**
   * Obtenir les statistiques
   */
  getStats() {
    return {
      ...this.stats,
      cacheSize: this.cache.size,
      listenersCount: this.listeners.size,
      channelsCount: this.channels.size,
      tablesCount: this.tableConfigs.size,
      connected: this.connected
    };
  }

  /**
   * Nettoyage
   */
  async destroy() {
    console.log('[RealtimeStore] Destruction...');
    
    // Nettoyer les intervals
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
    }

    // Fermer tous les channels
    for (const [table, channel] of this.channels) {
      await supabase.removeChannel(channel);
    }

    // Nettoyer les données
    this.cache.clear();
    this.listeners.clear();
    this.channels.clear();
    this.tableConfigs.clear();
  }
}

// Instance singleton
export const realtimeStore = new RealtimeStore();

// Export pour debug
window.realtimeStore = realtimeStore;
