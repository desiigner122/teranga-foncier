import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/components/ui/use-toast";
import { 
  Shield, 
  TrendingUp, 
  Banknote,
  ShieldCheck,
  Scale,
  FolderCheck,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  FileText,
  Calculator,
  Target,
  Zap,
  Eye,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import AntiFraudDashboard from '@/components/ui/AntiFraudDashboard';
import AIAssistantWidget from '@/components/ui/AIAssistantWidget';
import { supabase } from '@/lib/supabaseClient';
import { antiFraudAI } from '@/lib/antiFraudAI';

const BanqueDashboard = () => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    activeGuarantees: 0,
    pendingEvaluations: 0,
    fundingRequests: 0,
    complianceRate: 0,
    totalExposure: 0,
    securityScore: 92
  });
  const [guarantees, setGuarantees] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [fundingRequests, setFundingRequests] = useState([]);
  const [riskAnalysis, setRiskAnalysis] = useState([]);
  const [marketTrends, setMarketTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    loadBankDashboardData();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête banque */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Banque 🏦
            </h1>
            <p className="text-gray-600 mt-1">
              Gestion des garanties et financements immobiliers avec IA
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleRiskAnalysis} className="bg-red-600 hover:bg-red-700">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Analyser les Risques
            </Button>
            <Button onClick={handleComplianceCheck} className="bg-blue-600 hover:bg-blue-700">
              <FolderCheck className="h-4 w-4 mr-2" />
              Vérifier Conformité
            </Button>
          </div>
        </div>

        {/* Statistiques bancaires */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <Card className="border-l-4 border-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Garanties Actives</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.activeGuarantees}</p>
                </div>
                <ShieldCheck className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Évaluations</p>
                  <p className="text-3xl font-bold text-green-600">{stats.pendingEvaluations}</p>
                </div>
                <Scale className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Financements</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.fundingRequests}</p>
                </div>
                <Banknote className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conformité</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.complianceRate}%</p>
                </div>
                <FolderCheck className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Exposition</p>
                  <p className="text-2xl font-bold text-red-600">
                    {(stats.totalExposure / 1000000000).toFixed(1)}Md
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-indigo-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sécurité</p>
                  <p className="text-3xl font-bold text-indigo-600">{stats.securityScore}%</p>
                </div>
                <Shield className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>
        </div>

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
  );
};

export default BanqueDashboard;
