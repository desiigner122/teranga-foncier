import VendeurTransitionModal from '@/components/dashboard/VendeurTransitionModal';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/components/ui/use-toast";
import { 
  Shield, 
  User, 
  Heart, 
  CreditCard, 
  MapPin, 
  TrendingUp,
  Search,
  Bell,
  Settings,
  FileText,
  Eye,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Star,
  DollarSign,
  Clock,
  Filter,
  Download,
  Share
} from 'lucide-react';
import { motion } from 'framer-motion';
import AntiFraudDashboard from '@/components/ui/AntiFraudDashboard';
import AIAssistantWidget from '@/components/ui/AIAssistantWidget';
import { supabase } from '@/lib/supabaseClient';
import { SupabaseDataService } from '@/services/supabaseDataService';
import { antiFraudAI } from '@/lib/antiFraudAI';
import DocumentWallet from '@/components/mairie/DocumentWallet';
import ParcelTimeline from '@/components/mairie/ParcelTimeline';
  // Mes parcelles attribuées
  const [myParcels, setMyParcels] = useState([]);
  const [showTimeline, setShowTimeline] = useState(false);
  const [timelineParcel, setTimelineParcel] = useState(null);

  useEffect(() => {
    const loadMyParcels = async () => {
      if (!user) return;
      try {
        const allParcels = await SupabaseDataService.getParcels();
        const mine = allParcels.filter(p => p.beneficiary_id === user.id);
        setMyParcels(mine);
      } catch (e) {/* ignore */}
    };
    loadMyParcels();
  }, [user]);

