// src/pages/admin/AdminParcelsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
const AdminParcelsPage = () => {
  const { data: parcels, loading: parcelsLoading, error: parcelsError, refetch } = useRealtimeParcels();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (parcels) {
      setFilteredData(parcels);
    }
  }, [parcels]);
  
  useEffect(() => {
    fetchParcels();
    fetchOwners();
  }, [fetchParcels, fetchOwners]);

  // --- NOUVEAU : Ouvre le modal et charge les données de la parcelle ---
  const handleEditClick = (parcel) => {
    setCurrentEditParcel(parcel);
    setFormData({
      name: parcel.name || '',
      reference: parcel.reference || '',
      location_name: parcel.location_name || '',
      area_sqm: parcel.area_sqm || '',
      price: parcel.price || '',
      description: parcel.description || '',
      status: parcel.status || 'Disponible',
      owner_id: parcel.owner_id || '',
    });
    setIsModalOpen(true);
  };

  // Handle Add New Parcel
  const handleAddClick = () => {
    setCurrentEditParcel(null);
    setFormData({
      name: '',
      reference: '',
      location_name: '',
      area_sqm: '',
      price: '',
      description: '',
      status: 'Disponible',
      owner_id: '',
    });
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
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.reference || !formData.owner_id) {
      toast({
        variant: "destructive",
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires.",
      });
      return;
    }

    setIsFormLoading(true);

    try {
      if (currentEditParcel) {
        // Update existing parcel
        const { error } = await supabase
          .from('parcels')
          .update(formData)
          .eq('id', currentEditParcel.id);

        if (error) throw error;

        toast({
          title: "Parcelle mise à jour",
          description: `La parcelle "${formData.name}" a été mise à jour avec succès.`,
        });
      } else {
        // Add new parcel
        const { error } = await supabase
          .from('parcels')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Parcelle ajoutée",
          description: `La parcelle "${formData.name}" a été ajoutée avec succès.`,
        });
      }

      setIsModalOpen(false);
      fetchParcels(); // Recharger les données
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
        <DialogContent className="sm:max-w-[500px]">
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
          <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nom *</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={handleFormChange} 
                className="col-span-3" 
                required 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reference" className="text-right">Référence *</Label>
              <Input 
                id="reference" 
                value={formData.reference} 
                onChange={handleFormChange} 
                className="col-span-3" 
                required 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="owner_id" className="text-right">Propriétaire *</Label>
              <Select 
                value={formData.owner_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, owner_id: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un propriétaire" />
                </SelectTrigger>
                <SelectContent>
                  {loadingOwners ? (
                    <SelectItem value="" disabled>Chargement...</SelectItem>
                  ) : owners.length === 0 ? (
                    <SelectItem value="" disabled>Aucun propriétaire disponible</SelectItem>
                  ) : (
                    owners.map(owner => (
                      <SelectItem key={owner.id} value={owner.id}>
                        {owner.full_name || owner.email} ({owner.type})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location_name" className="text-right">Localisation</Label>
              <Input id="location_name" value={formData.location_name} onChange={handleFormChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="area_sqm" className="text-right">Surface (m²)</Label>
              <Input id="area_sqm" type="number" value={formData.area_sqm} onChange={handleFormChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Prix (FCFA)</Label>
              <Input id="price" type="number" value={formData.price} onChange={handleFormChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Statut</Label>
                <Select onValueChange={handleSelectChange} value={formData.status}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Disponible">Disponible</SelectItem>
                        <SelectItem value="En attente">En attente</SelectItem>
                        <SelectItem value="Réservé">Réservé</SelectItem>
                        <SelectItem value="Vendu">Vendu</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea id="description" value={formData.description} onChange={handleFormChange} className="col-span-3" />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Annuler</Button>
              </DialogClose>
              <Button type="submit" disabled={isFormLoading}>
                {isFormLoading && <LoadingSpinner size="small" className="mr-2" />}
                {currentEditParcel ? 'Enregistrer' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminParcelsPage;
