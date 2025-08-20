import React, { useState, useEffect, useMemo } from 'react';
import { useRealtimeTable, useRealtimeParcels } from '@/hooks/useRealtimeTable';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SupabaseDataService } from '@/services/supabaseDataService';
import ParcelCard from '@/components/parcels/ParcelCard';
import ParcelFilters from '@/components/parcels/ParcelFilters';
import ParcelListSkeleton from '@/components/parcels/ParcelListSkeleton';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ListFilter, Map, Search, Save, Landmark } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import ParcelsHeroSearch from '@/components/parcels/ParcelsHeroSearch';
import { Helmet } from 'react-helmet-async';

const ParcelsListPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: parcels, loading: parcelsLoading, error: parcelsError, refetch } = useRealtimeParcels();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (parcels) {
      setFilteredData(parcels);
    }
  }, [parcels]);
  
  useEffect(() => {
    const loadParcels = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const realParcels = await SupabaseDataService.getParcels();
        setParcels(realParcels || [error]);
      } catch (err) {
        setError("Impossible de charger les parcelles pour le moment.");
      } finally {
        setLoading(false);
      }
    };

    loadParcels();
  }, []);

  useEffect(() => {
    let tempParcels = [...parcels];

    if (activeFilters.search) {
      tempParcels = tempParcels.filter(p =>
        p.name.toLowerCase().includes(activeFilters.search.toLowerCase()) ||
        p.reference.toLowerCase().includes(activeFilters.search.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(activeFilters.search.toLowerCase()))
      );
    }
    ['zone', 'status', 'legalStatus', 'zoneType', 'ownerType'].forEach(key => {
        if (activeFilters[key] && activeFilters[key] !== 'all') {
            tempParcels = tempParcels.filter(p => {
              if (key === 'legalStatus') return p.documents.some(d => d.name.includes(activeFilters[key]));
              return p[key] === activeFilters[key];
            });
        }
    });
    if (activeFilters.serviced) {
        tempParcels = tempParcels.filter(p => p.description.toLowerCase().includes('viabilisé'));
    }
    if (activeFilters.verified) {
        tempParcels = tempParcels.filter(p => p.verified);
    }
    if (activeFilters.minPrice) {
      tempParcels = tempParcels.filter(p => p.price >= parseFloat(activeFilters.minPrice));
    }
    if (activeFilters.maxPrice) {
      tempParcels = tempParcels.filter(p => p.price <= parseFloat(activeFilters.maxPrice));
    }
    if (activeFilters.minArea) {
      tempParcels = tempParcels.filter(p => p.area_sqm >= parseInt(activeFilters.minArea, 10));
    }
    if (activeFilters.maxArea) {
      tempParcels = tempParcels.filter(p => p.area_sqm <= parseInt(activeFilters.maxArea, 10));
    }
    
    switch (activeFilters.sortBy) {
      case 'price_asc': tempParcels.sort((a, b) => a.price - b.price); break;
      case 'price_desc': tempParcels.sort((a, b) => b.price - a.price); break;
      case 'area_asc': tempParcels.sort((a, b) => a.area_sqm - b.area_sqm); break;
      case 'area_desc': tempParcels.sort((a, b) => b.area_sqm - a.area_sqm); break;
      case 'date_desc': 
      default: 
        tempParcels.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); 
        break;
    }

    setFilteredParcels(tempParcels);

    const queryParams = new URLSearchParams();
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== false && value !== '') {
        queryParams.set(key, value);
      }
    });
    navigate(`${location.pathname}?${queryParams.toString()}`, { replace: true });

  }, [activeFilters, parcels, navigate, location.pathname]);

  const handleFilterChange = (newFilters) => {
    setActiveFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      search: '', zone: 'all', status: 'all', minPrice: '', maxPrice: '',
      minArea: '', maxArea: '', sortBy: 'date_desc', legalStatus: 'all',
      serviced: false, verified: false, zoneType: 'all', ownerType: 'all',
    };
    setActiveFilters(defaultFilters);
  };

  const handleSaveSearch = () => {
    toast({
      title: "Sauvegarder la Recherche",
      description: "🚧 Cette fonctionnalité est en cours de développement. Bientôt, vous pourrez sauvegarder vos critères et recevoir des alertes !",
      duration: 5000,
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  return (
    <>
    <Helmet>
        <title>Terrains à Vendre au Sénégal - Teranga Foncier</title>
        <meta name="description" content="Parcourez notre catalogue de terrains et parcelles vérifiés à vendre à Dakar, Saly, Thiès et partout au Sénégal. Filtrez par prix, surface et statut juridique." />
        <meta name="keywords" content="terrains à vendre, parcelles Sénégal, immobilier Dakar, acheter terrain Saly, foncier Thiès" />
        <link rel="canonical" href="https://www.terangafoncier.com/parcelles" />
    </Helmet>
    <div className="bg-muted/20">
      <ParcelsHeroSearch onSearch={handleFilterChange} initialFilters={activeFilters} />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <div className={`w-full md:w-1/3 lg:w-1/4 ${showFiltersAside ? 'block' : 'hidden md:block'}`}>
            <div className="sticky top-24">
              <ParcelFilters
                filters={activeFilters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                parcelCount={filteredParcels.length}
              />
              <Card className="mt-4 p-4 text-center bg-secondary/30">
                  <CardTitle className="text-base mb-2 flex items-center justify-center"><Landmark className="h-5 w-5 mr-2"/>Besoin d'un terrain communal ?</CardTitle>
                  <CardDescription className="text-xs mb-3">Faites une demande directe auprès des mairies partenaires pour des parcelles spécifiques.</CardDescription>
                  <Button asChild size="sm" className="w-full">
                      <Link to="/request-municipal-land">Faire une Demande</Link>
                  </Button>
              </Card>
            </div>
          </div>

          <div className="w-full md:w-2/3 lg:w-3/4">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <p className="text-sm text-muted-foreground">
                {loading ? 'Chargement...' : `${filteredParcels.length} parcelle(s) trouvée(s).`}
              </p>
              <div className="flex gap-2 flex-wrap justify-center">
                <Button variant="outline" onClick={() => setShowFiltersAside(!showFiltersAside)} className="md:hidden">
                  <ListFilter className="mr-2 h-4 w-4" /> {showFiltersAside ? 'Cacher' : 'Afficher'} les Filtres
                </Button>
                <Button variant="outline" onClick={handleSaveSearch}>
                  <Save className="mr-2 h-4 w-4" /> Sauvegarder
                </Button>
                <Button variant="default" asChild>
                  <Link to="/map"><Map className="mr-2 h-4 w-4" /> Carte</Link>
                </Button>
              </div>
            </div>

            {loading ? (
              <ParcelListSkeleton />
            ) : error ? (
              <div className="text-center py-10 text-red-600 bg-red-50 p-6 rounded-lg border border-red-200">
                <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-red-500"/>
                <p className="text-lg font-medium">{error}</p>
                <p className="text-sm">Veuillez réessayer plus tard.</p>
              </div>
            ) : filteredParcels.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {filteredParcels.map(parcel => (
                  <ParcelCard key={parcel.id} parcel={parcel} />
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-16 bg-card rounded-lg border border-dashed border-border/70 shadow-sm">
                <Search className="h-16 w-16 mx-auto text-muted-foreground/70 mb-5" />
                <h2 className="text-2xl font-semibold mb-2 text-foreground">Aucune parcelle ne correspond à vos critères.</h2>
                <p className="text-muted-foreground mb-6">Essayez d'ajuster vos filtres ou de réinitialiser la recherche.</p>
                <Button onClick={handleResetFilters} variant="outline">Réinitialiser les Filtres</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ParcelsListPage;
