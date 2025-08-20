import React, { useState, useEffect } from 'react';
import { useRealtime } from '@/context/RealtimeContext.jsx';
import { useRealtimeTable, useRealtimeUsers, useRealtimeParcels, useRealtimeParcelSubmissions } from '@/hooks/useRealtimeTable';
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
  TrendingUp,
  CheckSquare,
  FileDown
} from 'lucide-react';
import jsPDF from 'jspdf';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import AIAssistantWidget from '@/components/ui/AIAssistantWidget';
import AntiFraudDashboard from '@/components/ui/AntiFraudDashboard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { hybridAI } from '@/lib/hybridAI';

const NotairesDashboard = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('dossiers');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDossier, setCurrentDossier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  // Loading g�r� par le hook temps r�el
  const { data: dossiers, loading: dossiersLoading, error: dossiersError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (dossiers) {
      setFilteredData(dossiers);
    }
  }, [dossiers]);
  
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

      // Charger les activit�s r�centes depuis les notifications
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!activitiesError) {
        setRecentActivities(activitiesData || []);
      }

      // Calculer les statistiques avec les vraies donn�es
      const dossiersStats = calculateStats(dossiersData || []);
      
      setStats([
        { 
          title: "Dossiers � V�rifier", 
          value: dossiersStats.pending, 
          icon: FileClock, 
          color: "text-yellow-500",
          trend: dossiersStats.pendingTrend
        },
        { 
          title: "Actes Authentifi�s (Mois)", 
          value: dossiersStats.authenticated, 
          icon: Gavel, 
          color: "text-green-500",
          trend: dossiersStats.authenticatedTrend
        },
        { 
          title: "Proc�dures en Attente", 
          value: dossiersStats.inProgress, 
          icon: History, 
          color: "text-blue-500",
          trend: dossiersStats.inProgressTrend
        },
        { 
          title: "V�rifications de Conformit�", 
          value: dossiersStats.compliant, 
          icon: Scale, 
          color: "text-indigo-500",
          trend: dossiersStats.compliantTrend
        },
      ]);

    } catch (error) {
      console.error('Erreur lors du chargement des donn�es:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les donn�es du notaire",
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
    
    // Statistiques bas�es sur les statuts de transactions/contrats
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

    // Statistiques du mois pr�c�dent pour calculer les tendances
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
      pendingTrend: calculateTrend(dossiersData, 'pending_notary', lastMonth, endOfLastMonth, startOfMonth),
      authenticatedTrend: authenticated - lastMonthAuthenticated,
      inProgressTrend: calculateTrend(dossiersData, 'in_progress', lastMonth, endOfLastMonth, startOfMonth),
      compliantTrend: calculateTrend(dossiersData, 'verified', lastMonth, endOfLastMonth, startOfMonth)
    };
  };

  // Fonction helper pour calculer les tendances r�elles
  const calculateTrend = (data, status, lastMonthStart, lastMonthEnd, currentMonthStart) => {
    const currentMonth = data.filter(d => 
      (d.status === status || 
       (status === 'pending_notary' && ['pending_notary', 'awaiting_verification', 'pending'].includes(d.status))) &&
      new Date(d.updated_at) >= currentMonthStart
    ).length;
    
    const lastMonth = data.filter(d => 
      (d.status === status || 
       (status === 'pending_notary' && ['pending_notary', 'awaiting_verification', 'pending'].includes(d.status))) &&
      new Date(d.updated_at) >= lastMonthStart &&
      new Date(d.updated_at) <= lastMonthEnd
    ).length;
    
    return currentMonth - lastMonth;
  };

  // G�n�rer des insights IA bas�s sur les donn�es du notaire
  const generateAIInsights = async () => {
    try {
      const context = {
        role: 'notaire',
        totalDossiers: dossiers.length,
        dossiersEnAttente: dossiers.filter(d => d.status === 'En attente v�rification').length
      };

      const query = `Analyse les donn�es de ce notaire et donne 3 recommandations intelligentes pour optimiser son travail. ${JSON.stringify(context)}`;
      
      const response = await hybridAI.generateResponse(query, [], { role: 'notaire', domain: 'legal_analysis' });
      setAiInsights(response);
    } catch (error) {
      console.error('Erreur g�n�ration insights IA:', error);
    }
  };

  // Analyser un document avec l'IA
  const authenticateDossier = async (dossier) => {
    if (!profile?.id) return;
    try {
      setAuthenticating(dossier.id);
      // Mettre � jour la transaction comme authentifi�e
      const { data, error } = await supabase
        .from('transactions')
        .update({ status:'authenticated', authenticated_at: new Date().toISOString(), updated_at: new Date().toISOString(), assigned_notary: profile.id })
        .eq('id', dossier.id)
        .select()
        .single();
      if (error) throw error;
      setDossiers(ds => ds.map(d=> d.id===dossier.id? { ...d, ...data }: d));
      toast({ title:'Acte authentifi�', description:`Dossier ${dossier.reference || dossier.id}` });
    } catch (e) {
      console.error(e);
      toast({ variant:'destructive', title:'Erreur', description:'Authentification impossible' });
    } finally {
      setAuthenticating(null);
    }
  };

  const analyzeDocumentWithAI = async (dossier) => {
    try {
      setDocumentAnalysis({ loading: true, dossierId: dossier.id });
      
      // Analyse r�elle bas�e sur les donn�es du dossier
      const documentContent = {
        reference: dossier.reference || dossier.id,
        type: dossier.type,
        valuation: dossier.valuation,
        status: dossier.status,
        buyerInfo: dossier.users?.full_name,
        parcelInfo: dossier.parcels?.reference,
        createdAt: dossier.created_at,
        updatedAt: dossier.updated_at
      };

      const query = `Analyse approfondie du dossier notarial ${documentContent.reference}:
      
Type: ${documentContent.type}
Valeur: ${documentContent.valuation ? documentContent.valuation.toLocaleString() + ' XOF' : 'Non d�finie'}
Statut: ${documentContent.status}
Client: ${documentContent.buyerInfo || 'Non renseign�'}
Parcelle: ${documentContent.parcelInfo || 'Non r�f�renc�e'}
Date cr�ation: ${new Date(documentContent.createdAt).toLocaleDateString('fr-FR')}

En tant qu'expert notaire, effectue une analyse compl�te:
1. V�rification de la coh�rence des informations
2. Identification des risques potentiels
3. Conformit� l�gale et r�glementaire
4. Recommandations d'actions prioritaires
5. Score de risque (0-100)

Fournis une r�ponse structur�e avec score et recommandations.`;
      
      const response = await hybridAI.generateResponse(query, [], { 
        role: 'notaire', 
        domain: 'legal_document_analysis',
        documentType: dossier.type,
        analysisMode: 'detailed'
      });

      // Calcul du score de risque bas� sur des crit�res r�els
      let riskScore = 0;
      
      // Facteurs de risque
      if (!dossier.valuation || dossier.valuation === 0) riskScore += 25;
      if (dossier.status === 'pending' || dossier.status === 'pending_notary') riskScore += 20;
      if (!dossier.parcels?.reference) riskScore += 15;
      if (!dossier.users?.full_name) riskScore += 10;
      
      // Anciennet� du dossier
      const daysOld = Math.floor((new Date() - new Date(dossier.created_at)) / (1000 * 60 * 60 * 24));
      if (daysOld > 30) riskScore += Math.min(20, daysOld - 30);
      
      // Derni�re mise � jour
      const daysSinceUpdate = Math.floor((new Date() - new Date(dossier.updated_at)) / (1000 * 60 * 60 * 24));
      if (daysSinceUpdate > 7) riskScore += Math.min(10, daysSinceUpdate - 7);

      setDocumentAnalysis({
        loading: false,
        dossierId: dossier.id,
        result: response,
        riskScore: Math.min(100, riskScore), // Cap � 100
        timestamp: new Date(),
        analysisDetails: {
          completeness: !dossier.valuation ? 'Incompl�te' : 'Compl�te',
          urgency: riskScore > 70 ? '�lev�e' : riskScore > 40 ? 'Moyenne' : 'Faible',
          recommendation: riskScore > 70 ? 'Action imm�diate requise' : 'Suivi standard'
        }
      });

      toast({
        title: "Analyse IA termin�e",
        description: `Document ${dossier.reference || dossier.id} analys� - Risque: ${Math.min(100, riskScore)}%`,
      });
    } catch (error) {
      console.error('Erreur analyse IA:', error);
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
          title: "V�rification initi�e",
          description: `V�rification du dossier ${dossierId} en cours.`,
        });
        break;
      case 'authenticate':
        toast({
          title: "Authentification",
          description: `Processus d'authentification d�marr� pour ${dossierId}.`,
        });
        break;
      case 'schedule':
        toast({
          title: "Rendez-vous planifi�",
          description: "Consultation programm�e avec succ�s.",
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
        const notes = decision === 'approve' ? 'Dossier approuv� par le notaire' : 'Dossier rejet� par le notaire';
        
        // Mise � jour dans la table transactions
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

        // Cr�er une notification pour l'utilisateur
        await supabase
          .from('notifications')
          .insert([{
            user_id: currentDossier.buyer_id || currentDossier.user_id,
            title: decision === 'approve' ? 'Dossier approuv�' : 'Dossier rejet�',
            message: `Votre dossier ${currentDossier.id} a �t� ${decision === 'approve' ? 'approuv�' : 'rejet�'} par le notaire.`,
            type: decision === 'approve' ? 'success' : 'warning',
            created_at: new Date().toISOString()
          }]);

        // Recharger les donn�es
        await loadNotaireData();

        toast({
          title: decision === 'approve' ? "Dossier approuv�" : "Dossier rejet�",
          description: `${currentDossier.id} - ${decision === 'approve' ? 'Approuv�' : 'Rejet�'} avec succ�s.`,
        });
      } catch (error) {
        console.error('Erreur lors de la mise � jour:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de mettre � jour le dossier",
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
        // Filtrer les dossiers selon les r�sultats de l'IA
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
      // Anciens statuts pour compatibilit�
      'En cours': { variant: 'default', color: 'bg-yellow-100 text-yellow-800' },
      'Termin�': { variant: 'default', color: 'bg-green-100 text-green-800' },
      'Nouveau': { variant: 'default', color: 'bg-blue-100 text-blue-800' },
      'Confirm�e': { variant: 'default', color: 'bg-purple-100 text-purple-800' },
      'En attente v�rification': { variant: 'default', color: 'bg-yellow-100 text-yellow-800' },
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
                  placeholder="Rechercher par dossier, client, ou r�f�rence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select 
                className="border rounded-md px-3 py-2 text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tous</option>
                {realStatusOptions.map(s=> <option key={s} value={s}>{s}</option>)}
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
                    <p className="text-muted-foreground">Aucun dossier trouv�</p>
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
                            <Label className="text-muted-foreground">Date cr�ation</Label>
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
                              V�rifier
                            </Button>
                            <Button size="sm" variant="secondary" disabled={authenticating===dossier.id || ['authenticated','notarized','completed'].includes(dossier.status)} onClick={()=>authenticateDossier(dossier)}>
                              {authenticating===dossier.id? '...':'Authentifier'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={()=>exportDossierPDF(dossier)}>
                              <FileDown className="h-4 w-4 mr-1" />PDF
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
                        
                        {/* R�sultat d'analyse IA */}
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
              <CardDescription>G�rez vos rendez-vous et consultations</CardDescription>
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
                    Calendrier des consultations � venir
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
      {/* En-t�te */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard Notaire</h1>
        <p className="text-muted-foreground">Gestion des actes notari�s et v�rifications fonci�res</p>
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
          <TabsTrigger value="activites">Activit�s R�centes</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {renderTabContent()}
        </TabsContent>
      </Tabs>

      {/* Modal de d�tails */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>D�tails du Dossier {currentDossier?.id}</DialogTitle>
            <DialogDescription>
              V�rification et validation du dossier notarial
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
                  <Label className="text-sm font-medium">R�f�rence Parcelle</Label>
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
                <Label htmlFor="notes">Notes de v�rification</Label>
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
          dossiersEnAttente: dossiers.filter(d => d.status === 'En attente v�rification').length,
          actesAuthentifies: stats.find(s => s.title.includes('Authentifi�s'))?.value || 0,
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

