import React, { useState, useEffect } from 'react';
import BanqueSidebar from './BanqueSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/components/ui/use-toast";

const BanqueDashboard = () => {

  // Onglet actif (legacy, fallback) — supprimé car non utilisé

  // ...JSX du dashboard (tout le return)...



  const fetchDocuments = async () => {
    try {
      const docs = await SupabaseDataService.getDocumentsByUser(user.id);
      setDocuments(docs || []);
    } catch (e) {
      setDocuments([]);
    }
  };
  // Realtime subscriptions
  useEffect(()=>{
    const channels = [];
    try {
      const ch1 = supabase.channel('financing_requests_changes').on('postgres_changes',{ event:'*', schema:'public', table:'financing_requests', filter:`bank_id=eq.${user?.id||'000'}`}, ()=> loadBankDashboardData());
      const ch2 = supabase.channel('bank_guarantees_changes').on('postgres_changes',{ event:'*', schema:'public', table:'bank_guarantees', filter:`bank_id=eq.${user?.id||'000'}`}, ()=> loadBankDashboardData());
      const ch3 = supabase.channel('land_evaluations_changes').on('postgres_changes',{ event:'*', schema:'public', table:'land_evaluations', filter:`evaluator_id=eq.${user?.id||'000'}`}, ()=> loadBankDashboardData());
      channels.push(ch1, ch2, ch3);
      channels.forEach(c=> c.subscribe());
    } catch(e){ /* silent */ }
    return ()=> { channels.forEach(c=> { try { supabase.removeChannel(c);} catch{} }); };
  }, [user]);

  const loadUserData = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      setUser({ ...user, ...profile });

      // Analyse de sécurité pour banque
      const securityAnalysis = await antiFraudAI.analyzeUserFraud(user.id, {
        institutionalProfile: true,
        complianceHistory: true,
        financialStability: true
      });

      setStats(prev => ({
        ...prev,
        securityScore: Math.round((1 - securityAnalysis.riskScore) * 100)
      }));

    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
    }
  };

  const loadBankDashboardData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Charger les garanties bancaires
      const { data: bankGuarantees } = await supabase
        .from('bank_guarantees')
        .select(`
          *,
          users(full_name, email),
          parcels(reference, location, price)
        `)
        .eq('bank_id', user.id);

      // Charger les évaluations foncières
      const { data: landEvaluations } = await supabase
        .from('land_evaluations')
        .select(`
          *,
          parcels(reference, location, price),
          users(full_name, email)
        `)
        .eq('evaluator_id', user.id);

      // Charger les demandes de financement
      const { data: financingRequests } = await supabase
        .from('financing_requests')
        .select(`
          *,
          users(full_name, email),
          parcels(reference, location, price)
        `)
        .eq('bank_id', user.id);

      // Charger les données de conformité
      const { data: complianceData } = await supabase
        .from('compliance_checks')
        .select('*')
        .eq('entity_type', 'bank')
        .eq('entity_id', user.id);

      // Calculs statistiques
      const activeGuarantees = bankGuarantees?.filter(g => g.status === 'active').length || 0;
      const pendingEvaluations = landEvaluations?.filter(e => e.status === 'pending').length || 0;
      const fundingRequests = financingRequests?.filter(r => r.status === 'pending').length || 0;
      
      const totalCompliant = complianceData?.filter(c => c.status === 'conforme').length || 0;
      const totalChecks = complianceData?.length || 1;
      const complianceRate = Math.round((totalCompliant / totalChecks) * 100);

      const totalExposure = bankGuarantees?.reduce((sum, guarantee) => {
        return sum + (guarantee.guarantee_amount || 0);
      }, 0) || 0;

      // Analyse des risques IA
      const risks = await generateRiskAnalysis(bankGuarantees, financingRequests);
      
      // Tendances du marché
      const trends = await generateMarketTrends();

      setStats({
        activeGuarantees,
        pendingEvaluations,
        fundingRequests,
        complianceRate,
        totalExposure,
        securityScore: stats.securityScore
      });

      setGuarantees(bankGuarantees || []);
      setEvaluations(landEvaluations || []);
      setFundingRequests(financingRequests || []);
      setRiskAnalysis(risks);
      setMarketTrends(trends);

    } catch (error) {
      console.error('Erreur chargement dashboard banque:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRiskAnalysis = async (guarantees, requests) => {
    try {
      const risks = [];

      // Analyse concentration géographique
      if (guarantees && guarantees.length > 0) {
        const locations = guarantees.map(g => g.parcels?.location).filter(Boolean);
        const locationCounts = locations.reduce((acc, loc) => {
          const city = loc.split(',')[0];
          acc[city] = (acc[city] || 0) + 1;
          return acc;
        }, {});

        const maxConcentration = Math.max(...Object.values(locationCounts));
        const concentrationRate = maxConcentration / guarantees.length;

        if (concentrationRate > 0.3) {
          risks.push({
            type: 'geographic',
            level: 'medium',
            title: 'Concentration géographique élevée',
            description: `${Math.round(concentrationRate * 100)}% des garanties dans une même zone`,
            recommendation: 'Diversifiez votre portefeuille géographique'
          });
        }
      }

      // Analyse des montants
      if (guarantees && guarantees.length > 0) {
        const amounts = guarantees.map(g => g.guarantee_amount).filter(Boolean);
        const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
        const highAmountCount = amounts.filter(amt => amt > avgAmount * 2).length;

        if (highAmountCount > amounts.length * 0.2) {
          risks.push({
            type: 'financial',
            level: 'high',
            title: 'Exposition aux gros montants',
            description: `${highAmountCount} garanties dépassent 200% de la moyenne`,
            recommendation: 'Réévaluez les limites d\'exposition'
          });
        }
      }

      // Analyse des délais de traitement
      if (requests && requests.length > 0) {
        const pendingOld = requests.filter(r => {
          const created = new Date(r.created_at);
          const now = new Date();
          const daysDiff = (now - created) / (1000 * 60 * 60 * 24);
          return r.status === 'pending' && daysDiff > 30;
        });

        if (pendingOld.length > 0) {
          risks.push({
            type: 'operational',
            level: 'medium',
            title: 'Délais de traitement longs',
            description: `${pendingOld.length} demandes en attente depuis plus de 30 jours`,
            recommendation: 'Accélérez le processus de traitement'
          });
        }
      }

      return risks;

    } catch (error) {
      console.error('Erreur analyse des risques:', error);
      return [];
    }
  };

  const generateMarketTrends = async () => {
    try {
      // Analyser les tendances du marché immobilier
      const { data: recentTransactions } = await supabase
        .from('transactions')
        .select('amount, created_at')
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .eq('status', 'completed');

      if (!recentTransactions || recentTransactions.length === 0) {
        return [
          {
            type: 'info',
            title: 'Marché stable',
            description: 'Données insuffisantes pour analyse de tendance',
            trend: 'stable'
          }
        ];
      }

      // Calcul des tendances
      const monthlyData = recentTransactions.reduce((acc, transaction) => {
        const month = new Date(transaction.created_at).toISOString().slice(0, 7);
        if (!acc[month]) {
          acc[month] = { total: 0, count: 0 };
        }
        acc[month].total += transaction.amount;
        acc[month].count += 1;
        return acc;
      }, {});

      const months = Object.keys(monthlyData).sort();
      const trends = [];

      if (months.length >= 2) {
        const lastMonth = monthlyData[months[months.length - 1]];
        const prevMonth = monthlyData[months[months.length - 2]];
        
        const volumeChange = ((lastMonth.count - prevMonth.count) / prevMonth.count) * 100;
        const valueChange = ((lastMonth.total - prevMonth.total) / prevMonth.total) * 100;

        trends.push({
          type: 'volume',
          title: 'Volume des transactions',
          description: `${volumeChange > 0 ? '+' : ''}${volumeChange.toFixed(1)}% ce mois`,
          trend: volumeChange > 0 ? 'up' : 'down'
        });

        trends.push({
          type: 'value',
          title: 'Valeur des transactions',
          description: `${valueChange > 0 ? '+' : ''}${valueChange.toFixed(1)}% ce mois`,
          trend: valueChange > 0 ? 'up' : 'down'
        });
      }

      return trends;

    } catch (error) {
      console.error('Erreur analyse tendances:', error);
      return [];
    }
  };

  const handleRiskAnalysis = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Analyse complète des risques IA
      const riskAnalysis = await antiFraudAI.analyzeBankRisk(user.id, {
        portfolioAnalysis: true,
        concentrationRisk: true,
        creditRisk: true,
        marketRisk: true
      });

      toast({
        title: "Analyse des risques terminée",
        description: `Score de risque global: ${Math.round(riskAnalysis.overallRisk * 100)}%`,
      });

    } catch (error) {
      console.error('Erreur analyse risques:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'effectuer l'analyse des risques",
      });
    }
  };

  const handleComplianceCheck = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Vérification de conformité automatisée
      const complianceCheck = await antiFraudAI.runComplianceCheck(user.id, 'bank');

      toast({
        title: "Vérification de conformité terminée",
        description: `Taux de conformité: ${Math.round(complianceCheck.complianceRate * 100)}%`,
      });

    } catch (error) {
      console.error('Erreur vérification conformité:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de vérifier la conformité",
      });
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return Target;
      default: return BarChart3;
    }
  };

  const act = async (kind, id, extra={}) => {
    if (!user) return;
    const key = `${kind}-${id}`;
    try {
      setActionBusy(key);
      let updated;
      if (kind==='financing-approve') updated = await SupabaseDataService.updateFinancingRequestStatus(id, 'approved', user.id, extra.note||null);
      if (kind==='financing-reject') updated = await SupabaseDataService.updateFinancingRequestStatus(id, 'rejected', user.id, extra.note||null);
      if (kind==='guarantee-activate') updated = await SupabaseDataService.updateBankGuaranteeStatus(id, 'active', user.id);
      if (kind==='guarantee-close') updated = await SupabaseDataService.updateBankGuaranteeStatus(id, 'closed', user.id);
      if (kind==='evaluation-complete') updated = await SupabaseDataService.completeLandEvaluation(id, user.id, extra.value||null, extra.report||null);
      // Refresh local arrays
      if (updated) {
        if (updated.guarantee_amount !== undefined || kind.startsWith('guarantee')) setGuarantees(gs=> gs.map(g=> g.id===id? {...g, ...updated}: g));
        if (updated.decision_note !== undefined || kind.startsWith('financing')) setFundingRequests(rs=> rs.map(r=> r.id===id? {...r, ...updated}: r));
        if (updated.estimated_value !== undefined || kind.startsWith('evaluation')) setEvaluations(ev=> ev.map(e=> e.id===id? {...e, ...updated}: e));
      }
      toast({ title:'Action effectuée', description: key });
    } catch(e) {
      console.error(e);
      toast({ variant:'destructive', title:'Erreur', description:'Action impossible'});
    } finally {

      setActionBusy(null);
    }
  };

