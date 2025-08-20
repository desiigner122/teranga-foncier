// src/context/MessagingNotificationContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { SupabaseDataService } from '@/services/supabaseDataService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useRealtimeTable } from '@/hooks/useRealtimeTable';

const MessagingNotificationContext = createContext();

export const useMessagingNotification = () => {
  const context = useContext(MessagingNotificationContext);
  if (!context) {
    throw new Error('useMessagingNotification must be used within a MessagingNotificationProvider');
  }
  return context;
};

export const MessagingNotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State
  const [conversations, setConversations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({ messages: 0, notifications: 0 });
  const [loading, setLoading] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isFirebaseAvailable] = useState(false); // Supabase only
  
  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const convList = await SupabaseDataService.listConversations(user.id);
      setConversations(convList || []);
    } catch (e) {
      console.error('loadConversations failed', e);
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Optional realtime channel for new conversations/messages
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`messaging_${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema:'public', table:'messages' }, payload => {
        const msg = payload.new;
        // If message belongs to a known conversation, fetch messages list
        if (msg.conversation_id) {
          // lazy load conversation if not present
          setConversations(prev => {
            if (!prev.find(c=>c.id===msg.conversation_id)) {
              loadConversations();
            }
            return prev;
          });
          // Append to messages cache
          setMessages(prev => {
            const existing = prev[msg.conversation_id] || [];
            return { ...prev, [msg.conversation_id]: [...existing, msg] };
          });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, loadConversations]);

  // Load notifications (poll every 30s)
  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setIsLoadingNotifications(true);
    try {
      const list = await SupabaseDataService.listNotifications(user.id, { unreadOnly:false, limit:100 });
      setNotifications(list);
    } catch (e) {
      console.error('loadNotifications failed', e);
    } finally { setIsLoadingNotifications(false); }
  }, [user]);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);
  // Realtime notifications (replace polling)
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`notifications_${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema:'public', table:'notifications', filter:`user_id=eq.${user.id}` }, payload => {
        const row = payload.new;
        setNotifications(prev => [row, ...prev].slice(0,100));
      })
      .on('postgres_changes', { event: 'UPDATE', schema:'public', table:'notifications', filter:`user_id=eq.${user.id}` }, payload => {
        const row = payload.new;
        setNotifications(prev => prev.map(n => n.id===row.id ? row : n));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Messages listener for selected conversation
  const subscribeToMessages = useCallback((conversationId) => {
    // For Supabase we already have realtime channel global; here we fetch initial messages once
    (async () => {
      try {
        const list = await SupabaseDataService.listConversationMessages(conversationId, 500);
        setMessages(prev => ({ ...prev, [conversationId]: list }));
      } catch (e) { console.error('fetch messages failed', e); }
    })();
    return () => {};
  }, []);

  // Update unread counts
  useEffect(() => {
    if (!user) return;
  const messageCount = conversations.reduce((sum,c)=> sum + (c.unreadCount||0), 0);
    const notificationCount = notifications.filter(n => !n.read).length;
    setUnreadCounts({ messages: messageCount, notifications: notificationCount });
  }, [conversations, notifications, user]);

  // Send message
  const sendMessage = async (conversationId, content) => {
    if (!user) return;
    try {
      await SupabaseDataService.sendMessage({ conversationId, senderId: user.id, content });
      // Refresh messages list quickly
      const list = await SupabaseDataService.listConversationMessages(conversationId, 500);
      setMessages(prev => ({ ...prev, [conversationId]: list }));
      // Update conversation metadata in local state
      setConversations(prev => prev.map(c => c.id===conversationId ? { ...c, lastMessage: content, lastMessageAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : c));
    } catch (e) {
      console.error('sendMessage failed', e);
      toast({ title:'Erreur', description:"Impossible d'envoyer le message", variant:'destructive' });
    }
  };

  // Create conversation
  const createConversation = async (participantIds, parcelId = null, title = null) => {
    if (!user) return null;
    try {
      const conv = await SupabaseDataService.createConversation({ subject: title, creatorId: user.id, participantIds });
      if (conv) {
        setConversations(prev => [
          { id: conv.id, participants: participantIds.concat(user.id), title: title || 'Conversation', parcelId, lastMessage:'', updatedAt: conv.created_at, lastMessageAt: conv.created_at, unreadCount:{} },
          ...prev
        ]);
        return conv.id;
      }
    } catch (e) { console.error('createConversation failed', e); }
    return null;
  };

  // Mark messages as read
  const markMessagesAsRead = async (conversationId) => {
    if (!user || !conversationId) return;
    try {
      await SupabaseDataService.markConversationMessagesRead({ conversationId, userId: user.id });
      // Refresh unread count for this conversation
      const unread = await SupabaseDataService.getConversationUnreadCount({ conversationId, userId: user.id });
      setConversations(prev => prev.map(c => c.id===conversationId ? { ...c, unreadCount: unread } : c));
    } catch(e){ console.warn('markMessagesAsRead failed', e); }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try { await SupabaseDataService.markNotificationRead(notificationId); loadNotifications(); } catch(e){ console.error('markNotificationAsRead failed', e);} };

  // Delete notification
  const deleteNotification = async () => { /* not implemented for Supabase notifications (soft delete optional) */ };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      await Promise.all(notifications.filter(n=>!n.read).map(n=>SupabaseDataService.markNotificationRead(n.id)));
      loadNotifications();
    } catch(e){ console.error('markAllNotificationsAsRead failed', e);} };

  // Delete all notifications
  const deleteAllNotifications = async () => { /* destructive clear not implemented */ };

  const value = {
    // State
    conversations,
    notifications,
    messages,
    unreadCounts,
    loading,
    isFirebaseAvailable,

    // Actions
    sendMessage,
    createConversation,
    subscribeToMessages,
    markMessagesAsRead,
    markNotificationAsRead,
    deleteNotification,
    markAllNotificationsAsRead,
    deleteAllNotifications
  };

  return (
    <MessagingNotificationContext.Provider value={value}>
      {children}
    </MessagingNotificationContext.Provider>
  );
};

