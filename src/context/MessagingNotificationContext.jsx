// src/context/MessagingNotificationContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebaseClient';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

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
  const [loading, setLoading] = useState(true);
  const [isFirebaseAvailable, setIsFirebaseAvailable] = useState(false);

  // Check Firebase availability
  useEffect(() => {
    setIsFirebaseAvailable(isFirebaseConfigured());
    if (!isFirebaseConfigured()) {
      // Firebase not configured, use fallback data for development
      if (import.meta.env.DEV) {
        console.warn('Firebase not configured. Using fallback data.');
      }
      setLoading(false);
    }
  }, []);

  // Conversations listener
  useEffect(() => {
    if (!user || !isFirebaseAvailable) {
      setLoading(false);
      return;
    }

    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', user.id),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const convs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setConversations(convs);
        setLoading(false);
      },
      (error) => {
        // Log conversation listener errors in development only
        if (import.meta.env.DEV) {
          console.error('Error listening to conversations:', error);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, isFirebaseAvailable]);

  // Notifications listener
  useEffect(() => {
    if (!user || !isFirebaseAvailable) return;

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const notifs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setNotifications(notifs);
      },
      (error) => {
        // Log notification listener errors in development only
        if (import.meta.env.DEV) {
          console.error('Error listening to notifications:', error);
        }
      }
    );

    return () => unsubscribe();
  }, [user, isFirebaseAvailable]);

  // Messages listener for selected conversation
  const subscribeToMessages = useCallback((conversationId) => {
    if (!isFirebaseAvailable) return () => {};

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMessages(prev => ({
          ...prev,
          [conversationId]: msgs
        }));
      },
      (error) => {
        console.error('Error listening to messages:', error);
      }
    );

    return unsubscribe;
  }, [isFirebaseAvailable]);

  // Update unread counts
  useEffect(() => {
    if (!user) return;

    const messageCount = conversations.reduce((total, conv) => {
      return total + (conv.unreadCount?.[user.id] || 0);
    }, 0);

    const notificationCount = notifications.filter(n => !n.isRead).length;

    setUnreadCounts({
      messages: messageCount,
      notifications: notificationCount
    });
  }, [conversations, notifications, user]);

  // Send message
  const sendMessage = async (conversationId, content, messageType = 'text') => {
    if (!user || !isFirebaseAvailable) {
      toast({
        title: "Erreur",
        description: "Service de messagerie non disponible",
        variant: "destructive"
      });
      return;
    }

    try {
      const messagesRef = collection(db, 'messages');
      await addDoc(messagesRef, {
        conversationId,
        senderId: user.id,
        content,
        messageType,
        createdAt: serverTimestamp(),
        isRead: false
      });

      // Update conversation last message
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        lastMessage: content,
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    }
  };

  // Create conversation
  const createConversation = async (participantIds, parcelId = null, title = null) => {
    if (!user || !isFirebaseAvailable) return null;

    try {
      const conversationsRef = collection(db, 'conversations');
      const docRef = await addDoc(conversationsRef, {
        participants: participantIds,
        parcelId,
        title,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        unreadCount: participantIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {})
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (conversationId) => {
    if (!user || !isFirebaseAvailable) return;

    try {
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('conversationId', '==', conversationId),
        where('senderId', '!=', user.id),
        where('isRead', '==', false)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { isRead: true });
      });

      await batch.commit();

      // Update conversation unread count
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        [`unreadCount.${user.id}`]: 0
      });

    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    if (!isFirebaseAvailable) return;

    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { isRead: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    if (!isFirebaseAvailable) return;

    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notificationRef);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    if (!user || !isFirebaseAvailable) return;

    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      const batch = writeBatch(db);

      unreadNotifications.forEach(notification => {
        const notificationRef = doc(db, 'notifications', notification.id);
        batch.update(notificationRef, { isRead: true });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete all notifications
  const deleteAllNotifications = async () => {
    if (!user || !isFirebaseAvailable) return;

    try {
      const batch = writeBatch(db);

      notifications.forEach(notification => {
        const notificationRef = doc(db, 'notifications', notification.id);
        batch.delete(notificationRef);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  };

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
