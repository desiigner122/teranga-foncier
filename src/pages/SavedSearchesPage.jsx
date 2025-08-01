import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { sampleSavedSearches as initialSampleSearches } from '@/data/sampleData';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, BellOff, SearchCheck, Trash2, Edit3, PlusCircle, ExternalLink, Filter, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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

const formatSearchParams = (params) => {
  if (!params) return 'Critères non définis.';
  const parts = [];
  if (params.search) parts.push(`Terme: "${params.search}"`);
  if (params.zone && params.zone !== 'all') parts.push(`Zone: ${params.zone}`);
  if (params.status && params.status !== 'all') parts.push(`Statut: ${params.status}`);
  if (params.minPrice) parts.push(`Prix min: ${new Intl.NumberFormat('fr-SN', {style:'currency', currency:'XOF', maximumFractionDigits:0}).format(params.minPrice)}`);
  if (params.maxPrice) parts.push(`Prix max: ${new Intl.NumberFormat('fr-SN', {style:'currency', currency:'XOF', maximumFractionDigits:0}).format(params.maxPrice)}`);
  if (params.minArea) parts.push(`Surface min: ${params.minArea} m²`);
  if (params.maxArea) parts.push(`Surface max: ${params.maxArea} m²`);
  
  if (parts.length === 0) return "Tous les terrains (aucun critère spécifique).";
  return parts.join(' | ');
};

