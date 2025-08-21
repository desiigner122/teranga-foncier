import React, { useState, useEffect } from 'react';
import { Bell, Eye, Search, Clock, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import SupabaseDataService from '../../services/SupabaseDataService';
import supabase from "../../lib/supabaseClient";
import { motion } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useRealtimeTable } from "../../hooks/useRealtimeTable";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from "../../components/ui/table";

const ParticulierDashboard = () => {
  
  const [loading, setLoading] = useState(false);
const { toast } = useToast();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    favoritesCounted: 0,
    savedSearches: 0,
    transactionsInProgress: 0,
    securityScore: 0
  });
  const { data: recentActivity, loading: recentActivityLoading, error: recentActivityError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (recentActivity) {
      setFilteredData(recentActivity);
    }
  }, [recentActivity]);
  
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Recalculer les recommandations quand les parcelles changent
  useEffect(() => {
    const updateRecommendations = async () => {
      if (user?.id && allParcels && allParcels.length > 0) {
        try {
          const favorites = await SupabaseDataService.getUserFavorites(user.id);
          const recommendations = await generateAIRecommendations(user.id, favorites, allParcels);
          setRecommendedParcels(recommendations);
        } catch (error) {        }
      }
    };

    updateRecommendations();
  }, [allParcels, user?.id]);

  // Charger l'analyse de sécurité quand l'utilisateur change
  useEffect(() => {
    const loadSecurityAnalysis = async () => {
      if (!user?.id) return;
      
      try {
        const securityAnalysis = await antiFraudAI.analyzeUserFraud(user.id, {
          loginHistory: true,
          transactionHistory: true,
          profileCompleteness: true
        });

        setStats(prev => ({
          ...prev,
          securityScore: Math.round((1 - securityAnalysis.riskScore) * 100)
        }));
      } catch (error) {      }
    };

    loadSecurityAnalysis();
  }, [user?.id]);

  const loadDashboardData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Charger les favoris
      const favorites = await SupabaseDataService.getUserFavorites(user.id);

      // Charger les recherches sauvegardées
      const { data: searches } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id);

      // Charger les transactions en cours
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*, parcels(*)')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .eq('status', 'in_progress');

      // Charger l'activité récente
      const { data: activity } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Recommandations IA personnalisées
      const recommendations = await generateAIRecommendations(user.id, favorites, allParcels);

      // Alertes de sécurité personnalisées
      const alerts = await loadSecurityAlerts(user.id);

      setStats({
        favoritesCounted: favorites?.length || 0,
        savedSearches: searches?.length || 0,
        transactionsInProgress: transactions?.length || 0,
        securityScore: stats.securityScore
      });

      setRecentActivity(activity || []);
      setRecommendedParcels(recommendations);
      setSecurityAlerts(alerts);

    } catch (error) {    } finally {
      setLoading(false);
    }
  };

  const generateAIRecommendations = async (userId, favorites, allParcels) => {
    try {
      // Analyser les préférences de l'utilisateur
      const preferences = favorites?.map(f => ({
        location: f.parcels?.location,
        price: f.parcels?.price,
        type: f.parcels?.type,
        surface: f.parcels?.surface
      }));

      if (!preferences || preferences.length === 0) {
        // Recommandations par défaut pour nouveaux utilisateurs
        return await getDefaultRecommendations();
      }

      // Utiliser les parcelles du hook real-time au lieu d'une requéte
      const availableParcels = (allParcels || [])
        .filter(p => p.status === 'available')
        .slice(0, 6);

      // Scoring IA basé sur les préférences
      const scoredParcels = availableParcels.map(parcel => {
        let score = 0;
        
        // Analyse de localisation
        preferences.forEach(pref => {
          if (parcel.location.includes(pref.location.split(',')[0])) {
            score += 0.3;
          }
        });

        // Analyse de prix
        const avgPrice = preferences.reduce((sum, p) => sum + p.price, 0) / preferences.length;
        const priceDiff = Math.abs(parcel.price - avgPrice) / avgPrice;
        if (priceDiff < 0.2) score += 0.3;

        // Analyse de surface
        const avgSurface = preferences.reduce((sum, p) => sum + p.surface, 0) / preferences.length;
        const surfaceDiff = Math.abs(parcel.surface - avgSurface) / avgSurface;
        if (surfaceDiff < 0.3) score += 0.2;

        // Analyse anti-fraude
        if (parcel.verification_status === 'verified') score += 0.2;

        return { ...parcel, aiScore: score };
      });

      return scoredParcels
        .sort((a, b) => b.aiScore - a.aiScore)
        .slice(0, 4);

    } catch (error) {      return [];
    }
  };

  const getDefaultRecommendations = async () => {
    const { data: parcels } = await supabase
      .from('parcels')
      .select('*')
      .eq('status', 'available')
      .eq('verification_status', 'verified')
      .order('created_at', { ascending: false })
      .limit(4);

    return parcels || [];
  };

  const loadSecurityAlerts = async (userId) => {
    try {
      const { data: alerts } = await supabase
        .from('fraud_alerts')
        .select('*')
        .eq('target_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3);

      return alerts || [];

    } catch (error) {      return [];
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'view_parcel': return Eye;
      case 'favorite_added': return Heart;
      case 'search_saved': return Search;
      case 'transaction_started': return CreditCard;
      case 'document_uploaded': return FileText;
      default: return Bell;
    }
  };

  const getActivityMessage = (activity) => {
    switch (activity.action_type) {
      case 'view_parcel':
        return `Parcelle visualisée: ${activity.details?.parcel_reference || 'Réf. inconnue'}`;
      case 'favorite_added':
        return `Parcelle ajoutée aux favoris`;
      case 'search_saved':
        return `Recherche sauvegardée: ${activity.details?.search_name || 'Sans nom'}`;
      case 'transaction_started':
        return `Transaction initiée`;
      case 'document_uploaded':
        return `Document téléchargé: ${activity.details?.document_type || 'Type inconnu'}`;
      default:
        return activity.description || 'Activité inconnue';
    }
  };

  const handleSecurityCheck = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Analyse compléte de sécurité
      const securityAnalysis = await antiFraudAI.analyzeUserFraud(user.id, {
        profileAnalysis: true,
        behaviorAnalysis: true,
        transactionAnalysis: true,
        documentAnalysis: true
      });

      toast({
        title: "Analyse de sécurité terminée",
        description: `Score de sécurité: ${Math.round((1 - securityAnalysis.riskScore) * 100)}%`,
      });

      setStats(prev => ({
        ...prev,
        securityScore: Math.round((1 - securityAnalysis.riskScore) * 100)
      }));

    } catch (error) {      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'effectuer l'analyse de sécurité",
      });
    }
  };

  const toggleFavorite = async (parcelId) => {
    if (!user) return;
    try {
      setFavoriteBusy(parcelId);
      const isFav = await SupabaseDataService.isParcelFavorite(user.id, parcelId);
      if (isFav) {
        await SupabaseDataService.removeFromFavorites(user.id, parcelId);
        toast({ title: 'Retiré des favoris' });
      } else {
        await SupabaseDataService.addToFavorites(user.id, parcelId);
        toast({ title: 'Ajouté aux favoris' });
      }
      // Refresh favorites count & recommendations
      loadDashboardData();
    } catch (e) {      toast({ variant:'destructive', title:'Erreur', description:'Impossible de mettre é jour les favoris' });
    } finally {
      setFavoriteBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-téte avec salutations */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bonjour {user?.full_name || 'Utilisateur'} ??
            </h1>
            <p className="text-gray-600 mt-1">
              Votre tableau de bord personnel sécurisé par IA anti-fraude
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSecurityCheck} className="bg-green-600 hover:bg-green-700">
              <Shield className="h-4 w-4 mr-2" />
              Vérifier la Sécurité
            </Button>
            <Button variant="outline" onClick={()=> setShowMunicipalModal(true)}>
              <MapPin className="h-4 w-4 mr-2" />
              Demande Terrain Mairie
            </Button>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Mes Favoris</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.favoritesCounted}</p>
                </div>
                <Heart className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recherches</p>
                  <p className="text-3xl font-bold text-green-600">{stats.savedSearches}</p>
                </div>
                <Search className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Transactions</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.transactionsInProgress}</p>
                </div>
                <CreditCard className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sécurité</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.securityScore}%</p>
                </div>
                <Shield className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertes de sécurité */}
        {securityAlerts.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Alertes de Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="font-medium text-red-800">{alert.alert_type}</p>
                        <p className="text-sm text-red-600">{alert.description}</p>
                      </div>
                    </div>
                    <Badge className="bg-red-100 text-red-800">
                      {alert.risk_level}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recommandations IA */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Recommandations IA Personnalisées
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : recommendedParcels.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Aucune recommendation disponible</p>
                    <p className="text-sm text-gray-400">Ajoutez des favoris pour recevoir des suggestions</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendedParcels.map((parcel) => (
                      <motion.div
                        key={parcel.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-sm">{parcel.reference}</h4>
                          {parcel.aiScore && (
                            <Badge className="bg-green-100 text-green-800">
                              {Math.round(parcel.aiScore * 100)}% match
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{parcel.location}</p>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-blue-600">
                            {parcel.price?.toLocaleString()} FCFA
                          </span>
                          <span className="text-xs text-gray-500">
                            {parcel.surface} mé
                          </span>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="h-3 w-3 mr-1" />
                            Voir
                          </Button>
                          <Button size="sm" variant={favoriteBusy===parcel.id? 'secondary':'outline'} disabled={favoriteBusy===parcel.id} onClick={()=>toggleFavorite(parcel.id)}>
                            <Heart className={`h-3 w-3 ${favoriteBusy===parcel.id?'animate-pulse':''}`} />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activité récente */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Activité Récente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Aucune activité récente</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.slice(0, 5).map((activity) => {
                      const ActivityIcon = getActivityIcon(activity.action_type);
                      return (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className="p-1 rounded-full bg-blue-100">
                            <ActivityIcon className="h-3 w-3 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {getActivityMessage(activity)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.created_at).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dashboard Anti-Fraude */}
        <AntiFraudDashboard 
          userRole="particulier" 
          dashboardContext={{ 
            userId: user?.id,
            userType: 'particulier',
            securityLevel: 'standard'
          }} 
        />

        {/* Assistant IA */}
        <AIAssistantWidget 
          userRole="particulier"
          context={{
            userId: user?.id,
            userPreferences: {
              favorites: stats.favoritesCounted,
              searches: stats.savedSearches
            }
          }}
        />
      </div>

      {/* Modal Transition Vendeur */}
      <VendeurTransitionModal
        isOpen={isVendeurTransitionModalOpen}
        onClose={() => setIsVendeurTransitionModalOpen(false)}
        onSuccess={() => {
          toast({
            title: "Demande soumise",
            description: "Votre demande de transition vers vendeur a été soumise avec succés",
          });
          setIsVendeurTransitionModalOpen(false);
        }}
      />

      {showMunicipalModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={()=> !creatingMunicipalReq && setShowMunicipalModal(false)}>?</button>
            <h2 className="text-xl font-semibold mb-4">Nouvelle Demande Municipale</h2>
            <form onSubmit={async e=> { e.preventDefault(); if(!user) return; try { setCreatingMunicipalReq(true); const req = await SupabaseDataService.createMunicipalRequest({ requesterId:user.id, region: municipalReqForm.region, department: municipalReqForm.department, commune: municipalReqForm.commune, requestType: 'allocation_terrain', areaSqm: municipalReqForm.area_sqm? Number(municipalReqForm.area_sqm): null, message: municipalReqForm.message }); toast({ title:'Demande soumise', description:req?.reference || 'Référence générée'}); setShowMunicipalModal(false); setMunicipalReqForm({ commune:'', department:'', region:'', area_sqm:'', message:''}); } catch(err){ console.error(err); toast({ variant:'destructive', title:'Erreur', description:'Soumission impossible'});} finally { setCreatingMunicipalReq(false);} }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Commune *</label>
                  <input className="w-full border rounded px-2 py-2 text-sm" value={municipalReqForm.commune} onChange={e=> setMunicipalReqForm(f=>({...f, commune:e.target.value}))} required />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Département</label>
                  <input className="w-full border rounded px-2 py-2 text-sm" value={municipalReqForm.department} onChange={e=> setMunicipalReqForm(f=>({...f, department:e.target.value}))} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Région</label>
                  <input className="w-full border rounded px-2 py-2 text-sm" value={municipalReqForm.region} onChange={e=> setMunicipalReqForm(f=>({...f, region:e.target.value}))} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Surface (mé)</label>
                  <input type="number" min="0" className="w-full border rounded px-2 py-2 text-sm" value={municipalReqForm.area_sqm} onChange={e=> setMunicipalReqForm(f=>({...f, area_sqm:e.target.value}))} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Message (motif)</label>
                <textarea rows={4} className="w-full border rounded px-2 py-2 text-sm" value={municipalReqForm.message} onChange={e=> setMunicipalReqForm(f=>({...f, message:e.target.value}))} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" disabled={creatingMunicipalReq} onClick={()=> setShowMunicipalModal(false)}>Annuler</Button>
                <Button type="submit" disabled={creatingMunicipalReq}>{creatingMunicipalReq? 'Soumission...' : 'Soumettre'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticulierDashboard;

