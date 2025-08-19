// src/services/supabaseDataService.js
import { supabase } from '../lib/supabaseClient.js';

export class SupabaseDataService {

  // Generic raw select helper (table: string, selectCols='*')
  static async supabaseRaw(table, selectCols='*') {
    try {
      const { data, error } = await supabase.from(table).select(selectCols);
      return { data, error };
    } catch (e) {
      return { data: null, error: e };
    }
  }
  
  // ============== USERS ==============
  static async getUsers(limit = null) {
    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (limit) query = query.limit(limit);
    
    const { data, error } = await query;
    if (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return [];
    }
    return data || [];
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
    return data;
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

      return docData;
    } catch (error) {
      console.error('Erreur lors de l\'upload du document:', error);
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
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      throw error;
    }
    return true;
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
}

// Export par défaut du service
export default SupabaseDataService;
