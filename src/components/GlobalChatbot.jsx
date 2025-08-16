// src/components/GlobalChatbot.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquareText, X, Send, User, Bot, Loader2, Trash2, Sparkles, MessageCircle, HelpCircle, MapPin, Search, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { useAuth } from '@/context/AuthContext';
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { useChatbot } from '@/context/ChatbotContext';

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
    { text: "J'ai une question légale sur le foncier.", icon: HelpCircle, category: "legal" },
    { text: "Comment contacter le support ?", icon: Phone, category: "support" }
  ];
  const [currentSuggestions, setCurrentSuggestions] = useState([]);

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

Je suis **Teranga AI**, votre assistant intelligent pour tout ce qui concerne l'immobilier foncier au Sénégal. 🏡

Je peux vous aider avec :
• 🔍 Recherche de terrains et propriétés
• 📋 Procédures administratives
• 💼 Conseils d'investissement
• 🏛️ Démarches légales et notariales
• 📞 Mise en relation avec nos experts

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

    // Instructions système pour l'IA : concision, personnalité et format de réponse JSON
    let systemInstruction = `Tu es l'assistant virtuel de Teranga Foncier, une plateforme immobilière au Sénégal. Tu es moderne, intelligent, un assistant serviable, gentil, professionnel et capable d'humour léger.
    Ton rôle est de fournir des informations précises, utiles et CONCISES sur l'achat, la vente, la gestion de terrains, les procédures foncières, les services de Teranga Foncier, et les spécificités du marché immobilier sénégalais.
    Réponds de manière brève et directe, en évitant les longs paragraphes. Utilise des émojis pertinents pour rendre tes réponses plus amicales et expressives.
    Après chaque réponse, propose 1 à 3 suggestions de questions ou d'actions pertinentes pour l'utilisateur. Ces suggestions doivent être liées au contexte de la conversation ou aux prochaines étapes logiques.
    
    Le format de ta réponse DOIT être un objet JSON avec deux propriétés :
    {
      "text": "Ta réponse textuelle avec des émojis.",
      "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"] // Tableau de chaînes de caractères
    }
    
    Si une question est trop complexe ou nécessite une action spécifique sur la plateforme (ex: "créer un compte", "faire une demande"), oriente l'utilisateur vers la fonctionnalité ou le contact approprié et propose des liens pertinents si possible.
    Si l'utilisateur n'est pas connecté et pose une question sur des fonctionnalités avancées, rappelle-lui qu'il doit se connecter ou s'inscrire pour y accéder.`;
    
    let prompt;
    if (!isAuthenticated) {
      prompt = `${systemInstruction} L'utilisateur n'est pas connecté. Sa question : "${textToSend}".`;
    } else {
      prompt = `${systemInstruction} L'utilisateur est connecté (Nom: ${user.full_name || user.email}, Rôle: ${user.role || user.type}). Sa question : "${textToSend}".`;
    }

    try {
      let chatHistory = messages.map(msg => ({ role: msg.sender === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] }));
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });

      const payload = {
        contents: chatHistory,
        generationConfig: {
          responseMimeType: "application/json", // Demande une réponse JSON
          responseSchema: { // Définit le schéma attendu
            type: "OBJECT",
            properties: {
              text: { type: "STRING" },
              suggestions: {
                type: "ARRAY",
                items: { type: "STRING" }
              }
            },
            required: ["text", "suggestions"]
          }
        }
      };

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error("Configuration manquante: API Key pour Gemini non configurée.");
      }

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

      const MAX_RETRIES = 3;
      let retries = 0;
      let response;

      while (retries < MAX_RETRIES) {
        try {
          response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (response.status === 429) {
            const delay = Math.pow(2, retries) * 1000;
            retries++;
            await new Promise(res => setTimeout(res, delay));
            continue;
          }

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `Erreur HTTP: ${response.status}`);
          }

          break;
        } catch (fetchError) {
          if (retries === MAX_RETRIES - 1) {
            throw fetchError;
          }
          retries++;
          const delay = Math.pow(2, retries) * 1000;
          await new Promise(res => setTimeout(res, delay));
        }
      }

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const aiResponseRaw = result.candidates[0].content.parts[0].text;
        let aiResponse;
        try {
          aiResponse = JSON.parse(aiResponseRaw); // Tente de parser la réponse JSON
        } catch (parseError) {
          console.error("Erreur de parsing JSON de la réponse IA:", parseError, "Réponse brute:", aiResponseRaw);
          aiResponse = { text: aiResponseRaw, suggestions: [] }; // Fallback si le parsing échoue
        }
        
        setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: aiResponse.text }]);
        setCurrentSuggestions(aiResponse.suggestions || []); // Met à jour les suggestions
      } else {
        setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: "Désolé, je n'ai pas pu générer de réponse. Veuillez réessayer." }]);
        setCurrentSuggestions(initialSuggestions); // Réinitialise les suggestions initiales
      }
    } catch (err) {
      console.error("Erreur lors de l'appel à l'API Gemini:", err);
      setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: `Une erreur est survenue: ${err.message}. Veuillez réessayer plus tard.` }]);
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

      {/* Fenêtre du chatbot */}
      <AnimatePresence>
        {isChatbotOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] h-[600px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header avec gradient moderne */}
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 border-2 border-white/20">
                      <AvatarFallback className="bg-white/20 text-white">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <motion.div
                      className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Teranga AI</h3>
                    <div className="flex items-center gap-1 text-sm text-white/80">
                      <Sparkles className="h-3 w-3" />
                      <span>En ligne • Répond instantanément</span>
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
              
              {/* Effet d'onde décoratif */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-blue-600 to-purple-600">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="h-full w-full">
                  <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="rgba(255,255,255,0.1)"></path>
                </svg>
              </div>
            </div>

            {/* Zone de messages */}
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
                          <Bot className="h-4 w-4"/>
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl p-4 max-w-[85%] shadow-sm",
                        msg.sender === 'user'
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-md"
                          : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md border border-gray-200 dark:border-gray-600"
                      )}
                    >
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</div>
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
                
                {/* Indicateur de frappe avec animation */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 justify-start"
                  >
                    <Avatar className="h-8 w-8 shrink-0 border-2 border-blue-200">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        <Bot className="h-4 w-4"/>
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl rounded-bl-md p-4 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <motion.div
                            className="w-2 h-2 bg-blue-500 rounded-full"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-blue-500 rounded-full"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-blue-500 rounded-full"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                          />
                        </div>
                        <span className="text-sm text-gray-500">Teranga AI écrit...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Suggestions avec icônes */}
            {currentSuggestions.length > 0 && (
              <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 gap-2">
                  {currentSuggestions.map((suggestion, index) => {
                    const suggestionData = typeof suggestion === 'string' 
                      ? { text: suggestion, icon: MessageCircle } 
                      : suggestion;
                    const Icon = suggestionData.icon || MessageCircle;
                    
                    return (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="flex items-center gap-3 p-3 text-left text-sm bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors group"
                      >
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                          <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                          {suggestionData.text}
                        </span>
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
