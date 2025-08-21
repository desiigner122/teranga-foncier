import React, { useState, useEffect } from 'react';
import { DollarSign, Home, Eye, Search, Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select';
import { Checkbox } from '../../../components/ui/checkbox';
import { Textarea } from '../../../components/ui/textarea';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import SupabaseDataService from '../../../services/supabaseDataService';
import { motion } from 'framer-motion';
import { useToast } from '../../../components/ui/use-toast';
import { useAuth } from '../../../context/AuthContext';
import { useRealtimeTable } from '../../../hooks/useRealtimeTable';
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from "../../components/ui/table";

const MyPropertiesPage = () => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const propertyTypes = [
    { id: 'maison', name: 'Maison' },
    { id: 'appartement', name: 'Appartement' },
    { id: 'terrain', name: 'Terrain' },
    { id: 'commercial', name: 'Local Commercial' },
    { id: 'bureau', name: 'Bureau' }
  ];

  const statusOptions = [
    { id: 'disponible', name: 'Disponible' },
    { id: 'vendu', name: 'Vendu' },
    { id: 'reserve', name: 'Réservé' },
    { id: 'construction', name: 'En Construction' }
  ];

  const featuresOptions = [
    { id: 'parking', name: 'Parking' },
    { id: 'piscine', name: 'Piscine' },
    { id: 'jardin', name: 'Jardin' },
    { id: 'balcon', name: 'Balcon' },
    { id: 'ascenseur', name: 'Ascenseur' },
    { id: 'securite', name: 'Sécurité 24/7' }
  ];

const { toast } = useToast();
  const { user } = useAuth();
  const { data: properties, loading: propertiesLoading, error: propertiesError, refetch } = useRealtimeTable('properties');
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (properties) {
      setFilteredData(properties);
    }
  }, [properties]);
  
  useEffect(() => {
    refetch();
  }, [user, refetch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.type || !formData.price) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires"
      });
      return;
    }

    try {
      const propertyData = {
        ...formData,
        owner_id: user.id,
        price: parseFloat(formData.price),
        surface: parseFloat(formData.surface) || null,
        bedrooms: parseInt(formData.bedrooms) || null,
        bathrooms: parseInt(formData.bathrooms) || null
      };

      await SupabaseDataService.createProperty(propertyData);
      
      toast({
        title: "Bien ajouté",
        description: "Votre bien a été ajouté avec succés"
      });

      setFormData({
        title: '',
        description: '',
        type: '',
        price: '',
        surface: '',
        location: '',
        bedrooms: '',
        bathrooms: '',
        features: [],
        images: [],
        status: 'available'
      });
      setShowAddForm(false);
      loadProperties();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter le bien"
      });
    }
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const deleteProperty = async (propertyId, propertyTitle) => {
    try {
      await SupabaseDataService.deleteProperty(propertyId);
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      toast({
        title: "Bien supprimé",
        description: `"${propertyTitle}" a été supprimé`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer ce bien"
      });
    }
  };

  const getTypeIcon = (type) => {
    const typeConfig = propertyTypes.find(t => t.value === type);
    const Icon = typeConfig?.icon || Home;
    return <Icon className="h-5 w-5" />;
  };

  const getStatusBadge = (status) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    return (
      <Badge 
        className={`text-white ${statusConfig?.color || 'bg-gray-500'}`}
      >
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    const matchesType = typeFilter === 'all' || property.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Home className="h-8 w-8" />
            Mes Biens
          </h1>
          <p className="text-muted-foreground">
            Gérez votre portefeuille immobilier
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un bien
        </Button>
      </div>

      {/* Add Property Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Ajouter un nouveau bien</CardTitle>
            <CardDescription>
              Remplissez les informations de votre bien immobilier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Titre du bien *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Belle villa avec piscine"
                  />
                </div>

                <div>
                  <Label htmlFor="type">Type de bien *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le type" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="price">Prix (FCFA) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="Ex: 15000000"
                  />
                </div>

                <div>
                  <Label htmlFor="surface">Surface (mé)</Label>
                  <Input
                    id="surface"
                    type="number"
                    value={formData.surface}
                    onChange={(e) => setFormData(prev => ({ ...prev, surface: e.target.value }))}
                    placeholder="Ex: 120"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Localisation</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Ex: Dakar, Almadies"
                  />
                </div>

                <div>
                  <Label htmlFor="bedrooms">Nombre de chambres</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: e.target.value }))}
                    placeholder="Ex: 3"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez votre bien..."
                />
              </div>

              <div>
                <Label>équipements et caractéristiques</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {featuresOptions.map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox
                        id={feature}
                        checked={formData.features.includes(feature)}
                        onCheckedChange={() => handleFeatureToggle(feature)}
                      />
                      <Label htmlFor={feature} className="text-sm">
                        {feature}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  Ajouter le bien
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Rechercher un bien..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Home className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total biens</p>
                <p className="text-2xl font-bold">{properties.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Disponibles</p>
                <p className="text-2xl font-bold">
                  {properties.filter(p => p.status === 'available').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">En négociation</p>
                <p className="text-2xl font-bold">
                  {properties.filter(p => p.status === 'under_negotiation').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Home className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-muted-foreground">Vendus</p>
                <p className="text-2xl font-bold">
                  {properties.filter(p => p.status === 'sold').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Properties List */}
      <div className="space-y-4">
        {filteredProperties.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun bien trouvé</h3>
              <p className="text-muted-foreground">
                {properties.length === 0 
                  ? "Vous n'avez pas encore ajouté de biens. Commencez par ajouter votre premier bien."
                  : "Aucun bien ne correspond é vos critéres de recherche."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* Image placeholder */}
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center relative">
                    {getTypeIcon(property.type)}
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(property.status)}
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="secondary" className="text-xs">
                        {property.type}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-1">{property.title}</h3>
                    
                    {property.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {property.description}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatPrice(property.price)}</span>
                      </div>
                      
                      {property.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-1">{property.location}</span>
                        </div>
                      )}
                      
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {property.surface && (
                          <span>{property.surface} mé</span>
                        )}
                        {property.bedrooms && (
                          <span>{property.bedrooms} ch.</span>
                        )}
                        {property.bathrooms && (
                          <span>{property.bathrooms} sdb</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-1 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteProperty(property.id, property.title)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
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

export default MyPropertiesPage;