// ...existing code for all functions and hooks...
// S'assurer que toutes les fonctions sont fermées ici

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Banque */}
      <BanqueSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          {/* Timeline Modal */}
          <Dialog open={isTimelineOpen} onOpenChange={setIsTimelineOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Timeline de la parcelle</DialogTitle>
                <DialogDescription>Suivi complet des événements de la parcelle</DialogDescription>
              </DialogHeader>
              {timelineParcelId && <ParcelTimeline parcelId={timelineParcelId} />}
            </DialogContent>
          </Dialog>


          {/* Onglets banque (legacy, à remplacer par navigation sidebar) — supprimé */}


          {/* Section Documents (legacy tab) — supprimée car non utilisée */}

          {/* Analyse des risques et tendances */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Analyse des risques */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Analyse des Risques IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                {riskAnalysis.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-400" />
                    <p className="text-gray-500">Aucun risque majeur détecté</p>
                    <p className="text-sm text-gray-400">Portefeuille bien diversifié</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {riskAnalysis.map((risk, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-3 rounded-lg border ${getRiskLevelColor(risk.level)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{risk.title}</h4>
                            <p className="text-sm opacity-80 mt-1">{risk.description}</p>
                            <p className="text-xs mt-2 font-medium">
                              Recommandation: {risk.recommendation}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {risk.level}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tendances du marché */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Tendances du Marché
                </CardTitle>
              </CardHeader>
              <CardContent>
                {marketTrends.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Analyse en cours...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {marketTrends.map((trend, index) => {
                      const TrendIcon = getTrendIcon(trend.trend);
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <TrendIcon className={`h-5 w-5 ${
                              trend.trend === 'up' ? 'text-green-500' : 
                              trend.trend === 'down' ? 'text-red-500' : 'text-blue-500'
                            }`} />
                            <div>
                              <h4 className="font-medium text-sm">{trend.title}</h4>
                              <p className="text-sm text-gray-600">{trend.description}</p>
                            </div>
                          </div>
                          <Badge className={
                            trend.trend === 'up' ? 'bg-green-100 text-green-800' :
                            trend.trend === 'down' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }>
                            {trend.trend}
                          </Badge>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Dashboard Anti-Fraude pour banques */}
          <AntiFraudDashboard 
            userRole="banque" 
            dashboardContext={{ 
              userId: user?.id,
              userType: 'banque',
              securityLevel: 'maximum',
              guaranteesCount: stats.activeGuarantees,
              totalExposure: stats.totalExposure
            }} 
          />

          {/* Listes opérationnelles */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Demandes de financement */}
            <Card>
              <CardHeader>
                <CardTitle>Demandes de Financement</CardTitle>
              </CardHeader>
              <CardContent>
                {fundingRequests.length===0? <p className="text-sm text-gray-500">Aucune demande</p> : (
                  <div className="space-y-3">
                    {fundingRequests.slice(0,6).map(fr => (
                      <div key={fr.id} className="border rounded p-3 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">#{fr.id}</span>
                          <Badge variant={fr.status==='approved'? 'success': fr.status==='rejected'? 'destructive':'secondary'}>{fr.status}</Badge>
                        </div>
                        <p className="text-xs text-gray-500">{fr.parcels?.reference} • {fr.amount?.toLocaleString()} XOF</p>
                        <div className="flex gap-2 mt-2">
                          <Button size="xs" variant="outline" onClick={()=>{setTimelineParcelId(fr.parcels?.id||fr.parcel_id);setIsTimelineOpen(true);}}>Timeline</Button>
                          {fr.status==='pending' && <>
                            <Button size="xs" disabled={actionBusy===`financing-approve-${fr.id}`} onClick={()=>act('financing-approve', fr.id)}>Approuver</Button>
                            <Button size="xs" variant="destructive" disabled={actionBusy===`financing-reject-${fr.id}`} onClick={()=>act('financing-reject', fr.id)}>Refuser</Button>
                          </>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Garanties bancaires */}
            <Card>
              <CardHeader><CardTitle>Garanties</CardTitle></CardHeader>
              <CardContent>
                {guarantees.length===0? <p className="text-sm text-gray-500">Aucune garantie</p> : (
                  <div className="space-y-3">
                    {guarantees.slice(0,6).map(g => (
                      <div key={g.id} className="border rounded p-3 text-sm">
                        <div className="flex justify-between"><span>#{g.id}</span><Badge variant={g.status==='active'? 'success': g.status==='closed'?'secondary':'outline'}>{g.status}</Badge></div>
                        <p className="text-xs text-gray-500">{g.parcels?.reference} • {g.guarantee_amount?.toLocaleString()} XOF</p>
                        <div className="flex gap-2 mt-2">
                          <Button size="xs" variant="outline" onClick={()=>{setTimelineParcelId(g.parcels?.id||g.parcel_id);setIsTimelineOpen(true);}}>Timeline</Button>
                          {g.status!=='closed' && <>
                            {g.status!=='active' && <Button size="xs" disabled={actionBusy===`guarantee-activate-${g.id}`} onClick={()=>act('guarantee-activate', g.id)}>Activer</Button>}
                            <Button size="xs" variant="outline" disabled={actionBusy===`guarantee-close-${g.id}`} onClick={()=>act('guarantee-close', g.id)}>Clore</Button>
                          </>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Evaluations foncières */}
              <Card>
                <CardHeader><CardTitle>Évaluations Foncières</CardTitle></CardHeader>
                <CardContent>
                  {evaluations.length===0? <p className="text-sm text-gray-500">Aucune évaluation</p> : (
                    <div className="space-y-3">
                      {evaluations.slice(0,6).map(ev => (
                        <div key={ev.id} className="border rounded p-3 text-sm">
                          <div className="flex justify-between"><span>#{ev.id}</span><Badge variant={ev.status==='completed'? 'success':'secondary'}>{ev.status}</Badge></div>
                          <p className="text-xs text-gray-500">{ev.parcels?.reference} • {ev.estimated_value? ev.estimated_value.toLocaleString()+' XOF':'—'}</p>
                          {ev.status==='pending' && (
                            <div className="mt-2">
                              <Button size="xs" disabled={actionBusy===`evaluation-complete-${ev.id}`} onClick={()=>act('evaluation-complete', ev.id)}>Clôturer</Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                  )}
                </CardContent>
              </Card>
          </div>

          {/* Assistant IA spécialisé banque */}
          <AIAssistantWidget 
            userRole="banque"
            context={{
              userId: user?.id,
              bankingData: {
                guarantees: stats.activeGuarantees,
                evaluations: stats.pendingEvaluations,
                requests: stats.fundingRequests,
                compliance: stats.complianceRate
              },
              riskProfile: riskAnalysis
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BanqueDashboard;



