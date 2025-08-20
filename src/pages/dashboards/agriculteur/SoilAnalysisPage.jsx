import React, { useState, useEffect } from 'react';
const SoilAnalysisPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: analyses, loading: analysesLoading, error: analysesError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (analyses) {
      setFilteredData(analyses);
    }
  }, [analyses]);
  
  useEffect(() => {
    if (user) {
      loadSoilAnalyses();
    }
  }, [user]);

  const loadSoilAnalyses = async () => {
    try {
      setRefreshing(true);
      if (!user?.id) {
        setAnalyses([]);
        return;
      }

      // Récupérer les analyses de sol depuis la table soil_analyses
      const { data: analysisData, error } = await SupabaseDataService.supabaseClient
        .from('soil_analyses')
        .select(`
          *,
          parcels:parcel_id(*)
        `)
        .eq('farmer_id', user.id)
        .order('analysis_date', { ascending: false });

      if (error && error.code !== 'PGRST116') {      }

      setAnalyses(analysisData || []);

    } catch (error) {      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les analyses de sol"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getpHStatus = (pH) => {
    if (!pH) return { status: 'unknown', label: 'Inconnu', color: 'secondary' };
    if (pH < 6.0) return { status: 'acidic', label: 'Acide', color: 'destructive' };
    if (pH > 8.0) return { status: 'alkaline', label: 'Alcalin', color: 'warning' };
    return { status: 'optimal', label: 'Optimal', color: 'success' };
  };

  const getNutrientLevel = (value, optimal_min, optimal_max) => {
    if (!value || !optimal_min || !optimal_max) return { status: 'unknown', label: 'Inconnu', color: 'secondary' };
    if (value < optimal_min) return { status: 'low', label: 'Faible', color: 'destructive' };
    if (value > optimal_max) return { status: 'high', label: 'élevé', color: 'warning' };
    return { status: 'optimal', label: 'Optimal', color: 'success' };
  };

  const getOverallHealthScore = (analysis) => {
    let score = 0;
    let factors = 0;

    // pH
    const pHStatus = getpHStatus(analysis.ph);
    if (pHStatus.status === 'optimal') score += 25;
    else if (pHStatus.status !== 'unknown') score += 10;
    factors++;

    // Nutriments principaux
    ['nitrogen', 'phosphorus', 'potassium'].forEach(nutrient => {
      const level = getNutrientLevel(
        analysis[nutrient], 
        analysis[`${nutrient}_optimal_min`], 
        analysis[`${nutrient}_optimal_max`]
      );
      if (level.status === 'optimal') score += 15;
      else if (level.status !== 'unknown') score += 5;
      factors++;
    });

    // Matiére organique
    if (analysis.organic_matter) {
      if (analysis.organic_matter >= 3) score += 20;
      else if (analysis.organic_matter >= 2) score += 15;
      else score += 5;
      factors++;
    }

    return factors > 0 ? Math.round(score / factors * 4) : 0; // Score sur 100
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'destructive';
  };

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = 
      analysis.parcels?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.parcels?.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesParcel = parcelFilter === 'all' || analysis.parcel_id === parcelFilter;
    return matchesSearch && matchesParcel;
  });

  const uniqueParcels = Array.from(new Set(analyses.map(a => a.parcel_id).filter(Boolean)));

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
            <Beaker className="mr-3 h-8 w-8 text-primary"/>
            Analyse des Sols
          </h1>
          <p className="text-sm text-muted-foreground max-w-prose mt-1">
            Surveillez la qualité de vos sols et obtenez des recommandations personnalisées
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadSoilAnalyses} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Rafraéchir
          </Button>
          <Button size="sm">
            <Beaker className="mr-2 h-4 w-4" />
            Nouvelle analyse
          </Button>
        </div>
      </div>

      {/* Vue d'ensemble */}
      {analyses.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Analyses totales</p>
                  <p className="text-2xl font-bold">{analyses.length}</p>
                </div>
                <Beaker className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sols sains</p>
                  <p className="text-2xl font-bold text-green-600">
                    {analyses.filter(a => getOverallHealthScore(a) >= 80).length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600" />
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
                    {analyses.filter(a => {
                      const score = getOverallHealthScore(a);
                      return score >= 60 && score < 80;
                    }).length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sols dégradés</p>
                  <p className="text-2xl font-bold text-red-600">
                    {analyses.filter(a => getOverallHealthScore(a) < 60).length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
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
          <CardDescription>Trouvez rapidement vos analyses de sol</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={parcelFilter} onValueChange={setParcelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Parcelle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les parcelles</SelectItem>
                {uniqueParcels.map(parcelId => {
                  const analysis = analyses.find(a => a.parcel_id === parcelId);
                  return (
                    <SelectItem key={parcelId} value={parcelId}>
                      {analysis?.parcels?.title || `Parcelle ${parcelId}`}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Button variant="outline" disabled>
              Exporter rapport
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des analyses */}
      <Card>
        <CardHeader>
          <CardTitle>Analyses de sol</CardTitle>
          <CardDescription>
            {filteredAnalyses.length} analyse(s) disponible(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAnalyses.length === 0 ? (
            <div className="text-center py-8">
              <Beaker className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {analyses.length === 0 ? 'Aucune analyse de sol' : 'Aucun résultat'}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {analyses.length === 0 
                  ? 'Commencez par faire analyser vos sols'
                  : 'Essayez de modifier vos critéres de recherche'
                }
              </p>
              <Button className="mt-4" size="sm">
                <Beaker className="mr-2 h-4 w-4" />
                Nouvelle analyse
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAnalyses.map((analysis) => {
                const healthScore = getOverallHealthScore(analysis);
                const pHStatus = getpHStatus(analysis.ph);
                
                return (
                  <motion.div
                    key={analysis.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <Beaker className="h-8 w-8 text-blue-500" />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {analysis.parcels?.title || `Parcelle ${analysis.parcel_id}`}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {analysis.parcels?.location || 'Localisation non spécifiée'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getHealthScoreColor(healthScore)}>
                          Score: {healthScore}/100
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(analysis.analysis_date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      {/* pH */}
                      <div className="text-center p-3 border rounded-lg">
                        <p className="text-sm text-muted-foreground">pH</p>
                        <p className="text-2xl font-bold">{analysis.ph || 'é'}</p>
                        <Badge variant={pHStatus.color} className="text-xs">
                          {pHStatus.label}
                        </Badge>
                      </div>

                      {/* Azote */}
                      <div className="text-center p-3 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Azote (N)</p>
                        <p className="text-lg font-bold">{analysis.nitrogen || 'é'}</p>
                        <Badge variant={getNutrientLevel(
                          analysis.nitrogen, 
                          analysis.nitrogen_optimal_min, 
                          analysis.nitrogen_optimal_max
                        ).color} className="text-xs">
                          {getNutrientLevel(
                            analysis.nitrogen, 
                            analysis.nitrogen_optimal_min, 
                            analysis.nitrogen_optimal_max
                          ).label}
                        </Badge>
                      </div>

                      {/* Phosphore */}
                      <div className="text-center p-3 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Phosphore (P)</p>
                        <p className="text-lg font-bold">{analysis.phosphorus || 'é'}</p>
                        <Badge variant={getNutrientLevel(
                          analysis.phosphorus, 
                          analysis.phosphorus_optimal_min, 
                          analysis.phosphorus_optimal_max
                        ).color} className="text-xs">
                          {getNutrientLevel(
                            analysis.phosphorus, 
                            analysis.phosphorus_optimal_min, 
                            analysis.phosphorus_optimal_max
                          ).label}
                        </Badge>
                      </div>

                      {/* Potassium */}
                      <div className="text-center p-3 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Potassium (K)</p>
                        <p className="text-lg font-bold">{analysis.potassium || 'é'}</p>
                        <Badge variant={getNutrientLevel(
                          analysis.potassium, 
                          analysis.potassium_optimal_min, 
                          analysis.potassium_optimal_max
                        ).color} className="text-xs">
                          {getNutrientLevel(
                            analysis.potassium, 
                            analysis.potassium_optimal_min, 
                            analysis.potassium_optimal_max
                          ).label}
                        </Badge>
                      </div>

                      {/* Matiére organique */}
                      <div className="text-center p-3 border rounded-lg">
                        <p className="text-sm text-muted-foreground">M.O. (%)</p>
                        <p className="text-lg font-bold">{analysis.organic_matter || 'é'}</p>
                        <Badge variant={
                          analysis.organic_matter >= 3 ? 'success' : 
                          analysis.organic_matter >= 2 ? 'warning' : 'destructive'
                        } className="text-xs">
                          {analysis.organic_matter >= 3 ? 'Bon' : 
                           analysis.organic_matter >= 2 ? 'Moyen' : 'Faible'}
                        </Badge>
                      </div>
                    </div>

                    {analysis.recommendations && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                          Recommandations
                        </h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {analysis.recommendations}
                        </p>
                      </div>
                    )}

                    {analysis.notes && (
                      <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                        <strong>Notes:</strong> {analysis.notes}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SoilAnalysisPage;