const SavedSearchCard = ({ search, onToggleNotify, onDelete, onEdit, onViewResults }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
  >
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 bg-card border border-border/50">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <CardTitle className="text-lg text-primary mb-1 sm:mb-0 flex items-center">
            <Filter className="h-5 w-5 mr-2 flex-shrink-0"/>
            {search.search_name || 'Recherche Sans Nom'}
          </CardTitle>
          <Badge variant={search.notify ? 'success' : 'secondary'} className="flex items-center self-start sm:self-center text-xs py-1 px-2">
            {search.notify ? <Bell className="h-3.5 w-3.5 mr-1.5"/> : <BellOff className="h-3.5 w-3.5 mr-1.5"/>}
            Notifications {search.notify ? 'Activées' : 'Désactivées'}
          </Badge>
        </div>
        <CardDescription className="text-xs mt-1">Créée le: {new Date(search.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium mb-1.5 text-foreground">Critères :</p>
        <p className="text-sm text-muted-foreground bg-muted/40 p-3 rounded-md border border-dashed border-border/70 text-xs leading-relaxed">
          {formatSearchParams(search.search_parameters)}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t">
         <div className="flex items-center space-x-2 self-start sm:self-center">
             <Switch
               id={`notify-${search.id}`}
               checked={search.notify}
               onCheckedChange={(checked) => onToggleNotify(search.id, checked)}
               aria-label="Activer les notifications pour cette recherche"
             />
             <Label htmlFor={`notify-${search.id}`} className="text-sm text-muted-foreground cursor-pointer">Recevoir les alertes</Label>
         </div>
         <div className="flex gap-2 self-end sm:self-center">
             <Button variant="outline" size="sm" onClick={() => onEdit(search)} title="Modifier cette recherche">
                 <Edit3 className="h-4 w-4"/>
             </Button>
              <Button variant="default" size="sm" onClick={() => onViewResults(search.search_parameters)} title="Voir les résultats actuels">
                 <ExternalLink className="h-4 w-4"/>
             </Button>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                   <Button variant="destructive" size="sm" title="Supprimer cette recherche">
                       <Trash2 className="h-4 w-4"/>
                   </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                   <AlertDialogHeader>
                     <AlertDialogTitle>Confirmer la Suppression</AlertDialogTitle>
                     <AlertDialogDescription>
                       Voulez-vous vraiment supprimer la recherche sauvegardée "{search.search_name || 'Recherche Sans Nom'}" ? Cette action est irréversible et arrêtera les notifications associées.
                     </AlertDialogDescription>
                   </AlertDialogHeader>
                   <AlertDialogFooter>
                     <AlertDialogCancel>Annuler</AlertDialogCancel>
                     <AlertDialogAction onClick={() => onDelete(search.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                       Oui, Supprimer
                     </AlertDialogAction>
                   </AlertDialogFooter>
                </AlertDialogContent>
             </AlertDialog>
         </div>
      </CardFooter>
    </Card>
  </motion.div>
);

const SavedSearchesSkeleton = () => (
  <div className="space-y-5">
    {[...Array(2)].map((_, i) => (
      <Card key={i} className="shadow-md">
        <CardHeader>
          <div className="flex justify-between items-start">
            <Skeleton className="h-7 w-3/5 mb-1" />
            <Skeleton className="h-6 w-1/5" />
          </div>
          <Skeleton className="h-4 w-2/5" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-5 w-1/4 mb-2" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
        <CardFooter className="flex justify-between items-center pt-4 border-t">
          <Skeleton className="h-6 w-1/3" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-10" />
            <Skeleton className="h-9 w-10" />
            <Skeleton className="h-9 w-10" />
          </div>
        </CardFooter>
      </Card>
    ))}
  </div>
);

const SavedSearchesPage = () => {
  const { user } = useAuth();
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (!user) {
      setError("Veuillez vous connecter pour gérer vos recherches sauvegardées.");
      setLoading(false);
      return;
    }

    setTimeout(() => {
      try {
        const userSearches = initialSampleSearches.filter(s => s.user_id === 'user1'); // Demo user_id
        setSavedSearches(userSearches.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
      } catch (err) {
        console.error("Erreur de chargement des recherches sauvegardées:", err);
        setError("Impossible de charger vos recherches sauvegardées.");
        setSavedSearches([]);
      } finally {
        setLoading(false);
      }
    }, 500);

  }, [user]);

  const handleToggleNotify = (searchId, notify) => {
    try {
      setSavedSearches(prev => prev.map(s => s.id === searchId ? { ...s, notify: notify } : s));
      toast({ title: `Alertes ${notify ? 'activées' : 'désactivées'}`, description: `Les notifications pour cette recherche ont été ${notify ? 'activées' : 'désactivées'}.` });
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible de modifier le statut des notifications.", variant: "destructive" });
    }
  };

  const handleDeleteSearch = (searchId) => {
    try {
      setSavedSearches(prev => prev.filter(s => s.id !== searchId));
      toast({ title: "Recherche Supprimée", description: "La recherche sauvegardée a été supprimée avec succès." });
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible de supprimer la recherche.", variant: "destructive" });
    }
  };

  const handleEditSearch = (search) => {
     toast({ title: "Fonctionnalité à venir", description: "La modification des recherches sera bientôt disponible. Pour l'instant, supprimez et recréez votre recherche." });
  };

   const handleAddNewSearch = () => {
      toast({ 
        title: "Comment sauvegarder une recherche ?",
        description: (
          <div>
            <p className="mb-2">Pour sauvegarder une nouvelle recherche :</p>
            <ol className="list-decimal list-inside text-sm space-y-1">
              <li>Allez sur la <Link to="/parcelles" className="text-primary underline">page des parcelles</Link>.</li>
              <li>Appliquez les filtres souhaités (zone, prix, surface, etc.).</li>
              <li>Cliquez sur le bouton "Sauvegarder la Recherche" (bientôt disponible en haut des filtres).</li>
            </ol>
          </div>
        ),
        duration: 8000,
      });
   };

  const handleViewResults = (params) => {
    const queryParams = new URLSearchParams(params).toString();
    // Navigate to parcels list page with these params
    // This is a placeholder navigation, a real app would use react-router's navigate
    window.location.href = `/parcelles?${queryParams}`;
    toast({ title: "Redirection...", description: "Affichage des résultats correspondants."});
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-12 px-4"
    >
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-primary flex items-center">
            <SearchCheck className="h-8 w-8 mr-3 text-primary"/> Mes Recherches Sauvegardées
          </h1>
          <p className="text-muted-foreground mt-1">Gérez vos critères de recherche et soyez alerté des nouvelles parcelles correspondantes.</p>
        </div>
         <Button onClick={handleAddNewSearch} variant="default" size="lg" className="self-center sm:self-auto">
             <PlusCircle className="h-5 w-5 mr-2"/> Créer une Nouvelle Recherche
         </Button>
      </div>

      {loading ? (
        <SavedSearchesSkeleton />
      ) : error ? (
        <div className="text-center py-12 text-destructive bg-destructive/10 rounded-lg border border-destructive/30">
          <Info className="h-12 w-12 mx-auto mb-3"/>
          <p className="text-lg font-medium">{error}</p>
          {!user && <Button asChild className="mt-4"><Link to="/login">Se Connecter</Link></Button>}
        </div>
      ) : savedSearches.length > 0 ? (
        <motion.div layout className="space-y-6">
          {savedSearches.map(search => (
            <SavedSearchCard
              key={search.id}
              search={search}
              onToggleNotify={handleToggleNotify}
              onDelete={handleDeleteSearch}
              onEdit={handleEditSearch}
              onViewResults={handleViewResults}
            />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-16 bg-card rounded-lg border border-dashed border-border/70 shadow-sm">
          <SearchCheck className="h-16 w-16 mx-auto text-muted-foreground/70 mb-5" />
          <h2 className="text-2xl font-semibold mb-2 text-foreground">Aucune recherche sauvegardée pour le moment.</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">Sauvegardez vos critères de recherche depuis la page des terrains pour être alerté des nouvelles opportunités.</p>
          <Button asChild size="lg">
            <Link to="/parcelles">Explorer les parcelles et définir des alertes</Link>
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default SavedSearchesPage;