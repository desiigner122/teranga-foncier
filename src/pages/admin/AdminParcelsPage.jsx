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
import { supabase } from '@/lib/supabaseClient';

const AdminParcelsPage = () => {
  const { user, profile } = useAuth();
  const userRole = profile?.type?.toLowerCase() || profile?.role?.toLowerCase() || 'user';
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // --- NOUVEAU : États pour le modal d'ajout/édition ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEditParcel, setCurrentEditParcel] = useState(null);
  const [formData, setFormData] = useState({});
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [owners, setOwners] = useState([]); // Vendeurs and Mairies
  const [loadingOwners, setLoadingOwners] = useState(false);

  const fetchParcels = useCallback(async () => {
    // ... (cette fonction ne change pas)
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('parcels').select('*');
      if (searchTerm) {
        query = query.or(`reference.ilike.%${searchTerm}%,location_name.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%,status.ilike.%${searchTerm}%`);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setParcels(data || []);
    } catch (err) {
      setError("Impossible de charger les parcelles: " + err.message);
      toast({ variant: "destructive", title: "Erreur de chargement", description: err.message });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, toast]);

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

  // --- NOUVEAU : Ouvre le modal et charge les données de la parcelle ---
  const handleEditClick = (parcel) => {
    setCurrentEditParcel(parcel);
    setFormData(parcel);
    setIsModalOpen(true);
  };

  // Handle Add New Parcel
  const handleAddClick = () => {
    setCurrentEditParcel(null);
    setFormData({});
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

  // --- NOUVEAU : Soumet le formulaire à Supabase ---
  const handleFormSubmit = async (data) => {
    setIsFormLoading(true);
    try {
      if (currentEditParcel) {
        // Update existing parcel
        const { error } = await supabase
          .from('parcels')
          .update(data)
          .eq('id', currentEditParcel.id);
        if (error) throw error;
        toast({
          title: "Parcelle mise à jour",
          description: `La parcelle "${data.name}" a été mise à jour avec succès.`,
        });
      } else {
        // Add new parcel
        const { error } = await supabase
          .from('parcels')
          .insert([data]);
        if (error) throw error;
        toast({
          title: "Parcelle ajoutée",
          description: `La parcelle "${data.name}" a été ajoutée avec succès.`,
        });
      }
      setIsModalOpen(false);
      fetchParcels();
    } catch (err) {
      toast({
        variant: "destructive",
        title: currentEditParcel ? "Erreur de mise à jour" : "Erreur d'ajout",
        description: err.message,
      });
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleDeleteParcel = async (parcelId, parcelName) => {
    // ... (cette fonction ne change pas)
    try {
      const { error } = await supabase.from('parcels').delete().eq('id', parcelId);
      if (error) throw error;
      toast({ title: "Parcelle supprimée", description: `La parcelle "${parcelName}" a été supprimée.` });
      fetchParcels();
    } catch (err) {
      toast({ variant: "destructive", title: "Erreur de suppression", description: err.message });
    }
  };

  const filteredParcels = parcels.filter(parcel =>
    parcel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parcel.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parcel.location_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parcel.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <Button onClick={handleAddClick} className="flex items-center gap-2">
            <LandPlot className="h-4 w-4" />
            Ajouter une Parcelle
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Rechercher et Filtrer les Parcelles</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par référence, nom, localisation ou statut..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                        <TableCell className="text-right flex justify-end space-x-2">
                          <Link to={`/parcelles/${parcel.id}`}>
                            <Button variant="ghost" size="sm" title="Voir Détails"><Eye className="h-4 w-4"/></Button>
                          </Link>
                          {/* --- MODIFICATION : Le bouton appelle maintenant handleEditClick --- */}
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
          </CardContent>
        </Card>
      </motion.div>

      {/* --- NOUVEAU : Modal d'ajout/édition --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentEditParcel ? 'Modifier la parcelle' : 'Ajouter une nouvelle parcelle'}
            </DialogTitle>
            <DialogDescription>
              {currentEditParcel 
                ? 'Mettez à jour les informations de la parcelle. Cliquez sur "Enregistrer" pour sauvegarder.'
                : 'Remplissez les informations de la nouvelle parcelle. Tous les champs marqués (*) sont obligatoires.'
              }
            </DialogDescription>
          </DialogHeader>
          <ParcelForm
            initialData={formData}
            onSubmit={handleFormSubmit}
            userRole={userRole}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminParcelsPage;