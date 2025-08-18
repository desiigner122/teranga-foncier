// src/services/supabaseDataService.js
import { supabase } from '../lib/supabaseClient.js';

export class SupabaseDataService {
  
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
}

// Export par défaut du service
export default SupabaseDataService;