const ParticulierDashboard = () => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    favoritesCounted: 0,
    savedSearches: 0,
    transactionsInProgress: 0,
    securityScore: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [recommendedParcels, setRecommendedParcels] = useState([]);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteBusy, setFavoriteBusy] = useState(null); // parcel id if toggling
  const [creatingMunicipalReq, setCreatingMunicipalReq] = useState(false);
  const [municipalReqForm, setMunicipalReqForm] = useState({ commune:'', department:'', region:'', area_sqm:'', message:'' });
  const [showMunicipalModal, setShowMunicipalModal] = useState(false);

  // State pour la modale de transition vendeur
  const [isVendeurTransitionModalOpen, setIsVendeurTransitionModalOpen] = useState(false);

  // Blocage strict : tant que le particulier n'est pas vérifié, il ne doit pas accéder au dashboard
  useEffect(() => {
    loadUserData();
    loadDashboardData();
  }, []);

  // Affichage du blocage si non vérifié
  if (user && (user.type === 'Particulier' || user.type === 'particulier')) {
    if (user.verification_status !== 'verified') {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen py-12">
          <div className="bg-white rounded shadow p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4">Votre compte est en attente de validation</h2>
            <p className="mb-4">Vous avez bien soumis vos documents. L'accès au tableau de bord sera débloqué dès que l'administrateur aura validé votre compte.</p>
            <p className="text-sm text-muted-foreground">Statut actuel : <span className="font-semibold">{user.verification_status === 'pending' ? 'En attente' : 'Non vérifié'}</span></p>
            <p className="mt-4 text-xs text-gray-400">Contactez le support si la validation prend trop de temps.</p>
          </div>
        </div>
      );
    }
  }
  useEffect(()=>{
    if(!user) return; 
    const favChannel = supabase.channel('favorites_changes').on('postgres_changes',{ event:'*', schema:'public', table:'favorites', filter:`user_id=eq.${user.id}`}, ()=> loadDashboardData());
    favChannel.subscribe();
    return ()=> { try { supabase.removeChannel(favChannel);} catch{} };
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

      // Analyse de sécurité du profil utilisateur
      const securityAnalysis = await antiFraudAI.analyzeUserFraud(user.id, {
        loginHistory: true,
        transactionHistory: true,
        profileCompleteness: true
      });

      setStats(prev => ({
        ...prev,
        securityScore: Math.round((1 - securityAnalysis.riskScore) * 100)
      }));

    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
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
  const recommendations = await generateAIRecommendations(user.id, favorites);

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

    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIRecommendations = async (userId, favorites) => {
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

      // IA pour recommandations personnalisées
      const { data: parcels } = await supabase
        .from('parcels')
        .select('*')
        .eq('status', 'available')
        .limit(6);

      // Scoring IA basé sur les préférences
      const scoredParcels = parcels.map(parcel => {
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

    } catch (error) {
      console.error('Erreur recommandations IA:', error);
      return [];
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

    } catch (error) {
      console.error('Erreur alertes sécurité:', error);
      return [];
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
      
      // Analyse complète de sécurité
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

    } catch (error) {
      console.error('Erreur analyse sécurité:', error);
      toast({
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
    } catch (e) {
      console.error(e);
      toast({ variant:'destructive', title:'Erreur', description:'Impossible de mettre à jour les favoris' });
    } finally {
      setFavoriteBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête avec salutations */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bonjour {user?.full_name || 'Utilisateur'} 👋
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
        {/* Mes parcelles attribuées */}
        <div className="mt-10">
          <Card>
            <CardHeader>
              <CardTitle>Mes parcelles attribuées</CardTitle>
            </CardHeader>
            <CardContent>
              {myParcels.length === 0 ? (
                <div className="text-muted-foreground text-sm">Aucune parcelle attribuée pour l’instant.</div>
              ) : (
                <div className="space-y-6">
                  {myParcels.map(parcel => (
                    <div key={parcel.id} className="border rounded p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <div className="font-semibold">{parcel.reference}</div>
                          <div className="text-xs text-muted-foreground">{parcel.location_name} — {parcel.zone}</div>
                          <div className="text-xs">Surface : {parcel.area_sqm} m²</div>
                        </div>
                        <div className="flex gap-2 mt-2 md:mt-0">
                          <Button size="sm" variant="outline" onClick={()=>{setTimelineParcel(parcel);setShowTimeline(true);}}>Voir timeline</Button>
                          {Array.isArray(parcel.documents) && parcel.documents.length > 0 && (
                            <Button size="sm" variant="outline" onClick={()=>window.open(parcel.documents[0].url, '_blank')}>Voir documents</Button>
                          )}
                        </div>
                      </div>
                      {Array.isArray(parcel.documents) && parcel.documents.length > 0 && (
                        <div className="mt-2">
                          <DocumentWallet documents={parcel.documents} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modal Timeline */}
        {showTimeline && timelineParcel && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg shadow-xl w-full max-w-lg relative p-6">
              <button className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground" onClick={()=>setShowTimeline(false)}>
                <span className="text-lg">×</span>
              </button>
              <h2 className="text-xl font-semibold mb-4">Historique de la parcelle {timelineParcel.reference}</h2>
              <ParcelTimeline history={(() => {
                const p = timelineParcel;
                const history = [];
                if (p.created_at) history.push({ status: 'created', date: p.created_at, description: 'Parcelle créée' });
                if (p.status === 'Attribuée' && p.beneficiary_id) history.push({ status: 'attributed', date: p.updated_at, description: 'Attribuée à vous' });
                if (p.status === 'Validée' || p.validated_by_notary) history.push({ status: 'validated', date: p.validated_at, description: 'Validée par notaire' });
                if (p.status === 'Archivée' || p.archived) history.push({ status: 'archived', date: p.archived_at, description: 'Parcelle archivée' });
                return history;
              })()} />
            </div>
          </div>
        )}
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
                            {parcel.surface} m²
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
            description: "Votre demande de transition vers vendeur a été soumise avec succès",
          });
          setIsVendeurTransitionModalOpen(false);
        }}
      />

      {showMunicipalModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={()=> !creatingMunicipalReq && setShowMunicipalModal(false)}>✕</button>
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
                  <label className="block text-xs font-medium mb-1">Surface (m²)</label>
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
