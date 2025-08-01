import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from '@/components/ui/spinner';
import { LandPlot, Search, DollarSign, FileText, CalendarDays, BarChart, Eye, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const VendeurDashboardPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('listings') // Assuming you have a 'listings' table for properties for sale
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data);
    } catch (err) {
      console.error("Erreur lors du chargement des annonces:", err.message);
      setError("Impossible de charger les annonces. Veuillez vérifier votre connexion ou les données Supabase.");
      toast({
        title: "Erreur de chargement",
        description: "Impossible de récupérer les annonces.",
        variant: "destructive",
      });
      setListings([]); // Clear data on error
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleSimulatedAction = (actionType, listingId = null) => {
    toast({
      title: `${actionType} en cours`,
      description: `${actionType} de l'annonce ${listingId ? listingId.substring(0, 8) + '...' : ''} simulée. (Fonctionnalité complète à implémenter)`,
      duration: 3000,
    });
  };

  const filteredListings = listings.filter(listing =>
    listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(price);
  };

  if (loading && listings.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-red-500">
        <p>{error}</p>
        <p className="text-sm text-muted-foreground mt-2">Veuillez réessayer plus tard.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 p-4 md:p-6 lg:p-8"
    >
      <h1 className="text-3xl font-bold flex items-center">
        <LandPlot className="mr-3 h-8 w-8 text-primary" /> Tableau de Bord Vendeur
      </h1>
      <p className="text-muted-foreground">
        Gérez vos annonces de biens immobiliers et suivez vos transactions.
      </p>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher une annonce par titre, statut ou localisation..."
            className="pl-9 pr-3 py-2 border rounded-md w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => handleSimulatedAction("Ajout d'une nouvelle annonce")}>
          Ajouter une Annonce {/* PlusCircle est dans sidebarConfig, pas directement ici */}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mes Annonces Actives</CardTitle>
          <CardDescription>Vue d'ensemble de vos biens actuellement en vente.</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredListings.length === 0 && !loading ? (
            <p className="text-center text-muted-foreground py-8">Aucune annonce trouvée.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre de l'Annonce</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Date de Publication</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredListings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell className="font-medium">{listing.title}</TableCell>
                      <TableCell>
                        <Badge variant={listing.status === 'Active' ? 'success' : 'secondary'}>
                          {listing.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{listing.location}</TableCell>
                      <TableCell>{formatPrice(listing.price)}</TableCell>
                      <TableCell>{new Date(listing.created_at).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleSimulatedAction("Voir les détails", listing.id)} className="mr-2">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleSimulatedAction("Modifier", listing.id)} className="mr-2">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action supprimera définitivement l'annonce "{listing.title}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleSimulatedAction("Suppression", listing.id)}>Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {loading && listings.length > 0 && (
            <div className="flex justify-center py-4">
              <LoadingSpinner size="medium" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ajoutez d'autres sections ou graphiques ici si nécessaire */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annonces Actives</CardTitle>
            <LandPlot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{listings.filter(l => l.status === 'Active').length}</div>
            <p className="text-xs text-muted-foreground">
              Biens actuellement en vente
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventes Réussies</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div> {/* Donnée fictive */}
            <p className="text-xs text-muted-foreground">
              Ventes conclues ce mois-ci
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus Estimés</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(150000000)}</div> {/* Donnée fictive */}
            <p className="text-xs text-muted-foreground">
              Potentiel de revenus de vos annonces
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transactions Récentes</CardTitle>
            <CardDescription>Historique de vos dernières ventes.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Vous pouvez intégrer un tableau des transactions ici */}
            <div className="h-40 flex items-center justify-center text-muted-foreground">
              Tableau des transactions (à implémenter)
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rapports de Performance</CardTitle>
            <CardDescription>Analyse de la visibilité de vos annonces.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Graphique de performance */}
            <div className="h-40 flex items-center justify-center text-muted-foreground">
              Graphique de performance (à implémenter)
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default VendeurDashboardPage;
