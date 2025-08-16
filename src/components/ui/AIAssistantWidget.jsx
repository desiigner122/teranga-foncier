import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Trash2,
  Edit,
  Search,
  FileText,
  TrendingUp,
  Calendar,
  Bell
} from 'lucide-react';
import { aiAssistant } from '@/lib/aiAssistant';
import { useAuth } from '@/context/AuthContext';

const AIAssistantWidget = ({ dashboardContext = {}, onAction }) => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Suggestions par rôle
  const roleSuggestions = {
    admin: [
      "Supprimer l'utilisateur amadou.diallo@email.com",
      "Générer un rapport des transactions du mois",
      "Rechercher les parcelles en attente de validation",
      "Analyser les tendances d'inscription des utilisateurs",
      "Créer une notification pour tous les agents"
    ],
    particulier: [
      "Rechercher des parcelles à Almadies sous 50M FCFA",
      "Prédire le prix d'une parcelle de 500m² à Ngor",
      "Programmer un rendez-vous avec un agent",
      "Analyser l'évolution des prix dans ma zone",
      "Trouver des opportunités d'investissement"
    ],
    agent: [
      "Lister mes clients les plus actifs",
      "Générer un rapport de mes ventes du trimestre",
      "Programmer des relances pour les prospects",
      "Analyser les performances de mes annonces",
      "Rechercher des parcelles pour mon client"
    ],
    vendeur: [
      "Évaluer le prix de ma parcelle à Dakar",
      "Générer une description attractive pour mon annonce",
      "Analyser les vues de mes annonces",
      "Programmer des visites avec les acheteurs",
      "Optimiser le prix de vente"
    ],
    notaire: [
      "Vérifier la conformité du dossier DOS-001",
      "Générer un acte de vente type",
      "Rechercher l'historique d'une parcelle",
      "Valider les documents de succession",
      "Programmer une authentification"
    ],
    banque: [
      "Évaluer le risque de financement",
      "Analyser la solvabilité du demandeur",
      "Générer un rapport d'évaluation foncière",
      "Calculer les garanties nécessaires",
      "Prédire les défauts de paiement"
    ],
    mairie: [
      "Vérifier la conformité urbanistique",
      "Générer un certificat d'urbanisme",
      "Analyser les demandes de permis en attente",
      "Mettre à jour le plan cadastral",
      "Traiter les litiges fonciers"
    ],
    promoteur: [
      "Analyser la viabilité d'un projet",
      "Calculer les coûts de construction",
      "Prédire les ventes futures",
      "Optimiser le planning de construction",
      "Générer un rapport de rentabilité"
    ],
    investisseur: [
      "Analyser le ROI d'un investissement",
      "Rechercher les meilleures opportunités",
      "Prédire l'évolution des prix",
      "Évaluer les risques du marché",
      "Optimiser mon portefeuille foncier"
    ],
    agriculteur: [
      "Analyser la qualité du sol",
      "Optimiser l'utilisation de mes terres",
      "Prédire les rendements agricoles",
      "Rechercher des financements",
      "Planifier la rotation des cultures"
    ]
  };

  useEffect(() => {
    if (profile?.role) {
      setSuggestions(roleSuggestions[profile.role] || roleSuggestions.particulier);
    }
  }, [profile]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendCommand = async () => {
    if (!command.trim() || isProcessing) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: command,
      timestamp: new Date()
    };

    setConversation(prev => [...prev, userMessage]);
    setCommand('');
    setIsProcessing(true);

    try {
      // Traitement IA de la commande
      const aiResponse = await aiAssistant.processCommand(command, {
        userRole: profile?.role,
        dashboardContext,
        userId: profile?.id
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse.explanation,
        action: aiResponse,
        timestamp: new Date()
      };

      setConversation(prev => [...prev, aiMessage]);

      // Exécution de l'action si confiance suffisante
      if (aiResponse.confidence > 0.7 && aiResponse.action !== 'ERROR') {
        try {
          const result = await aiAssistant.executeAction(aiResponse, profile?.role);
          
          const successMessage = {
            id: Date.now() + 2,
            type: 'success',
            content: result.message,
            data: result,
            timestamp: new Date()
          };

          setConversation(prev => [...prev, successMessage]);

          // Callback pour mettre à jour le dashboard parent
          if (onAction) {
            onAction(aiResponse.action, result);
          }

          toast({
            title: "Action exécutée",
            description: result.message,
          });

        } catch (executionError) {
          const errorMessage = {
            id: Date.now() + 2,
            type: 'error',
            content: executionError.message,
            timestamp: new Date()
          };

          setConversation(prev => [...prev, errorMessage]);

          toast({
            variant: "destructive",
            title: "Erreur d'exécution",
            description: executionError.message,
          });
        }
      } else if (aiResponse.confidence <= 0.7) {
        const clarificationMessage = {
          id: Date.now() + 2,
          type: 'clarification',
          content: "Je ne suis pas sûr de comprendre votre demande. Pouvez-vous la reformuler ?",
          timestamp: new Date()
        };

        setConversation(prev => [...prev, clarificationMessage]);
      }

    } catch (error) {
      console.error('Erreur IA:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Désolé, je ne peux pas traiter votre demande pour le moment.',
        timestamp: new Date()
      };

      setConversation(prev => [...prev, errorMessage]);

      toast({
        variant: "destructive",
        title: "Erreur",
        description: "L'assistant IA n'est pas disponible",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setCommand(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const toggleVoiceInput = () => {
    if ('speechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.speechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'fr-FR';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setCommand(transcript);
      };
      
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
      }
    } else {
      toast({
        variant: "destructive",
        title: "Non supporté",
        description: "La reconnaissance vocale n'est pas supportée par votre navigateur",
      });
    }
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'error': return AlertTriangle;
      case 'clarification': return Info;
      default: return Bot;
    }
  };

  const getMessageColor = (type) => {
    switch (type) {
      case 'user': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'clarification': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          onClick={() => setIsMinimized(false)}
          size="lg"
          className="rounded-full h-14 w-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
        >
          <Bot className="h-6 w-6 text-white" />
        </Button>
      </motion.div>
    );
  }

  return (
    <>
      {/* Bouton d'activation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
        >
          <Bot className="h-6 w-6 text-white" />
        </Button>
      </motion.div>

      {/* Dialog de l'assistant */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-500" />
              Assistant IA Teranga
              <Badge variant="secondary">
                {profile?.role || 'Utilisateur'}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Votre assistant intelligent pour la gestion foncière
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex flex-col gap-4">
            {/* Zone de conversation */}
            <ScrollArea className="flex-1 border rounded-lg p-4">
              <div className="space-y-4">
                {conversation.length === 0 && (
                  <div className="text-center text-muted-foreground">
                    <Bot className="h-12 w-12 mx-auto mb-2 text-blue-500" />
                    <p>Bonjour ! Je suis votre assistant IA.</p>
                    <p>Comment puis-je vous aider aujourd'hui ?</p>
                  </div>
                )}

                <AnimatePresence>
                  {conversation.map((message) => {
                    const IconComponent = getMessageIcon(message.type);
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${getMessageColor(message.type)}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className={`flex-1 rounded-lg p-3 ${getMessageColor(message.type)}`}>
                          <p className="text-sm">{message.content}</p>
                          {message.action && (
                            <div className="mt-2 text-xs opacity-75">
                              Action: {message.action.action} (Confiance: {Math.round(message.action.confidence * 100)}%)
                            </div>
                          )}
                          <div className="text-xs opacity-75 mt-1">
                            {message.timestamp.toLocaleTimeString('fr-FR')}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                    </div>
                    <div className="flex-1 bg-blue-100 rounded-lg p-3">
                      <p className="text-sm text-blue-800">Traitement en cours...</p>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Suggestions */}
            {suggestions.length > 0 && conversation.length === 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Suggestions pour vous :</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.slice(0, 3).map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs h-auto py-1 px-2"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Zone de saisie */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendCommand()}
                  placeholder="Tapez votre commande ou question..."
                  disabled={isProcessing}
                  className="pr-12"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleVoiceInput}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  disabled={isProcessing}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4 text-red-500" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                onClick={handleSendCommand}
                disabled={!command.trim() || isProcessing}
                size="sm"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIAssistantWidget;
