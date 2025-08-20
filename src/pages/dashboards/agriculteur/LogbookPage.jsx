import React, { useState, useEffect } from 'react';
import { useRealtimeTable, useRealtimeUsers, useRealtimeParcels, useRealtimeParcelSubmissions } from '@/hooks/useRealtimeTable';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, PlusCircle, Calendar, RefreshCw, Filter, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { SupabaseDataService } from '@/services/supabaseDataService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const LogbookPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: entries, loading: entriesLoading, error: entriesError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (entries) {
      setFilteredData(entries);
    }
  }, [entries]);
  
  useEffect(() => {
    if (user) {
      loadLogbookEntries();
    }
  }, [user]);

  const loadLogbookEntries = async () => {
    try {
      setRefreshing(true);
      if (!user?.id) {
        setEntries([]);
        return;
      }

      // Récupérer les entrées du journal agricole depuis la table agricultural_logs
      const { data: logEntries, error } = await SupabaseDataService.supabaseClient
        .from('agricultural_logs')
        .select(`
          *,
          parcels:parcel_id(*)
        `)
        .eq('farmer_id', user.id)
        .order('activity_date', { ascending: false });

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur chargement journal:', error);
      }

      setEntries(logEntries || []);

    } catch (error) {
      console.error('Erreur chargement journal:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger le journal d'exploitation"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'planting': return '??';
      case 'irrigation': return '??';
      case 'fertilizing': return '??';
      case 'harvesting': return '??';
      case 'treatment': return '??';
      case 'maintenance': return '??';
      default: return '??';
    }
  };

  const getActivityLabel = (type) => {
    switch (type) {
      case 'planting': return 'Plantation';
      case 'irrigation': return 'Irrigation';
      case 'fertilizing': return 'Fertilisation';
      case 'harvesting': return 'Récolte';
      case 'treatment': return 'Traitement';
      case 'maintenance': return 'Maintenance';
      default: return 'Autre';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'planned': return 'info';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'in_progress': return 'En cours';
      case 'planned': return 'Planifié';
      default: return status;
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = 
      entry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.activity_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.parcels?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActivity = activityFilter === 'all' || entry.activity_type === activityFilter;
    const matchesParcel = parcelFilter === 'all' || entry.parcel_id === parcelFilter;
    return matchesSearch && matchesActivity && matchesParcel;
  });

  const uniqueParcels = Array.from(new Set(entries.map(e => e.parcel_id).filter(Boolean)));

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
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center">
            <BookOpen className="mr-3 h-8 w-8 text-primary"/>
            Journal d'Exploitation
          </h1>
          <p className="text-sm text-muted-foreground max-w-prose mt-1">
            Suivez toutes vos activités agricoles et gardez un historique détaillé
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadLogbookEntries} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Rafraîchir
          </Button>
          <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouvelle entrée
          </Button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtres et recherche</CardTitle>
          <CardDescription>Trouvez rapidement vos activités agricoles</CardDescription>
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
            <Select value={activityFilter} onValueChange={setActivityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type d'activité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les activités</SelectItem>
                <SelectItem value="planting">Plantation</SelectItem>
                <SelectItem value="irrigation">Irrigation</SelectItem>
                <SelectItem value="fertilizing">Fertilisation</SelectItem>
                <SelectItem value="harvesting">Récolte</SelectItem>
                <SelectItem value="treatment">Traitement</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={parcelFilter} onValueChange={setParcelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Parcelle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les parcelles</SelectItem>
                {uniqueParcels.map(parcelId => {
                  const entry = entries.find(e => e.parcel_id === parcelId);
                  return (
                    <SelectItem key={parcelId} value={parcelId}>
                      {entry?.parcels?.title || `Parcelle ${parcelId}`}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Button variant="outline" disabled>
              <Filter className="mr-2 h-4 w-4" />
              Plus de filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des entrées */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des activités</CardTitle>
          <CardDescription>
            {filteredEntries.length} entrée(s) dans votre journal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {entries.length === 0 ? 'Aucune entrée dans le journal' : 'Aucun résultat'}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {entries.length === 0 
                  ? 'Commencez à enregistrer vos activités agricoles'
                  : 'Essayez de modifier vos critères de recherche'
                }
              </p>
              <Button className="mt-4" size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Ajouter une entrée
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getActivityIcon(entry.activity_type)}</span>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {getActivityLabel(entry.activity_type)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {entry.parcels?.title || `Parcelle ${entry.parcel_id}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(entry.status)}>
                        {getStatusLabel(entry.status)}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(entry.activity_date).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>

                  {entry.description && (
                    <p className="text-sm text-gray-700 mb-3">
                      {entry.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {entry.duration_hours && (
                      <div>
                        <span className="text-muted-foreground">Durée:</span>
                        <p className="font-medium">{entry.duration_hours}h</p>
                      </div>
                    )}
                    
                    {entry.cost && (
                      <div>
                        <span className="text-muted-foreground">Coût:</span>
                        <p className="font-medium text-red-600">
                          {entry.cost.toLocaleString()} FCFA
                        </p>
                      </div>
                    )}

                    {entry.weather_conditions && (
                      <div>
                        <span className="text-muted-foreground">Météo:</span>
                        <p className="font-medium">{entry.weather_conditions}</p>
                      </div>
                    )}

                    {entry.equipment_used && (
                      <div>
                        <span className="text-muted-foreground">Équipement:</span>
                        <p className="font-medium">{entry.equipment_used}</p>
                      </div>
                    )}
                  </div>

                  {entry.notes && (
                    <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                      <strong>Notes:</strong> {entry.notes}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LogbookPage;

