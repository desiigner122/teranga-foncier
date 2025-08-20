// src/components/ui/DashboardAIAssistant.jsx - Assistant IA spécialisé à gauche
import React, { useState, useEffect, useRef } from 'react';
const DashboardAIAssistant = ({ dashboardContext, onAction, userRole = 'user' }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const { data: messageData, loading: messagesLoading, error: messagesError, refetch } = useRealtimeMessages(null, { limit: 50 });
  const [filteredData, setFilteredData] = useState([]);
  const [chatMessages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { isEnabled: isFeatureEnabled } = useFeatureFlag('show_dashboard_assistant', true);
  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  useEffect(() => {
    scrollToBottom();
    if (messageData) {
      setFilteredData(messageData);
    }
  }, [messageData]);
  
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const getWelcomeMessage = () => {
    const roleMessages = {
      admin: "é️ **Assistant IA Admin** - Je vous aide à gérer la plateforme, analyser les données et superviser les opérations avec expertise.",
      notaire: "⚖️ **Assistant IA Notaire** - Spécialisé dans l'analyse de documents, la conformité légale et la gestion des dossiers complexes.",
      particulier: "🏠 **Assistant IA Particulier** - Je vous guide dans vos recherches de propriétés et vos démarches d'acquisition avec des conseils personnalisés.",
      vendeur: "💼 **Assistant IA Vendeur** - Optimisation de vos annonces, analyse de marché et stratégies de vente pour maximiser vos résultats.",
      banque: "🏦 **Assistant IA Banque** - Évaluation de risques, analyse de garanties et gestion de portefeuille avec précision.",
      agent: "🤝 **Assistant IA Agent** - Gestion clientèle, planification visites et suivi des transactions pour votre réussite.",
      mairie: "🏛️ **Assistant IA Mairie** - Gestion du foncier communal, urbanisme et démarches administratives municipales."
    };

    return `👋 ${roleMessages[userRole] || "🤖 **Assistant IA Dashboard** - Je vous aide avec votre tableau de bord et vos tâches spécialisées."}

🎯 **MON RÔLE :**
• Assistance spécialisée selon votre profil
• Réponses expertes dans votre domaine  
• Suggestions d'actions pertinentes
• Support technique personnalisé

💬 **PRÊT À VOUS AIDER !**
Utilisez les actions rapides ou posez vos questions directement.`;
  };

  const getSpecializedPrompts = () => {
    const prompts = {
      admin: [
        "📊 Analyser les performances",
        "📈 Rapport d'activité mensuel", 
        "⚠️ Identifier les risques",
        "⚙️ Optimiser les processus"
      ],
      notaire: [
        "⚖️ Analyser ce dossier",
        "✅ Vérifier la conformité",
        "🔍 Évaluer les risques",
        "📋 Proposer des clauses"
      ],
      particulier: [
        "🏠 Rechercher des propriétés",
        "💰 Évaluer ce terrain", 
        "📊 Calculer les frais",
        "💡 Conseils d'investissement"
      ],
      vendeur: [
        "💸 Optimiser le prix",
        "📊 Analyser la concurrence",
        "✨ Améliorer l'annonce",
        "📢 Stratégie marketing"
      ]
    };

    return prompts[userRole] || [
      "📊 Analyser les données",
      "💡 Générer des insights", 
      "⚡ Optimiser performance",
      "🎯 Conseils personnalisés"
    ];
  };

  useEffect(() => {
    if (isOpen && chatMessages.length === 0) {
      setMessages([{ sender: 'bot', text: getWelcomeMessage() }]);
    }
  }, [isOpen, userRole, chatMessages.length]);

  const handleSendMessage = async (textToSend = inputValue) => {
    if (!textToSend.trim()) return;

    const userMessage = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const context = {
        role: userRole,
        dashboardData: dashboardContext,
        domain: 'dashboard_assistance'
      };

      const response = await hybridAI.generateResponse(textToSend, messages, context);
      
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: response.text,
        modelUsed: response.modelUsed,
        confidence: response.confidence,
        suggestions: response.suggestions || []
      }]);

      // Exécuter des actions si nécessaire
      if (onAction && response.actionType) {
        onAction(response.actionType, response);
      }
      
    } catch (error) {      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: "Erreur technique. Veuillez réessayer.",
        error: true
      }]);
      toast({
        variant: "destructive",
        title: "Erreur Assistant IA",
        description: error.message,
      });
    } finally {
      setIsTyping(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const handleQuickAction = (prompt) => {
    handleSendMessage(prompt);
  };

  return (
    <>
      {/* Bouton flottant à gauche */}
      <motion.div
        className="fixed bottom-6 left-6 z-40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          className={cn(
            "rounded-full h-14 w-14 shadow-lg transition-all duration-300",
            isOpen 
              ? "bg-purple-600 hover:bg-purple-700" 
              : "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
          )}
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Brain className="h-6 w-6 text-white" />
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Fenêtre assistant */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -100 }}
            className="fixed bottom-24 left-6 z-40 w-[500px] h-[700px] bg-white border border-gray-200 rounded-xl shadow-xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-white/20 text-white">
                      <Brain className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">Assistant IA {userRole}</h3>
                    <p className="text-xs text-white/80">Spécialisé dashboard</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-white hover:bg-white/20">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
              <h4 className="text-sm font-semibold mb-3 text-purple-700">🚀 Actions rapides</h4>
              <div className="grid grid-cols-1 gap-2">
                {getSpecializedPrompts().slice(0, 4).map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(prompt)}
                    className="text-xs h-10 justify-start border-purple-200 hover:bg-purple-100 hover:border-purple-300 transition-all"
                  >
                    <Sparkles className="h-3 w-3 mr-2 text-purple-500" />
                    <span className="font-medium">{prompt}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatMessages.map((msg, index) => (
                  <div key={index}>
                    <div
                      className={cn(
                        "flex gap-2",
                        msg.sender === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.sender === 'bot' && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-purple-100 text-purple-600">
                            <Brain className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "max-w-[85%] p-4 rounded-lg text-sm leading-relaxed",
                          msg.sender === 'user'
                            ? "bg-purple-500 text-white rounded-br-sm"
                            : "bg-gray-50 text-gray-900 rounded-bl-sm border border-gray-200"
                        )}
                      >
                        <div className="whitespace-pre-wrap font-medium">{msg.text}</div>
                        {msg.sender === 'bot' && (
                          <div className="flex items-center gap-2 mt-3">
                            {msg.modelUsed && (
                              <div className="text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-1 rounded-full">
                                {msg.modelUsed.toUpperCase()}
                              </div>
                            )}
                            {msg.confidence && (
                              <div className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">
                                {Math.round(msg.confidence * 100)}% confiance
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Suggestions */}
                    {msg.sender === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-2 ml-10 space-y-1">
                        {msg.suggestions.slice(0, 2).map((suggestion, idx) => (
                          <Button
                            key={idx}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSendMessage(suggestion)}
                            className="h-6 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 justify-start"
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-2 justify-start">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        <Brain className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 p-3 rounded-lg rounded-bl-sm">
                      <div className="flex space-x-1">
                        <motion.div
                          className="w-2 h-2 bg-purple-500 rounded-full"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-purple-500 rounded-full"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-purple-500 rounded-full"
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
                  placeholder={`Question ${userRole}...`}
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
                  className="bg-purple-500 hover:bg-purple-600"
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

export default DashboardAIAssistant;
