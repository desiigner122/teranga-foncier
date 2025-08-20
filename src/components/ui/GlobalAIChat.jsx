// src/components/ui/GlobalAIChat.jsx - Chat IA principal à droite
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquareText, X, Send, User, Bot, Brain, Sparkles, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { useAuth } from '@/context/AuthContext';
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { hybridAI } from '@/lib/hybridAI';

const GlobalAIChat = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const { data: messages, loading: messagesLoading, error: messagesError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (messages) {
      setFilteredData(messages);
    }
  }, [messages]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
    const username = isAuthenticated ? ` ${user?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}` : '';
    
    return `?? ${greeting}${username} !

?? Je suis **Teranga AI Global**, votre assistant intelligent pour la plateforme foncière.

? **MES SPÉCIALITÉS :**
?? Recherche de propriétés personnalisée
?? Évaluations et conseils de prix  
?? Procédures et démarches administratives
?? Conseils d'investissement immobilier
?? Navigation et aide sur la plateforme

?? **COMMENT PUIS-JE VOUS AIDER ?**
Posez-moi vos questions en langage naturel !`;
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ sender: 'bot', text: getWelcomeMessage() }]);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend = inputValue) => {
    if (!textToSend.trim()) return;

    const userMessage = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const context = {
        isAuthenticated,
        userRole: user?.role || user?.type,
        platform: 'teranga-global'
      };

      const response = await hybridAI.generateResponse(textToSend, messages, context);
      
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: response.text,
        modelUsed: response.modelUsed,
        confidence: response.confidence
      }]);
      
    } catch (error) {
      console.error("Erreur IA Global:", error);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: "Désolé, je rencontre des difficultés. Veuillez réessayer.",
        error: true
      }]);
      toast({
        variant: "destructive",
        title: "Erreur IA Global",
        description: error.message,
      });
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([{ sender: 'bot', text: getWelcomeMessage() }]);
  };

  return (
    <>
      {/* Bouton flottant à droite */}
      <motion.div
        className="fixed bottom-6 right-6 z-40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          className={cn(
            "rounded-full h-14 w-14 shadow-lg transition-all duration-300",
            isOpen 
              ? "bg-gray-600 hover:bg-gray-700" 
              : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          )}
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <MessageSquareText className="h-6 w-6 text-white" />
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Fenêtre de chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 100 }}
            className="fixed bottom-24 right-6 z-40 w-[500px] h-[700px] bg-white border border-gray-200 rounded-xl shadow-xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-white/20 text-white">
                      <MessageSquareText className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">Teranga AI Global</h3>
                    <p className="text-xs text-white/80">Chat principal</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={clearChat} className="h-8 w-8 text-white hover:bg-white/20">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-white hover:bg-white/20">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-2",
                      msg.sender === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.sender === 'bot' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-[85%] p-4 rounded-lg text-sm leading-relaxed",
                        msg.sender === 'user'
                          ? "bg-blue-500 text-white rounded-br-sm"
                          : "bg-gray-50 text-gray-900 rounded-bl-sm border border-gray-200"
                      )}
                    >
                      <div className="whitespace-pre-wrap font-medium">{msg.text}</div>
                      {msg.sender === 'bot' && msg.modelUsed && (
                        <div className="mt-2 text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded-full inline-block">
                          {msg.modelUsed.toUpperCase()}
                        </div>
                      )}
                    </div>
                    {msg.sender === 'user' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gray-100 text-gray-600">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-2 justify-start">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 p-3 rounded-lg rounded-bl-sm">
                      <div className="flex space-x-1">
                        <motion.div
                          className="w-2 h-2 bg-blue-500 rounded-full"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-blue-500 rounded-full"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-blue-500 rounded-full"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Posez votre question..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  disabled={isTyping}
                  className="flex-1"
                />
                <Button 
                  size="icon" 
                  onClick={() => handleSendMessage()} 
                  disabled={isTyping || !inputValue.trim()}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalAIChat;

