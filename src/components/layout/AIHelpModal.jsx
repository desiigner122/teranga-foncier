import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Info, Search, Lightbulb, FileQuestion, Home, UserCircle, Banknote, Building2, Leaf, TrendingUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useLocation } from 'react-router-dom';

const AIHelpModal = ({ isOpen, onClose }) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contextualQuestions, setContextualQuestions] = useState([]);
  const { toast } = useToast();
  const location = useLocation();

  const baseQuestions = [
    "Quelles sont les étapes pour acheter un terrain ?",
    "Comment Teranga Foncier sécurise les transactions ?",
    "Quels sont les frais de notaire estimés ?",
    "Comment puis-je contacter un agent ?"
  ];

  useEffect(() => {
    let specificQuestions = [];
    const pathname = location.pathname;

    if (pathname.startsWith('/parcelles/')) {
      specificQuestions = [
        "Expliquez-moi les documents de cette parcelle.",
        "Quels sont les points d'intérêt proches ?",
        "Comment initier une offre pour ce terrain ?",
      ];
    } else if (pathname === '/parcelles') {
      specificQuestions = [
        "Comment utiliser les filtres de recherche ?",
        "Que signifie le 'Score de Confiance' ?",
        "Comment sauvegarder une recherche ?",
      ];
    } else if (pathname === '/dashboard') {
      specificQuestions = [
        "Comment voir mes demandes en cours ?",
        "Où trouver mes documents sauvegardés ?",
        "Comment planifier une visite ?",
      ];
    } else if (pathname === '/profile' || pathname === '/settings') {
       specificQuestions = [
        "Comment modifier mon mot de passe ?",
        "Où gérer mes notifications ?",
       ];
    } else if (pathname === '/solutions/banques') {
        specificQuestions = [
            "Quels services offrez-vous aux banques ?",
            "Comment évaluez-vous les garanties foncières ?",
        ];
    } else if (pathname === '/solutions/promoteurs') {
        specificQuestions = [
            "Comment aidez-vous les promoteurs à trouver des terrains ?",
            "Proposez-vous des études de faisabilité ?",
        ];
    } else if (pathname === '/solutions/investisseurs') {
        specificQuestions = [
            "Quelles opportunités pour les investisseurs ?",
            "Comment analysez-vous le rendement potentiel ?",
        ];
    } else if (pathname === '/solutions/agriculteurs') {
        specificQuestions = [
            "Avez-vous des terrains agricoles spécifiques ?",
            "Fournissez-vous des infos sur les sols/eau ?",
        ];
    }
    // Ensure 4 questions, prioritizing specific ones
    const combined = [...specificQuestions, ...baseQuestions];
    const uniqueQuestions = Array.from(new Set(combined.map(q => q.toLowerCase()))).map(q => combined.find(orig => orig.toLowerCase() === q));
    setContextualQuestions(uniqueQuestions.slice(0, 4));

  }, [location.pathname]);


  const handleQuestionClick = (question) => {
    setInputValue(question);
    handleSubmit(question);
  };

  const handleSubmit = async (queryOverride) => {
    const currentQuery = queryOverride || inputValue;
    if (!currentQuery.trim()) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    let simulatedResponse = "🚧 Cette fonctionnalité d'IA est en cours de développement. Votre question : '" + currentQuery + "' serait traitée par notre IA pour vous fournir une réponse pertinente. Pour l'instant, vous pouvez consulter notre FAQ ou contacter notre support. 🚀";
    
    if (currentQuery.toLowerCase().includes("document")) {
        simulatedResponse = "Les documents listés sur la page de la parcelle (Titre Foncier, Bail, etc.) sont vérifiés par nos équipes. Vous pouvez demander plus de détails à un agent. (Réponse IA simulée)";
    } else if (currentQuery.toLowerCase().includes("visite")) {
        simulatedResponse = "Pour planifier une visite, utilisez le calendrier sur votre tableau de bord ou le bouton 'Demander une visite' sur la page de la parcelle. (Réponse IA simulée)";
    } else if (currentQuery.toLowerCase().includes("filtres")) {
        simulatedResponse = "Utilisez les filtres en haut de la liste des parcelles pour affiner votre recherche par zone, prix, surface, etc. (Réponse IA simulée)";
    } else if (currentQuery.toLowerCase().includes("banques")) {
        simulatedResponse = "Nous aidons les banques avec l'évaluation de garanties, le suivi de portefeuille et la diligence raisonnée. (Réponse IA simulée)";
    } else if (currentQuery.toLowerCase().includes("promoteurs")) {
        simulatedResponse = "Pour les promoteurs, nous facilitons l'identification de terrains stratégiques et fournissons des analyses de potentiel. (Réponse IA simulée)";
    }


    toast({
      title: "Assistance IA (Simulation)",
      description: simulatedResponse,
      duration: 8000,
    });

    setInputValue('');
    setIsLoading(false);
    onClose();
  };
  
  const getPageIcon = () => {
    const pathname = location.pathname;
    if (pathname.startsWith('/parcelles/')) return <Home className="h-6 w-6 mr-2 text-green-500" />;
    if (pathname === '/parcelles') return <Search className="h-6 w-6 mr-2 text-blue-500" />;
    if (pathname.startsWith('/dashboard')) return <UserCircle className="h-6 w-6 mr-2 text-purple-500" />;
    if (pathname === '/solutions/banques') return <Banknote className="h-6 w-6 mr-2 text-blue-600" />;
    if (pathname === '/solutions/promoteurs') return <Building2 className="h-6 w-6 mr-2 text-purple-600" />;
    if (pathname === '/solutions/investisseurs') return <TrendingUp className="h-6 w-6 mr-2 text-red-600" />;
    if (pathname === '/solutions/agriculteurs') return <Leaf className="h-6 w-6 mr-2 text-green-600" />;
    return <Lightbulb className="h-6 w-6 mr-2 text-yellow-400" />;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] bg-gradient-to-br from-background via-muted/50 to-background border-border/60 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center text-primary">
            {getPageIcon()}
            Assistant IA Teranga Foncier
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Posez votre question ou choisissez une suggestion. Notre IA (simulée) est là pour vous aider !
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="relative">
            <Input
              id="ai-question"
              placeholder="Ex: Comment vérifier un titre foncier ?"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="pr-10 h-12 text-base"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <Button
              type="button"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={() => handleSubmit()}
              disabled={isLoading || !inputValue.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-2">
            <h4 className="text-sm font-medium text-foreground mb-2">Suggestions Contextuelles :</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {contextualQuestions.map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="text-left justify-start h-auto py-2 text-sm"
                  onClick={() => handleQuestionClick(q)}
                  disabled={isLoading}
                >
                  <FileQuestion className="h-4 w-4 mr-2 flex-shrink-0 text-primary/70" />
                  {q}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-between flex-col sm:flex-row gap-2">
           <div className="flex items-center text-xs text-muted-foreground">
             <Info className="h-4 w-4 mr-1 flex-shrink-0" />
             <span>L'assistance IA est actuellement en mode simulation.</span>
           </div>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIHelpModal;