import React, { useState, useEffect, useRef } from 'react';
import { useRealtimeTable, useRealtimeUsers, useRealtimeParcels, useRealtimeParcelSubmissions } from '@/hooks/useRealtimeTable';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useMessagingNotification } from '@/context/MessagingNotificationContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, MessageSquare, Users, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.split(' ');
  if (parts.length > 1) {
    return parts[0][0] + parts[parts.length - 1][0];
  }
  return name.substring(0, 2);
};

const formatDate = (date) => {
   if (!date) return '';
   return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

const SecureMessagingPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const {
    conversations,
    messages,
    loading,
    isFirebaseAvailable,
    sendMessage,
    createConversation,
    subscribeToMessages,
    markMessagesAsRead
  } = useMessagingNotification();
  
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const messageUnsubscribeRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle conversation creation from external navigation (e.g., from parcel details)
  useEffect(() => {
  if (!user) return;

    const { parcelId, parcelName, contactUser } = location.state || {};
    if (parcelId && contactUser) {
      // Check if conversation already exists
      const existingConv = conversations.find(c => 
        c.parcelId === parcelId && c.participants.includes(contactUser)
      );
      
      if (existingConv) {
        setSelectedConversationId(existingConv.id);
      } else {
        // Create new conversation
        createConversation([user.id, contactUser], parcelId, `Conversation pour ${parcelName}`)
          .then(conversationId => {
            if (conversationId) {
              setSelectedConversationId(conversationId);
            }
          });
      }
    }
  }, [user, isFirebaseAvailable, location.state, conversations, createConversation]);

  // Subscribe to messages when conversation is selected
  useEffect(() => {
  if (selectedConversationId) {
      setLoadingMessages(true);
      
      // Unsubscribe from previous conversation
      if (messageUnsubscribeRef.current) {
        messageUnsubscribeRef.current();
      }
      
      // Subscribe to new conversation messages
      messageUnsubscribeRef.current = subscribeToMessages(selectedConversationId);
      
      // Mark messages as read
  markMessagesAsRead && markMessagesAsRead(selectedConversationId);
      
      setLoadingMessages(false);
    }

    return () => {
      if (messageUnsubscribeRef.current) {
        messageUnsubscribeRef.current();
      }
    };
  }, [selectedConversationId, isFirebaseAvailable, subscribeToMessages, markMessagesAsRead]);

  const handleSelectConversation = (convId) => {
    setSelectedConversationId(convId);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId || !user) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      await sendMessage(selectedConversationId, messageContent);
      toast({ title: "Message envoyé" });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ 
        title: "Erreur", 
        description: "Impossible d'envoyer le message",
        variant: "destructive" 
      });
      // Restore message on error
      setNewMessage(messageContent);
    }
  };

  // Set error state if user not logged in
  useEffect(() => {
    if (!user) {
      setError("Veuillez vous connecter pour accéder à la messagerie.");
    } else {
      setError(null);
    }
  }, [user]);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const conversationMessages = selectedConversationId ? messages[selectedConversationId] || [] : [];

  // Helper function to get other participant details
  const getOtherParticipant = (conversation) => {
    if (!conversation || !user) return { name: 'Utilisateur Inconnu', avatar: null };
    
    const otherUserId = conversation.participants?.find(pId => pId !== user.id);
    // In a real app, you'd fetch user details from Supabase
    // For now, return basic info
    return {
      name: conversation.title || `Utilisateur ${otherUserId?.slice(-4)}`,
      avatar: null,
      id: otherUserId
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <div className="border rounded-lg overflow-hidden h-full flex bg-card shadow-sm">
        <div className={cn(
            "w-full md:w-1/3 lg:w-1/4 border-r flex flex-col transition-all duration-300 ease-in-out",
            selectedConversationId && "hidden md:flex"
        )}>
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold flex items-center"><Users className="h-5 w-5 mr-2"/> Conversations</h2>
          </div>
          <div className="flex-grow overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : error ? (
               <p className="p-4 text-destructive">{error}</p>
            ) : conversations.length === 0 ? (
               <div className="p-4 text-muted-foreground text-center">
                 {isFirebaseAvailable ? 'Aucune conversation.' : 'Service de messagerie non disponible.'}
               </div>
            ) : (
              conversations.map(conv => {
                const otherParticipant = getOtherParticipant(conv);
                return (
                  <div
                    key={conv.id}
                    className={cn(
                      "flex items-center gap-3 p-3 cursor-pointer border-b last:border-b-0 hover:bg-muted/50",
                      selectedConversationId === conv.id && "bg-muted"
                    )}
                    onClick={() => handleSelectConversation(conv.id)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={otherParticipant.avatar} alt={otherParticipant.name} />
                      <AvatarFallback>{getInitials(otherParticipant.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow overflow-hidden">
                      <div className="flex justify-between items-center">
                         <h3 className="text-sm font-semibold truncate">{otherParticipant.name}</h3>
             {conv.unreadCount > 0 && 
                           <Badge variant="destructive" className="h-5 px-1.5 text-xs">
               {conv.unreadCount}
                           </Badge>
                         }
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.lastMessage || 'Nouvelle conversation'}
                      </p>
                    </div>
                     <span className="text-xs text-muted-foreground flex-shrink-0 ml-auto self-start pt-1">
                       {formatDate(conv.lastMessageAt || conv.updatedAt)}
                     </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className={cn(
            "flex-grow flex flex-col",
            !selectedConversationId && "hidden md:flex"
        )}>
          {selectedConversationId && selectedConversation ? (
            <>
              <div className="p-3 border-b flex items-center gap-3">
                 <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setSelectedConversationId(null)}>
                    <ArrowLeft className="h-5 w-5"/>
                 </Button>
                 {(() => {
                   const otherParticipant = getOtherParticipant(selectedConversation);
                   return (
                     <>
                       <Avatar className="h-9 w-9">
                         <AvatarImage src={otherParticipant.avatar} alt={otherParticipant.name} />
                         <AvatarFallback>{getInitials(otherParticipant.name)}</AvatarFallback>
                       </Avatar>
                       <div>
                          <h2 className="text-lg font-semibold">{otherParticipant.name}</h2>
                          {selectedConversation.parcelId &&
                            <Link to={`/parcelles/${selectedConversation.parcelId}`} className="text-xs text-primary hover:underline">
                                Concerne la parcelle: {selectedConversation.parcelId}
                            </Link>
                          }
                       </div>
                     </>
                   );
                 })()}
              </div>

              <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-muted/20">
                {loadingMessages ? (
                  <div className="space-y-4">
                     <Skeleton className="h-10 w-3/5" />
                     <Skeleton className="h-10 w-3/5 ml-auto" />
                     <Skeleton className="h-10 w-3/5" />
                  </div>
                ) : conversationMessages.length === 0 ? (
                   <p className="text-center text-muted-foreground pt-10">Aucun message. Soyez le premier à en envoyer un !</p>
                ) : (
                  conversationMessages.map(msg => (
                    <div key={msg.id} className={cn("flex", (msg.sender_id||msg.senderId) === user.id ? 'justify-end' : 'justify-start')}>
                      <div className={cn(
                        "p-2 px-3 rounded-lg max-w-[75%]",
                        (msg.sender_id||msg.senderId) === user.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      )}>
                        <p className="text-sm">{msg.content}</p>
                        <span className={cn("text-xs mt-1 block text-right", msg.senderId === user.id ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                           {formatDate(msg.created_at || msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t bg-background">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Écrivez votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-grow"
                    disabled={loadingMessages}
                  />
                  <Button type="submit" size="icon" disabled={!newMessage.trim() || loadingMessages}>
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-muted/30">
               <MessageSquare className="h-20 w-20 text-muted-foreground/50 mb-4"/>
              <h2 className="text-xl font-semibold text-muted-foreground">Sélectionnez une conversation</h2>
              <p className="text-muted-foreground">Choisissez une conversation dans la liste de gauche pour afficher les messages.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SecureMessagingPage;
