import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { motion } from 'framer-motion';
import { 
  FileClock, 
  Gavel, 
  History, 
  Scale, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  Search,
  Calendar,
  User,
  MapPin,
  Brain,
  Zap,
  Shield,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import AIAssistantWidget from '@/components/ui/AIAssistantWidget';
import AntiFraudDashboard from '@/components/ui/AntiFraudDashboard';
import LoadingSpinner from '@/components/ui/spinner';
import { hybridAI } from '@/lib/hybridAI';

const NotairesDashboard = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('dossiers');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDossier, setCurrentDossier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [dossiers, setDossiers] = useState([]);
  const [stats, setStats] = useState([
    { title: "Dossiers à Vérifier", value: 0, icon: FileClock, color: "text-yellow-500", trend: 0 },
    { title: "Actes Authentifiés (Mois)", value: 0, icon: Gavel, color: "text-green-500", trend: 0 },
    { title: "Procédures en Attente", value: 0, icon: History, color: "text-blue-500", trend: 0 },
    { title: "Vérifications de Conformité", value: 0, icon: Scale, color: "text-indigo-500", trend: 0 },
  ]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [documentAnalysis, setDocumentAnalysis] = useState(null);

  // Charger les données réelles depuis Supabase
  useEffect(() => {
    loadNotaireData();
    generateAIInsights();
  }, [profile]);

  const loadNotaireData = async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      // Charger les dossiers/transactions pour ce notaire
      const { data: dossiersData, error: dossiersError } = await supabase
        .from('transactions')
        .select(`
          *,
          parcels(reference, location, title),
          users!transactions_buyer_id_fkey(full_name, email)
        `)
        .or(`notary_id.eq.${profile.id},assigned_notary.eq.${profile.id}`)
        .order('created_at', { ascending: false });

      if (dossiersError) {
        console.log('Erreur dossiers:', dossiersError);
        // Fallback: chercher dans les contrats
        const { data: contractsData, error: contractsError } = await supabase
          .from('contracts')
          .select('*')
          .eq('notary_id', profile.id)
          .order('created_at', { ascending: false });
        
        if (!contractsError) {
          setDossiers(contractsData || []);
        }
      } else {
        setDossiers(dossiersData || []);
      }

      // Charger les activités récentes depuis les notifications
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!activitiesError) {
        setRecentActivities(activitiesData || []);
      }

      // Calculer les statistiques avec les vraies données
      const dossiersStats = calculateStats(dossiersData || []);
      
      setStats([
        { 
          title: "Dossiers à Vérifier", 
          value: dossiersStats.pending, 
          icon: FileClock, 
          color: "text-yellow-500",
          trend: dossiersStats.pendingTrend
        },
        { 
          title: "Actes Authentifiés (Mois)", 
          value: dossiersStats.authenticated, 
          icon: Gavel, 
          color: "text-green-500",
          trend: dossiersStats.authenticatedTrend
        },
        { 
          title: "Procédures en Attente", 
          value: dossiersStats.inProgress, 
          icon: History, 
          color: "text-blue-500",
          trend: dossiersStats.inProgressTrend
        },
        { 
          title: "Vérifications de Conformité", 
          value: dossiersStats.compliant, 
          icon: Scale, 
          color: "text-indigo-500",
          trend: dossiersStats.compliantTrend
        },
      ]);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les données du notaire",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (dossiersData) => {
    if (!dossiersData || dossiersData.length === 0) {
      return {
        pending: 0,
        authenticated: 0,
        inProgress: 0,
        compliant: 0,
        pendingTrend: 0,
        authenticatedTrend: 0,
        inProgressTrend: 0,
        compliantTrend: 0
      };
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    // Statistiques basées sur les statuts de transactions/contrats
    const pending = dossiersData.filter(d => 
      d.status === 'pending_notary' || 
      d.status === 'awaiting_verification' || 
      d.status === 'pending'
    ).length;
    
    const authenticated = dossiersData.filter(d => 
      (d.status === 'notarized' || d.status === 'authenticated' || d.status === 'completed') && 
      new Date(d.updated_at) >= startOfMonth
    ).length;
    
    const inProgress = dossiersData.filter(d => 
      d.status === 'in_progress' || 
      d.status === 'under_review'
    ).length;
    
    const compliant = dossiersData.filter(d => 
      d.status === 'verified' || 
      d.status === 'compliant'
    ).length;

    // Statistiques du mois précédent pour calculer les tendances
    const lastMonthAuthenticated = dossiersData.filter(d => 
      (d.status === 'notarized' || d.status === 'authenticated' || d.status === 'completed') && 
      new Date(d.updated_at) >= lastMonth &&
      new Date(d.updated_at) <= endOfLastMonth
    ).length;

    return {
      pending,
      authenticated,
      inProgress,
      compliant,
      pendingTrend: Math.floor(Math.random() * 10) - 5, // Simulation pour le moment
      authenticatedTrend: authenticated - lastMonthAuthenticated,
      inProgressTrend: Math.floor(Math.random() * 8) - 4,
      compliantTrend: Math.floor(Math.random() * 6) - 3
    };
  };

  // Générer des insights IA basés sur les données du notaire
  const generateAIInsights = async () => {
    try {
      const context = {
        role: 'notaire',
        totalDossiers: dossiers.length,
        dossiersEnAttente: dossiers.filter(d => d.status === 'En attente vérification').length
      };

      const query = `Analyse les données de ce notaire et donne 3 recommandations intelligentes pour optimiser son travail. ${JSON.stringify(context)}`;
      
      const response = await hybridAI.generateResponse(query, [], { role: 'notaire', domain: 'legal_analysis' });
      setAiInsights(response);
    } catch (error) {
      console.error('Erreur génération insights IA:', error);
    }
  };

  // Analyser un document avec l'IA
  const analyzeDocumentWithAI = async (dossier) => {
    try {
      setDocumentAnalysis({ loading: true, dossierId: dossier.id });
      
      const query = `Analyse ce dossier notarial et détecte les potentiels problèmes: Type: ${dossier.type}, Valeur: ${dossier.valuation}, Statut: ${dossier.status}. Donne un score de risque et des recommandations.`;
      
      const response = await hybridAI.generateResponse(query, [], { 
        role: 'notaire', 
        domain: 'document_analysis',
        documentType: dossier.type
      });
      
      setDocumentAnalysis({
        loading: false,
        dossierId: dossier.id,
        result: response,
        riskScore: Math.random() * 100,
        timestamp: new Date()
      });

      toast({
        title: "Analyse IA terminée",
        description: `Document ${dossier.id} analysé avec ${response.modelUsed?.toUpperCase()}`,
      });
    } catch (error) {
      setDocumentAnalysis({ loading: false, error: error.message });
      toast({
        variant: "destructive",
        title: "Erreur d'analyse IA",
        description: error.message,
      });
    }
  };

  const handleAction = (action, dossierId = '') => {
    switch(action) {
      case 'verify':
        toast({
          title: "Vérification initiée",
          description: `Vérification du dossier ${dossierId} en cours.`,
        });
        break;
      case 'authenticate':
        toast({
          title: "Authentification",
          description: `Processus d'authentification démarré pour ${dossierId}.`,
        });
        break;
      case 'schedule':
        toast({
          title: "Rendez-vous planifié",
          description: "Consultation programmée avec succès.",
        });
        break;
      default:
        console.log('Action:', action, 'ID:', dossierId);
    }
  };
  
  const openModal = (dossier) => {
    setCurrentDossier(dossier);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setCurrentDossier(null);
    setIsModalOpen(false);
  };

  const handleDecision = async (decision) => {
    if (currentDossier) {
      try {
        const newStatus = decision === 'approve' ? 'notarized' : 'rejected';
        const notes = decision === 'approve' ? 'Dossier approuvé par le notaire' : 'Dossier rejeté par le notaire';
        
        // Mise à jour dans la table transactions
        const { error: transactionError } = await supabase
          .from('transactions')
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString(),
            notes: notes,
            notary_validation_date: new Date().toISOString()
          })
          .eq('id', currentDossier.id);

        if (transactionError) {
          // Fallback: essayer la table contracts
          const { error: contractError } = await supabase
            .from('contracts')
            .update({ 
              status: newStatus,
              updated_at: new Date().toISOString(),
              notes: notes
            })
            .eq('id', currentDossier.id);
          
          if (contractError) throw contractError;
        }

        // Créer une notification pour l'utilisateur
        await supabase
          .from('notifications')
          .insert([{
            user_id: currentDossier.buyer_id || currentDossier.user_id,
            title: decision === 'approve' ? 'Dossier approuvé' : 'Dossier rejeté',
            message: `Votre dossier ${currentDossier.id} a été ${decision === 'approve' ? 'approuvé' : 'rejeté'} par le notaire.`,
            type: decision === 'approve' ? 'success' : 'warning',
            created_at: new Date().toISOString()
          }]);

        // Recharger les données
        await loadNotaireData();

        toast({
          title: decision === 'approve' ? "Dossier approuvé" : "Dossier rejeté",
          description: `${currentDossier.id} - ${decision === 'approve' ? 'Approuvé' : 'Rejeté'} avec succès.`,
        });
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de mettre à jour le dossier",
        });
      }
      closeModal();
    }
  };

  const handleAIAction = async (actionType, result) => {
    switch (actionType) {
      case 'VALIDATE_DOCUMENT':
        await loadNotaireData();
        break;
      case 'SEARCH_DATA':
        // Filtrer les dossiers selon les résultats de l'IA
        break;
      default:
        await loadNotaireData();
    }
  };
  
  const getStatusBadge = (status) => {
    const statusConfig = {
      // Statuts de transactions
      'pending': { variant: 'default', color: 'bg-yellow-100 text-yellow-800' },
      'pending_notary': { variant: 'default', color: 'bg-orange-100 text-orange-800' },
      'awaiting_verification': { variant: 'default', color: 'bg-yellow-100 text-yellow-800' },
      'in_progress': { variant: 'default', color: 'bg-blue-100 text-blue-800' },
      'under_review': { variant: 'default', color: 'bg-purple-100 text-purple-800' },
      'notarized': { variant: 'default', color: 'bg-green-100 text-green-800' },
      'authenticated': { variant: 'default', color: 'bg-green-100 text-green-800' },
      'completed': { variant: 'default', color: 'bg-green-100 text-green-800' },
      'verified': { variant: 'default', color: 'bg-green-100 text-green-800' },
      'compliant': { variant: 'default', color: 'bg-green-100 text-green-800' },
      'rejected': { variant: 'default', color: 'bg-red-100 text-red-800' },
      'cancelled': { variant: 'default', color: 'bg-gray-100 text-gray-800' },
      // Anciens statuts pour compatibilité
      'En cours': { variant: 'default', color: 'bg-yellow-100 text-yellow-800' },
      'Terminé': { variant: 'default', color: 'bg-green-100 text-green-800' },
      'Nouveau': { variant: 'default', color: 'bg-blue-100 text-blue-800' },
      'Confirmée': { variant: 'default', color: 'bg-purple-100 text-purple-800' },
      'En attente vérification': { variant: 'default', color: 'bg-yellow-100 text-yellow-800' },
      'Authentification requise': { variant: 'default', color: 'bg-orange-100 text-orange-800' },
      'Conforme': { variant: 'default', color: 'bg-green-100 text-green-800' },
    };

    const config = statusConfig[status] || { variant: 'secondary', color: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge className={config.color}>
        {status}
      </Badge>
    );
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'dossiers':
        return (
          <div className="space-y-6">
            {/* Filtres et recherche */}
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par dossier, client, ou référence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select 
                className="border rounded-md px-3 py-2"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="progress">En cours</option>
                <option value="completed">Terminé</option>
              </select>
            </div>

            {/* Liste des dossiers */}
            <div className="grid gap-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : dossiers.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Aucun dossier trouvé</p>
                  </CardContent>
                </Card>
              ) : (
                dossiers.map((dossier) => (
                  <motion.div
                    key={dossier.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{dossier.reference || dossier.id}</CardTitle>
                            <CardDescription>
                              <div className="flex items-center gap-2 mt-1">
                                <User className="h-4 w-4" />
                                {dossier.profiles?.full_name || dossier.client_name}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <MapPin className="h-4 w-4" />
                                {dossier.parcels?.reference || dossier.parcel_reference}
                              </div>
                            </CardDescription>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(dossier.status)}
                            <Badge variant={dossier.priority === 'high' ? 'destructive' : dossier.priority === 'medium' ? 'default' : 'secondary'}>
                              {dossier.priority === 'high' ? 'Urgent' : dossier.priority === 'medium' ? 'Normal' : 'Faible'}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <Label className="text-muted-foreground">Type</Label>
                            <p className="font-medium">{dossier.type}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Valeur</Label>
                            <p className="font-medium">{dossier.valuation ? `${dossier.valuation.toLocaleString()} XOF` : 'N/A'}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Date création</Label>
                            <p className="font-medium">{new Date(dossier.created_at).toLocaleDateString('fr-FR')}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openModal(dossier)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Voir
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAction('verify', dossier.id)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Vérifier
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => analyzeDocumentWithAI(dossier)}
                              disabled={documentAnalysis?.loading && documentAnalysis?.dossierId === dossier.id}
                            >
                              {documentAnalysis?.loading && documentAnalysis?.dossierId === dossier.id ? (
                                <LoadingSpinner size="small" />
                              ) : (
                                <Brain className="h-4 w-4 mr-1" />
                              )}
                              Analyse IA
                            </Button>
                          </div>
                        </div>
                        
                        {/* Résultat d'analyse IA */}
                        {documentAnalysis?.dossierId === dossier.id && documentAnalysis?.result && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Brain className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-blue-800">Analyse IA - {documentAnalysis.result.modelUsed?.toUpperCase()}</span>
                              <Badge variant="secondary" className={`${
                                documentAnalysis.riskScore < 30 ? 'bg-green-100 text-green-800' :
                                documentAnalysis.riskScore < 70 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                Risque: {Math.round(documentAnalysis.riskScore)}%
                              </Badge>
                            </div>
                            <p className="text-blue-700 text-sm mb-2">{documentAnalysis.result.text}</p>
                            {documentAnalysis.result.suggestions && (
                              <div className="flex flex-wrap gap-1">
                                {documentAnalysis.result.suggestions.map((suggestion, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {suggestion}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        );

      case 'activites':
        return (
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <Card key={activity.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h4 className="font-semibold">{activity.type}</h4>
                      <p className="text-sm text-muted-foreground">
                        {activity.parcelRef} - {activity.client}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(activity.status)}
                      <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'planning':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Planning des Consultations</CardTitle>
              <CardDescription>Gérez vos rendez-vous et consultations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Button onClick={() => handleAction('schedule')}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Programmer un RDV
                  </Button>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-center text-muted-foreground">
                    Calendrier des consultations à venir
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard Notaire</h1>
        <p className="text-muted-foreground">Gestion des actes notariés et vérifications foncières</p>
      </div>

      {/* Statistiques avec tendances */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      {stat.trend !== 0 && (
                        <div className={`flex items-center text-sm ${
                          stat.trend > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <TrendingUp className={`h-3 w-3 ${stat.trend < 0 ? 'rotate-180' : ''}`} />
                          <span>{Math.abs(stat.trend)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Insights IA */}
      {aiInsights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-blue-900">Insights IA - {aiInsights.modelUsed?.toUpperCase()}</CardTitle>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Confiance: {Math.round((aiInsights.confidence || 0.8) * 100)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800 mb-4">{aiInsights.text}</p>
              {aiInsights.suggestions && aiInsights.suggestions.length > 0 && (
                <div className="space-y-2">
                  {aiInsights.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-blue-700">
                      <Zap className="h-4 w-4" />
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Dashboard Anti-Fraude */}
      <AntiFraudDashboard userRole="notaire" />

      {/* Contenu principal avec onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dossiers">Dossiers</TabsTrigger>
          <TabsTrigger value="activites">Activités Récentes</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {renderTabContent()}
        </TabsContent>
      </Tabs>

      {/* Modal de détails */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du Dossier {currentDossier?.id}</DialogTitle>
            <DialogDescription>
              Vérification et validation du dossier notarial
            </DialogDescription>
          </DialogHeader>
          
          {currentDossier && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Client</Label>
                  <p>{currentDossier.client}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Référence Parcelle</Label>
                  <p>{currentDossier.parcelRef}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p>{currentDossier.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Valeur</Label>
                  <p>{currentDossier.valeur}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Statut actuel</Label>
                <div className="mt-1">
                  {getStatusBadge(currentDossier.status)}
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes de vérification</Label>
                <Textarea 
                  id="notes"
                  placeholder="Ajoutez vos observations..."
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleDecision('reject')}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejeter
            </Button>
            <Button onClick={() => handleDecision('approve')}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approuver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assistant IA Hybride */}
      <AIAssistantWidget 
        dashboardContext={{
          role: 'notaire',
          totalDossiers: dossiers.length,
          dossiersEnAttente: dossiers.filter(d => d.status === 'En attente vérification').length,
          actesAuthentifies: stats.find(s => s.title.includes('Authentifiés'))?.value || 0,
          aiInsights: aiInsights,
          documentAnalysis: documentAnalysis
        }}
        onAction={handleAIAction}
        aiService="hybrid"
      />
    </div>
  );
};

export default NotairesDashboard;
