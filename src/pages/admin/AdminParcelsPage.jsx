// src/pages/admin/AdminParcelsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import ParcelForm from '@/components/parcel-admin/ParcelForm';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Edit, Trash2, Eye, LandPlot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from '@/components/ui/spinner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SupabaseDataService } from '@/services/supabaseDataService';

const AdminParcelsPage = () => {
  const { user, profile } = useAuth();
  const userRole = profile?.type?.toLowerCase() || profile?.role?.toLowerCase() || 'user';
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  // Filtres
  const [filterMairie, setFilterMairie] = useState('');
  const [filterVendeur, setFilterVendeur] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const { toast } = useToast();

  // --- NOUVEAU : États pour le modal d'ajout/édition ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEditParcel, setCurrentEditParcel] = useState(null);
  const [formData, setFormData] = useState({});
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [owners, setOwners] = useState([]); // Vendeurs and Mairies
  const [loadingOwners, setLoadingOwners] = useState(false);

  const fetchParcels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('parcels').select('*', { count: 'exact' });
      // Recherche
      if (searchTerm) {
        query = query.or(`reference.ilike.%${searchTerm}%,location_name.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%,status.ilike.%${searchTerm}%`);
      }
      // Filtres
      if (filterMairie) query = query.eq('owner_type', 'Mairie').eq('owner_id', filterMairie);
      if (filterVendeur) query = query.eq('owner_type', 'Vendeur').eq('owner_id', filterVendeur);
      if (filterStatut) query = query.eq('status', filterStatut);
      // Pagination
      query = query.order('created_at', { ascending: false }).range((page-1)*pageSize, page*pageSize-1);
      const { data, error, count } = await query;
      if (error) throw error;
      setParcels(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      setError("Impossible de charger les parcelles: " + err.message);
      toast({ variant: "destructive", title: "Erreur de chargement", description: err.message });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterMairie, filterVendeur, filterStatut, page, pageSize, toast]);

  // Fetch potential owners (Vendeurs and Mairies)
  const fetchOwners = useCallback(async () => {
    setLoadingOwners(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, type')
        .in('type', ['Vendeur', 'Mairie'])
        .order('full_name', { ascending: true });
      
      if (error) throw error;
      setOwners(data || []);
    } catch (err) {
      console.error('Error fetching owners:', err);
      toast({ 
        variant: "destructive", 
        title: "Erreur", 
        description: "Impossible de charger la liste des propriétaires" 
      });
    } finally {
      setLoadingOwners(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchParcels();
    fetchOwners();
  }, [fetchParcels, fetchOwners]);

  // --- Ouvre le modal et charge les données de la parcelle (modification uniquement) ---
  const handleEditClick = (parcel) => {
    setCurrentEditParcel(parcel);
    setFormData(parcel);
    setIsModalOpen(true);
  };

  // --- NOUVEAU : Gère les changements dans le formulaire ---
  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (value) => {
      setFormData(prev => ({ ...prev, status: value }));
  };

  // --- Soumet le formulaire à Supabase (modification uniquement) ---
  const handleFormSubmit = async (data) => {
    setIsFormLoading(true);
    try {
      // Use SupabaseDataService for update (logs event, robust)
      await SupabaseDataService.updateParcel(currentEditParcel.id, data);
      toast({
        title: "Parcelle mise à jour",
        description: `La parcelle "${data.name}" a été mise à jour avec succès.`,
      });
      setIsModalOpen(false);
      fetchParcels();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur de mise à jour",
        description: err.message,
      });
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleDeleteParcel = async (parcelId, parcelName) => {
    try {
      await SupabaseDataService.deleteParcel(parcelId, user?.id);
      toast({ title: "Parcelle supprimée", description: `La parcelle "${parcelName}" a été supprimée.` });
      fetchParcels();
    } catch (err) {
      toast({ variant: "destructive", title: "Erreur de suppression", description: err.message });
    }
  };

  // Les filtres sont maintenant côté requête, donc on affiche directement parcels
  const filteredParcels = parcels;

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Disponible': return 'success';
      case 'En attente': return 'warning';
      case 'Vendu': return 'destructive';
      case 'Réservé': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading && parcels.length === 0) {
    return <div className="flex items-center justify-center h-full min-h-[500px]"><LoadingSpinner size="large" /></div>;
  }
  if (error) {
    return <div className="flex items-center justify-center h-full min-h-[500px] text-red-600"><p>Erreur: {error}</p></div>;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 p-4 md:p-6 lg:p-8"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center"><LandPlot className="mr-3 h-8 w-8"/>Gestion des Parcelles</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Rechercher et Filtrer les Parcelles</CardTitle>
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0 mt-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Recherche rapide..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                />
              </div>
              <Select value={filterMairie || "all"} onValueChange={v => { setFilterMairie(v === "all" ? "" : v); setPage(1); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer Mairie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes Mairies</SelectItem>
                  {owners.filter(o => o.type === 'Mairie').map(mairie => (
                    <SelectItem key={mairie.id} value={mairie.id}>{mairie.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterVendeur || "all"} onValueChange={v => { setFilterVendeur(v === "all" ? "" : v); setPage(1); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer Vendeur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous Vendeurs</SelectItem>
                  {owners.filter(o => o.type === 'Vendeur').map(vendeur => (
                    <SelectItem key={vendeur.id} value={vendeur.id}>{vendeur.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatut || "all"} onValueChange={v => { setFilterStatut(v === "all" ? "" : v); setPage(1); }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filtrer Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous Statuts</SelectItem>
                  <SelectItem value="Disponible">Disponible</SelectItem>
                  <SelectItem value="En attente">En attente</SelectItem>
                  <SelectItem value="Vendu">Vendu</SelectItem>
                  <SelectItem value="Réservé">Réservé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredParcels.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucune parcelle trouvée.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Localisation</TableHead>
                      <TableHead>Surface (m²)</TableHead>
                      <TableHead>Prix (FCFA)</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Propriétaire</TableHead>
                      <TableHead>Parties prenantes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParcels.map((parcel) => (
                      <TableRow key={parcel.id}>
                        <TableCell className="font-mono">{parcel.reference || 'N/A'}</TableCell>
                        <TableCell className="font-medium">{parcel.name || 'N/A'}</TableCell>
                        <TableCell>{parcel.location_name || 'N/A'}</TableCell>
                        <TableCell>{parcel.area_sqm || 'N/A'}</TableCell>
                        <TableCell>{parcel.price ? new Intl.NumberFormat('fr-SN').format(parcel.price) : 'N/A'}</TableCell>
                        <TableCell><Badge variant={getStatusBadgeVariant(parcel.status)}>{parcel.status || 'N/A'}</Badge></TableCell>
                        <TableCell>{parcel.owner_type || parcel.owner_name || 'N/A'}</TableCell>
                        <TableCell>{parcel.stakeholders ? parcel.stakeholders.join(', ') : 'N/A'}</TableCell>
                        <TableCell className="text-right flex justify-end space-x-2">
                          <Link to={`/parcelles/${parcel.id}`}>
                            <Button variant="ghost" size="sm" title="Voir Détails"><Eye className="h-4 w-4"/></Button>
                          </Link>
                          <Button variant="ghost" size="sm" title="Modifier" onClick={() => handleEditClick(parcel)}>
                            <Edit className="h-4 w-4"/>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" title="Supprimer" className="text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4"/></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                                <AlertDialogDescription>Cette action ne peut pas être annulée. Cela supprimera définitivement la parcelle "{parcel.name || parcel.reference}".</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteParcel(parcel.id, parcel.name || parcel.reference)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Supprimer</AlertDialogAction>
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
            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">{`Résultats ${Math.min((page-1)*pageSize+1, totalCount)}-${Math.min(page*pageSize, totalCount)} sur ${totalCount}`}</div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p-1))}>Précédent</Button>
                <span className="text-sm">Page {page}</span>
                <Button variant="outline" size="sm" disabled={page*pageSize >= totalCount} onClick={() => setPage(p => p+1)}>Suivant</Button>
                <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setPage(1); }}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* --- Modal de modification uniquement --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Modifier la parcelle
            </DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de la parcelle. Cliquez sur "Enregistrer" pour sauvegarder.
            </DialogDescription>
          </DialogHeader>
          <ParcelForm
            initialData={formData}
            onSubmit={handleFormSubmit}
            userRole={userRole}
            isEditOnly={true}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminParcelsPage;