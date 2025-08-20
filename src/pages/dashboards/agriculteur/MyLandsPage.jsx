import React, { useState, useEffect } from 'react';
const MyLandsPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: lands, loading: landsLoading, error: landsError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (lands) {
      setFilteredData(lands);
    }
  }, [lands]);
  
  useEffect(() => {
    if (user) {
      loadMyLands();
    }
  }, [user]);

  const loadMyLands = async () => {
    try {
      setRefreshing(true);
      if (!user?.id) {
        setLands([]);
        return;
      }

      // Récupérer les parcelles agricoles de l'utilisateur
      const { data: parcelsData, error } = await SupabaseDataService.supabaseClient
        .from('parcels')
        .select(`
          *,
          agricultural_data:agricultural_data(*)
        `)
        .eq('owner_id', user.id)
        .or('usage.eq.agricultural,usage.eq.farming')
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') {      }

      setLands(parcelsData || []);

    } catch (error) {      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger vos parcelles agricoles"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getCultureHealth = (agriculturalData) => {
    if (!agriculturalData || !agriculturalData[0]) return { status: 'unknown', label: 'Inconnu', color: 'secondary' };
    
    const data = agriculturalData[0];
    const health = data.crop_health_score || 0;
    
    if (health >= 80) return { status: 'excellent', label: 'Excellente', color: 'success' };
    if (health >= 60) return { status: 'good', label: 'Bonne', color: 'info' };
    if (health >= 40) return { status: 'average', label: 'Moyenne', color: 'warning' };
    return { status: 'poor', label: 'Préoccupante', color: 'destructive' };
  };

  const getCropType = (agriculturalData) => {
    if (!agriculturalData || !agriculturalData[0]) return 'Culture non spécifiée';
    return agriculturalData[0].crop_type || 'Culture non spécifiée';
  };

  const getYield = (agriculturalData) => {
    if (!agriculturalData || !agriculturalData[0]) return null;
    return agriculturalData[0].expected_yield;
  };

  const getLastActivity = (agriculturalData) => {
    if (!agriculturalData || !agriculturalData[0]) return null;
    return agriculturalData[0].last_activity_date;
  };

  const filteredLands = lands.filter(land => {
    const culture = getCropType(land.agricultural_data);
    const health = getCultureHealth(land.agricultural_data);
    
    const matchesSearch = 
      land.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      land.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      culture.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && land.status === 'available') ||
      (statusFilter === 'inactive' && land.status !== 'available');
    
    const matchesCulture = cultureFilter === 'all' || culture.toLowerCase().includes(cultureFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesCulture;
  });

  const uniqueCultures = Array.from(new Set(lands.map(land => getCropType(land.agricultural_data)).filter(c => c !== 'Culture non spécifiée')));

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 p-4 md:p-6"
    >
      {/* En-téte */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center">
            <LandPlot className="mr-3 h-8 w-8 text-primary"/>
            Mes Parcelles Agricoles
          </h1>
          <p className="text-sm text-muted-foreground max-w-prose mt-1">
            Gérez et surveillez toutes vos terres agricoles
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadMyLands} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Rafraéchir
          </Button>
          <Button size="sm" disabled title="Recherche de parcelles é venir">
            <PlusCircle className="mr-2 h-4 w-4" />
            Trouver une nouvelle parcelle
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      {lands.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total parcelles</p>
                  <p className="text-2xl font-bold">{lands.length}</p>
                </div>
                <LandPlot className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Surface totale</p>
                  <p className="text-2xl font-bold">
                    {lands.reduce((sum, land) => sum + (land.surface || 0), 0).toFixed(1)} Ha
                  </p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cultures saines</p>
                  <p className="text-2xl font-bold text-green-600">
                    {lands.filter(land => {
                      const health = getCultureHealth(land.agricultural_data);
                      return health.status === 'excellent' || health.status === 'good';
                    }).length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nécessitent attention</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {lands.filter(land => {
                      const health = getCultureHealth(land.agricultural_data);
                      return health.status === 'average' || health.status === 'poor';
                    }).length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres et recherche */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtres et recherche</CardTitle>
          <CardDescription>Trouvez rapidement vos parcelles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actives</SelectItem>
                <SelectItem value="inactive">Inactives</SelectItem>
              </SelectContent>
            </Select>
            <Select value={cultureFilter} onValueChange={setCultureFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type de culture" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les cultures</SelectItem>
                {uniqueCultures.map(culture => (
                  <SelectItem key={culture} value={culture}>{culture}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" disabled>
              <Filter className="mr-2 h-4 w-4" />
              Plus de filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des parcelles */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredLands.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <LandPlot className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {lands.length === 0 ? 'Aucune parcelle agricole' : 'Aucun résultat'}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {lands.length === 0 
                    ? 'Commencez par acquérir votre premiére parcelle'
                    : 'Essayez de modifier vos critéres de recherche'
                  }
                </p>
                {lands.length === 0 && (
                  <Button className="mt-4" size="sm" disabled>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Trouver une parcelle
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredLands.map(land => {
            const culture = getCropType(land.agricultural_data);
            const health = getCultureHealth(land.agricultural_data);
            const yieldExpected = getYield(land.agricultural_data);
            const lastActivity = getLastActivity(land.agricultural_data);

            return (
              <motion.div
                key={land.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{land.title || `Parcelle ${land.reference}`}</span>
                      <Badge variant={health.color}>{health.label}</Badge>
                    </CardTitle>
                    <CardDescription>
                      Culture principale: {culture}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Surface:</span>
                        <p className="font-medium">{land.surface || 0} Ha</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Statut:</span>
                        <p className="font-medium">
                          {land.status === 'available' ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      {yieldExpected && (
                        <div>
                          <span className="text-muted-foreground">Rendement attendu:</span>
                          <p className="font-medium">{yieldExpected} tonnes/Ha</p>
                        </div>
                      )}
                      {lastActivity && (
                        <div>
                          <span className="text-muted-foreground">Derniére activité:</span>
                          <p className="font-medium">
                            {new Date(lastActivity).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {land.location && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Localisation:</span>
                        <p className="font-medium">{land.location}</p>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <Link to={`/parcelles/${land.id}`}>
                          <Map className="mr-1 h-4 w-4" /> 
                          Carte
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <Link to="/dashboard/logbook">
                          <BookOpen className="mr-1 h-4 w-4" /> 
                          Journal
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

export default MyLandsPage;
