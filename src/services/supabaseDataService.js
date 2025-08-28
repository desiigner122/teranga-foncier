import { supabase } from '../lib/supabaseClient.js';

export class SupabaseDataService {
  static _eventRecentCache = new Map(); // key -> timestamp
  static _eventWindowMs = 5000; // 5s window for identical events
  static _eventMaxQueue = 200;
  static _configLoaded = false;

  /**
   * deleteParcel: Delete a parcel by ID (admin only, logs event)
   */
  static async deleteParcel(parcelId, actorUserId = null) {
    try {
      const { error } = await supabase
        .from('parcels')
        .delete()
        .eq('id', parcelId);
      if (error) throw error;
  await this.logEvent({ entityType: 'parcel', entityId: parcelId, eventType: 'parcel.deleted', actorUserId, data: {} });
      return true;
    } catch (e) {
      console.error('Erreur suppression parcelle:', e.message || e);
      throw e;
    }
  }
  static _eventRecentCache = new Map(); // key -> timestamp
  static _eventWindowMs = 5000; // 5s window for identical events
  static _eventMaxQueue = 200;
  static _configLoaded = false;

  static async _loadEventConfig() {
    try {
      const { data } = await supabase.from('feature_flags').select('key,audience,enabled').in('key',['events_antispam_window_ms']);
      if (data) {
        const row = data.find(r=>r.key==='events_antispam_window_ms' && r.enabled);
        if (row && row.audience && row.audience.value) {
          const v = parseInt(row.audience.value,10); if (!isNaN(v) && v>0 && v<60000) this._eventWindowMs = v;
        } else if (row && typeof row.audience === 'object') {
          // audience might be JSON object with value property
          const val = row.audience.value || row.audience.VAL || row.audience.ms;
          const v = parseInt(val,10); if(!isNaN(v) && v>0 && v<60000) this._eventWindowMs = v;
        }
      }
    } catch {/* silent */}
  }

  static _canSendEvent(signature){
    const now = Date.now();
    const last = this._eventRecentCache.get(signature);
    if (last && (now - last) < this._eventWindowMs) return false;
    this._eventRecentCache.set(signature, now);
    if (this._eventRecentCache.size > this._eventMaxQueue) {
      // prune oldest
      const entries = Array.from(this._eventRecentCache.entries()).sort((a,b)=>a[1]-b[1]);
      for (let i=0;i<entries.length- this._eventMaxQueue;i++) this._eventRecentCache.delete(entries[i][0]);
    }
    return true;
  }

  // Generic raw select helper (table: string, selectCols='*')
  static async supabaseRaw(table, selectCols='*') {
    try {
      const { data, error } = await supabase.from(table).select(selectCols);
      return { data, error };
    } catch (e) {
      return { data: null, error: e };
    }
  }
  
  // ============== ADMIN DASHBOARD METRICS ==============
  // Suppressed legacy getAdminDashboardMetrics (duplicate) – use unified implementation plus events table lookup.
  
  static async getUserRegistrationsByMonth() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('created_at');
        
      if (error) throw error;
      
      // Structurer les données par mois pour les 6 derniers mois
      const now = new Date();
      const monthsData = [];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleString('fr-FR', { month: 'short' });
        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
        
        const count = data.filter(user => {
          const userDate = new Date(user.created_at);
          return userDate.getFullYear() === date.getFullYear() && 
                 userDate.getMonth() === date.getMonth();
        }).length;
        
