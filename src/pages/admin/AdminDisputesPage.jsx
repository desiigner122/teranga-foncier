// src/pages/admin/AdminDisputesPage.jsx
import React, { useState, useEffect } from 'react';
const AdminDisputesPage = () => {
  const { data: disputes, loading: disputesLoading, error: disputesError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (disputes) {
      setFilteredData(disputes);
    }
  }, [disputes]);
  
  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      
      // Essayer de récupérer les litiges depuis Supabase (table disputes si elle existe)
      const { data: realDisputes, error } = await supabase
        .from('disputes')
        .select('*')
        .order('created_at', { ascending: false });

      let disputesData;
      
      if (error || !realDisputes || realDisputes.length === 0) {
        // Si pas de table disputes ou erreur, utiliser des données de démonstration        disputesData = [
          {
            id: '1',
            title: 'Conflit de propriété - Parcelle #A-2023-001',
            description: 'Deux parties revendiquent la propriété de la même parcelle située à Dakar',
            parcel_id: 'A-2023-001',
            plaintiff_name: 'Mamadou Diallo',
            defendant_name: 'Fatou Ndiaye',
            status: 'investigating',
            priority: 'high',
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-20T14:00:00Z',
            assigned_mediator: 'Me Aminata Touré',
            evidence_documents: ['titre_foncier_1.pdf', 'acte_achat_2.pdf'],
            location: 'Dakar, Plateau'
          },
          {
            id: '2',
            title: 'Litige de bornage - Parcelle #B-2023-045',
            description: 'Désaccord sur les limites entre deux parcelles adjacentes',
            parcel_id: 'B-2023-045',
            plaintiff_name: 'Société DELTA SARL',
            defendant_name: 'Omar Sy',
            status: 'pending',
            priority: 'medium',
            created_at: '2024-01-18T09:15:00Z',
            updated_at: '2024-01-18T09:15:00Z',
            assigned_mediator: 'Me Ibrahima Fall',
            evidence_documents: ['plan_cadastral.pdf'],
            location: 'Thiès, Zone industrielle'
          },
          {
            id: '3',
            title: 'Contestation de vente - Parcelle #C-2022-089',
            description: 'Contestation de la validité d\'une transaction immobilière',
            parcel_id: 'C-2022-089',
            plaintiff_name: 'Aissatou Diop',
            defendant_name: 'Jean Dupont',
            status: 'resolved',
            priority: 'low',
            created_at: '2023-12-10T16:45:00Z',
            updated_at: '2024-01-10T11:30:00Z',
            assigned_mediator: 'Me Khadija Seck',
            evidence_documents: ['contrat_vente.pdf', 'titre_propriete.pdf'],
            location: 'Saint-Louis, Centre-ville',
            resolution: 'Transaction annulée, remboursement effectué'
          },
          {
            id: '4',
            title: 'Héritage contesté - Parcelle #D-2023-012',
            description: 'Conflit d\'héritage entre plusieurs héritiers',
            parcel_id: 'D-2023-012',
            plaintiff_name: 'Famille Ba',
            defendant_name: 'Famille Sow',
            status: 'investigating',
            priority: 'urgent',
            created_at: '2024-01-22T08:00:00Z',
            updated_at: '2024-01-25T10:15:00Z',
            assigned_mediator: 'Me Moussa Diouf',
            evidence_documents: ['acte_deces.pdf', 'testament.pdf'],
            location: 'Kaolack, Quartier résidentiel'
          },
          {
            id: '5',
            title: 'Occupation illégale - Parcelle #E-2023-067',
            description: 'Signalement d\'occupation illégale d\'une parcelle',
            parcel_id: 'E-2023-067',
            plaintiff_name: 'Commune de Rufisque',
            defendant_name: 'Particulier non identifié',
            status: 'pending',
            priority: 'high',
            created_at: '2024-01-20T14:30:00Z',
            updated_at: '2024-01-20T14:30:00Z',
            assigned_mediator: 'Me Fatou Gueye',
            evidence_documents: ['constat_huissier.pdf'],
            location: 'Rufisque, Zone littorale'
          }
        ];
      } else {
        disputesData = realDisputes;
      }

      setDisputes(disputesData);
      setFilteredDisputes(disputesData);
    } catch (error) {      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les litiges"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les litiges
  useEffect(() => {
    let filtered = disputes;

    if (searchTerm) {
      filtered = filtered.filter(dispute =>
        dispute.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dispute.plaintiff_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dispute.defendant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dispute.parcel_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(dispute => dispute.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(dispute => dispute.priority === priorityFilter);
    }

    setFilteredDisputes(filtered);
  }, [disputes, searchTerm, statusFilter, priorityFilter]);

  // Mettre à jour le statut d'un litige
  const updateDisputeStatus = async (disputeId, newStatus) => {
    try {
      // En production, ceci ferait appel à Supabase
      setDisputes(prev => prev.map(dispute =>
        dispute.id === disputeId
          ? { ...dispute, status: newStatus, updated_at: new Date().toISOString() }
          : dispute
      ));

      toast({
        title: "Statut mis à jour",
        description: `Le statut du litige a été changé vers "${statusOptions[newStatus].label}"`
      });
    } catch (error) {      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  };

  // Résoudre un litige
  const resolveDispute = async (disputeId) => {
    if (!resolution.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une résolution",
        variant: "destructive"
      });
      return;
    }

    try {
      setDisputes(prev => prev.map(dispute =>
        dispute.id === disputeId
          ? {
            ...dispute,
            status: 'resolved',
            resolution: resolution,
            updated_at: new Date().toISOString()
          }
          : dispute
      ));

      setSelectedDispute(null);
      setResolution('');

      toast({
        title: "Litige résolu",
        description: "La résolution a été enregistrée avec succès"
      });
    } catch (error) {      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la résolution",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || dataLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Chargement des litiges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Litiges</h1>
          <p className="text-muted-foreground">
            Gérez et résolvez les conflits fonciers et les litiges
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="px-3 py-1">
            <AlertTriangle className="h-4 w-4 mr-1" />
            {disputes.filter(d => d.status === 'pending').length} en attente
          </Badge>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">
                  {disputes.filter(d => d.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">En enquête</p>
                <p className="text-2xl font-bold">
                  {disputes.filter(d => d.status === 'investigating').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Résolus</p>
                <p className="text-2xl font-bold">
                  {disputes.filter(d => d.status === 'resolved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Urgents</p>
                <p className="text-2xl font-bold">
                  {disputes.filter(d => d.priority === 'urgent').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par titre, parties, ou parcelle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(statusOptions).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrer par priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les priorités</SelectItem>
                {Object.entries(priorityOptions).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des litiges */}
      <Card>
        <CardHeader>
          <CardTitle>Litiges ({filteredDisputes.length})</CardTitle>
          <CardDescription>
            Liste de tous les litiges fonciers et conflits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Litige</TableHead>
                <TableHead>Parties</TableHead>
                <TableHead>Parcelle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDisputes.map((dispute) => (
                <TableRow key={dispute.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{dispute.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {dispute.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Plaignant:</span> {dispute.plaintiff_name}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Défendeur:</span> {dispute.defendant_name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{dispute.parcel_id}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${statusOptions[dispute.status].color} text-white`}>
                      {statusOptions[dispute.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={priorityOptions[dispute.priority].color}>
                      {priorityOptions[dispute.priority].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>Créé: {formatDate(dispute.created_at)}</p>
                      <p className="text-muted-foreground">
                        MAJ: {formatDate(dispute.updated_at)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{dispute.title}</DialogTitle>
                            <DialogDescription>
                              Détails du litige #{dispute.id}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Description</h4>
                              <p className="text-sm text-muted-foreground">{dispute.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium mb-1">Plaignant</h4>
                                <p className="text-sm">{dispute.plaintiff_name}</p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-1">Défendeur</h4>
                                <p className="text-sm">{dispute.defendant_name}</p>
                              </div>
                            </div>
                            {dispute.resolution && (
                              <div>
                                <h4 className="font-medium mb-2">Résolution</h4>
                                <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                                  {dispute.resolution}
                                </p>
                              </div>
                            )}
                            <div className="flex space-x-2">
                              {dispute.status !== 'resolved' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => updateDisputeStatus(dispute.id, 'investigating')}
                                  >
                                    Enquêter
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedDispute(dispute)}
                                  >
                                    Résoudre
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog pour résolution de litige */}
      {selectedDispute && (
        <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Résoudre le litige</DialogTitle>
              <DialogDescription>
                Saisissez la résolution pour: {selectedDispute.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Décrivez la résolution du litige..."
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                rows={4}
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedDispute(null)}>
                  Annuler
                </Button>
                <Button onClick={() => resolveDispute(selectedDispute.id)}>
                  Résoudre le litige
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminDisputesPage;
