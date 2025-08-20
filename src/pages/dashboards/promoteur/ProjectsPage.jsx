import React, { useState, useEffect } from 'react';
const ProjectsPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: projects, loading: projectsLoading, error: projectsError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (projects) {
      setFilteredData(projects);
    }
  }, [projects]);
  
  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      
      // Récupérer les projets du promoteur depuis la table projects ou parcels avec type 'development'
      const { data, error } = await supabase
        .from('parcels')
        .select(`
          *,
          users!inner(id, full_name)
        `)
        .eq('owner_id', user.id)
        .eq('type', 'development')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transformer les données pour correspondre au format projet
      const projectsData = data.map(parcel => ({
        id: parcel.id,
        name: parcel.name || `Projet ${parcel.reference}`,
        description: parcel.description || 'Aucune description',
        location: parcel.location_name || parcel.location || 'Non spécifié',
        budget: parcel.price || 0,
        status: parcel.status || 'planning',
        surface_area: parcel.surface_area,
        reference: parcel.reference,
        created_at: parcel.created_at,
        updated_at: parcel.updated_at
      }));

      setProjects(projectsData);
    } catch (error) {      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les projets"
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    try {
      setIsProcessing(true);
      
      const { error } = await supabase
        .from('parcels')
        .insert({
          name: newProject.name,
          description: newProject.description,
          location_name: newProject.location,
          price: parseFloat(newProject.budget) || 0,
          status: newProject.status,
          type: 'development',
          owner_id: user.id,
          reference: `DEV-${Date.now()}`,
          legal_status: 'private'
        });

      if (error) throw error;

      toast({
        title: "Projet créé",
        description: "Votre nouveau projet a été créé avec succés"
      });

      // Recharger les données
      await loadProjects();
      setIsAddModalOpen(false);
      setNewProject({
        name: '',
        description: '',
        location: '',
        budget: '',
        status: 'planning'
      });
      
    } catch (error) {      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le projet"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'planning': 'Planification',
      'in_progress': 'En cours',
      'completed': 'Terminé',
      'on_hold': 'En attente',
      'cancelled': 'Annulé'
    };
    return labels[status] || status;
  };

  const getStatusBadge = (status) => {
    const variants = {
      'planning': 'secondary',
      'in_progress': 'default',
      'completed': 'default',
      'on_hold': 'secondary',
      'cancelled': 'destructive'
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {getStatusLabel(status)}
      </Badge>
    );
  };

  const getProgressPercentage = (status) => {
    const progress = {
      'planning': 10,
      'in_progress': 50,
      'completed': 100,
      'on_hold': 25,
      'cancelled': 0
    };
    return progress[status] || 0;
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading || dataLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center">
          <Building className="mr-3 h-8 w-8" />
          Mes Projets de Développement
        </h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Nouveau Projet
        </Button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Projets</p>
                <p className="text-2xl font-bold">{projects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">En Cours</p>
                <p className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Terminés</p>
                <p className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Budget Total</p>
                <p className="text-2xl font-bold">
                  {projects.reduce((sum, p) => sum + (p.budget || 0), 0).toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par nom, localisation ou référence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="planning">Planification</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="on_hold">En attente</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des projets */}
      <Card>
        <CardHeader>
          <CardTitle>Projets ({filteredProjects.length})</CardTitle>
          <CardDescription>
            Gérez vos projets de développement immobilier
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Aucun projet trouvé</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsAddModalOpen(true)}
              >
                Créer votre premier projet
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Projet</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Progrés</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground">{project.reference}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                        {project.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {project.budget.toLocaleString('fr-FR')} FCFA
                      </div>
                      {project.surface_area && (
                        <div className="text-sm text-muted-foreground">
                          {project.surface_area} mé
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(project.status)}
                    </TableCell>
                    <TableCell>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${getProgressPercentage(project.status)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {getProgressPercentage(project.status)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(project.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProject(project);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Détails
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal d'ajout de projet */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau Projet de Développement</DialogTitle>
            <DialogDescription>
              Créez un nouveau projet de développement immobilier
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nom du projet</Label>
              <Input
                id="name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="Ex: Résidence Les Palmiers"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Décrivez votre projet..."
              />
            </div>
            <div>
              <Label htmlFor="location">Localisation</Label>
              <Input
                id="location"
                value={newProject.location}
                onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                placeholder="Ex: Dakar, Almadies"
              />
            </div>
            <div>
              <Label htmlFor="budget">Budget (FCFA)</Label>
              <Input
                id="budget"
                type="number"
                value={newProject.budget}
                onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                placeholder="Ex: 50000000"
              />
            </div>
            <div>
              <Label htmlFor="status">Statut initial</Label>
              <Select 
                value={newProject.status} 
                onValueChange={(value) => setNewProject({ ...newProject, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planification</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="on_hold">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddModalOpen(false)}
              disabled={isProcessing}
            >
              Annuler
            </Button>
            <Button 
              onClick={createProject}
              disabled={isProcessing || !newProject.name}
            >
              {isProcessing ? 'Création...' : 'Créer le projet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de détails */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du Projet</DialogTitle>
            <DialogDescription>
              Informations complétes sur le projet de développement
            </DialogDescription>
          </DialogHeader>
          
          {selectedProject && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nom du projet</Label>
                  <p className="font-medium">{selectedProject.name}</p>
                </div>
                <div>
                  <Label>Référence</Label>
                  <p className="font-medium">{selectedProject.reference}</p>
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                <p className="text-sm mt-1">{selectedProject.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Localisation</Label>
                  <p className="font-medium">{selectedProject.location}</p>
                </div>
                <div>
                  <Label>Budget</Label>
                  <p className="font-medium text-lg">
                    {selectedProject.budget.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Statut</Label>
                  {getStatusBadge(selectedProject.status)}
                </div>
                <div>
                  <Label>Progrés</Label>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${getProgressPercentage(selectedProject.status)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {getProgressPercentage(selectedProject.status)}%
                  </span>
                </div>
              </div>

              {selectedProject.surface_area && (
                <div>
                  <Label>Surface</Label>
                  <p className="font-medium">{selectedProject.surface_area} mé</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date de création</Label>
                  <p className="text-sm">{new Date(selectedProject.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <Label>Derniére mise é jour</Label>
                  <p className="text-sm">{new Date(selectedProject.updated_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ProjectsPage;