        monthsData.push({
          name: monthName,
          value: count
        });
      }
      
      return monthsData;
    } catch (error) {
      console.error('Erreur lors de la récupération des inscriptions par mois:', error);
      return [];
    }
  }
  
  static calculateMonthlySales(transactions) {
    try {
      // Structurer les données par mois pour les 6 derniers mois
      const now = new Date();
      const monthsData = [];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleString('fr-FR', { month: 'short' });
        
        const monthTransactions = transactions.filter(tx => {
          if (!tx.created_at) return false;
          const txDate = new Date(tx.created_at);
          return txDate.getFullYear() === date.getFullYear() && 
                 txDate.getMonth() === date.getMonth();
        });
        
        const amount = monthTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
        
        monthsData.push({
          name: monthName,
          amount: amount
        });
      }
      
      return monthsData;
    } catch (error) {
      console.error('Erreur lors du calcul des ventes mensuelles:', error);
      return [];
    }
  }
  
  static calculateParcelStatus(parcels) {
    try {
      // Compter les parcelles par statut
      const statusCount = {};
      
      parcels.forEach(parcel => {
        const status = parcel.status || 'Non défini';
        statusCount[status] = (statusCount[status] || 0) + 1;
      });
      
      // Convertir en format pour graphique
      return Object.entries(statusCount).map(([name, value]) => ({
        name,
        value,
        unit: 'parcelles'
      }));
    } catch (error) {
      console.error('Erreur lors du calcul des statuts de parcelles:', error);
      return [];
    }
  }
  
  static calculateRequestTypes(requests) {
    try {
      // Compter les demandes par type
      const typeCount = {};
      
      requests.forEach(request => {
        const type = request.type || 'Autre';
        typeCount[type] = (typeCount[type] || 0) + 1;
      });
      
      // Convertir en format pour graphique
      return Object.entries(typeCount).map(([name, value]) => ({
        name,
        value,
        unit: 'demandes'
      }));
    } catch (error) {
      console.error('Erreur lors du calcul des types de demandes:', error);
      return [];
    }
  }
  
  static calculateActorStats(users, parcels, requests, transactions) {
    try {
      // Calculer les statistiques par type d'acteur
      const vendeurs = users.filter(user => user.type?.toLowerCase() === 'vendeur');
      const particuliers = users.filter(user => user.type?.toLowerCase() === 'particulier');
      const mairies = users.filter(user => user.type?.toLowerCase() === 'mairie');
      const banques = users.filter(user => user.type?.toLowerCase() === 'banque');
      const notaires = users.filter(user => user.type?.toLowerCase() === 'notaire');
      const agents = users.filter(user => user.type?.toLowerCase() === 'agent');
      
      return {
        vendeur: {
          parcellesListees: parcels.filter(p => vendeurs.some(v => v.id === p.owner_id)).length,
          transactionsReussies: transactions.filter(t => vendeurs.some(v => v.id === t.vendor_id)).length
        },
        particulier: {
          demandesSoumises: requests.filter(r => particuliers.some(p => p.id === r.requester_id)).length,
          acquisitions: transactions.filter(t => particuliers.some(p => p.id === t.buyer_id)).length
        },
        mairie: {
          parcellesCommunales: parcels.filter(p => mairies.some(m => m.id === p.owner_id)).length,
          demandesTraitees: requests.filter(r => mairies.some(m => m.id === r.recipient_id) && r.status === 'completed').length
        },
        banque: {
          pretsAccordes: transactions.filter(t => t.funding_source === 'loan').length,
          garantiesEvaluees: parcels.filter(p => p.has_loan_guarantee).length
        },
        notaire: {
          dossiersTraites: transactions.filter(t => t.notary_id).length,
          actesAuthentifies: transactions.filter(t => t.notary_id && t.status === 'completed').length
        },
        agent: {
          clientsAssignes: particuliers.filter(p => p.agent_id).length,
          visitesPlanifiees: requests.filter(r => r.type === 'visit' && agents.some(a => a.id === r.assigned_to)).length
        }
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques par acteur:', error);
      return {
        vendeur: {},
        particulier: {},
        mairie: {},
        banque: {},
        notaire: {},
        agent: {}
      };
    }
  }
  
  static async getUpcomingEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(3);
        
      if (error) throw error;
      
      return (data || []).map(event => ({
        title: event.title,
        date: event.event_date.split('T')[0],
        time: event.event_time || '09:00'
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des événements à venir:', error);
      return [];
    }
  }
  
  static async getAllTransactions() {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*');
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
      return [];
    }
  }
  
  // ============== ROLES & PERMISSIONS (NEW) ==============
  static async listRoles() {
    try {
      const { data, error } = await supabase.from('roles').select('*').order('key');
      if (error) throw error; return data || [];
    } catch (e) { console.warn('listRoles failed:', e.message||e); return []; }
  }

  static async deleteRole(roleKey) {
    // Only allow deletion of non-system roles (expects column is_system or is_protected)
    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('key', roleKey)
        .neq('is_system', true)
        .neq('is_protected', true);
      if (error) throw error;
      return true;
    } catch (e) { console.error('deleteRole failed:', e.message||e); throw e; }
  }

  static async listUserRoles(userId) {
    // Prefer view v_user_roles if available
    try {
      const { data, error } = await supabase.from('v_user_roles').select('*').eq('user_id', userId);
      if (error) throw error; return data || [];
    } catch (e) {
      // Fallback direct join style if view missing
      try {
        const { data, error } = await supabase.from('user_roles').select('role_id, roles:role_id(key,label,description,feature_flags,default_permissions)').eq('user_id', userId);
        if (error) throw error;
        return (data||[]).map(r => ({ user_id: userId, role_key: r.roles?.key, label: r.roles?.label, feature_flags: r.roles?.feature_flags, default_permissions: r.roles?.default_permissions }));
      } catch (err) { console.warn('listUserRoles fallback failed:', err.message||err); return []; }
    }
  }

  static async listAllUserRoles() {
    // Retrieve all user-role associations
    try {
      const { data, error } = await supabase.from('v_user_roles').select('*');
      if (error) throw error; return data || [];
    } catch (e) {
      try {
        const { data, error } = await supabase.from('user_roles').select('user_id, role_id, roles:role_id(key,label,description,feature_flags,default_permissions)');
        if (error) throw error;
        return (data||[]).map(r => ({ user_id: r.user_id, role_key: r.roles?.key, label: r.roles?.label, feature_flags: r.roles?.feature_flags, default_permissions: r.roles?.default_permissions }));
      } catch (err) { console.warn('listAllUserRoles fallback failed:', err.message||err); return []; }
    }
  }

  static async createRole({ key, label, description=null, defaultPermissions=[], featureFlags=[] }) {
    try {
      const { data, error } = await supabase.rpc('create_role', {
        p_key: key,
        p_label: label,
        p_description: description,
        p_default_permissions: defaultPermissions,
        p_feature_flags: featureFlags
      });
      if (error) throw error; return data;
    } catch (e) { console.error('createRole failed:', e.message||e); throw e; }
  }

  static async assignRole(userId, roleKey) {
    try { const { error } = await supabase.rpc('assign_role', { p_user_id: userId, p_role_key: roleKey }); if (error) throw error; return true; }
    catch (e) { console.error('assignRole failed:', e.message||e); throw e; }
  }

  static async revokeRole(userId, roleKey) {
    try { const { error } = await supabase.rpc('revoke_role', { p_user_id: userId, p_role_key: roleKey }); if (error) throw error; return true; }
    catch (e) { console.error('revokeRole failed:', e.message||e); throw e; }
  }

  static async getEffectivePermissions(userId) {
    try { const { data, error } = await supabase.rpc('get_effective_permissions', { p_user: userId }); if (error) throw error; return data || []; }
    catch (e) { console.warn('getEffectivePermissions failed:', e.message||e); return []; }
  }
  
  // ============== USERS ==============
  static async getUsers(limit = null) {
    let query = supabase
      .from('users')
      .select('*')
      .eq('is_active', true)
  .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    if (limit) query = query.limit(limit);
    
    const { data, error } = await query;
    if (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return [];
    }
    return data || [];
  }

  /**
   * getAllUsers (legacy compatibility)
   * Fournit une API plus flexible attendue par certains composants minifiés (ex: Ge.getAllUsers)
   * Options:
   *  - select: colonnes (par défaut id,email,full_name,type,role,created_at,is_active,verification_status)
   *  - limit / offset pagination
   *  - search: filtre sur email / full_name (ilike)
   *  - types: array de types à filtrer
   *  - activeOnly: filtre is_active=true
   * Retourne { data, count }
   */
  static async getAllUsers({
    select = 'id,email,full_name,type,role,created_at,is_active,verification_status',
    limit = 200,
    offset = 0,
    search = null,
    types = null,
    activeOnly = false
  } = {}) {
    try {
      if (limit > 1000) limit = 1000; // garde-fou
      let query = supabase
        .from('users')
        .select(select, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (activeOnly) query = query.eq('is_active', true).is('deleted_at', null);
      if (types && Array.isArray(types) && types.length) query = query.in('type', types);
      if (search && search.trim()) {
        const s = search.trim();
        query = query.or(`full_name.ilike.%${s}%,email.ilike.%${s}%`);
      }
      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data || [], count: count || 0 };
    } catch (e) {
      console.error('getAllUsers failed:', e.message || e);
      return { data: [], count: 0 };
    }
  }

  /**
   * getUserTypeCounts : renvoie un objet mappant chaque type -> nombre d'utilisateurs
   */
  static async getUserTypeCounts() {
    try {
      const { data, error } = await supabase.from('users').select('type');
      if (error) throw error;
      const counts = {};
      (data || []).forEach(u => {
        const t = u.type || 'Inconnu';
        counts[t] = (counts[t] || 0) + 1;
      });
      return counts;
    } catch (e) {
      console.error('getUserTypeCounts failed:', e.message || e);
      return {};
    }
  }

  // ============== GEO & REFERENCE DATA (NEW) ==============
  static async listRegions() {
    try {
      const { data, error } = await supabase.from('regions').select('id, name, code').order('name');
      if (error) throw error; return data || [];
    } catch (e) { console.warn('listRegions fallback (table missing?)', e.message||e); return []; }
  }
  static async listDepartmentsByRegion(regionId) {
    if (!regionId) return [];
    try {
      const { data, error } = await supabase.from('departments').select('id, name, code').eq('region_id', regionId).order('name');
      if (error) throw error; return data || [];
    } catch (e) { console.warn('listDepartmentsByRegion fallback', e.message||e); return []; }
  }
  static async listCommunesByDepartment(departmentId) {
    if (!departmentId) return [];
    try {
      const { data, error } = await supabase.from('communes').select('id, name, code').eq('department_id', departmentId).order('name');
      if (error) throw error; return data || [];
    } catch (e) { console.warn('listCommunesByDepartment fallback', e.message||e); return []; }
  }
  static async listBanks() {
    // Distinct institution_profiles of type Banque
    try {
      const { data, error } = await supabase.from('institution_profiles').select('name').eq('institution_type','Banque');
      if (error) throw error; return Array.from(new Set((data||[]).map(r=>r.name).filter(Boolean))).sort();
    } catch (e) { console.warn('listBanks fallback', e.message||e); return []; }
  }
  // listPaymentMethods & listMobileMoneyProviders canonical implementations defined later (duplicates removed)
  
  // Dynamic payment methods (optional table-backed). Fallback to defaults if table absent.
  static async listPaymentMethods() {
    try {
      const { data, error } = await supabase.from('payment_methods').select('id, name, icon, providers');
      if (error) throw error;
      // providers expected as json/text[]
      return (data||[]).map(m => ({
        id: m.id,
        name: m.name,
        icon: m.icon || null,
        providers: Array.isArray(m.providers) ? m.providers : (m.providers ? [m.providers] : [])
      }));
    } catch (e) {
      // fallback static minimal set
      return [
        { id: 'mobile', name: 'Mobile Money', icon: 'Smartphone', providers: ['Wave','Orange Money'] },
        { id: 'transfer', name: 'Virement Bancaire', icon: 'Landmark', providers: [] },
        { id: 'check', name: 'Chèque de banque', icon: 'FileCheck2', providers: [] }
      ];
    }
  }

  // Mobile money providers dedicated helper (optional separate table)
  static async listMobileMoneyProviders() {
    try {
      const { data, error } = await supabase.from('mobile_money_providers').select('name').eq('enabled', true).order('name');
      if (error) throw error; return (data||[]).map(r=>r.name);
    } catch (e) {
      return ['Wave','Orange Money'];
    }
  }
  static async listNotaireSpecialities() {
    // Attempt dedicated table notaire_specialities then fallback to institution_profiles metadata
    try {
      const { data, error } = await supabase.from('notaire_specialities').select('label');
      if (!error && data) return data.map(r=>r.label).filter(Boolean).sort();
    } catch {/* ignore */}
    try {
      const { data, error } = await supabase.from('institution_profiles').select('metadata').eq('institution_type','Notaire');
      if (error) throw error;
      const vals = (data||[]).map(r=> (r.metadata && (r.metadata.notaire_speciality || r.metadata.speciality)) ).filter(Boolean);
      return Array.from(new Set(vals)).sort();
    } catch (e) { console.warn('listNotaireSpecialities fallback', e.message||e); return []; }
  }

  static async getUserById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
    return data;
  }

  static async getUsersByRole(role) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`Erreur lors de la récupération des utilisateurs ${role}:`, error);
      return [];
    }
    return data || [];
  }

  // ============== PARCELS ==============
  static async getParcels(limit = null) {
    let query = supabase
      .from('parcels')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (limit) query = query.limit(limit);
    
    const { data, error } = await query;
    if (error) {
      console.error('Erreur lors de la récupération des parcelles:', error);
      return [];
    }
    return data || [];
  }

  // Compatibility alias used by some legacy admin code
  static async getAllParcels() { return this.getParcels(); }

  static async getParcelById(id) {
    const { data, error } = await supabase
      .from('parcels')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Erreur lors de la récupération de la parcelle:', error);
      return null;
    }
    return data;
  }

  static async getParcelsByOwner(ownerId) {
    const { data, error } = await supabase
      .from('parcels')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des parcelles du propriétaire:', error);
      return [];
    }
    return data || [];
  }

  // ============== PARCELS (EXTENDED HELPERS) ==============
  static async searchParcels({ status = null, zone = null, type = null, minPrice = null, maxPrice = null, text = null, limit = 50 } = {}) {
    try {
      let query = supabase.from('parcels').select('*').order('created_at', { ascending: false }).limit(limit);
      if (status) query = query.eq('status', status);
      if (zone) query = query.ilike('zone', zone);
      if (type) query = query.eq('type', type);
      if (minPrice) query = query.gte('price', minPrice);
      if (maxPrice) query = query.lte('price', maxPrice);
      if (text) {
        // Basic ilike OR search (adjust depending on Postgres config / extensions)
        query = query.or(`reference.ilike.%${text}%,location_name.ilike.%${text}%,description.ilike.%${text}%`);
      }
      const { data, error } = await query;
      if (error) { console.error('Erreur recherche parcelles:', error); return []; }
      return data || [];
    } catch (e) { console.error('Erreur inattendue recherche parcelles:', e); return []; }
  }

  static async getFeaturedParcels(limit = 6) {
    const { data, error } = await supabase
      .from('parcels')
      .select('*')
      .eq('is_featured', true)
      .order('updated_at', { ascending: false })
      .limit(limit);
    if (error) { console.error('Erreur featured parcels:', error); return []; }
    return data || [];
  }

  static async getParcelsByZone(zone, limit = 12) {
    const { data, error } = await supabase
      .from('parcels')
      .select('*')
      .ilike('zone', zone)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) { console.error('Erreur parcels by zone:', error); return []; }
    return data || [];
  }

  // ============== REQUESTS ==============
  static async getRequests(limit = null) {
    let query = supabase
      .from('requests')
      .select(`
        *,
        users:user_id (
          id, full_name, email, phone
        )
      `)
      .order('created_at', { ascending: false });
    
    if (limit) query = query.limit(limit);
    
    const { data, error } = await query;
    if (error) {
      console.error('Erreur lors de la récupération des demandes:', error);
      return [];
    }
    return data || [];
  }

  static async getRequestById(id) {
    const { data, error } = await supabase
      .from('requests')
      .select(`
        *,
        users:user_id (
          id, full_name, email, phone
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Erreur lors de la récupération de la demande:', error);
      return null;
    }
    return data;
  }

  static async getRequestsByStatus(status) {
    const { data, error } = await supabase
      .from('requests')
      .select(`
        *,
        users:user_id (
          id, full_name, email, phone
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`Erreur lors de la récupération des demandes ${status}:`, error);
      return [];
    }
    return data || [];
  }

  static async getRequestsByUser(userId) {
    const { data, error } = await supabase
      .from('requests')
      .select(`
        *,
        users:user_id (
          id, full_name, email, phone
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des demandes de l\'utilisateur:', error);
      return [];
    }
    return data || [];
  }

  // ============== TRANSACTIONS ==============
  static async getTransactions(limit = null) {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        users:user_id (
          id, full_name, email
        )
      `)
      .order('created_at', { ascending: false });
    
    if (limit) query = query.limit(limit);
    
    const { data, error } = await query;
    if (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
      return [];
    }
    return data || [];
  }

  static async getTransactionsByUser(userId) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        users:user_id (
          id, full_name, email
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des transactions de l\'utilisateur:', error);
      return [];
    }
    return data || [];
  }

  static async getTransactionById(id) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error; return data;
    } catch (e) { console.error('getTransactionById failed:', e.message||e); return null; }
  }

  static async payTransaction(transactionId, actorUserId, method) {
    try {
      const { data, error } = await supabase.rpc('pay_transaction', {
        p_transaction_id: transactionId,
        p_actor: actorUserId,
        p_method: method
      });
      if (error) throw error; return data;
    } catch (e) { console.error('payTransaction failed:', e.message||e); throw e; }
  }

  // ============== BLOG POSTS ==============
  static async getBlogPosts(limit = null) {
    let query = supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    
    if (limit) query = query.limit(limit);
    
    const { data, error } = await query;
    if (error) {
      console.error('Erreur lors de la récupération des articles de blog:', error);
      return [];
    }
    return data || [];
  }

  static async getBlogPostById(id) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Erreur lors de la récupération de l\'article de blog:', error);
      return null;
    }
    return data;
  }

  // ============== ANALYTICS (VIEWS & INQUIRIES) ==============
  static async logParcelView(parcelId, viewerId, metadata={}) {
    try {
      if (!parcelId) return null;
      const payload = { parcel_id: parcelId, viewer_id: viewerId||null, metadata };
      const { error } = await supabase.from('parcel_views').insert([payload]);
      if (error) throw error;
      return true;
    } catch (e) { console.warn('logParcelView failed', e.message||e); return false; }
  }
  static async createParcelInquiry({ parcelId, inquirerId, inquiryType='info', message='', metadata={} }) {
    try {
      const { data, error } = await supabase.from('parcel_inquiries')
        .insert([{ parcel_id: parcelId, inquirer_id: inquirerId, inquiry_type: inquiryType, message, metadata }])
        .select()
        .single();
      if (error) throw error;
      this.logEvent({ entityType:'parcel', entityId:parcelId, eventType:'parcel.inquiry', actorUserId:inquirerId, data:{ inquiryType } });
      return data;
    } catch (e) { console.error('createParcelInquiry failed', e.message||e); throw e; }
  }
  static async listParcelInquiries(parcelId, limit=50) {
    try {
      const { data, error } = await supabase.from('parcel_inquiries')
        .select('*')
        .eq('parcel_id', parcelId)
        .order('created_at', { ascending:false })
        .limit(limit);
      if (error) throw error; return data||[];
    } catch (e) { console.warn('listParcelInquiries failed', e.message||e); return []; }
  }

  // ============== USER ACTIVITIES ==============
  static async recordUserActivity({ userId, activityType, entityType=null, entityId=null, description=null, metadata={} }) {
    if (!userId || !activityType) return false;
    try {
      const { error } = await supabase.from('user_activities').insert([{ user_id:userId, activity_type:activityType, entity_type:entityType, entity_id:entityId, description, metadata }]);
      if (error) throw error; return true;
    } catch (e) { console.warn('recordUserActivity failed', e.message||e); return false; }
  }
  static async listUserActivities(userId, limit=50) {
    try {
      const { data, error } = await supabase.from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending:false })
        .limit(limit);
      if (error) throw error; return data||[];
    } catch (e) { console.warn('listUserActivities failed', e.message||e); return []; }
  }

  // ============== SIMPLE MESSAGING (SUPABASE BACKEND) ==============
  static async createConversation({ subject, creatorId, participantIds=[] }) {
    try {
      const { data: conv, error } = await supabase.from('conversations')
        .insert([{ subject, created_by: creatorId }])
        .select()
        .single();
      if (error) throw error;
      const participants = Array.from(new Set([creatorId, ...participantIds].filter(Boolean))).map(uid=>({ conversation_id: conv.id, user_id: uid }));
      if (participants.length) await supabase.from('conversation_participants').insert(participants);
      this.logEvent({ entityType:'conversation', entityId:conv.id, eventType:'conversation.created', actorUserId:creatorId, data:{ subject } });
      return conv;
    } catch (e) { console.error('createConversation failed', e.message||e); throw e; }
  }
  static async sendMessage({ conversationId, senderId, content, attachments=[] }) {
    try {
      const { data, error } = await supabase.from('messages')
        .insert([{ conversation_id: conversationId, sender_id: senderId, content, attachments }])
        .select()
        .single();
      if (error) throw error;
      this.logEvent({ entityType:'conversation', entityId:conversationId, eventType:'message.sent', actorUserId:senderId, data:{ length: content?.length } });
      return data;
    } catch (e) { console.error('sendMessage failed', e.message||e); throw e; }
  }
  static async listConversationMessages(conversationId, limit=200) {
    try {
      const { data, error } = await supabase.from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending:true })
        .limit(limit);
      if (error) throw error; return data||[];
    } catch (e) { console.warn('listConversationMessages failed', e.message||e); return []; }
  }
  static async markConversationMessagesRead({ conversationId, userId, messageIds=[] }) {
    if (!conversationId || !userId) return 0;
    try {
      // If specific messageIds provided, insert those; else bulk insert unread ones
      if (messageIds.length) {
        const rows = messageIds.map(id => ({ message_id:id, user_id:userId }));
        const { error } = await supabase.from('message_reads').insert(rows, { upsert: true }).select();
        if (error && !String(error.message||'').includes('duplicate')) throw error;
        return messageIds.length;
      }
      // Bulk: fetch unread messages ids for user (messages not authored by user and not already in message_reads)
      const { data: unread, error: unreadErr } = await supabase.rpc('list_unread_message_ids', { p_conversation_id: conversationId, p_user_id: userId });
      if (unreadErr) {
        // fallback manual query (less efficient)
        const { data: msgs } = await supabase.from('messages').select('id,sender_id').eq('conversation_id', conversationId).neq('sender_id', userId);
        const { data: reads } = await supabase.from('message_reads').select('message_id').eq('user_id', userId);
        const readSet = new Set((reads||[]).map(r=>r.message_id));
        const candidates = (msgs||[]).filter(m=>!readSet.has(m.id)).map(m=>m.id);
        if (!candidates.length) return 0;
        const rows = candidates.map(id=>({ message_id:id, user_id:userId }));
        await supabase.from('message_reads').insert(rows).select();
        return candidates.length;
      }
      if (!unread || !unread.length) return 0;
      const rows = unread.map(id=>({ message_id:id, user_id:userId }));
      await supabase.from('message_reads').insert(rows).select();
      return unread.length;
    } catch (e) { console.warn('markConversationMessagesRead failed', e.message||e); return 0; }
  }
  static async getConversationUnreadCount({ conversationId, userId }) {
    if (!conversationId || !userId) return 0;
    try {
      const { data, error } = await supabase.rpc('count_unread_messages', { p_conversation_id: conversationId, p_user_id: userId });
      if (!error && typeof data === 'number') return data;
    } catch {/* ignore */}
    try {
      // fallback manual
      const { data: msgs } = await supabase.from('messages').select('id,sender_id').eq('conversation_id', conversationId).neq('sender_id', userId);
      const { data: reads } = await supabase.from('message_reads').select('message_id').eq('user_id', userId).in('message_id', (msgs||[]).map(m=>m.id));
      const readSet = new Set((reads||[]).map(r=>r.message_id));
      return (msgs||[]).filter(m=>!readSet.has(m.id)).length;
    } catch (e) { console.warn('getConversationUnreadCount failed', e.message||e); return 0; }
  }
  static async listUserConversationsWithUnread(userId, limit=50) {
  // Now RPC already returns unread_count
  return this.listUserConversations(userId, limit);
  }
  static async listUserConversations(userId, limit=50) {
    try {
      const { data, error } = await supabase.rpc('list_user_conversations', { p_user_id: userId });
      if (!error && data) return data;
    } catch(e) {/* ignore */}
    try {
      // Fallback manual join if RPC absent
      const { data: convs, error } = await supabase.from('conversation_participants')
        .select('conversation_id, conversations:conversation_id(*)')
        .eq('user_id', userId)
        .limit(limit);
      if (error) throw error;
      return (convs||[]).map(r=>r.conversations).filter(Boolean);
    } catch (e) { console.warn('listUserConversations failed', e.message||e); return []; }
  }

  // ============== NOTIFICATIONS ==============
  static async createNotification({ userId, type, title, body, data={} }) {
    if (!userId) return null;
    try {
      const { data: row, error } = await supabase.from('notifications')
        .insert([{ user_id:userId, type, title, body, data }])
        .select()
        .single();
      if (error) throw error;
      return row;
    } catch (e) { console.error('createNotification failed', e.message||e); return null; }
  }
  static async listNotifications(userId, { unreadOnly=false, limit=50 }={}) {
    try {
      let query = supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending:false }).limit(limit);
      if (unreadOnly) query = query.eq('read', false);
      const { data, error } = await query; if (error) throw error; return data||[];
    } catch (e) { console.warn('listNotifications failed', e.message||e); return []; }
  }
  static async markNotificationRead(id) {
    try { await supabase.from('notifications').update({ read:true, read_at:new Date().toISOString() }).eq('id', id); return true; }
    catch(e){ return false; }
  }

  // ============== DOCUMENTS ==============
  static async getDocuments(limit = null) {
    let query = supabase
      .from('documents')
      .select(`
        *,
        users:user_id (
          id, full_name, email
        )
      `)
      .order('created_at', { ascending: false });
    
    if (limit) query = query.limit(limit);
    
    const { data, error } = await query;
    if (error) {
      console.error('Erreur lors de la récupération des documents:', error);
      return [];
    }
    return data || [];
  }

  static async getDocumentsByUser(userId) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des documents de l\'utilisateur:', error);
      return [];
    }
    return data || [];
  }

  // ============== NOTIFICATIONS ==============
  static async getNotifications(userId = null, limit = null) {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (userId) query = query.eq('user_id', userId);
    if (limit) query = query.limit(limit);
    
    const { data, error } = await query;
    if (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      return [];
    }
    return data || [];
  }

  // ============== STATISTICS ==============
  static async getDashboardStats() {
    try {
      const [users, parcels, requests, transactions] = await Promise.all([
        this.getUsers(),
        this.getParcels(),
        this.getRequests(),
        this.getTransactions()
      ]);

      const stats = {
        totalUsers: users.length,
        totalParcels: parcels.length,
        totalRequests: requests.length,
        totalTransactions: transactions.length,
        
        // Statistiques par statut
        activeUsers: users.filter(u => u.is_active).length,
        verifiedUsers: users.filter(u => u.verification_status === 'verified').length,
        pendingRequests: requests.filter(r => r.status === 'pending').length,
        approvedRequests: requests.filter(r => r.status === 'approved').length,
        completedTransactions: transactions.filter(t => t.status === 'completed').length,
        
        // Statistiques par role
        usersByRole: users.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {}),

        // Statistiques par type de demande
        requestsByType: requests.reduce((acc, request) => {
          acc[request.request_type] = (acc[request.request_type] || 0) + 1;
          return acc;
        }, {}),

        // Données récentes
        recentUsers: users.slice(0, 5),
        recentRequests: requests.slice(0, 5),
        recentTransactions: transactions.slice(0, 5)
      };

      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        totalUsers: 0,
        totalParcels: 0,
        totalRequests: 0,
        totalTransactions: 0
      };
    }
  }

  // ============== CREATE OPERATIONS ==============
  static async createUser(userData) {
    try {
      // Normaliser le type d'utilisateur (première lettre en majuscule)
      const normalizedType = userData.type.charAt(0).toUpperCase() + userData.type.slice(1).toLowerCase();
      userData.type = normalizedType;
      
      // 1. Créer l'utilisateur dans Auth avec mot de passe
      let { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: { data: { full_name: userData.full_name, type: normalizedType, role: userData.role || 'user' } }
      });

      // Fallback edge function si signUp échoue (ex: rate limit, policy)
      if (authError || !authData?.user) {
        console.warn('SignUp direct échoué, tentative via edge function create-user-with-password:', authError?.message);
        try {
          const resp = await fetch('/functions/v1/create-user-with-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: userData.email,
              password: userData.password,
              full_name: userData.full_name,
              type: normalizedType,
              role: userData.role || 'user'
            })
          });
          const edgeJson = await resp.json().catch(()=>({}));
          if (!resp.ok || edgeJson.error) {
            throw new Error(edgeJson.error || `Edge function status ${resp.status}`);
          }
          authData = { user: { id: edgeJson.user?.id, email: userData.email } };
        } catch (edgeErr) {
          console.error('Fallback edge function échoué:', edgeErr);
          throw new Error(`Erreur d'authentification: ${authError?.message || edgeErr.message}`);
        }
      }

      // 2. Créer le profil complet dans la table users
      const userProfile = {
        id: authData.user.id,
        email: userData.email,
        full_name: userData.full_name,
        phone: userData.phone,
        type: normalizedType,
        role: userData.role || 'user',
        metadata: {
          ...userData.metadata,
          creation_method: 'admin_complete',
          password_generated: true,
          created_by: 'admin'
        },
        verification_status: 'verified', // Les utilisateurs créés par admin sont pré-vérifiés
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .upsert(userProfile, { onConflict: 'id' })
        .select()
        .single();

      if (profileError) {
        console.error('Erreur création profil:', profileError);
        // Si le profil échoue, on essaie de nettoyer l'auth user
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (cleanupError) {
          console.warn('Impossible de nettoyer l\'utilisateur auth:', cleanupError);
        }
        throw new Error(`Erreur de profil: ${profileError.message}`);
      }

      // 3. Créer une notification de bienvenue
      try {
        await this.createNotification({
          user_id: authData.user.id,
          title: `Bienvenue sur Teranga Foncier`,
          body: `Votre compte ${userData.type} a été créé avec succès. Vous pouvez maintenant vous connecter et accéder à toutes les fonctionnalités.`,
          type: 'welcome',
          data: {
            user_type: userData.type,
            creation_source: 'admin',
            login_email: userData.email
          }
        });
      } catch (notifError) {
        console.warn('Notification de bienvenue échouée:', notifError);
        // Non bloquant
      }

      return {
        ...profileData,
        auth_user: authData.user,
        temporary_password: userData.password // Pour affichage à l'admin
      };
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      // Journaliser l'échec de création utilisateur
      try {
        await this.logEvent({
          entityType: 'user',
          entityId: null,
          eventType: 'user.create_failed',
          actorUserId: null,
            importance: 80,
          source: 'admin_dashboard',
          data: { email: userData?.email, type: userData?.type, error: error.message }
        });
      } catch {/* ignore */}
      throw error;
    }
  }

  /**
   * Créer une institution complète (banque ou mairie) avec authentification
   */
  static async createInstitutionUser(institutionData) {
    try {
      // Normaliser le type d'institution (première lettre en majuscule)
      const normalizedType = institutionData.type.charAt(0).toUpperCase() + institutionData.type.slice(1).toLowerCase();
      institutionData.type = normalizedType;
      
      // 1. Créer l'utilisateur dans Auth avec mot de passe
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: institutionData.email,
        password: institutionData.password,
        options: {
          data: {
            full_name: institutionData.full_name,
            type: normalizedType,
            role: institutionData.role || 'institution'
          }
        }
      });

      if (authError) {
        console.error('Erreur création Auth:', authError);
        throw new Error(`Erreur d'authentification: ${authError.message}`);
      }

      // 2. Créer le profil complet dans la table users
      const userProfile = {
        id: authData.user.id,
        email: institutionData.email,
        full_name: institutionData.full_name,
        phone: institutionData.phone,
        type: normalizedType,
        role: institutionData.role || 'institution',
        metadata: {
          ...institutionData.metadata,
          location: institutionData.location || {},
          creation_method: 'admin_complete',
          password_generated: true,
          institution_verified: true,
          created_by: 'admin'
        },
        verification_status: 'verified', // Les institutions créées par admin sont pré-vérifiées
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .upsert(userProfile, { onConflict: 'id' })
        .select()
        .single();

      if (profileError) {
        console.error('Erreur création profil:', profileError);
        // Si le profil échoue, on essaie de nettoyer l'auth user
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (cleanupError) {
          console.warn('Impossible de nettoyer l\'utilisateur auth:', cleanupError);
        }
        throw new Error(`Erreur de profil: ${profileError.message}`);
      }

      // 3. Créer une notification de bienvenue
      try {
        await this.createNotification({
          user_id: authData.user.id,
          title: `Bienvenue sur Teranga Foncier`,
          body: `Votre compte ${institutionData.type} a été créé avec succès. Vous pouvez maintenant vous connecter et accéder à toutes les fonctionnalités.`,
          type: 'institution_welcome',
          data: {
            institution_type: institutionData.type,
            creation_source: 'admin',
            login_email: institutionData.email
          }
        });
      } catch (notifError) {
        console.warn('Notification de bienvenue échouée:', notifError);
        // Non bloquant
      }

      // 4. Enregistrer un événement de création d'institution
      try {
        await this.logEvent('institution_created', {
          institution_id: authData.user.id,
          institution_type: institutionData.type,
          institution_name: institutionData.full_name,
          location: institutionData.location,
          created_by: 'admin',
          services_count: institutionData.metadata.services?.length || institutionData.metadata.services_offered?.length || 0
        });
      } catch (eventError) {
        console.warn('Log événement échoué:', eventError);
        // Non bloquant
      }

      return {
        ...profileData,
        auth_user: authData.user,
        temporary_password: institutionData.password // Pour affichage à l'admin
      };

    } catch (error) {
      console.error('Erreur création institution complète:', error);
      throw error;
    }
  }

  /**
   * ensureUserProfile: guarantee a row exists in users table for given auth user.
   * Tries fetch by id, then upsert minimal profile if missing.
   * Returns profile object or null.
   */
  static async ensureUserProfile(authUser) {
    if (!authUser?.id || !authUser?.email) return null;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();
      if (error) throw error;
      if (data) return data;
    } catch (e) {
      // non fatal
      console.warn('ensureUserProfile fetch warning:', e.message||e);
    }
    try {
      const profile = {
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || authUser.email,
        type: authUser.user_metadata?.type || authUser.user_metadata?.role_type || 'Particulier',
        role: authUser.user_metadata?.role || 'user',
        verification_status: 'not_verified',
        created_at: authUser.created_at,
        updated_at: new Date().toISOString()
      };
      const { data, error } = await supabase
        .from('users')
        .upsert(profile, { onConflict: 'id', ignoreDuplicates: false })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.error('ensureUserProfile upsert failed:', e.message||e);
      return null;
    }
  }

  // ============== INSTITUTION PROFILES (NEW) ==============
  // Requires table institution_profiles (see database/institution_profiles_schema.sql)
  static async createInstitutionProfile(profileData) {
    try {
      const { data, error } = await supabase
        .from('institution_profiles')
        .insert([profileData])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn('Institution profile creation skipped/failed (table missing?)', e.message || e);
      return null;
    }
  }

  // Placeholder for calling an Edge Function that sends an auth invitation
  static async sendAuthInvitation(email, role='user') {
    try {
      const endpoint = `${import.meta.env.VITE_EDGE_BASE_URL || ''}/invite`; // Configure in env
      if (!endpoint) throw new Error('EDGE endpoint non configuré');
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      });
      if (!res.ok) throw new Error('Échec envoi invitation');
      return await res.json();
    } catch (e) {
      console.warn('sendAuthInvitation fallback (non bloquant):', e.message || e);
      return null;
    }
  }

  static async createRequest(requestData) {
    const { data, error } = await supabase
      .from('requests')
      .insert([requestData])
      .select()
      .single();
    if (error) {
      console.error('Erreur lors de la création de la demande:', error);
      throw error;
    }
    // Event instrumentation
    this.logEvent({ entityType:'request', entityId:data.id, eventType:'request.created', actorUserId:data.user_id, data:{ type:data.request_type, status:data.status } });
    return data;
  }

  static async createTransaction(transactionData) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transactionData])
      .select()
      .single();
    if (error) {
      console.error('Erreur lors de la création de la transaction:', error);
      throw error;
    }
    this.logEvent({ entityType:'transaction', entityId:data.id, eventType:'transaction.created', actorUserId:data.user_id || null, data:{ amount:data.amount, status:data.status } });
    return data;
  }

  // ============== VENDEUR (SELLER) OPERATIONS (NEW) ==============
  static async getVendeurProperties(ownerId) {
    try {
      const { data, error } = await supabase
        .from('parcels')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Erreur récupération biens vendeur:', e.message||e);
      return [];
    }
  }

  static async createProperty(propertyData) {
    try {
      const insert = { ...propertyData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      const { data, error } = await supabase
        .from('parcels')
        .insert([insert])
        .select()
        .single();
      if (error) throw error;
      this.logEvent({ entityType:'parcel', entityId:data.id, eventType:'parcel.created', actorUserId:data.owner_id, data:{ status:data.status, price:data.price } });
      return data;
    } catch (e) {
      console.error('Erreur création bien vendeur:', e.message||e);
      throw e;
    }
  }

  static async updateProperty(id, updates) {
    try {
      const { data, error } = await supabase
        .from('parcels')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      this.logEvent({ entityType:'parcel', entityId:id, eventType:'parcel.updated', actorUserId:data.owner_id, data:{ status:data.status, price:data.price } });
      return data;
    } catch (e) {
      console.error('Erreur mise à jour bien vendeur:', e.message||e);
      throw e;
    }
  }

  /**
   * updateParcel: legacy alias (certaines pages utilisaient updateParcel au lieu de updateProperty)
   */
  static async updateParcel(id, updates) {
    return this.updateProperty(id, updates);
  }

  // ============== AGENT OPERATIONS (NEW) ==============
  static async getAgentClients(agentId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, type, created_at')
        .eq('assigned_agent_id', agentId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Erreur récupération clients agent:', e.message||e);
      return [];
    }
  }

  static async getAgentProperties(agentId) {
    try {
      const { data, error } = await supabase
        .from('parcels')
        .select('*')
        .eq('assigned_agent_id', agentId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Erreur récupération propriétés agent:', e.message||e);
      return [];
    }
  }

  static async getAgentSales(agentId) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Erreur récupération ventes agent:', e.message||e);
      return [];
    }
  }

  static async getAgentAppointments(agentId) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('agent_id', agentId)
        .gte('date', new Date(Date.now() - 90*24*60*60*1000).toISOString())
        .order('date', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Erreur récupération rendez-vous agent:', e.message||e);
      return [];
    }
  }

  // ============== REQUEST ROUTING METHODS ==============
  
  /**
   * Récupère les utilisateurs par type (role) pour le routage des demandes
   */
  static async getUsersByType(userType) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, type, role')
        .eq('type', userType)
        .eq('is_active', true)
        .order('full_name');
      
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Erreur lors de la récupération des utilisateurs par type:', e);
      return [];
    }
  }

  /**
   * Récupère les parcelles appartenant à un propriétaire spécifique
   */
  static async getParcelsByOwner(ownerId) {
    try {
      const { data, error } = await supabase
        .from('parcels')
        .select('id, parcel_number, location, area_sqm, status')
        .eq('owner_id', ownerId)
        .eq('status', 'disponible')
        .order('parcel_number');
      
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Erreur lors de la récupération des parcelles par propriétaire:', e);
      return [];
    }
  }

  /**
   * Récupère les demandes destinées à un destinataire spécifique
   */
  static async getRequestsByRecipient(recipientId, recipientType) {
    try {
      let query = supabase
        .from('requests')
        .select(`
          *,
          users:user_id (
            id, full_name, email, phone
          )
        `)
        .eq('recipient_type', recipientType)
        .order('created_at', { ascending: false });

      // Filtrer par le champ approprié selon le type de destinataire
      if (recipientType === 'mairie') {
        query = query.eq('mairie_id', recipientId);
      } else if (recipientType === 'banque') {
        query = query.eq('banque_id', recipientId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Erreur lors de la récupération des demandes par destinataire:', e);
      return [];
    }
  }

  // ============== MUNICIPAL REQUESTS (NEW) ==============
  static _genMunicipalRef() {
    const ts = new Date();
    const pad = (n)=> String(n).padStart(2,'0');
    return `MR-${ts.getFullYear()}${pad(ts.getMonth()+1)}${pad(ts.getDate())}-${Math.random().toString(36).substring(2,7).toUpperCase()}`;
  }

  // ============== LISTING SUBMISSIONS (NEW) ==============
  static _genListingRef() {
    const ts = new Date();
    const pad = (n)=> String(n).padStart(2,'0');
    return `LS-${ts.getFullYear()}${pad(ts.getMonth()+1)}${pad(ts.getDate())}-${Math.random().toString(36).substring(2,7).toUpperCase()}`;
  }

  /**
   * Crée une demande municipale.
   * Assumptions: mairie_id pas encore résolu (null) – la mairie sera matchée plus tard via commune.
   * documentsPayload: { region, department, commune, area_sqm, message, document_ids, attachments_meta }
   */
  static async resolveMairieProfile({ commune, department=null, region=null }) {
    try {
      if (!commune) return null;
      const norm = (s)=> (s||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
      const communeNorm = norm(commune);
      const communeTokens = communeNorm.split(/[^a-z0-9]+/).filter(Boolean);
      // Tentative 1: match direct commune token
      let { data, error } = await supabase.from('profiles')
        .select('id, full_name, type')
        .eq('type','mairie')
        .ilike('full_name', `%${commune}%`)
        .limit(1);
      if (!error && data && data.length) return data[0].id;
      // Tentative 2: récupérer plusieurs mairies et faire matching côté client (normalisation)
      const { data: allMairies, error: allErr } = await supabase.from('profiles').select('id, full_name, type').eq('type','mairie').limit(200);
      if (allErr || !allMairies) return null;
      const scored = allMairies.map(m=>{
        const n = norm(m.full_name);
        let score = 0;
        if (n.includes(communeNorm)) score += 15;
        // token coverage
        const coverage = communeTokens.reduce((acc,t)=> acc + (n.includes(t)?1:0),0);
        score += coverage * 3;
        if (department && n.includes(norm(department))) score += 3;
        if (region && n.includes(norm(region))) score += 1;
        // Optional Levenshtein via server RPC (if function exists). We attempt gracefully.
        return { id:m.id, score };
      }).map(entry=>entry)
      .sort((a,b)=>b.score-a.score);
      // If multiple similar, keep highest; minimal threshold
      if (scored.length && scored[0].score >= 5) return scored[0].id;
      // Optional: attempt remote similarity RPC if available
      try {
        const { data: lev } = await supabase.rpc('levenshtein_best_mairie', { target: commune });
        if (lev && lev.id) return lev.id;
      } catch {/* ignore */}
      return null;
    } catch { return null; }
  }

  static async createMunicipalRequest({ requesterId, region, department, commune, requestType, areaSqm, message, documentIds = [], rawDocumentsMeta = [], mairieId = null, autoResolveMairie=true }) {
    try {
      const reference = this._genMunicipalRef();
      const documents = {
        region,
        department,
        commune,
        area_sqm: areaSqm,
        message,
        document_ids: documentIds,
        attachments_meta: rawDocumentsMeta
      };
      let finalMairieId = mairieId;
      if (!finalMairieId && autoResolveMairie) {
        finalMairieId = await this.resolveMairieProfile({ commune, department, region });
      }
      const payload = {
        reference,
        requester_id: requesterId,
        mairie_id: finalMairieId, // Peut rester null si non résolue
        parcel_id: null,
        request_type: requestType,
        status: 'Soumise',
        documents,
        priority: 'normal',
        estimated_processing_time: null
      };
      const { data, error } = await supabase
        .from('municipal_requests')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      if (data) {
        this.logEvent({ entityType:'municipal_request', entityId:data.id, eventType:'municipal_request.created', actorUserId: requesterId, data:{ region, department, commune, request_type: requestType, mairie_id: finalMairieId } });
        if (documentIds && documentIds.length) {
          this.logEvent({ entityType:'municipal_request', entityId:data.id, eventType:'municipal_request.documents_uploaded', actorUserId: requesterId, importance:0, source:'ui', data:{ count: documentIds.length, document_ids: documentIds } });
        }
      }
      return data;
    } catch (e) {
      console.error('Erreur création municipal_request:', e.message||e);
      throw e;
    }
  }

  /**
   * Enregistre une soumission d'annonce (étape initiale avant création réelle de parcelle).
   * Pour le moment, on ne dispose peut-être pas encore d'une table dédiée; on trace via events.
   * Returns a lightweight object { reference, loggedEvent }.
   */
  static async logListingSubmission({ userId=null, propertyType, surfaceArea, price, description, titleDeedNumber, documentsMeta=[], allRequiredProvided }) {
    try {
      const reference = this._genListingRef();
      const meta = { reference, property_type: propertyType, surface_area: surfaceArea, price, title_deed_number: titleDeedNumber, description, documents_meta: documentsMeta, all_required: allRequiredProvided };
      const ev = await this.logEvent({ entityType:'listing_submission', entityId: reference, eventType:'listing.submitted', actorUserId:userId, importance:1, source:'ui', data: meta });
      return { reference, loggedEvent: ev };
    } catch (e) {
      console.warn('logListingSubmission failed:', e.message||e);
      return { reference: null, loggedEvent: null };
    }
  }

  // ================== PARCEL SUBMISSIONS (real table workflow) ==================
  /**
   * createParcelSubmission: Insert a pending submission; requires table parcel_submissions(owner_id, reference, location, type, price, surface, status, documents, created_at, updated_at)
   * If the table is absent -> fallback to logListingSubmission and return fallback:true
   */
  static async createParcelSubmission({ ownerId, reference, location, type='terrain', price=null, surface=null, documents=[], description=null }) {
    try {
      const now = new Date().toISOString();
      const payload = {
        owner_id: ownerId,
        reference: reference || this._genListingRef(),
        location,
        type,
        price,
        surface,
        description,
        documents, // expected jsonb
        status: 'pending',
        created_at: now,
        updated_at: now
      };
      const { data, error } = await supabase.from('parcel_submissions').insert([payload]).select().single();
      if (error) throw error;
      this.logEvent({ entityType:'parcel_submission', entityId:data.id, eventType:'parcel_submission.created', actorUserId: ownerId, data:{ reference: data.reference, type, price, surface } });
      return { ...data, fallback:false };
    } catch (e) {
      console.warn('createParcelSubmission fallback -> events only:', e.message||e);
      const { reference } = await this.logListingSubmission({ userId: ownerId, propertyType:type, surfaceArea:surface, price, description, titleDeedNumber:null, documentsMeta:documents, allRequiredProvided:false });
      return { id: reference, reference, status:'pending', fallback:true };
    }
  }

  static async listParcelSubmissionsByOwner(ownerId, { status=null } = {}) {
    try {
      let query = supabase.from('parcel_submissions').select('*').eq('owner_id', ownerId).order('created_at', { ascending:false }).limit(100);
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (e) {
      // table inexistante -> pas d'erreur bloquante
      return [];
    }
  }

  static async listPendingParcelSubmissions({ limit=200 }={}) {
    try {
      const { data, error } = await supabase.from('parcel_submissions').select('*').eq('status','pending').order('created_at',{ ascending:false }).limit(limit);
      if (error) throw error; return data||[];
    } catch (e) { return []; }
  }

  /**
   * listParcelSubmissions: admin/mairie/notaire overview (optionally filter by status)
   */
  static async listParcelSubmissions({ status=null, limit=500 }={}) {
    try {
      let query = supabase.from('parcel_submissions').select('*').order('created_at',{ ascending:false }).limit(limit);
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (e) { return []; }
  }

  /**
   * approveParcelSubmission: creates real parcel then marks submission approved (links parcel_id)
   */
  static async approveParcelSubmission(submissionId, { reviewerId=null } = {}) {
    try {
      const { data: sub, error: subErr } = await supabase.from('parcel_submissions').select('*').eq('id', submissionId).single();
      if (subErr) throw subErr;
      if (sub.status !== 'pending') return sub; // idempotent
      // Create parcel
      const parcelPayload = {
        reference: sub.reference,
        location_name: sub.location,
        type: sub.type,
        price: sub.price,
        area_sqm: sub.surface,
        status: 'available',
        owner_id: sub.owner_id,
        owner_type: 'Vendeur',
        verification_status: 'verified'
      };
      const parcel = await this.createProperty(parcelPayload);
      const { data: updated, error: upErr } = await supabase.from('parcel_submissions').update({ status:'approved', approved_at:new Date().toISOString(), reviewer_id: reviewerId, parcel_id: parcel.id, updated_at: new Date().toISOString() }).eq('id', submissionId).select().single();
      if (upErr) throw upErr;
      this.logEvent({ entityType:'parcel_submission', entityId:submissionId, eventType:'parcel_submission.approved', actorUserId: reviewerId, data:{ parcel_id: parcel.id } });
      // Notify owner
      try { this.createNotification({ userId: sub.owner_id, type:'parcel_submission', title:'Parcelle approuvée', body:`Votre parcelle ${sub.reference} est publiée.`, data:{ parcel_id:parcel.id } }); } catch {/* ignore */}
      return updated;
    } catch (e) { console.error('approveParcelSubmission failed', e.message||e); throw e; }
  }

  static async rejectParcelSubmission(submissionId, { reviewerId=null, reason=null } = {}) {
    try {
      const { data: sub, error: subErr } = await supabase.from('parcel_submissions').select('*').eq('id', submissionId).single();
      if (subErr) throw subErr;
      if (sub.status !== 'pending') return sub;
      const { data: updated, error } = await supabase.from('parcel_submissions').update({ status:'rejected', rejected_at:new Date().toISOString(), rejection_reason: reason, reviewer_id: reviewerId, updated_at:new Date().toISOString() }).eq('id', submissionId).select().single();
      if (error) throw error;
      this.logEvent({ entityType:'parcel_submission', entityId:submissionId, eventType:'parcel_submission.rejected', actorUserId: reviewerId, data:{ reason } });
      try { this.createNotification({ userId: sub.owner_id, type:'parcel_submission', title:'Parcelle rejetée', body: reason || 'Votre soumission de parcelle a été rejetée.', data:{ submission_id:submissionId, reason } }); } catch {/* ignore */}
      return updated;
    } catch (e) { console.error('rejectParcelSubmission failed', e.message||e); throw e; }
  }

  /** Log simple clic sur CTA homepage */
  static async recordHomepageCta(label) {
    try {
      await this.logEvent({ entityType:'homepage', entityId:'root', eventType:'homepage.cta.click', actorUserId:null, source:'ui', importance:0, data:{ label } });
    } catch {/* silent */}
  }

  // ============== UPDATE OPERATIONS ==============
  static async updateUser(id, userData) {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw error;
    }
    return data;
  }

  static async updateRequestStatus(id, status, details = null) {
    const updateData = { status, updated_at: new Date().toISOString() };
    if (details) updateData.details = details;
    const { data, error } = await supabase
      .from('requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Erreur lors de la mise à jour du statut de la demande:', error);
      throw error;
    }
    if (data) this.logEvent({ entityType:'request', entityId:id, eventType:'request.status_updated', actorUserId:data.user_id, data:{ new_status:status } });
    // Notify requester
    try {
      if (data?.user_id) {
        this.createNotification({
          userId: data.user_id,
          type: 'request_status',
          title: 'Statut de votre demande mis à jour',
          body: `La demande #${id} est maintenant: ${status}.`,
          data: { request_id: id, status }
        });
      }
    } catch {/* silent */}
    return data;
  }

  static async updateTransactionStatus(id, status) {
    const { data, error } = await supabase
      .from('transactions')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la mise à jour du statut de la transaction:', error);
      throw error;
    }
    if (data) this.logEvent({ entityType:'transaction', entityId:id, eventType:'transaction.status_updated', actorUserId:data.user_id || null, data:{ new_status:status } });
    try {
      const parties = [data?.buyer_id, data?.seller_id].filter(Boolean);
      parties.forEach(uid => {
        if (uid) this.createNotification({
          userId: uid,
          type: 'transaction_status',
          title: 'Transaction mise à jour',
          body: `La transaction #${id} est maintenant: ${status}.`,
          data: { transaction_id: id, status }
        });
      });
    } catch {/* silent */}
    return data;
  }

  // ============== BANKING OPERATIONS (NEW) ==============
  static async updateBankGuaranteeStatus(id, status, reviewerId=null) {
    try {
      const { data, error } = await supabase
        .from('bank_guarantees')
        .update({ status, reviewed_at: new Date().toISOString(), reviewer_id: reviewerId || null, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      this.logEvent({ entityType:'bank_guarantee', entityId:id, eventType:'bank_guarantee.status_updated', actorUserId: reviewerId, data:{ new_status: status } });
      if (data?.user_id) {
        this.createNotification({ userId:data.user_id, type:'guarantee_status', title:'Garantie mise à jour', body:`Votre garantie #${id} est maintenant ${status}.`, data:{ guarantee_id:id, status } });
      }
      return data;
    } catch (e) { console.error('updateBankGuaranteeStatus failed', e.message||e); throw e; }
  }

  static async updateFinancingRequestStatus(id, status, reviewerId=null, decisionNote=null) {
    try {
      const { data, error } = await supabase
        .from('financing_requests')
        .update({ status, decision_note: decisionNote, decided_at: new Date().toISOString(), reviewer_id: reviewerId || null, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      this.logEvent({ entityType:'financing_request', entityId:id, eventType:'financing_request.status_updated', actorUserId: reviewerId, data:{ new_status: status } });
      if (data?.user_id) {
        this.createNotification({ userId:data.user_id, type:'financing_status', title:'Demande de financement', body:`Votre demande #${id} est ${status}.`, data:{ financing_request_id:id, status } });
      }
      return data;
    } catch (e) { console.error('updateFinancingRequestStatus failed', e.message||e); throw e; }
  }

  static async completeLandEvaluation(id, evaluatorId=null, newValue=null, reportData=null) {
    try {
      const update = { status:'completed', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      if (newValue!==null) update.estimated_value = newValue;
      if (reportData) update.report = reportData;
      if (evaluatorId) update.evaluator_id = evaluatorId;
      const { data, error } = await supabase
        .from('land_evaluations')
        .update(update)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      this.logEvent({ entityType:'land_evaluation', entityId:id, eventType:'land_evaluation.completed', actorUserId:evaluatorId, data:{ estimated_value: data?.estimated_value } });
      return data;
    } catch (e) { console.error('completeLandEvaluation failed', e.message||e); throw e; }
  }

  // ============== FAVORITES ==============
  static async getUserFavorites(userId) {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        parcels:parcel_id (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des favoris:', error);
      return [];
    }
    return data || [];
  }

  static async addToFavorites(userId, parcelId) {
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        parcel_id: parcelId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    if (error) {
      console.error('Erreur lors de l\'ajout aux favoris:', error);
      throw error;
    }
    this.logEvent({ entityType:'parcel', entityId:parcelId, eventType:'user.favorite_added', actorUserId:userId, data:{ favorite_id:data.id } });
    try {
      const { data: parcel } = await supabase.from('parcels').select('owner_id, reference').eq('id', parcelId).maybeSingle();
      if (parcel?.owner_id && parcel.owner_id !== userId) {
        this.createNotification({
          userId: parcel.owner_id,
          type: 'favorite_added',
          title: 'Nouvel intérêt pour votre parcelle',
          body: `Un utilisateur a ajouté votre parcelle ${parcel.reference || parcelId} à ses favoris.`,
          data: { parcel_id: parcelId, favorite_id: data.id }
        });
      }
    } catch {/* silent */}
    return data;
  }

  static async removeFromFavorites(userId, parcelId) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('parcel_id', parcelId);
    if (error) {
      console.error('Erreur lors de la suppression des favoris:', error);
      throw error;
    }
    this.logEvent({ entityType:'parcel', entityId:parcelId, eventType:'user.favorite_removed', actorUserId:userId });
    return true;
  }

  static async isParcelFavorite(userId, parcelId) {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('parcel_id', parcelId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Erreur lors de la vérification des favoris:', error);
      return false;
    }
    return !!data;
  }

  // ============== SAVED SEARCHES ==============
  static async getUserSavedSearches(userId) {
    const { data, error } = await supabase
      .from('saved_searches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des recherches sauvegardées:', error);
      return [];
    }
    return data || [];
  }

  static async saveSearch(userId, searchData) {
    const { data, error } = await supabase
      .from('saved_searches')
      .insert({
        user_id: userId,
        name: searchData.name,
        criteria: searchData.criteria,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la sauvegarde de la recherche:', error);
      throw error;
    }
    return data;
  }

  static async deleteSavedSearch(userId, searchId) {
    const { error } = await supabase
      .from('saved_searches')
      .delete()
      .eq('user_id', userId)
      .eq('id', searchId);
    
    if (error) {
      console.error('Erreur lors de la suppression de la recherche:', error);
      throw error;
    }
    return true;
  }

  // ============== DOCUMENTS ==============
  static async getUserDocuments(userId) {
    const { data, error } = await supabase
      .from('user_documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des documents:', error);
      return [];
    }
    return data || [];
  }

  static async uploadDocument(userId, file) {
    try {
      // Upload du fichier vers Supabase Storage
      const fileName = `${userId}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Enregistrement des métadonnées en base
      const { data: docData, error: docError } = await supabase
        .from('user_documents')
        .insert({
          user_id: userId,
          name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
          category: this.getCategoryFromFileName(file.name),
          verified: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (docError) throw docError;

  // Log event succès
  this.logEvent({ entityType:'document', entityId:docData.id, eventType:'document.uploaded', actorUserId:userId, source:'ui', data:{ name:file.name, size:file.size, mime:file.type } });
      return docData;
    } catch (error) {
      console.error('Erreur lors de l\'upload du document:', error);
  this.logEvent({ entityType:'document', entityId:'pending', eventType:'document.upload.failed', actorUserId:userId, importance:0, source:'ui', data:{ name:file?.name, size:file?.size, mime:file?.type, error: error.message || String(error) } });
      throw error;
    }
  }

  static async getDocumentDownloadUrl(documentId) {
    try {
      // Récupérer les infos du document
      const { data: document, error: docError } = await supabase
        .from('user_documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (docError) throw docError;

      // Générer l'URL de téléchargement
      const { data: urlData, error: urlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 3600); // 1 heure

      if (urlError) throw urlError;

      return urlData.signedUrl;
    } catch (error) {
      console.error('Erreur lors de la génération de l\'URL:', error);
      throw error;
    }
  }

  static getCategoryFromFileName(fileName) {
    const name = fileName.toLowerCase();
    if (name.includes('acte') || name.includes('notaire')) return 'Actes Notariés';
    if (name.includes('titre') || name.includes('propriete')) return 'Titres de Propriété';
    if (name.includes('plan') || name.includes('cadastre')) return 'Plans et Documents Techniques';
    if (name.includes('rapport') || name.includes('diligence')) return 'Rapports & Vérifications';
    return 'Autres Documents';
  }

  // ============== ADMIN MANAGEMENT ==============
  static async deleteUser(userId) {
    // Prefer logical deletion: mark inactive if users table has is_active column
    try {
      // Try update flag first
      const { data: updated, error: updErr } = await supabase
        .from('users')
        .update({ is_active: false, deleted_at: new Date().toISOString() })
        .eq('id', userId)
        .select('id');
      if (!updErr && updated && updated.length) {
        this.logEvent({ entityType:'user', entityId:userId, eventType:'user.soft_deleted', actorUserId:null, importance:1, source:'admin_ui' });
        return true;
      }
    } catch {/* ignore */}
    // Hard delete fallback (non-auth table only; Supabase auth.users cannot be deleted from client)
    try {
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (error) throw error;
      this.logEvent({ entityType:'user', entityId:userId, eventType:'user.deleted', actorUserId:null, importance:2, source:'admin_ui' });
      return true;
    } catch (e) {
      console.error('deleteUser failed:', e.message||e);
      throw e;
    }
  }

  static async updateUserRole(userId, newRole, newType) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        role: newRole,
        type: newType,
        updated_at: new Date().toISOString() 
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      throw error;
    }
    return data;
  }

  // ============== PROMOTEUR PROJECTS (NEW) ==============
  // Methods to retrieve developer projects. Requires table promoteur_projects from ai_real_data_schema.sql
  static async getPromoteurProjects({ promoteurId = null, status = null } = {}) {
    let query = supabase
      .from('promoteur_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (promoteurId) query = query.eq('promoteur_id', promoteurId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) {
      // Table might not yet exist in some environments – fail gracefully
      console.error('Erreur récupération projets promoteur:', error.message || error);
      return [];
    }
    return data || [];
  }

  static async getPromoteurProjectById(id) {
    const { data, error } = await supabase
      .from('promoteur_projects')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.error('Erreur récupération projet promoteur:', error);
      return null;
    }
    return data;
  }

  static async updatePromoteurProjectStatus(id, status) {
    try {
      const { data, error } = await supabase
        .from('promoteur_projects')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      if (data) {
        this.logEvent({ entityType: 'promoteur_project', entityId: id, eventType: 'project.status_updated', actorUserId: data.promoteur_id || null, data: { new_status: status } });
      }
      return data;
    } catch (e) {
      console.error('Erreur mise à jour statut projet promoteur:', e.message || e);
      throw e;
    }
  }

  // ============== PROJECT UNITS / LOTS (NEW) ==============
  // This expects a table promoteur_project_units (see migration suggestion) with columns:
  // id, project_id (FK promoteur_projects.id), reference, status ('available'|'reserved'|'sold'), price, client_name
  static async getProjectUnits(projectId) {
    const { data, error } = await supabase
      .from('promoteur_project_units')
      .select('*')
      .eq('project_id', projectId)
      .order('id');
    if (error) {
      console.error('Erreur récupération des lots du projet:', error.message || error);
      return [];
    }
    return data || [];
  }

  static async updateProjectUnitStatus(id, status) {
    try {
      const { data, error } = await supabase
        .from('promoteur_project_units')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      if (data) {
        this.logEvent({ entityType: 'project_unit', entityId: id, eventType: 'project_unit.status_updated', actorUserId: null, data: { new_status: status } });
      }
      return data;
    } catch (e) {
      console.error('Erreur mise à jour statut lot projet:', e.message || e);
      throw e;
    }
  }

  static async getUnitsForPromoteur(promoteurId) {
    // Join projects to filter by promoteur
    const { data, error } = await supabase
  .from('promoteur_project_units')
  .select('*, promoteur_projects!inner(id,name,promoteur_id)')
      .eq('promoteur_projects.promoteur_id', promoteurId);
    if (error) {
      console.error('Erreur récupération des lots promoteur:', error.message || error);
      return [];
    }
    return data || [];
  }

  // ============== ADMIN DASHBOARD AGGREGATION (NEW) ==============
  // Centralizes multi-table fetch + aggregation for AdminDashboardPage
  static async getAdminDashboardMetrics() {
    try {
      const [ usersRes, parcelsRes, requestsRes, transactionsRes, contractsRes ] = await Promise.all([
        supabase.from('users').select('id, created_at, role, type, assigned_agent_id, full_name, email, is_active, verification_status'),
        supabase.from('parcels').select('id, status, area_sqm, owner_id, created_at'),
        supabase.from('requests').select('id, request_type, status, user_id, recipient_type, created_at'),
        supabase.from('transactions').select('id, amount, created_at, status, buyer_id, seller_id, type'),
        supabase.from('contracts').select('id, status, user_id, parcel_id, created_at')
      ]);

      for (const r of [usersRes, parcelsRes, requestsRes, transactionsRes, contractsRes]) {
        if (r.error) throw r.error;
      }

      // Filtrer uniquement les utilisateurs actifs (non supprimés)
      const users = (usersRes.data || []).filter(u => 
        (u.is_active !== false) && 
        (!u.deleted_at) && 
        (u.status !== 'deleted')
      );
      const parcels = parcelsRes.data || [];
      const requests = requestsRes.data || [];
      const transactions = transactionsRes.data || [];
      const contracts = contractsRes.data || [];

      const totalUsers = users.length;
      const totalParcels = parcels.length;
      const totalRequests = requests.length;
      const totalSalesAmount = transactions.filter(t => t.status === 'completed').reduce((s, t) => s + (t.amount || 0), 0);

      // Monthly aggregations helper
      const monthKey = d => new Date(d).toLocaleString('fr-FR', { month: 'short', year: 'numeric' });

      const aggregateCountByMonth = (rows, dateField) => {
        const m = {};
        rows.forEach(r => { const key = monthKey(r[dateField]); m[key] = (m[key] || 0) + 1; });
        return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a,b)=> new Date(a.name) - new Date(b.name));
      };

      const aggregateSumByMonth = (rows, dateField, amountField) => {
        const m = {};
        rows.forEach(r => { const key = monthKey(r[dateField]); m[key] = (m[key] || 0) + (r[amountField] || 0); });
        return Object.entries(m).map(([name, amount]) => ({ name, amount })).sort((a,b)=> new Date(a.name) - new Date(b.name));
      };

      const userRegistrations = aggregateCountByMonth(users, 'created_at');
      const monthlySales = aggregateSumByMonth(transactions.filter(t => t.status === 'completed'), 'created_at', 'amount');

      const parcelStatusMap = parcels.reduce((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; }, {});
      const parcelStatus = Object.entries(parcelStatusMap).map(([name, value]) => ({ name, value, unit: 'parcelles' }));

      const requestTypesMap = requests.reduce((acc, r) => { acc[r.request_type] = (acc[r.request_type] || 0) + 1; return acc; }, {});
      const requestTypes = Object.entries(requestTypesMap).map(([name, value]) => ({ name, value, unit: 'demandes' }));

      // Actor categorization
      const vendeurUsers = users.filter(u => u.type === 'Vendeur');
      const particulierUsers = users.filter(u => u.type === 'Particulier');
      const mairieUsers = users.filter(u => u.type === 'Mairie');
      const banqueUsers = users.filter(u => u.type === 'Banque');
      const notaireUsers = users.filter(u => u.type === 'Notaire');
      const agentUsers = users.filter(u => u.role === 'agent');

      const actorStats = {
        vendeur: {
          parcellesListees: parcels.filter(p => p.owner_id && vendeurUsers.some(v => v.id === p.owner_id)).length,
          transactionsReussies: transactions.filter(t => t.status === 'completed' && t.seller_id && vendeurUsers.some(v => v.id === t.seller_id)).length,
        },
        particulier: {
          demandesSoumises: requests.filter(r => r.user_id && particulierUsers.some(v => v.id === r.user_id)).length,
          acquisitions: transactions.filter(t => t.status === 'completed' && t.buyer_id && particulierUsers.some(v => v.id === t.buyer_id)).length,
        },
        mairie: {
          parcellesCommunales: parcels.filter(p => p.owner_id && mairieUsers.some(v => v.id === p.owner_id)).length,
          demandesTraitees: requests.filter(r => r.status === 'completed' && r.recipient_type === 'Mairie').length,
        },
        banque: {
          pretsAccordes: transactions.filter(t => t.type === 'loan' && t.status === 'completed').length,
          garantiesEvaluees: parcels.filter(p => p.status === 'evaluated_as_guarantee').length,
        },
        notaire: {
          dossiersTraites: requests.filter(r => r.status === 'completed' && r.recipient_type === 'Notaire').length,
          actesAuthentifies: contracts.filter(c => c.status === 'signed').length,
        },
        agent: {
          clientsAssignes: users.filter(u => u.assigned_agent_id && agentUsers.some(a => a.id === u.assigned_agent_id)).length,
          visitesPlanifiees: requests.filter(r => r.request_type === 'visit' && r.status === 'pending').length,
        },
      };

      // Essayer de récupérer des events réels si table events existe
      let upcomingEvents = [];
      try {
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('id,title,start_time,location,type')
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(5);
        if (!eventsError && eventsData) {
          upcomingEvents = eventsData.map(e => ({
            id: e.id,
            title: e.title,
            date: e.start_time,
            location: e.location,
            type: e.type
          }));
        }
      } catch (e) { /* silencieux: table peut ne pas exister */ }

      return {
        totals: { totalUsers, totalParcels, totalRequests, totalSalesAmount },
        charts: { userRegistrations, parcelStatus, requestTypes, monthlySales },
        actorStats,
        upcomingEvents
      };
    } catch (error) {
      console.error('Erreur agrégation admin dashboard:', error);
      throw error;
    }
  }

  // ============== INSTITUTIONS LISTING (NEW) ==============
  // Returns institution profiles joined with geo tables and base user info
  static async listInstitutions({ regionId = null, type = null, status = null, limit = 100 } = {}) {
    return this.listInstitutionsPaged({ regionId, type, status, page:1, pageSize: limit, sortBy:'created_at', sortDir:'desc' });
  }

  static async listInstitutionsPaged({ regionId = null, type = null, status = null, page = 1, pageSize = 12, sortBy='created_at', sortDir='desc', createdAfter=null, createdBefore=null } = {}) {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const sortable = ['created_at','name','status'];
      if (!sortable.includes(sortBy)) sortBy = 'created_at';
      const ascending = sortDir === 'asc';

      let query = supabase
        .from('institution_profiles')
        .select(`id, user_id, institution_type, name, slug, status, created_at, region_id, department_id, commune_id, metadata,
          users:user_id (full_name, email, role, verification_status),
          regions:region_id (name),
          departments:department_id (name),
          communes:commune_id (name)
        `, { count: 'exact' })
        .order(sortBy, { ascending })
        .range(from, to);

  if (regionId) query = query.eq('region_id', regionId);
  if (type) query = query.eq('institution_type', type);
  if (status) query = query.eq('status', status);
  if (createdAfter) query = query.gte('created_at', createdAfter);
  if (createdBefore) query = query.lte('created_at', createdBefore);

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data || [], total: count || 0, page, pageSize };
    } catch (e) {
      console.warn('listInstitutionsPaged fallback (table missing?):', e.message || e);
      return { data: [], total: 0, page, pageSize };
    }
  }

  static async getInstitutionStatusCounts({ regionId = null, type = null, createdAfter=null, createdBefore=null } = {}) {
    try {
      let query = supabase
        .from('institution_profiles')
        .select('status, count:id', { group: 'status' });
  if (regionId) query = query.eq('region_id', regionId);
  if (type) query = query.eq('institution_type', type);
  if (createdAfter) query = query.gte('created_at', createdAfter);
  if (createdBefore) query = query.lte('created_at', createdBefore);
      const { data, error } = await query;
      if (error) throw error;
      const map = { pending:0, active:0, suspended:0 };
      (data||[]).forEach(r => { map[r.status] = r.count; });
      return map;
    } catch (e) {
      console.warn('getInstitutionStatusCounts failed:', e.message || e);
      return { pending:0, active:0, suspended:0 };
    }
  }

  // ============== AUDIT LOGS (NEW) ==============
  static async listAuditLogs({ page=1, pageSize=50, eventType=null, actorUserId=null, targetUserId=null, sortDir='desc', createdAfter=null, createdBefore=null } = {}) {
    try {
      const from = (page-1)*pageSize;
      const to = from + pageSize -1;
      let query = supabase
        .from('audit_logs')
        .select('id, event_type, actor_user_id, target_user_id, target_table, target_id, metadata, created_at', { count:'exact' })
        .order('created_at', { ascending: sortDir==='asc' })
        .range(from, to);
  if (eventType) query = query.eq('event_type', eventType);
  if (actorUserId) query = query.eq('actor_user_id', actorUserId);
  if (targetUserId) query = query.eq('target_user_id', targetUserId);
  if (createdAfter) query = query.gte('created_at', createdAfter);
  if (createdBefore) query = query.lte('created_at', createdBefore);
      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data || [], total: count || 0, page, pageSize };
    } catch (e) {
      console.warn('listAuditLogs failed:', e.message || e);
      return { data: [], total:0, page, pageSize };
    }
  }

  // ============== EVENTS & TIMELINE (NEW) ==============
  static async listEvents({ entityType=null, entityId=null, page=1, pageSize=50, eventType=null, importanceMin=null, createdAfter=null, createdBefore=null, source=null } = {}) {
    try {
      const from = (page-1)*pageSize; const to = from + pageSize -1;
      let query = supabase.from('events').select('*', { count:'exact' }).order('created_at', { ascending:false }).range(from,to);
      if (entityType) query = query.eq('entity_type', entityType);
      if (entityId) query = query.eq('entity_id', String(entityId));
      if (eventType) query = query.eq('event_type', eventType);
      if (importanceMin !== null && importanceMin !== undefined) query = query.gte('importance', importanceMin);
      if (createdAfter) query = query.gte('created_at', createdAfter);
      if (createdBefore) query = query.lte('created_at', createdBefore);
      if (source) query = query.eq('source', source);
      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data||[], total: count||0, page, pageSize };
    } catch (e) {
      console.warn('listEvents failed:', e.message||e); return { data:[], total:0, page, pageSize };
    }
  }

  static async getParcelTimeline(parcelId, { page=1, pageSize=50 } = {}) {
    try {
      // Use view parcel_timeline if exists else fallback to events only
      const from = (page-1)*pageSize; const to = from + pageSize -1;
      let useView = true;
      // naive detection: attempt view query, fallback on error
      let { data, error, count } = await supabase.from('parcel_timeline').select('*', { count:'exact' }).eq('parcel_id', parcelId).order('created_at',{ ascending:false }).range(from,to);
      if (error) { useView = false; }
      if (!useView) {
        const evRes = await this.listEvents({ entityType:'parcel', entityId:parcelId, page, pageSize });
        return { data: evRes.data.map(e=>({ ...e, source_type:'event' })), total: evRes.total, page, pageSize };
      }
      return { data: data||[], total: count||0, page, pageSize };
    } catch (e) {
      console.warn('getParcelTimeline failed:', e.message||e);
      return { data:[], total:0, page, pageSize };
    }
  }

  static async logEvent({ entityType, entityId, eventType, actorUserId=null, importance=0, source='system', data={} }) {
    try {
      if (!this._configLoaded) { await this._loadEventConfig(); this._configLoaded=true; }
      const signature = `${entityType}|${entityId}|${eventType}|${importance}`;
      if (!this._canSendEvent(signature)) return null;
      const payload = { entity_type: entityType, entity_id: String(entityId), event_type: eventType, actor_user_id: actorUserId, importance, source, data };
      console.log('logEvent payload:', JSON.stringify(payload));
      const { data: inserted, error } = await supabase.from('events').insert([payload]).select().single();
      if (error) throw error; return inserted;
    } catch (e) { console.warn('logEvent failed:', e.message||e); return null; }
  }

  // ============== CSV HELPERS (CLIENT-SIDE) ==============
  static toCSV(rows, columns) {
    const header = columns.map(c=>`"${c.label}"`).join(',');
    const lines = rows.map(r => columns.map(c => {
      let v = c.accessor(r);
      if (v === null || v === undefined) v = '';
      const s = String(v).replace(/"/g,'""');
      return `"${s}"`;
    }).join(','));
    return [header, ...lines].join('\n');
  }
  static downloadCSV(filename, csvString) {
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = filename; link.click();
    setTimeout(()=>URL.revokeObjectURL(url), 2000);
  }
}

// Export par défaut du service
export default SupabaseDataService;
