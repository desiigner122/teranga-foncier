// src/components/GlobalChatbot.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquareText, X, Send, User, Bot, Loader2, Trash2 } from 'lucide-react';
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

  // Suggestions prédéfinies pour le début de conversation
  const initialSuggestions = [
    "Je suis un acheteur, aidez-moi.",
    "Je suis un vendeur, que proposez-vous ?",
    "Je suis une mairie, comment ça marche ?",
    "J'ai une question légale sur le foncier.",
    "Comment contacter le support ?"
  ];
  const [currentSuggestions, setCurrentSuggestions] = useState([]);

  // Fonction pour un message de bienvenue dynamique
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting;
    if (hour < 12) greeting = "Bonjour";
    else if (hour < 18) greeting = "Bon après-midi";
    else greeting = "Bonsoir";

    return `${greeting} ! Je suis votre assistant virtuel Teranga Foncier. Je suis là pour vous aider avec toutes vos questions sur l'immobilier au Sénégal.`;
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
    handleSendMessage(suggestion); // Envoie la suggestion comme un message utilisateur
  };

  return (
    <>
      {/* Bouton flottant du chatbot */}
      <Button
        className="fixed bottom-6 right-6 z-50 rounded-full h-14 w-14 shadow-lg bg-blue-600 hover:bg-blue-700 transition-all duration-300"
        size="icon"
        onClick={toggleChatbot}
      >
        {isChatbotOpen ? <X className="h-6 w-6" /> : <MessageSquareText className="h-6 w-6" />}
      </Button>

      {/* Fenêtre du chatbot */}
      <AnimatePresence>
        {isChatbotOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[350px] h-[500px] bg-card border rounded-lg shadow-xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <h3 className="font-semibold">Assistant Teranga Foncier</h3>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={clearChatHistory} className="text-primary-foreground hover:bg-primary-foreground/20" aria-label="Effacer l'historique">
                  <Trash2 className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={closeChatbot} className="text-primary-foreground hover:bg-primary-foreground/20" aria-label="Fermer le chatbot">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4 space-y-4">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={cn(
                    "flex items-start gap-3",
                    msg.sender === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.sender === 'bot' && <Avatar className="h-8 w-8 shrink-0"><AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback></Avatar>}
                  <div
                    className={cn(
                      "rounded-lg p-3 max-w-[75%]",
                      msg.sender === 'user'
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-muted text-foreground rounded-bl-none"
                    )}
                  >
                    {msg.text}
                  </div>
                  {msg.sender === 'user' && <Avatar className="h-8 w-8 shrink-0"><AvatarFallback><User className="h-5 w-5"/></AvatarFallback></Avatar>}
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-3 justify-start">
                  <Avatar className="h-8 w-8 shrink-0"><AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback></Avatar>
                  <div className="rounded-lg p-3 bg-muted text-foreground rounded-bl-none">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> L'IA est en train d'écrire...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Suggestions de boutons */}
            {currentSuggestions.length > 0 && (
              <div className="p-4 border-t flex flex-wrap gap-2 justify-center">
                {currentSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs px-3 py-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}

            <div className="p-4 border-t flex items-center gap-2">
              <Input
                placeholder="Écrivez votre message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isTyping}
                className="flex-1"
              />
              <Button size="icon" onClick={() => handleSendMessage()} disabled={isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalChatbot;
