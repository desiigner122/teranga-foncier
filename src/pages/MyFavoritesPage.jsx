import React, { useState, useEffect } from 'react';
import { useRealtimeTable, useRealtimeUsers, useRealtimeParcels, useRealtimeParcelSubmissions } from '@/hooks/useRealtimeTable';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { SupabaseDataService } from '@/services/supabaseDataService';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Maximize, HeartOff, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Gestion des favoris via Supabase
const getFavorites = async (userId) => {
  try {
    const favorites = await SupabaseDataService.getUserFavorites(userId);
    return favorites || [];
  } catch (error) {
    console.error('Erreur récupération favoris:', error);
    return [];
  }
};

const addToFavorites = async (userId, parcelId) => {
  try {
    await SupabaseDataService.addToFavorites(userId, parcelId);
    return true;
  } catch (error) {
    console.error('Erreur ajout favori:', error);
    return false;
  }
};

const removeFromFavorites = async (userId, parcelId) => {
  try {
    await SupabaseDataService.removeFromFavorites(userId, parcelId);
    return true;
  } catch (error) {
    console.error('Erreur suppression favori:', error);
    return false;
  }
};

const formatPrice = (price) => {
  if (price === null || price === undefined) return 'N/A';
  return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(price);
};

const getStatusVariant = (status) => {
  switch (status) {
    case 'Disponible': return 'success';
    case 'Réservée': return 'warning';
    case 'Vendue': return 'destructive';
    default: return 'secondary';
  }
};

const FavoriteCard = ({ parcel, onRemove }) => (
  <motion.div
    layout
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="h-full"
  >
    <Card className="h-full flex flex-col overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 relative group">
      <CardHeader className="p-0 relative">
        <div className="aspect-video bg-muted overflow-hidden">
          <img 
            className="w-full h-full object-cover"
            alt={`Image principale pour ${parcel.location_name}`} src="https://images.unsplash.com/photo-1675023112817-52b789fd2ef0" />
        </div>
        <Badge variant={getStatusVariant(parcel.status)} className="absolute top-2 right-2 text-xs px-2 py-0.5">{parcel.status}</Badge>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg mb-2 truncate">{parcel.location_name}</CardTitle>
        <div className="text-sm text-muted-foreground space-y-1">
          <p className="flex items-center"><MapPin className="h-4 w-4 mr-2 flex-shrink-0"/> Zone: <span className="font-medium text-foreground ml-1">{parcel.zone || 'N/A'}</span></p>
          <p className="flex items-center"><Maximize className="h-4 w-4 mr-2 flex-shrink-0"/> Surface: <span className="font-medium text-foreground ml-1">{parcel.area_sqm ? `${parcel.area_sqm} m²` : 'N/A'}</span></p>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t flex justify-between items-center">
        <p className="text-lg font-bold text-accent_brand">{formatPrice(parcel.price)}</p>
        <Button size="sm" asChild>
          <Link to={`/parcelles/${parcel.id}`}>Voir Détails</Link>
        </Button>
      </CardFooter>
       <AlertDialog>
          <AlertDialogTrigger asChild>
             <Button
               variant="destructive"
               size="icon"
               className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
               title="Retirer des favoris"
             >
               <Trash2 className="h-4 w-4" />
             </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
             <AlertDialogHeader>
               <AlertDialogTitle>Retirer des favoris ?</AlertDialogTitle>
               <AlertDialogDescription>
                 Voulez-vous vraiment retirer "{parcel.location_name}" de votre liste de favoris ?
               </AlertDialogDescription>
             </AlertDialogHeader>
             <AlertDialogFooter>
               <AlertDialogCancel>Annuler</AlertDialogCancel>
               <AlertDialogAction onClick={() => onRemove(parcel.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                 Retirer
               </AlertDialogAction>
             </AlertDialogFooter>
          </AlertDialogContent>
       </AlertDialog>
    </Card>
  </motion.div>
);

const FavoritesSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(3)].map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <Skeleton className="aspect-video w-full" />
        <CardContent className="p-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-1" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
        <CardFooter className="p-4 border-t flex justify-between items-center">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-9 w-1/4" />
        </CardFooter>
      </Card>
    ))}
  </div>
);

const MyFavoritesPage = () => {
  const { user } = useAuth();
  const { data: favoriteParcels, loading: favoriteParcelsLoading, error: favoriteParcelsError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (favoriteParcels) {
      setFilteredData(favoriteParcels);
    }
  }, [favoriteParcels]);
  
  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      setError(null);

      if (!user) {
        setError("Veuillez vous connecter pour voir vos favoris.");
        setLoading(false);
        return;
      }

      try {
        // Récupérer les favoris de l'utilisateur
        const favorites = await getFavorites(user.id);
        
        // Récupérer les détails des parcelles favorites
        const favoriteDetails = [];
        for (const favorite of favorites) {
          const parcel = await SupabaseDataService.getParcelById(favorite.parcel_id);
          if (parcel) {
            favoriteDetails.push(parcel);
          }
        }
        
        setFavoriteParcels(favoriteDetails);
      } catch (err) {
        console.error("Erreur chargement favoris:", err);
        setError("Impossible de charger vos parcelles favorites.");
        setFavoriteParcels([]);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user]);

  const handleRemoveFavorite = async (parcelIdToRemove) => {
     if (!user) return;

     try {
        const success = await removeFromFavorites(user.id, parcelIdToRemove);
        if (success) {
          // Mettre à jour l'état local pour un feedback immédiat
          setFavoriteParcels(prevParcels => prevParcels.filter(p => p.id !== parcelIdToRemove));
          toast({ title: "Retiré des favoris", description: "La parcelle a été retirée de vos favoris." });
        } else {
          toast({ title: "Erreur", description: "Impossible de retirer la parcelle des favoris.", variant: "destructive" });
        }
     } catch (err) {
        console.error("Erreur suppression favori:", err);
        toast({ title: "Erreur", description: "Impossible de retirer la parcelle des favoris.", variant: "destructive" });
     }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8 px-4"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Mes Favoris</h1>
        <p className="text-muted-foreground">Retrouvez ici les parcelles que vous avez sauvegardées.</p>
      </div>

      {loading ? (
        <FavoritesSkeleton />
      ) : error ? (
        <div className="text-center py-10 text-destructive bg-destructive/10 rounded-md">
          <p>{error}</p>
          {!user && <Button asChild className="mt-4"><Link to="/login">Se Connecter</Link></Button>}
        </div>
      ) : favoriteParcels.length > 0 ? (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteParcels.map(parcel => (
            <FavoriteCard key={parcel.id} parcel={parcel} onRemove={handleRemoveFavorite} />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-16 bg-muted/50 rounded-lg border border-dashed">
          <HeartOff className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Votre liste de favoris est vide</h2>
          <p className="text-muted-foreground mb-6">Cliquez sur l'icône ?? sur une parcelle pour l'ajouter ici.</p>
          <Button asChild>
            <Link to="/parcelles">Explorer les parcelles</Link>
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default MyFavoritesPage;
