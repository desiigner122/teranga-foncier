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
}

// Export par défaut du service
export default SupabaseDataService;
