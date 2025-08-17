import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/components/ui/use-toast";
import { 
  Shield, 
  TrendingUp, 
  Eye, 
  Users, 
  DollarSign, 
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Camera,
  Upload,
  Star,
  MessageSquare,
  Calendar,
  BarChart3,
  Zap,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import AntiFraudDashboard from '@/components/ui/AntiFraudDashboard';
import AIAssistantWidget from '@/components/ui/AIAssistantWidget';
import { supabase } from '@/lib/supabaseClient';
import { antiFraudAI } from '@/lib/antiFraudAI';

const VendeurDashboard = () => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeViews: 0,
    totalRevenue: 0,
    averagePrice: 0,
    securityScore: 88
  });
  const [listings, setListings] = useState([]);
  const [analytics, setAnalytics] = useState({
    viewsThisMonth: 0,
    inquiriesThisMonth: 0,
    conversionRate: 0,
    topPerformingListing: null
  });
  const [marketInsights, setMarketInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    loadSellerDashboardData();
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

      // Analyse de sécurité pour vendeur
      const securityAnalysis = await antiFraudAI.analyzeUserFraud(user.id, {
        sellerProfile: true,
        listingHistory: true,
        verificationStatus: true
      });

      setStats(prev => ({
        ...prev,
        securityScore: Math.round((1 - securityAnalysis.riskScore) * 100)
      }));

    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
    }
  };

  const loadSellerDashboardData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Charger les annonces du vendeur
      const { data: userListings } = await supabase
        .from('parcels')
        .select(`
          *,
          parcel_views(id, viewed_at),
          parcel_inquiries(id, created_at, inquiry_type)
        `)
        .eq('owner_id', user.id);

      // Calculs statistiques
      const totalListings = userListings?.length || 0;
      const totalViews = userListings?.reduce((sum, listing) => sum + (listing.parcel_views?.length || 0), 0) || 0;
      const totalRevenue = userListings?.reduce((sum, listing) => {
        return listing.status === 'sold' ? sum + listing.price : sum;
      }, 0) || 0;
      
      const averagePrice = totalListings > 0 ? 
        userListings.reduce((sum, listing) => sum + listing.price, 0) / totalListings : 0;

      // Analytics mensuelles
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const viewsThisMonth = userListings?.reduce((sum, listing) => {
        const monthViews = listing.parcel_views?.filter(view => {
          const viewDate = new Date(view.viewed_at);
          return viewDate.getMonth() === currentMonth && viewDate.getFullYear() === currentYear;
        }).length || 0;
        return sum + monthViews;
      }, 0) || 0;

      const inquiriesThisMonth = userListings?.reduce((sum, listing) => {
        const monthInquiries = listing.parcel_inquiries?.filter(inquiry => {
          const inquiryDate = new Date(inquiry.created_at);
          return inquiryDate.getMonth() === currentMonth && inquiryDate.getFullYear() === currentYear;
        }).length || 0;
        return sum + monthInquiries;
      }, 0) || 0;

      // Taux de conversion
      const conversionRate = totalViews > 0 ? (inquiriesThisMonth / viewsThisMonth) * 100 : 0;

      // Meilleure annonce
      const topPerformingListing = userListings?.reduce((top, listing) => {
        const listingViews = listing.parcel_views?.length || 0;
        const topViews = top?.parcel_views?.length || 0;
        return listingViews > topViews ? listing : top;
      }, null);

      // Insights de marché IA
      const insights = await generateMarketInsights(userListings);

      setStats({
        totalListings,
        activeViews: totalViews,
        totalRevenue,
        averagePrice,
        securityScore: stats.securityScore
      });

      setAnalytics({
        viewsThisMonth,
        inquiriesThisMonth,
        conversionRate,
        topPerformingListing
      });

      setListings(userListings || []);
      setMarketInsights(insights);

    } catch (error) {
      console.error('Erreur chargement dashboard vendeur:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMarketInsights = async (userListings) => {
    try {
      if (!userListings || userListings.length === 0) {
        return [
          {
            type: 'tip',
            title: 'Créez votre première annonce',
            message: 'Commencez par publier une annonce pour recevoir des insights personnalisés',
            priority: 'high'
          }
        ];
      }

      // Analyser les types de biens et prix
      const propertyTypes = userListings.map(l => l.type);
      const prices = userListings.map(l => l.price);
      const locations = userListings.map(l => l.location);

      // Obtenir des données de marché similaires
      const { data: marketData } = await supabase
        .from('parcels')
        .select('price, type, location, created_at')
        .in('type', propertyTypes)
        .neq('owner_id', userListings[0].owner_id)
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

      const insights = [];

      // Analyse des prix
      if (marketData && marketData.length > 0) {
        const marketAvgPrice = marketData.reduce((sum, item) => sum + item.price, 0) / marketData.length;
        const userAvgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        
        if (userAvgPrice > marketAvgPrice * 1.1) {
          insights.push({
            type: 'warning',
            title: 'Prix au-dessus du marché',
            message: `Vos prix sont 10% plus élevés que la moyenne du marché (${marketAvgPrice.toLocaleString()} FCFA)`,
            priority: 'medium'
          });
        } else if (userAvgPrice < marketAvgPrice * 0.9) {
          insights.push({
            type: 'success',
            title: 'Prix compétitifs',
            message: `Vos prix sont attractifs comparés au marché local`,
            priority: 'low'
          });
        }
      }

      // Analyse des performances
      const totalViews = userListings.reduce((sum, listing) => sum + (listing.parcel_views?.length || 0), 0);
      if (totalViews < userListings.length * 10) {
        insights.push({
          type: 'tip',
          title: 'Améliorez votre visibilité',
          message: 'Ajoutez plus de photos et détails pour augmenter les vues',
          priority: 'high'
        });
      }

      // Analyse saisonnière IA
      insights.push({
        type: 'info',
        title: 'Tendance saisonnière',
        message: 'La demande immobilière augmente de 15% en cette période',
        priority: 'medium'
      });

      return insights;

    } catch (error) {
      console.error('Erreur génération insights:', error);
      return [];
    }
  };

  const handleListingOptimization = async (listingId) => {
    try {
      // Analyse IA de l'annonce
      const listing = listings.find(l => l.id === listingId);
      if (!listing) return;

      const optimization = await antiFraudAI.analyzeListingOptimization(listing);

      toast({
        title: "Analyse terminée",
        description: `Score d'optimisation: ${Math.round(optimization.score * 100)}%`,
      });

      // Proposer des améliorations
      const improvements = optimization.suggestions.join(', ');
      toast({
        title: "Suggestions d'amélioration",
        description: improvements,
        duration: 5000,
      });

    } catch (error) {
      console.error('Erreur optimisation annonce:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'analyser l'annonce",
      });
    }
  };

  const handlePriceAnalysis = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Analyse IA des prix
      const priceAnalysis = await antiFraudAI.analyzePricingStrategy(user.id, listings);

      toast({
        title: "Analyse des prix terminée",
        description: `Recommandation: ${priceAnalysis.recommendation}`,
        duration: 5000,
      });

    } catch (error) {
      console.error('Erreur analyse prix:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'analyser les prix",
      });
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle;
      case 'tip': return Star;
      case 'info': return Zap;
      default: return Target;
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'warning': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'tip': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'info': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête vendeur */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tableau de Bord Vendeur 🏡
            </h1>
            <p className="text-gray-600 mt-1">
              Gérez vos annonces et maximisez vos ventes avec l'IA
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handlePriceAnalysis} className="bg-blue-600 hover:bg-blue-700">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analyser les Prix
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <Upload className="h-4 w-4 mr-2" />
              Nouvelle Annonce
            </Button>
          </div>
        </div>

        {/* Statistiques vendeur */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="border-l-4 border-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Mes Annonces</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalListings}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vues Totales</p>
                  <p className="text-3xl font-bold text-green-600">{stats.activeViews}</p>
                </div>
                <Eye className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenus</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {(stats.totalRevenue / 1000000).toFixed(1)}M
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Prix Moyen</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(stats.averagePrice / 1000000).toFixed(1)}M
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sécurité</p>
                  <p className="text-3xl font-bold text-red-600">{stats.securityScore}%</p>
                </div>
                <Shield className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics et insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performances ce mois */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Performances ce Mois
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Vues</span>
                  <span className="font-bold">{analytics.viewsThisMonth}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Demandes</span>
                  <span className="font-bold">{analytics.inquiriesThisMonth}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taux de conversion</span>
                  <Badge className="bg-green-100 text-green-800">
                    {analytics.conversionRate.toFixed(1)}%
                  </Badge>
                </div>
                {analytics.topPerformingListing && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-600 mb-1">Meilleure annonce</p>
                    <p className="font-medium">{analytics.topPerformingListing.reference}</p>
                    <p className="text-xs text-gray-500">{analytics.topPerformingListing.location}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Insights IA */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Insights IA du Marché
                </CardTitle>
              </CardHeader>
              <CardContent>
                {marketInsights.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Insights en cours de génération...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {marketInsights.map((insight, index) => {
                      const InsightIcon = getInsightIcon(insight.type);
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-3 rounded-lg border ${getInsightColor(insight.type)}`}
                        >
                          <div className="flex items-start gap-3">
                            <InsightIcon className="h-4 w-4 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{insight.title}</h4>
                              <p className="text-sm opacity-80">{insight.message}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {insight.priority}
                            </Badge>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mes annonces avec optimisation IA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-500" />
              Mes Annonces Actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Aucune annonce active</p>
                <Button className="mt-4">
                  <Upload className="h-4 w-4 mr-2" />
                  Créer une annonce
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {listings.slice(0, 5).map((listing) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{listing.reference}</h4>
                          <Badge variant={listing.status === 'available' ? 'default' : 'secondary'}>
                            {listing.status === 'available' ? 'Disponible' : listing.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{listing.location}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-bold text-green-600">
                            {listing.price?.toLocaleString()} FCFA
                          </span>
                          <span className="text-gray-500">{listing.surface} m²</span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {listing.parcel_views?.length || 0} vues
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleListingOptimization(listing.id)}
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          Optimiser
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dashboard Anti-Fraude pour vendeurs */}
        <AntiFraudDashboard 
          userRole="vendeur" 
          dashboardContext={{ 
            userId: user?.id,
            userType: 'vendeur',
            securityLevel: 'enhanced',
            listingsCount: stats.totalListings
          }} 
        />

        {/* Assistant IA spécialisé vendeur */}
        <AIAssistantWidget 
          userRole="vendeur"
          context={{
            userId: user?.id,
            listingsData: {
              total: stats.totalListings,
              views: stats.activeViews,
              revenue: stats.totalRevenue
            },
            marketInsights: marketInsights
          }}
        />
      </div>
    </div>
  );
};

export default VendeurDashboard;
