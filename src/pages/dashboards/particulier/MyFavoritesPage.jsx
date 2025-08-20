import React, { useState, useEffect } from 'react';
const MyFavoritesPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (favorites) {
      setFilteredData(favorites);
    }
  }, [favorites]);
  
  useEffect(() => {
    loadFavorites();
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userFavorites = await SupabaseDataService.getUserFavorites(user.id);
      setFavorites(userFavorites || []);
    } catch (error) {      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger vos favoris"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId, itemTitle) => {
    try {
      await SupabaseDataService.removeFavorite(user.id, favoriteId);
      setFavorites(prev => prev.filter(f => f.id !== favoriteId));
      toast({
        title: "Favori supprimé",
        description: `"${itemTitle}" a été retiré de vos favoris`
      });
    } catch (error) {      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer ce favori"
      });
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'terrain':
      case 'land':
        return <TreePine className="h-4 w-4 text-green-600" />;
      case 'maison':
      case 'house':
        return <Home className="h-4 w-4 text-blue-600" />;
      case 'appartement':
      case 'apartment':
        return <Building2 className="h-4 w-4 text-purple-600" />;
      default:
        return <MapPin className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      'terrain': { label: 'Terrain', variant: 'secondary' },
      'maison': { label: 'Maison', variant: 'default' },
      'appartement': { label: 'Appartement', variant: 'outline' },
      'land': { label: 'Terrain', variant: 'secondary' },
      'house': { label: 'Maison', variant: 'default' },
      'apartment': { label: 'Appartement', variant: 'outline' }
    };

    const config = typeConfig[type?.toLowerCase()] || { label: type || 'Bien', variant: 'default' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatPrice = (price) => {
    if (!price) return 'Prix non spécifié';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredFavorites = favorites.filter(favorite => {
    const matchesSearch = favorite.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         favorite.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         favorite.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || favorite.type?.toLowerCase() === typeFilter.toLowerCase();
    
    return matchesSearch && matchesType;
  });

  if (loading || dataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 p-4 md:p-6 lg:p-8"
    >
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Heart className="h-8 w-8 text-red-500" />
          Mes Favoris
        </h1>
        <p className="text-muted-foreground">
          Retrouvez tous les biens que vous avez mis en favoris
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Rechercher dans vos favoris..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={typeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter('all')}
              >
                Tous
              </Button>
              <Button
                variant={typeFilter === 'terrain' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter('terrain')}
              >
                <TreePine className="h-4 w-4 mr-1" />
                Terrains
              </Button>
              <Button
                variant={typeFilter === 'maison' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter('maison')}
              >
                <Home className="h-4 w-4 mr-1" />
                Maisons
              </Button>
              <Button
                variant={typeFilter === 'appartement' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter('appartement')}
              >
                <Building2 className="h-4 w-4 mr-1" />
                Appartements
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span className="font-semibold">{favorites.length} favoris au total</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-muted-foreground">
                  {filteredFavorites.length} favoris affichés
                </span>
              </div>
            </div>
            
            {favorites.length > 0 && (
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Partager ma liste
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Favorites Grid */}
      <div className="space-y-4">
        {filteredFavorites.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {favorites.length === 0 ? "Aucun favori" : "Aucun résultat"}
              </h3>
              <p className="text-muted-foreground">
                {favorites.length === 0 
                  ? "Vous n'avez pas encore ajouté de biens à vos favoris. Explorez les annonces et ajoutez vos coups de cœur !"
                  : "Aucun favori ne correspond à vos critères de recherche."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((favorite) => (
              <Card key={favorite.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* Image placeholder */}
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center relative">
                    {getTypeIcon(favorite.type)}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {getTypeBadge(favorite.type)}
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="secondary" className="text-xs">
                        Ajouté le {formatDate(favorite.created_at)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold line-clamp-1">{favorite.title}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFavorite(favorite.id, favorite.title)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {favorite.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {favorite.description}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      {favorite.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-1">{favorite.location}</span>
                        </div>
                      )}
                      
                      {favorite.price && (
                        <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatPrice(favorite.price)}</span>
                        </div>
                      )}
                      
                      {favorite.surface && (
                        <div className="text-sm text-muted-foreground">
                          Surface: {favorite.surface} m²
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        Voir détails
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MyFavoritesPage;

