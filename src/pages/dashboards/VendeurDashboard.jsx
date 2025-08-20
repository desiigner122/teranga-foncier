import React, { useState, useEffect } from 'react';
import { useRealtimeContext } from '@/context/RealtimeContext.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { useRealtimeParcelSubmissions, useRealtimeParcels } from '../../hooks/useRealtimeTable';
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
  Target,
  Inbox
} from 'lucide-react';
import { motion } from 'framer-motion';
import AntiFraudDashboard from '@/components/ui/AntiFraudDashboard';
import AIAssistantWidget from '@/components/ui/AIAssistantWidget';
import { supabase } from '@/lib/supabaseClient';
import { SupabaseDataService } from '@/services/supabaseDataService';
import ParcelSubmissionModal from '@/components/vendeur/ParcelSubmissionModal';
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
  const [analytics, setAnalytics] = useState({
    viewsThisMonth: 0,
    inquiriesThisMonth: 0,
    conversionRate: 0,
    topPerformingListing: null
  });
  const { data: marketInsights, loading: marketInsightsLoading, error: marketInsightsError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  // Chargement géré par les hooks temps réel

  // Plus besoin de realtime manuel pour submissions/parcels
  // useEffect(()=>{
  //   const channel = supabase.channel('parcel_submissions_vendor')
  //     .on('postgres_changes', { event:'UPDATE', schema:'public', table:'parcel_submissions' }, (payload)=>{
  //       if (payload?.new?.owner_id === user?.id && payload.new.status === 'approved') {
  //         // Reload parcels so approved one replaces placeholder
  //         loadSellerDashboardData();
  //       }
  //     })
  //     .subscribe();
  //   return ()=> { supabase.removeChannel(channel); };
  // }, [user]);

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

  const loadMarketData = async () => {
    try {
      // Charger analytics et insights non couverts par realtime
      const [inquiriesData, analyticsData] = await Promise.all([
        SupabaseDataService.listParcelInquiries(user?.id || null),
        // Autres données d'analytics...
      ]);
      
      setInquiriesByListing(inquiriesData || []);
      
      // Calculer analytics en temps réel depuis les données realtime
      const currentStats = {
        totalListings: activeListings.length,
        activeViews: analyticsData?.viewsThisMonth || 0,
        totalRevenue,
        averagePrice: activeListings.length ? totalRevenue / activeListings.length : 0,
        securityScore: stats.securityScore // Garder score sécurité existant
      };
      
      setStats(currentStats);
      
    } catch (error) {
      console.error('Erreur chargement market data:', error);
    }
  };

  // Recalculer les stats quand les données realtime changent
  useEffect(() => {
    if (!loading && user?.id) {
      const currentStats = {
        totalListings: activeListings.length,
        activeViews: analytics.viewsThisMonth,
        totalRevenue,
        averagePrice: activeListings.length ? totalRevenue / activeListings.length : 0,
        securityScore: stats.securityScore
      };
      setStats(currentStats);
    }
  }, [listings, submissions, loading]);

  const loadUserProfile = async () => {
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

  const openCreate = () => { setEditingListing(null); setForm({ reference:'', location:'', type:'terrain', price:'', surface:'', status:'available' }); setShowSubmissionModal(true); };
  const openEdit = (listing) => { setEditingListing(listing); setForm({ reference:listing.reference||'', location:listing.location||'', type:listing.type||'terrain', price:listing.price||'', surface: listing.surface || listing.area_sqm ||'', status: listing.status||'available' }); setShowModal(true); };
  const saveListing = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSaving(true);
      const payload = {
        reference: form.reference.trim(),
        location: form.location.trim(),
        type: form.type,
        price: form.price? Number(form.price):0,
        surface: form.surface? Number(form.surface): null,
        status: form.status,
        owner_id: user.id,
        owner_type: 'vendeur'
      };
      if (editingListing) {
        const updated = await SupabaseDataService.updateProperty(editingListing.id, payload);
        setListings(ls => ls.map(l=> l.id===updated.id? {...l, ...updated}: l));
        toast({ title:'Annonce mise à jour', description: updated.reference });
      } else {
        const created = await SupabaseDataService.createProperty(payload);
        setListings(ls => [created, ...ls]);
        toast({ title:'Annonce créée', description: created.reference });
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      toast({ variant:'destructive', title:'Erreur', description:'Impossible d\'enregistrer l\'annonce' });
    } finally {
      setSaving(false);
    }
  };
  const withdrawListing = async (listing) => {
    try {
      const updated = await SupabaseDataService.updateProperty(listing.id, { status:'withdrawn' });
      setListings(ls=> ls.map(l=> l.id===listing.id? {...l, ...updated}: l));
      toast({ title:'Annonce retirée' });
    } catch(e){ toast({ variant:'destructive', title:'Erreur', description:'Retrait impossible'}); }
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
            <Button className="bg-green-600 hover:bg-green-700" onClick={openCreate}>
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
                <Button className="mt-4" onClick={openCreate}>
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
                          {listing.status === 'pending_validation' ? (
                            <Badge className="bg-yellow-100 text-yellow-800">En validation</Badge>
                          ) : (
                            <Badge variant={listing.status === 'available' ? 'default' : 'secondary'}>
                              {listing.status === 'available' ? 'Disponible' : listing.status}
                            </Badge>
                          )}
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
                        <Button size="sm" variant="outline" onClick={()=>openEdit(listing)}>
                          Éditer
                        </Button>
                        <Button size="sm" variant="outline" onClick={()=>withdrawListing(listing)} disabled={listing.status==='withdrawn'}>
                          {listing.status==='withdrawn'? 'Retirée':'Retirer'}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

  {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={()=>!saving && setShowModal(false)}>✕</button>
              <h2 className="text-xl font-semibold mb-4">{editingListing? 'Modifier l\'annonce':'Nouvelle annonce'}</h2>
              <form onSubmit={saveListing} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium">Référence</label>
                    <input className="w-full border rounded px-2 py-2 text-sm" value={form.reference} onChange={e=>setForm(f=>({...f, reference:e.target.value}))} required />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Localisation</label>
                    <input className="w-full border rounded px-2 py-2 text-sm" value={form.location} onChange={e=>setForm(f=>({...f, location:e.target.value}))} required />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Type</label>
                    <select className="w-full border rounded px-2 py-2 text-sm" value={form.type} onChange={e=>setForm(f=>({...f, type:e.target.value}))}>
                      <option value="terrain">Terrain</option>
                      <option value="maison">Maison</option>
                      <option value="appartement">Appartement</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium">Prix (XOF)</label>
                    <input type="number" min="0" className="w-full border rounded px-2 py-2 text-sm" value={form.price} onChange={e=>setForm(f=>({...f, price:e.target.value}))} required />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Surface (m²)</label>
                    <input type="number" min="0" className="w-full border rounded px-2 py-2 text-sm" value={form.surface} onChange={e=>setForm(f=>({...f, surface:e.target.value}))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Statut</label>
                    <select className="w-full border rounded px-2 py-2 text-sm" value={form.status} onChange={e=>setForm(f=>({...f, status:e.target.value}))}>
                      <option value="available">Disponible</option>
                      <option value="reserved">Réservée</option>
                      <option value="sold">Vendue</option>
                      <option value="withdrawn">Retirée</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" disabled={saving} onClick={()=>setShowModal(false)}>Annuler</Button>
                  <Button type="submit" disabled={saving}>{saving? 'Enregistrement...':'Enregistrer'}</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ParcelSubmissionModal
          isOpen={showSubmissionModal}
          onClose={()=> setShowSubmissionModal(false)}
          owner={user}
          onSubmitted={(submission)=>{
            // Optimistic placeholder listing marker while pending validation
            setListings(ls => [{ id: submission.reference, reference: submission.reference, location: submission.location, type: submission.type, price: submission.price, surface: submission.surface, status: 'pending_validation', parcel_submission_id: submission.id }, ...ls]);
          }}
        />

        {/* Demandes reçues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5 text-indigo-500" />
              Demandes Reçues
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
              </div>
            ) : inquiriesByListing.length === 0 ? (
              <p className="text-sm text-gray-500">Aucune demande reçue pour le moment.</p>
            ) : (
              <div className="space-y-4">
                {inquiriesByListing.map(block => (
                  <div key={block.listingId} className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{block.reference}</h4>
                      <Badge variant="outline">{block.inquiries.length} demande{block.inquiries.length>1?'s':''}</Badge>
                    </div>
                    <ul className="space-y-2">
                      {block.inquiries.slice(0,5).map(inq => (
                        <li key={inq.id} className="text-xs flex items-center justify-between bg-muted/40 rounded px-2 py-1">
                          <span className="flex items-center gap-2">
                            <Badge variant="secondary" className="capitalize">{inq.type}</Badge>
                            {new Date(inq.created_at).toLocaleDateString('fr-FR', { day:'2-digit', month:'short'})}
                          </span>
                          <Button size="xs" variant="ghost" className="h-6 text-xs" onClick={()=> setSelectedInquiry({ listingReference:block.reference, ...inq })}>Voir</Button>
                        </li>
                      ))}
                      {block.inquiries.length>5 && (
                        <li className="text-[11px] text-muted-foreground italic">+ {block.inquiries.length-5} autres...</li>
                      )}
                    </ul>
                  </div>
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

        {selectedInquiry && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-5 relative">
              <button
                aria-label="Fermer"
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={() => setSelectedInquiry(null)}
              >
                ✕
              </button>
              <h3 className="text-lg font-semibold mb-2">Détail Demande</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Annonce</span>
                  <span className="font-medium">{selectedInquiry.listingReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <Badge variant="outline" className="capitalize">{selectedInquiry.type}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span>{new Date(selectedInquiry.created_at).toLocaleString('fr-FR')}</span>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedInquiry(null)}>Fermer</Button>
                <Button
                  size="sm"
                  onClick={() => {
                    // future: open secure messaging
                    setSelectedInquiry(null);
                    toast({ title: 'Action', description: 'Messagerie à implémenter' });
                  }}
                >
                  Répondre
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendeurDashboard;
