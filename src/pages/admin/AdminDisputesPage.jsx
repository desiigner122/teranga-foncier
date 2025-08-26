// src/pages/admin/AdminDisputesPage.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Search, Filter, Eye, MessageSquare, Check, X, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const AdminDisputesPage = () => {
  const [disputes, setDisputes] = useState([]);
  const [filteredDisputes, setFilteredDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolution, setResolution] = useState('');
  const { toast } = useToast();

  // Status et priorité options
  const statusOptions = {
    'pending': { label: 'En attente', color: 'bg-yellow-500' },
    'investigating': { label: 'Enquête en cours', color: 'bg-blue-500' },
    'resolved': { label: 'Résolu', color: 'bg-green-500' },
    'closed': { label: 'Fermé', color: 'bg-gray-500' }
  };

  const priorityOptions = {
    'low': { label: 'Faible', color: 'bg-green-100 text-green-800' },
    'medium': { label: 'Moyen', color: 'bg-yellow-100 text-yellow-800' },
    'high': { label: 'Élevé', color: 'bg-orange-100 text-orange-800' },
    'urgent': { label: 'Urgent', color: 'bg-red-100 text-red-800' }
  };

  // Charger les litiges
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

      if (error) {
        setDisputes([]);
        setFilteredDisputes([]);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les litiges (table absente ou erreur Supabase)"
        });
      } else if (!realDisputes || realDisputes.length === 0) {
        setDisputes([]);
        setFilteredDisputes([]);
        toast({
          title: "Aucun litige trouvé",
          description: "Aucune donnée n'est disponible dans la table des litiges."
        });
      } else {
        setDisputes(realDisputes);
        setFilteredDisputes(realDisputes);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des litiges:', error);
      toast({
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
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast({
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
    } catch (error) {
      console.error('Erreur lors de la résolution:', error);
      toast({
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

  if (loading) {
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
