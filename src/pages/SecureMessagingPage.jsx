import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { sampleConversations as initialSampleConversations, sampleMessages as initialSampleMessages, sampleUsers } from '@/data/userData';
import { useAuth } from '@/context/AuthContext';
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
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setLoadingConversations(true);
    setError(null);
    if (!user) {
       setError("Veuillez vous connecter pour accéder à la messagerie.");
       setLoadingConversations(false);
       return;
    }
    
    setTimeout(() => {
      let userConvs = initialSampleConversations.filter(c => c.participants && c.participants.includes(user.id));
      
      let convsWithDetails = userConvs.map(c => {
        const otherUserId = c.participants.find(pId => pId !== user.id);
        const otherUser = sampleUsers.find(u => u.id === otherUserId);
        return { ...c, otherUserName: otherUser?.name || 'Utilisateur Inconnu', otherUserAvatar: otherUser?.avatar };
      });
      
      const { parcelId, parcelName, contactUser } = location.state || {};
      if (parcelId && contactUser) {
        let existingConv = convsWithDetails.find(c => c.parcel_id === parcelId && c.participants.includes(contactUser));
        if (!existingConv) {
            const otherUserDetails = sampleUsers.find(u => u.id === contactUser);
            const newConv = {
              id: `conv_${parcelId}_${contactUser}`,
              participants: [user.id, contactUser],
              parcel_id: parcelId,
              last_message: `Nouvelle conversation pour ${parcelName}`,
              unread_count: 0,
              updated_at: new Date().toISOString(),
              otherUserName: otherUserDetails?.name || 'Utilisateur Inconnu',
              otherUserAvatar: otherUserDetails?.avatar,
            };
            convsWithDetails = [newConv, ...convsWithDetails];
            setSelectedConversationId(newConv.id);
        } else {
            setSelectedConversationId(existingConv.id);
        }
      }

      setConversations(convsWithDetails);
      setLoadingConversations(false);
    }, 300);
  }, [user, location.state]);

  useEffect(() => {
    if (selectedConversationId) {
      setLoadingMessages(true);
      setMessages([]);
      setTimeout(() => {
        setMessages(initialSampleMessages[selectedConversationId] || []);
        setLoadingMessages(false);
        setConversations(prev => prev.map(c => c.id === selectedConversationId ? {...c, unread_count: 0} : c));
      }, 200);
    } else {
       setMessages([]);
    }
  }, [selectedConversationId]);

  const handleSelectConversation = (convId) => {
    setSelectedConversationId(convId);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId || !user) return;

    const messageToSend = {
      id: `msg${Date.now()}`,
      conversation_id: selectedConversationId,
      sender_id: user.id,
      content: newMessage,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, messageToSend]);
    setNewMessage('');

    const currentConv = conversations.find(c => c.id === selectedConversationId);
    const otherUserId = currentConv.participants.find(pId => pId !== user.id);

    setTimeout(() => {
       const reply = {
          id: `msg${Date.now()+1}`,
          conversation_id: selectedConversationId,
          sender_id: otherUserId,
          content: 'Message reçu (Simulation). Je vous réponds dès que possible.',
          created_at: new Date().toISOString(),
       };
       setMessages(prev => [...prev, reply]);
    }, 1500);

    setConversations(prev => prev.map(c =>
       c.id === selectedConversationId ? {...c, last_message: newMessage, updated_at: new Date().toISOString()} : c
    ).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)));

    toast({ title: "Message envoyé (Simulation)" });
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

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
            {loadingConversations ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : error ? (
               <p className="p-4 text-destructive">{error}</p>
            ) : conversations.length === 0 ? (
               <p className="p-4 text-muted-foreground text-center">Aucune conversation.</p>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  className={cn(
                    "flex items-center gap-3 p-3 cursor-pointer border-b last:border-b-0 hover:bg-muted/50",
                    selectedConversationId === conv.id && "bg-muted"
                  )}
                  onClick={() => handleSelectConversation(conv.id)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conv.otherUserAvatar} alt={conv.otherUserName} />
                    <AvatarFallback>{getInitials(conv.otherUserName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow overflow-hidden">
                    <div className="flex justify-between items-center">
                       <h3 className="text-sm font-semibold truncate">{conv.otherUserName}</h3>
                       {conv.unread_count > 0 && <Badge variant="destructive" className="h-5 px-1.5 text-xs">{conv.unread_count}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{conv.last_message}</p>
                  </div>
                   <span className="text-xs text-muted-foreground flex-shrink-0 ml-auto self-start pt-1">{formatDate(conv.updated_at)}</span>
                </div>
              ))
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
                 <Avatar className="h-9 w-9">
                   <AvatarImage src={selectedConversation.otherUserAvatar} alt={selectedConversation.otherUserName} />
                   <AvatarFallback>{getInitials(selectedConversation.otherUserName)}</AvatarFallback>
                 </Avatar>
                 <div>
                    <h2 className="text-lg font-semibold">{selectedConversation.otherUserName}</h2>
                    {selectedConversation.parcel_id &&
                      <Link to={`/parcelles/${selectedConversation.parcel_id}`} className="text-xs text-primary hover:underline">
                          Concerne la parcelle: {selectedConversation.parcel_id}
                      </Link>
                    }
                 </div>
              </div>

              <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-muted/20">
                {loadingMessages ? (
                  <div className="space-y-4">
                     <Skeleton className="h-10 w-3/5" />
                     <Skeleton className="h-10 w-3/5 ml-auto" />
                     <Skeleton className="h-10 w-3/5" />
                  </div>
                ) : messages.length === 0 ? (
                   <p className="text-center text-muted-foreground pt-10">Aucun message. Soyez le premier à en envoyer un !</p>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={cn("flex", msg.sender_id === user.id ? 'justify-end' : 'justify-start')}>
                      <div className={cn(
                        "p-2 px-3 rounded-lg max-w-[75%]",
                        msg.sender_id === user.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      )}>
                        <p className="text-sm">{msg.content}</p>
                        <span className={cn("text-xs mt-1 block text-right", msg.sender_id === user.id ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                           {formatDate(msg.created_at)}
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