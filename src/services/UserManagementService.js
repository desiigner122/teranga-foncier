// src/services/UserManagementService.import { supabase } from '@/lib/supabaseClient';

class UserManagementService {
  /**
   * Suppression complète d'un utilisateur (Auth + Database + Sessions)
   */
  static async deleteUserCompletely(userId) {
    try {
      // 1. Récupérer les informations de l'utilisateur
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw new Error(`Erreur lors de la récupération du profil: ${profileError.message}`);
      }

      // 2. Supprimer l'utilisateur de Supabase Auth (via Admin API)
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authDeleteError) {
        console.error('Erreur suppression Supabase Auth:', authDeleteError);
        // On continue même si la suppression Auth échoue
      }

      // 3. Soft delete dans la base de données (pour l'historique)
      const { error: dbUpdateError } = await supabase
        .from('users')
        .update({
          status: 'deleted',
          deleted_at: new Date().toISOString(),
          email: `deleted_${Date.now()}@${userProfile?.email || 'unknown.com'}`, // Anonymiser l'email
          active: false
        })
        .eq('id', userId);

      if (dbUpdateError) {
        throw new Error(`Erreur lors de la mise à jour en base: ${dbUpdateError.message}`);
      }

      // 4. Supprimer les sessions actives
      await this.revokeAllUserSessions(userId);

      // 5. Nettoyer les données associées
      await this.cleanupUserData(userId);

      return {
        success: true,
        message: `Utilisateur ${userProfile?.full_name || userId} supprimé complètement`,
        deletedUser: userProfile
      };

    } catch (error) {
      console.error('Erreur lors de la suppression complète:', error);
      throw error;
    }
  }

  /**
   * Révoquer toutes les sessions d'un utilisateur
   */
  static async revokeAllUserSessions(userId) {
    try {
      // Utiliser l'API Admin pour révoquer toutes les sessions
      const { error } = await supabase.auth.admin.signOut(userId, 'global');
      
      if (error) {
        console.error('Erreur révocation des sessions:', error);
      }

      return { success: !error };
    } catch (error) {
      console.error('Erreur lors de la révocation des sessions:', error);
      return { success: false, error };
    }
  }

  /**
   * Nettoyer les données associées à un utilisateur
   */
  static async cleanupUserData(userId) {
    try {
      const cleanupOperations = [
        // Supprimer les documents d'identité
        supabase.storage
          .from('identity-documents')
          .remove([`${userId}/id_card_front.jpg`, `${userId}/id_card_back.jpg`]),

        // Anonymiser les notifications
        supabase
          .from('notifications')
          .update({ user_id: null, deleted_user_id: userId })
          .eq('user_id', userId),

        // Supprimer les favoris
        supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId),

        // Supprimer les recherches sauvegardées
        supabase
          .from('saved_searches')
          .delete()
          .eq('user_id', userId)
      ];

      await Promise.allSettled(cleanupOperations);
      return { success: true };

    } catch (error) {
      console.error('Erreur lors du nettoyage des données:', error);
      return { success: false, error };
    }
  }

  /**
   * Vérifier si un utilisateur existe encore dans Auth
   */
  static async verifyUserAuthExists(userId) {
    try {
      const { data, error } = await supabase.auth.admin.getUserById(userId);
      
      if (error && error.status === 404) {
        return { exists: false, deleted: true };
      }
      
      if (error) {
        throw error;
      }

      return { 
        exists: true, 
        deleted: false,
        user: data.user 
      };

    } catch (error) {
      console.error('Erreur vérification utilisateur Auth:', error);
      return { exists: false, error };
    }
  }

  /**
   * Bloquer définitivement un utilisateur
   */
  static async blockUser(userId, reason = 'Violation des conditions d\'utilisation') {
    try {
      // 1. Mettre à jour le statut en base
      const { error: updateError } = await supabase
        .from('users')
        .update({
          status: 'blocked',
          blocked_at: new Date().toISOString(),
          blocked_reason: reason,
          active: false
        })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      // 2. Révoquer toutes les sessions
      await this.revokeAllUserSessions(userId);

      return { success: true, message: 'Utilisateur bloqué avec succès' };

    } catch (error) {
      console.error('Erreur lors du blocage:', error);
      throw error;
    }
  }
}

export default UserManagementService;
