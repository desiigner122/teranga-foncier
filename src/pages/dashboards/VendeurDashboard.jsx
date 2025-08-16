import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  LayoutDashboard, 
  Upload, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  Users, 
  FileText, 
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VendeurDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalViews: 0,
    totalInquiries: 0,
    pendingOffers: 0,
    completedSales: 0,
    totalRevenue: 0,
    averagePrice: 0
  });
  const [recentListings, setRecentListings] = useState([]);
  const [recentInquiries, setRecentInquiries] = useState([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Récupérer les annonces du vendeur
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', user.id);

      if (listingsError) throw listingsError;

      // Récupérer les demandes/inquiries
      const { data: inquiries, error: inquiriesError } = await supabase
        .from('inquiries')
        .select('*, listings(*)')
        .eq('listings.seller_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (inquiriesError) throw inquiriesError;

      // Calculer les statistiques
      const activeListings = listings?.filter(l => l.status === 'active') || [];
      const soldListings = listings?.filter(l => l.status === 'sold') || [];
      const totalViews = listings?.reduce((sum, l) => sum + (l.views || 0), 0) || 0;
      const totalRevenue = soldListings.reduce((sum, l) => sum + (l.price || 0), 0);

      setStats({
        totalListings: listings?.length || 0,
        activeListings: activeListings.length,
        totalViews,
        totalInquiries: inquiries?.length || 0,
        pendingOffers: listings?.filter(l => l.offers_count > 0)?.length || 0,
        completedSales: soldListings.length,
        totalRevenue,
        averagePrice: listings?.length > 0 ? listings.reduce((sum, l) => sum + (l.price || 0), 0) / listings.length : 0
      });

      setRecentListings(listings?.slice(0, 5) || []);
      setRecentInquiries(inquiries || []);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Actif', variant: 'default', color: 'bg-green-100 text-green-800' },
      pending: { label: 'En attente', variant: 'secondary', color: 'bg-yellow-100 text-yellow-800' },
      sold: { label: 'Vendu', variant: 'secondary', color: 'bg-blue-100 text-blue-800' },
      suspended: { label: 'Suspendu', variant: 'destructive', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8" />
            Dashboard Vendeur
          </h1>
          <p className="text-gray-600 mt-1">
            Bienvenue, {user?.first_name} ! Voici un aperçu de vos activités de vente.
          </p>
        </div>
        <Button 
          onClick={() => navigate('/dashboard/sell-property')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouvelle annonce
        </Button>
      </div>

      {/* Vérification d'identité */}
      {user?.identity_verification_status !== 'verified' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Vérification d'identité requise</strong>
                <p className="text-sm mt-1">
                  Pour publier des annonces, vous devez d'abord vérifier votre identité.
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={() => navigate('/identity-verification')}
              >
                Vérifier maintenant
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annonces totales</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalListings)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeListings} actives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vues totales</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalViews)}</div>
            <p className="text-xs text-muted-foreground">
              Sur toutes vos annonces
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demandes reçues</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalInquiries)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingOffers} offres en attente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedSales} ventes réalisées
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mes annonces récentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Mes annonces récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentListings.length > 0 ? (
              <div className="space-y-4">
                {recentListings.map((listing) => (
                  <div key={listing.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{listing.title}</h4>
                      <p className="text-xs text-gray-500">{listing.location}</p>
                      <p className="text-sm font-semibold text-blue-600">
                        {formatCurrency(listing.price)}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      {getStatusBadge(listing.status)}
                      <p className="text-xs text-gray-500">
                        {listing.views || 0} vues
                      </p>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate('/dashboard/my-listings')}
                >
                  Voir toutes mes annonces
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-3">Aucune annonce créée</p>
                <Button onClick={() => navigate('/dashboard/sell-property')}>
                  Créer ma première annonce
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demandes récentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Demandes récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentInquiries.length > 0 ? (
              <div className="space-y-4">
                {recentInquiries.map((inquiry) => (
                  <div key={inquiry.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{inquiry.contact_name}</h4>
                      <p className="text-xs text-gray-500">{inquiry.listings?.title}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(inquiry.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {inquiry.status === 'new' ? 'Nouveau' : 'Lu'}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/dashboard/my-requests')}
                >
                  Voir toutes les demandes
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Aucune demande reçue</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('/dashboard/sell-property')}
            >
              <Plus className="h-6 w-6 mb-2" />
              Nouvelle annonce
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('/dashboard/my-listings')}
            >
              <FileText className="h-6 w-6 mb-2" />
              Gérer mes annonces
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('/dashboard/my-requests')}
            >
              <MessageSquare className="h-6 w-6 mb-2" />
              Mes demandes
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('/dashboard/transactions')}
            >
              <DollarSign className="h-6 w-6 mb-2" />
              Mes ventes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendeurDashboard;
