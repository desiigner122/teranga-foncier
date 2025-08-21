import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Calendar } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import SupabaseDataService from '../../../services/supabaseDataService';
import { motion } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useRealtimeTable } from "../../hooks/useRealtimeTable";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from "../../components/ui/table";

const EquipmentPage = () => {
  
  
  /* REMOVED DUPLICATE */ ('');
  /* REMOVED DUPLICATE */ ('');
  /* REMOVED DUPLICATE */ ('');
  /* REMOVED DUPLICATE */ (false);
const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
const { toast } = useToast();
  const { user } = useAuth();
  const { data: equipment, loading: equipmentLoading, error: equipmentError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (equipment) {
      setFilteredData(equipment);
    }
  }, [equipment]);
  
  useEffect(() => {
    if (user) {
      loadEquipment();
    }
  }, [user]);

  const loadEquipment = async () => {
    try {
      setRefreshing(true);
      if (!user?.id) {
        setEquipment([]);
        return;
      }

      // Récupérer l'équipement agricole depuis la table agricultural_equipment
      const { data: equipmentData, error } = await SupabaseDataService.supabaseClient
        .from('agricultural_equipment')
        .select('*')
        .eq('farmer_id', user.id)
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') {
      }

      setEquipment(equipmentData || []);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger l'inventaire d'équipement"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getEquipmentIcon = (type) => {
    switch (type) {
      case 'tractor': return '??';
      case 'plow': return '??';
      case 'seeder': return '??';
      case 'harvester': return '??';
      case 'irrigation': return '??';
      case 'sprayer': return '??';
      case 'tools': return '??';
      default: return '??';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'tractor': return 'Tracteur';
      case 'plow': return 'Charrue';
      case 'seeder': return 'Semoir';
      case 'harvester': return 'Moissonneuse';
      case 'irrigation': return 'Irrigation';
      case 'sprayer': return 'Pulvérisateur';
      case 'tools': return 'Outils';
      default: return 'Autre';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'success';
      case 'maintenance': return 'warning';
      case 'broken': return 'destructive';
      case 'retired': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'operational': return 'Opérationnel';
      case 'maintenance': return 'En maintenance';
      case 'broken': return 'Défaillant';
      case 'retired': return 'Retiré';
      default: return status;
    }
  };

  const getMaintenanceStatus = (lastMaintenance, maintenanceInterval) => {
    if (!lastMaintenance || !maintenanceInterval) return 'unknown';
    
    const lastDate = new Date(lastMaintenance);
    const now = new Date();
    const daysSinceMaintenance = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
    
    if (daysSinceMaintenance > maintenanceInterval) return 'overdue';
    if (daysSinceMaintenance > maintenanceInterval * 0.8) return 'due-soon';
    return 'ok';
  };

  const getMaintenanceIcon = (status) => {
    switch (status) {
      case 'overdue': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'due-soon': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'ok': return <Settings className="h-4 w-4 text-green-500" />;
      default: return <Settings className="h-4 w-4 text-gray-400" />;
    }
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesType = typeFilter === 'all' || item.equipment_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const uniqueTypes = Array.from(new Set(equipment.map(e => e.equipment_type).filter(Boolean)));

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
            <Wrench className="mr-3 h-8 w-8 text-primary"/>
            Matériel & équipement
          </h1>
          <p className="text-sm text-muted-foreground max-w-prose mt-1">
            Gérez votre inventaire et suivez la maintenance de vos équipements agricoles
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadEquipment} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Rafraéchir
          </Button>
          <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter équipement
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{equipment.length}</p>
              </div>
              <Wrench className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Opérationnels</p>
                <p className="text-2xl font-bold text-green-600">
                  {equipment.filter(e => e.status === 'operational').length}
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
                <p className="text-sm font-medium text-muted-foreground">En maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {equipment.filter(e => e.status === 'maintenance').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Défaillants</p>
                <p className="text-2xl font-bold text-red-600">
                  {equipment.filter(e => e.status === 'broken').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtres et recherche</CardTitle>
          <CardDescription>Trouvez rapidement vos équipements</CardDescription>
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
                <SelectItem value="operational">Opérationnel</SelectItem>
                <SelectItem value="maintenance">En maintenance</SelectItem>
                <SelectItem value="broken">Défaillant</SelectItem>
                <SelectItem value="retired">Retiré</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {uniqueTypes.map(type => (
                  <SelectItem key={type} value={type}>{getTypeLabel(type)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Exporter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des équipements */}
      <Card>
        <CardHeader>
          <CardTitle>Inventaire d'équipement</CardTitle>
          <CardDescription>
            {filteredEquipment.length} équipement(s) dans votre inventaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEquipment.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {equipment.length === 0 ? 'Aucun équipement enregistré' : 'Aucun résultat'}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {equipment.length === 0 
                  ? 'Commencez par ajouter votre premier équipement'
                  : 'Essayez de modifier vos critéres de recherche'
                }
              </p>
              <Button className="mt-4" size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Ajouter un équipement
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEquipment.map((item) => {
                const maintenanceStatus = getMaintenanceStatus(
                  item.last_maintenance, 
                  item.maintenance_interval_days
                );
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getEquipmentIcon(item.equipment_type)}</span>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {item.name || 'équipement sans nom'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {getTypeLabel(item.equipment_type)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <Badge variant={getStatusColor(item.status)}>
                          {getStatusLabel(item.status)}
                        </Badge>
                        {getMaintenanceIcon(maintenanceStatus)}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      {item.manufacturer && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fabricant:</span>
                          <span className="font-medium">{item.manufacturer}</span>
                        </div>
                      )}
                      
                      {item.model && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Modéle:</span>
                          <span className="font-medium">{item.model}</span>
                        </div>
                      )}

                      {item.year && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Année:</span>
                          <span className="font-medium">{item.year}</span>
                        </div>
                      )}

                      {item.purchase_price && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Prix d'achat:</span>
                          <span className="font-medium text-blue-600">
                            {item.purchase_price.toLocaleString()} FCFA
                          </span>
                        </div>
                      )}

                      {item.last_maintenance && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dernier entretien:</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className="font-medium">
                              {new Date(item.last_maintenance).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {item.notes && (
                      <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                        <strong>Notes:</strong> {item.notes}
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        Modifier
                      </Button>
                      <Button variant="outline" size="sm">
                        Maintenance
                      </Button>
                    </div>
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

export default EquipmentPage;


