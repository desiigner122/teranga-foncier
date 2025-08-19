// src/services/supabaseDataService.js
import { supabase } from '../lib/supabaseClient.js';

export class SupabaseDataService {
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
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
    return data;
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
    return data;
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

      const users = usersRes.data || [];
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

      // Placeholder upcoming events (until events table exists)
      const upcomingEvents = [
        { title: 'Réunion de conformité', date: '2025-08-05', time: '10:00' },
        { title: 'Audit foncier annuel', date: '2025-08-15', time: '09:00' },
      ];

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
