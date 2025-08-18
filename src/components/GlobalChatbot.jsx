// src/components/GlobalChatbot.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquareText, X, Send, User, Bot, Loader2, Trash2, Sparkles, MessageCircle, HelpCircle, MapPin, Search, Phone, Brain, Zap, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { useAuth } from '@/context/AuthContext';
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { useChatbot } from '@/context/ChatbotContext';
import { hybridAI } from '@/lib/hybridAI';

const GlobalChatbot = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const { isChatbotOpen, toggleChatbot, closeChatbot } = useChatbot();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Suggestions prédéfinies pour le début de conversation avec icônes
  const initialSuggestions = [
    { text: "Je suis un acheteur, aidez-moi.", icon: Search, category: "achat" },
    { text: "Je suis un vendeur, que proposez-vous ?", icon: MapPin, category: "vente" },
    { text: "Je suis une mairie, comment ça marche ?", icon: MessageCircle, category: "institution" },
    { text: "J'ai une question légale sur le foncier.", icon: Shield, category: "legal" },
    { text: "Comment contacter le support ?", icon: Phone, category: "support" }
  ];
  const [currentSuggestions, setCurrentSuggestions] = useState([]);
  const [currentModel, setCurrentModel] = useState('hybrid');
  const [responseTime, setResponseTime] = useState(null);

  // Fonction pour un message de bienvenue dynamique avec emoji personnalisé
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting, emoji;
    if (hour < 12) {
      greeting = "Bonjour";
      emoji = "🌅";
    } else if (hour < 18) {
      greeting = "Bon après-midi";
      emoji = "☀️";
    } else {
      greeting = "Bonsoir";
      emoji = "🌙";
    }

    const username = isAuthenticated ? ` ${user?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}` : '';
    
    return `${greeting}${username} ! ${emoji}

Je suis **Teranga AI**, votre assistant intelligent hybride qui combine Claude, ChatGPT et Gemini pour vous offrir les meilleures réponses. 🧠✨

Je peux vous aider avec :
• 🔍 Recherche de terrains et propriétés
• 📋 Procédures administratives et légales
• 💼 Conseils d'investissement intelligents
• 🏛️ Démarches notariales et juridiques
• 📞 Mise en relation avec nos experts
• 🛡️ Prévention et détection de fraude

Mon IA hybride sélectionne automatiquement le meilleur modèle selon votre question !

Comment puis-je vous assister aujourd'hui ?`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialisation du message de bienvenue et des suggestions si la conversation est vide
  useEffect(() => {
    if (isChatbotOpen && messages.length === 0) {
      setMessages([{ sender: 'bot', text: getWelcomeMessage() }]);
      setCurrentSuggestions(initialSuggestions);
    }
  }, [isChatbotOpen]);

  const handleSendMessage = async (textToSend = inputValue) => {
    if (!textToSend.trim()) return;

    const userMessage = { sender: 'user', text: textToSend };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setCurrentSuggestions([]); // Efface les suggestions après l'envoi d'un message
    
    const startTime = Date.now();

    try {
      // Contexte utilisateur pour l'IA hybride
      const context = {
        isAuthenticated,
        userRole: user?.role || user?.type,
        userName: user?.full_name || user?.email,
        platform: 'teranga-foncier'
      };

      // Utilise le service IA hybride
      const response = await hybridAI.generateResponse(textToSend, messages, context);
      
      const endTime = Date.now();
      setResponseTime(endTime - startTime);
      setCurrentModel(response.modelUsed || 'hybrid');
      
      // Ajoute la réponse avec les métadonnées
      const botMessage = {
        sender: 'bot',
        text: response.text,
        confidence: response.confidence,
        modelUsed: response.modelUsed,
        timestamp: response.timestamp,
        fallback: response.fallback
      };
      
      setMessages((prevMessages) => [...prevMessages, botMessage]);
      setCurrentSuggestions(response.suggestions || []); // Met à jour les suggestions
      
      // Notification si fallback utilisé
      if (response.fallback) {
        toast({
          title: "Modèle de secours utilisé",
          description: `${response.originalModel} indisponible, ${response.modelUsed} utilisé`,
        });
      }
      
    } catch (err) {
      console.error("Erreur lors de l'appel à l'IA hybride:", err);
      setMessages((prevMessages) => [...prevMessages, { 
        sender: 'bot', 
        text: `Une erreur est survenue: ${err.message}. Veuillez réessayer plus tard.`,
        error: true
      }]);
      toast({
        variant: "destructive",
        title: "Erreur de l'assistant IA",
        description: `Impossible de communiquer avec l'IA. ${err.message}.`,
      });
      setCurrentSuggestions(initialSuggestions); // Réinitialise les suggestions initiales en cas d'erreur
    } finally {
      setIsTyping(false);
    }
  };

  const clearChatHistory = () => {
    setMessages([]);
    setInputValue('');
    setIsTyping(false);
    setMessages([{ sender: 'bot', text: getWelcomeMessage() }]);
    setCurrentSuggestions(initialSuggestions); // Réinitialise les suggestions
  };

  const handleSuggestionClick = (suggestion) => {
    const textToSend = typeof suggestion === 'string' ? suggestion : suggestion.text;
    handleSendMessage(textToSend); // Envoie la suggestion comme un message utilisateur
  };

  return (
    <>
      {/* Bouton flottant du chatbot avec animation pulse */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          className={cn(
            "rounded-full h-16 w-16 shadow-2xl transition-all duration-300 relative overflow-hidden",
            isChatbotOpen 
              ? "bg-gray-600 hover:bg-gray-700" 
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          )}
          size="icon"
          onClick={toggleChatbot}
        >
          <AnimatePresence mode="wait">
            {isChatbotOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <MessageSquareText className="h-6 w-6" />
                <motion.div
                  className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="h-2 w-2 bg-white rounded-full"></div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Effet de pulse autour du bouton */}
          {!isChatbotOpen && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-blue-400"
              animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </Button>
      </motion.div>

      {/* Fenêtre du chatbot avec taille responsive */}
      <AnimatePresence>
        {isChatbotOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[90vw] h-[700px] max-h-[80vh] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header avec gradient moderne et indicateurs IA */}
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-white/20">
                      <AvatarFallback className="bg-white/20 text-white">
                        <Brain className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <motion.div
                      className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white flex items-center justify-center"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Zap className="h-2 w-2 text-white" />
                    </motion.div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Teranga AI Hybride</h3>
                    <div className="flex items-center gap-2 text-sm text-white/90">
                      <div className="flex items-center gap-1">
                        <Brain className="h-3 w-3" />
                        <span className="text-xs font-medium">{currentModel?.toUpperCase() || 'HYBRID'}</span>
                      </div>
                      {responseTime && (
                        <div className="text-xs text-white/70">
                          • {responseTime}ms
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-white/80">
                      <Sparkles className="h-3 w-3" />
                      <span>Claude • ChatGPT • Gemini</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={clearChatHistory} 
                    className="text-white hover:bg-white/20 h-8 w-8" 
                    aria-label="Effacer l'historique"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={closeChatbot} 
                    className="text-white hover:bg-white/20 h-8 w-8" 
                    aria-label="Fermer le chatbot"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Effet d'onde décoratif amélioré */}
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="h-full w-full">
                  <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="rgba(255,255,255,0.15)"></path>
                </svg>
              </div>
            </div>

            {/* Zone de messages avec scroll amélioré */}
            <ScrollArea className="flex-1 p-4 bg-gray-50 dark:bg-gray-800">
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={cn(
                      "flex items-start gap-3",
                      msg.sender === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.sender === 'bot' && (
                      <Avatar className="h-8 w-8 shrink-0 border-2 border-blue-200">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          <Brain className="h-4 w-4"/>
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex flex-col max-w-[85%]">
                      <div
                        className={cn(
                          "rounded-2xl p-4 shadow-sm",
                          msg.sender === 'user'
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-md"
                            : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md border border-gray-200 dark:border-gray-600"
                        )}
                      >
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                        
                        {/* Métadonnées pour les messages IA */}
                        {msg.sender === 'bot' && (msg.modelUsed || msg.confidence) && (
                          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            {msg.modelUsed && (
                              <div className="flex items-center gap-1">
                                <Brain className="h-3 w-3" />
                                <span className="font-medium">{msg.modelUsed?.toUpperCase()}</span>
                                {msg.fallback && <span className="text-orange-500">(secours)</span>}
                              </div>
                            )}
                            {msg.confidence && (
                              <div className="flex items-center gap-1">
                                <div className={cn(
                                  "w-2 h-2 rounded-full",
                                  msg.confidence > 0.8 ? "bg-green-500" :
                                  msg.confidence > 0.6 ? "bg-yellow-500" : "bg-red-500"
                                )} />
                                <span>{Math.round(msg.confidence * 100)}%</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {msg.sender === 'user' && (
                      <Avatar className="h-8 w-8 shrink-0 border-2 border-gray-200">
                        <AvatarFallback className="bg-gray-100 text-gray-600">
                          <User className="h-4 w-4"/>
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </motion.div>
                ))}
                
                {/* Indicateur de frappe avec animation améliorée */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 justify-start"
                  >
                    <Avatar className="h-8 w-8 shrink-0 border-2 border-blue-200">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        <Brain className="h-4 w-4"/>
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl rounded-bl-md p-4 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <motion.div
                            className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full"
                            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">L'IA hybride analyse...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Suggestions avec icônes et design amélioré - Positionnement amélioré */}
            {currentSuggestions.length > 0 && (
              <div className="p-3 bg-gradient-to-b from-gray-50/90 to-white dark:from-gray-800/90 dark:to-gray-900 border-t border-gray-200 dark:border-gray-700 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Suggestions intelligentes</span>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {currentSuggestions.slice(0, 3).map((suggestion, index) => {
                    const suggestionData = typeof suggestion === 'string' 
                      ? { text: suggestion, icon: MessageCircle } 
                      : suggestion;
                    const Icon = suggestionData.icon || MessageCircle;
                    
                    return (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="flex items-center gap-2 p-2 text-left text-xs bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 group hover:shadow-sm w-full"
                      >
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-md group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-all duration-200 flex-shrink-0">
                          <Icon className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-300 flex-1 truncate">
                          {suggestionData.text}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <Send className="h-3 w-3 text-blue-500" />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Zone de saisie moderne */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-2">
                <Input
                  placeholder="Écrivez votre message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  disabled={isTyping}
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500"
                />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="icon" 
                    onClick={() => handleSendMessage()} 
                    disabled={isTyping || !inputValue.trim()}
                    className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 h-10 w-10"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
              
              {/* Footer avec logo */}
              <div className="flex items-center justify-center mt-3 text-xs text-gray-500">
                <span>Propulsé par </span>
                <Sparkles className="h-3 w-3 mx-1" />
                <span className="font-medium">Teranga AI</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalChatbot;
