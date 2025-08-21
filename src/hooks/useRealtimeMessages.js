// src/hooks/useRealtimeMessages.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { User } from 'lucide-react';


;
/**
 * Hook pour gérer les messages en temps réel
 * Corrige les bugs précédents liés aux messages et gère les abonnements aux tables
 */
export const useRealtimeMessages = (conversationId = null, options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  
  // Fonction pour charger les messages
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Vérifier si la table messages existe
      try {
        const { error: tableCheckError } = await supabase
          .from('messages')
          .select('id')
          .limit(1);
        
        if (tableCheckError && tableCheckError.code === '42P01') {          setData([]);
          return;
        }
      } catch (err) {      }
      
      // Construire la requête en fonction des paramètres
      let query = supabase.from('messages').select('*');
      
      if (conversationId) {
        query = query.eq('conversation_id', conversationId);
      } else if (user) {
        // Si pas de conversation spécifique mais un utilisateur, récupérer ses messages
        query = query.or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);
      }
      
      // Tri et pagination
      query = query.order('created_at', { ascending: options.newestFirst ? false : true });
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      const { data: messagesData, error: messagesError } = await query;
      
      if (messagesError) throw messagesError;
      
      setData(messagesData || []);
    } catch (err) {      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [conversationId, user, options.limit, options.newestFirst]);
  
  // Fonction pour s'abonner aux changements de messages
  const subscribeToMessages = useCallback(() => {
    // Canal pour les messages
    let messagesChannel;
    
    try {
      // Définir le filtre pour l'abonnement
      let filter = '';
      if (conversationId) {
        filter = `conversation_id=eq.${conversationId}`;
      } else if (user) {
        filter = `sender_id=eq.${user.id}`;
      }
      
      // S'abonner aux changements
      messagesChannel = supabase
        .channel('messages-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: filter || undefined
        }, (payload) => {
          // Mettre à jour les données en fonction de l'événement
          if (payload.eventType === 'INSERT') {
            setData(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setData(prev => 
              prev.map(item => item.id === payload.new.id ? payload.new : item)
            );
          } else if (payload.eventType === 'DELETE') {
            setData(prev => prev.filter(item => item.id !== payload.old.id));
          }
        })
        .subscribe();
    } catch (err) {    }
    
    // Fonction de nettoyage pour se désabonner
    return () => {
      if (messagesChannel) {
        supabase.removeChannel(messagesChannel);
      }
    };
  }, [conversationId, user]);
  
  // Charger les données au montage et s'abonner aux changements
  useEffect(() => {
    fetchMessages();
    
    // S'abonner aux changements en temps réel si activé
    const unsubscribe = options.realtime !== false ? subscribeToMessages() : null;
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchMessages, subscribeToMessages, options.realtime]);
  
  // Fonction pour recharger manuellement les données
  const refetch = useCallback(() => {
    fetchMessages();
  }, [fetchMessages]);
  
  // Fonction pour envoyer un message
  const sendMessage = useCallback(async (content, recipientId = null) => {
    try {
      if (!user) throw new Error('User not authenticated');
      if (!content?.trim()) throw new Error('Message content is required');
      
      const messageData = {
        sender_id: user.id,
        content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Ajouter conversationId ou recipientId selon le cas
      if (conversationId) {
        messageData.conversation_id = conversationId;
      } else if (recipientId) {
        messageData.recipient_id = recipientId;
      } else {
        throw new Error('Either conversationId or recipientId is required');
      }
      
      const { data: newMessage, error: sendError } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();
      
      if (sendError) throw sendError;
      
      // Ajouter le message à l'état local si l'abonnement temps réel est désactivé
      if (options.realtime === false) {
        setData(prev => [...prev, newMessage]);
      }
      
      return newMessage;
    } catch (err) {      throw err;
    }
  }, [user, conversationId, options.realtime]);
  
  // Fonction pour marquer un message comme lu
  const markAsRead = useCallback(async (messageId) => {
    try {
      if (!messageId) throw new Error('Message ID is required');
      
      const { error: updateError } = await supabase
        .from('messages')
        .update({
          read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', messageId);
      
      if (updateError) throw updateError;
      
      // Mettre à jour l'état local si l'abonnement temps réel est désactivé
      if (options.realtime === false) {
        setData(prev => 
          prev.map(msg => msg.id === messageId ? { ...msg, read: true, read_at: new Date().toISOString() } : msg)
        );
      }
      
      return true;
    } catch (err) {      return false;
    }
  }, [options.realtime]);
  
  return {
    data,
    loading,
    error,
    refetch,
    sendMessage,
    markAsRead
  };
};

export default useRealtimeMessages;
