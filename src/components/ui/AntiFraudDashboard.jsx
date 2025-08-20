import React, { useState, useEffect } from 'react';
import { useRealtime } from '@/context/RealtimeContext.jsx';
import { useRealtimeTable, useRealtimeUsers, useRealtimeParcels, useRealtimeParcelSubmissions } from '@/hooks/useRealtimeTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  Ban, 
  Eye, 
  FileX, 
  Users, 
  MapPin,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  Zap
} from 'lucide-react';
import { antiFraudAI } from '@/lib/antiFraudAI';
import { supabase } from '@/lib/supabaseClient';
import { safeTableQuery } from '@/lib/tableUtils';

const AntiFraudDashboard = ({ userRole, dashboardContext }) => {
  const { toast } = useToast();
  const { data: fraudAlerts, loading: fraudAlertsLoading, error: fraudAlertsError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (fraudAlerts) {
      setFilteredData(fraudAlerts);
    }
  }, [fraudAlerts]);
  
  useEffect(() => {
    loadFraudAlerts();
    const interval = setInterval(loadFraudAlerts, 30000); // Refresh toutes les 30 secondes
    return () => clearInterval(interval);
  }, [userRole]);

  const loadFraudAlerts = async () => {
    setLoading(true);
    try {
      // Charger les alertes de fraude selon le rôle
      const { data: alerts, error } = await supabase
        .from('fraud_alerts')
        .select(`
          *,
          parcels(reference, location),
          profiles(full_name, email)
        `)
        .or(getRoleFilter())
        .eq('status', 'active')
        .order('risk_score', { ascending: false })
        .limit(20);

      if (error) throw error;

      setFraudAlerts(alerts || []);
      calculateStats(alerts || []);

    } catch (error) {
      console.error('Erreur chargement alertes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleFilter = () => {
    switch (userRole) {
      case 'admin':
        return 'alert_type.in.(document_fraud,transaction_fraud,user_fraud,parcel_fraud,network_fraud)';
      case 'notaire':
        return 'alert_type.in.(document_fraud,signature_fraud)';
      case 'agent':
        return 'alert_type.in.(transaction_fraud,user_fraud)';
      case 'banque':
        return 'alert_type.in.(transaction_fraud,user_fraud)';
      case 'mairie':
        return 'alert_type.in.(parcel_fraud,document_fraud)';
      default:
        return 'alert_type.eq.user_fraud';
    }
  };

  const calculateStats = (alerts) => {
    const totalAlerts = alerts.length;
    const criticalAlerts = alerts.filter(a => a.risk_level === 'critical').length;
    const resolved = alerts.filter(a => a.status === 'resolved').length;
    const prevented = alerts.filter(a => a.action_taken === 'blocked').length;

    setStats({ totalAlerts, criticalAlerts, resolved, prevented });
  };

  const handleAlertAction = async (alertId, action) => {
    try {
      let updateData = { updated_at: new Date().toISOString() };

      switch (action) {
        case 'investigate':
          updateData.status = 'investigating';
          updateData.assigned_to = dashboardContext.userId;
          break;
        case 'resolve':
          updateData.status = 'resolved';
          updateData.resolved_at = new Date().toISOString();
          break;
        case 'escalate':
          updateData.status = 'escalated';
          updateData.escalated_to = 'admin';
          break;
        case 'dismiss':
          updateData.status = 'dismissed';
          updateData.dismissed_at = new Date().toISOString();
          break;
      }

      const { error } = await supabase
        .from('fraud_alerts')
        .update(updateData)
        .eq('id', alertId);

      if (error) throw error;

      await loadFraudAlerts();

      toast({
        title: "Action exécutée",
        description: `Alerte ${action === 'resolve' ? 'résolue' : action === 'escalate' ? 'escaladée' : 'mise à jour'}`,
      });

    } catch (error) {
      console.error('Erreur action alerte:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'exécuter l'action",
      });
    }
  };

  const runFraudAnalysis = async (type, targetId) => {
    try {
      let analysisResult;

      switch (type) {
        case 'user':
          const { data: userActivity } = await supabase
            .from('user_activities')
            .select('*')
            .eq('user_id', targetId)
            .order('created_at', { ascending: false })
            .limit(50);

          analysisResult = await antiFraudAI.analyzeUserFraud(targetId, userActivity);
          break;

        case 'transaction':
          const { data: transaction } = await supabase
            .from('transactions')
            .select('*')
            .eq('id', targetId)
            .single();

          const participants = [transaction.buyer_id, transaction.seller_id, transaction.agent_id].filter(Boolean);
          analysisResult = await antiFraudAI.analyzeTransactionFraud(transaction, participants);
          break;

        case 'parcel':
          const { data: ownershipHistory } = await supabase
            .from('ownership_history')
            .select('*')
            .eq('parcel_id', targetId)
            .order('created_at', { ascending: false });

          analysisResult = await antiFraudAI.analyzeParcelFraud(targetId, ownershipHistory);
          break;
      }

      if (analysisResult.riskScore > 0.6) {
        // Créer une nouvelle alerte
        await supabase.from('fraud_alerts').insert({
          alert_type: `${type}_fraud`,
          target_id: targetId,
          risk_score: analysisResult.riskScore,
          risk_level: analysisResult.riskLevel,
          indicators: analysisResult.fraudIndicators,
          recommendations: analysisResult.recommendations,
          status: 'active',
          created_by: 'ai_system'
        });

        await loadFraudAlerts();
      }

      return analysisResult;

    } catch (error) {
      console.error('Erreur analyse fraude:', error);
      throw error;
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertIcon = (alertType) => {
    switch (alertType) {
      case 'document_fraud': return FileX;
      case 'transaction_fraud': return TrendingDown;
      case 'user_fraud': return Users;
      case 'parcel_fraud': return MapPin;
      case 'network_fraud': return Zap;
      default: return AlertTriangle;
    }
  };

  const getAlertTitle = (alertType) => {
    switch (alertType) {
      case 'document_fraud': return 'Fraude Documentaire';
      case 'transaction_fraud': return 'Transaction Suspecte';
      case 'user_fraud': return 'Utilisateur Suspect';
      case 'parcel_fraud': return 'Parcelle Frauduleuse';
      case 'network_fraud': return 'Réseau de Fraude';
      default: return 'Alerte de Sécurité';
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistiques anti-fraude */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alertes Actives</p>
                <p className="text-2xl font-bold text-red-600">{stats.totalAlerts}</p>
              </div>
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critiques</p>
                <p className="text-2xl font-bold text-orange-600">{stats.criticalAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Résolues</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prévenus</p>
                <p className="text-2xl font-bold text-blue-600">{stats.prevented}</p>
              </div>
              <Ban className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes prioritaires */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            Alertes Anti-Fraude Prioritaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            </div>
          ) : fraudAlerts.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-muted-foreground">Aucune alerte de fraude active</p>
              <p className="text-sm text-green-600">Votre plateforme est sécurisée</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {fraudAlerts.slice(0, 5).map((alert) => {
                  const AlertIcon = getAlertIcon(alert.alert_type);
                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${getRiskColor(alert.risk_level)}`}>
                            <AlertIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{getAlertTitle(alert.alert_type)}</h4>
                              <Badge className={getRiskColor(alert.risk_level)}>
                                {alert.risk_level.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {alert.description || 'Activité suspecte détectée par l\'IA'}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(alert.created_at).toLocaleString('fr-FR')}
                              </span>
                              <span>Score: {Math.round(alert.risk_score * 100)}%</span>
                              {alert.target_reference && (
                                <span>Réf: {alert.target_reference}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAlert(alert);
                              setShowDetails(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {userRole === 'admin' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAlertAction(alert.id, 'investigate')}
                              >
                                Enquêter
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleAlertAction(alert.id, 'escalate')}
                              >
                                Escalader
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommandations IA selon le rôle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Recommandations Anti-Fraude pour {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getRoleRecommendations(userRole).map((recommendation, index) => (
              <Alert key={index} className="border-blue-200">
                <Info className="h-4 w-4 text-blue-500" />
                <AlertDescription>{recommendation}</AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de détails d'alerte */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails de l'Alerte Anti-Fraude</DialogTitle>
            <DialogDescription>
              Analyse complète de l'alerte de sécurité
            </DialogDescription>
          </DialogHeader>
          
          {selectedAlert && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Informations Générales</h4>
                  <div className="space-y-2 text-sm">
                    <div>Type: {getAlertTitle(selectedAlert.alert_type)}</div>
                    <div>Niveau de risque: {selectedAlert.risk_level}</div>
                    <div>Score: {Math.round(selectedAlert.risk_score * 100)}%</div>
                    <div>Créée: {new Date(selectedAlert.created_at).toLocaleString('fr-FR')}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Cible de l'Alerte</h4>
                  <div className="space-y-2 text-sm">
                    <div>ID: {selectedAlert.target_id}</div>
                    <div>Référence: {selectedAlert.target_reference || 'N/A'}</div>
                    <div>Statut: {selectedAlert.status}</div>
                  </div>
                </div>
              </div>

              {selectedAlert.indicators && selectedAlert.indicators.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Indicateurs de Fraude</h4>
                  <div className="space-y-2">
                    {selectedAlert.indicators.map((indicator, index) => (
                      <Alert key={index} className="border-orange-200">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <AlertDescription>
                          <span className="font-medium">{indicator.type}:</span> {indicator.message}
                          {indicator.severity && (
                            <Badge className={`ml-2 ${getRiskColor(indicator.severity)}`}>
                              {indicator.severity}
                            </Badge>
                          )}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}

              {selectedAlert.recommendations && selectedAlert.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Recommandations</h4>
                  <div className="space-y-1">
                    {selectedAlert.recommendations.map((rec, index) => (
                      <div key={index} className="text-sm flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Fermer
            </Button>
            {userRole === 'admin' && selectedAlert && (
              <>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    handleAlertAction(selectedAlert.id, 'dismiss');
                    setShowDetails(false);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeter
                </Button>
                <Button 
                  onClick={() => {
                    handleAlertAction(selectedAlert.id, 'resolve');
                    setShowDetails(false);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Résoudre
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Recommandations spécifiques par rôle
const getRoleRecommendations = (role) => {
  const recommendations = {
    admin: [
      "Surveillez les patterns de fraude en réseau - L'IA a détecté 3 groupes suspects ce mois",
      "Activez la vérification en deux étapes pour tous les utilisateurs à haut risque",
      "Planifiez des audits surprises des documents dans les zones à forte activité",
      "Renforcez la surveillance des transactions supérieures à 100M FCFA"
    ],
    notaire: [
      "Vérifiez systématiquement les signatures avec l'analyseur IA avant authentification",
      "Alertez immédiatement en cas de détection de documents dupliqués",
      "Documentez toutes les vérifications d'identité avec photos et empreintes",
      "Utilisez la blockchain pour l'horodatage sécurisé des actes"
    ],
    agent: [
      "Vérifiez l'identité de vos clients avec l'outil de reconnaissance faciale",
      "Signaler immédiatement les offres de prix anormalement élevées ou basses",
      "Utilisez le scoring IA pour évaluer la crédibilité de vos prospects",
      "Documentez tous les échanges avec photos géolocalisées des parcelles"
    ],
    banque: [
      "Analysez les patterns de revenus avec l'IA avant approbation de crédit",
      "Vérifiez la cohérence des garanties foncières avec les données cadastrales",
      "Surveillez les demandes multiples du même demandeur",
      "Exigez des évaluations indépendantes pour les biens de forte valeur"
    ],
    mairie: [
      "Vérifiez la cohérence des limites parcellaires avec l'IA géospatiale",
      "Alertez en cas de demandes multiples sur la même parcelle",
      "Utilisez la reconnaissance d'images pour détecter les faux documents",
      "Croisez les données avec le cadastre national régulièrement"
    ]
  };

  return recommendations[role] || [
    "Restez vigilant face aux activités suspectes",
    "Signalez tout comportement anormal aux autorités",
    "Vérifiez toujours l'authenticité des documents"
  ];
};

export default AntiFraudDashboard;
