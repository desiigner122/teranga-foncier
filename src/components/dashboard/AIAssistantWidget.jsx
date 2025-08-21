import React, { useState } from 'react';
import { Brain, MessageSquare, X, ChevronUp, ChevronDown, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";

const AIAssistantWidget = ({ 
  dashboardContext = {}, 
  onAction = () => {}, 
  aiService = 'hybrid'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      type: 'assistant', 
      content: 'Bonjour, je suis votre assistant IA. Comment puis-je vous aider aujourd\'hui?',
      timestamp: new Date(),
      model: aiService
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    // Add user message
    const userMessageId = Date.now();
    setMessages(prev => [
      ...prev, 
      { 
        id: userMessageId, 
        type: 'user', 
        content: newMessage,
        timestamp: new Date()
      }
    ]);
    
    setNewMessage('');
    setIsTyping(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      // Generate response based on context and message
      const response = generateAIResponse(newMessage, dashboardContext);
      
      setMessages(prev => [
        ...prev, 
        { 
          id: userMessageId + 1, 
          type: 'assistant', 
          content: response.text,
          actions: response.actions,
          model: aiService,
          timestamp: new Date()
        }
      ]);
      
      setIsTyping(false);
    }, 1000);
  };

  const handleActionClick = (actionType) => {
    onAction(actionType, { source: 'assistant_widget' });
    
    // Add system message acknowledging the action
    setMessages(prev => [
      ...prev, 
      { 
        id: Date.now(), 
        type: 'system', 
        content: `Action "${actionType}" exécutée avec succès.`,
        timestamp: new Date()
      }
    ]);
  };

  const generateAIResponse = (message, context) => {
    // Check for common queries and respond with context-aware information
    const lowercaseMsg = message.toLowerCase();
    
    // Analyze portfolio
    if (lowercaseMsg.includes('portfolio') || lowercaseMsg.includes('investissement')) {
      return {
        text: `D'après mon analyse, votre portfolio ${context.role === 'investisseur' ? 'immobilier' : ''} présente ${
          context.portfolioValue > 50000000 ? 'une valeur significative' : 'un potentiel de croissance'
        }. La diversification est ${
          context.diversificationScore > 70 ? 'bonne' : 'à améliorer'
        }. Je peux vous aider à optimiser davantage vos investissements.`,
        actions: [
          { type: 'OPTIMIZE_PORTFOLIO', label: 'Optimiser mon portfolio' }
        ]
      };
    }
    
    // Risk assessment
    if (lowercaseMsg.includes('risque') || lowercaseMsg.includes('sécurité')) {
      return {
        text: `Les métriques de risque actuelles indiquent un profil ${
          context.riskMetrics?.volatility > 15 ? 'modérément agressif' : 'conservateur'
        }. J'ai détecté ${
          context.fraudAnalysis?.warnings?.length || 0
        } alertes de sécurité potentielles. Souhaitez-vous une analyse complète?`,
        actions: [
          { type: 'RISK_ASSESSMENT', label: 'Analyser les risques' }
        ]
      };
    }
    
    // Market analysis
    if (lowercaseMsg.includes('marché') || lowercaseMsg.includes('tendance')) {
      return {
        text: `Les tendances actuelles du marché immobilier montrent une croissance de ${
          context.marketData?.priceGrowth || '3.2'
        }% sur les 6 derniers mois. Les zones ${
          context.marketData?.hotZones?.join(', ') || 'Dakar Plateau, Almadies'
        } sont particulièrement dynamiques. Je peux vous aider à identifier les meilleures opportunités.`,
        actions: [
          { type: 'ANALYZE_OPPORTUNITY', label: 'Trouver des opportunités' }
        ]
      };
    }
    
    // Default response
    return {
      text: `Je suis votre assistant IA spécialisé en ${
        context.role === 'investisseur' ? 'investissement immobilier' : 
        context.role === 'notaire' ? 'documentation légale et vérification' :
        context.role === 'mairie' ? 'administration municipale' :
        'gestion foncière'
      }. Comment puis-je vous aider plus spécifiquement aujourd'hui?`,
      actions: [
        { type: 'DASHBOARD_OVERVIEW', label: 'Résumé du dashboard' }
      ]
    };
  };

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggleOpen}
          className={`rounded-full h-14 w-14 shadow-lg ${isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Brain className="h-6 w-6" />}
        </Button>
      </div>
      
      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-lg shadow-xl z-50 border overflow-hidden"
          >
            {/* Header */}
            <div className="p-3 border-b bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  <h3 className="font-semibold">Assistant IA</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={() => setMessages([
                      { 
                        id: Date.now(), 
                        type: 'assistant', 
                        content: 'Comment puis-je vous aider aujourd\'hui?',
                        timestamp: new Date(),
                        model: aiService
                      }
                    ])}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={toggleOpen}
                  >
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Messages */}
            <div className="h-80 overflow-y-auto p-3 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-lg p-3 ${
                      message.type === 'user' 
                        ? 'bg-blue-500 text-white'
                        : message.type === 'system'
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    {message.model && (
                      <p className="text-xs opacity-70 mt-1">
                        {message.model === 'hybrid' ? 'IA Hybride' : message.model}
                      </p>
                    )}
                    
                    {message.actions && message.actions.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.actions.map((action, index) => (
                          <Button 
                            key={index}
                            size="sm"
                            variant={index === 0 ? "default" : "outline"}
                            className="text-xs w-full"
                            onClick={() => handleActionClick(action.type)}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                    
                    <span className="text-xs opacity-50 block mt-1">
                      {new Date(message.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-lg p-3 bg-gray-100 dark:bg-gray-800">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-75"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-150"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Input */}
            <div className="p-3 border-t">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Votre message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="resize-none"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button onClick={handleSendMessage} className="shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-center mt-2 text-gray-500">
                Propulsé par {aiService === 'hybrid' ? 'IA Hybride' : aiService}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistantWidget;
