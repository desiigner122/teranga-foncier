import React, { useState, useEffect, useCallback } from 'react';
// Configuration des champs spécifiques pour les agents (peuvent être étendus si nécessaire)
const agentSpecificFields = [
  // { id: 'agent_id_number', label: 'Numéro d\'Agent', type: 'text', optional: true },
  // { id: 'agency_name', label: 'Nom de l\'Agence', type: 'text', optional: true },
];

const AdminAgentsPage = () => {
  const { data: agents, loading: agentsLoading, error: agentsError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (agents) {
      setFilteredData(agents);
    }
  }, [agents]);
  
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const filteredAgents = agents.filter(agent =>
    agent.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteAgent = async (agentId, agentEmail) => {
    try {
      // Supprimer l'agent de la table 'public.users'
      const { error } = await supabase.from('users').delete().eq('id', agentId);
      if (error) throw error;
      
      toast({
        title: "Agent supprimé",
        description: `L'agent ${agentEmail} a été supprimé.`,
      });
      fetchAgents(); // Recharger après suppression
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur de suppression",
        description: err.message,
      });
    }
  };

  const handleAddAgentClick = () => {
    setCurrentEditAgent(null);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      metadata: {},
    });
    setIsModalOpen(true);
  };

  const handleEditAgentClick = (agent) => {
    setCurrentEditAgent(agent);
    setFormData({
      full_name: agent.full_name || '',
      email: agent.email || '',
      phone: agent.phone || '',
      metadata: agent.metadata || {},
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleMetadataChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [id]: value,
      },
    }));
  };

  const handleSubmitAgent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSave = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        role: 'agent', // Rôle fixé à 'agent'
        type: 'Agent', // Type fixé à 'Agent'
        metadata: formData.metadata,
      };

      if (currentEditAgent) {
        // Mise à jour d'un agent existant
        const { error } = await supabase
          .from('users')
          .update(dataToSave)
          .eq('id', currentEditAgent.id);
        if (error) throw error;
        toast({ title: "Agent mis à jour", description: `L'agent ${formData.full_name} a été modifié.` });
      } else {
        // Ajout d'un nouvel agent
        // Comme pour les utilisateurs, la création d'utilisateur Auth et l'envoi d'email
        // devraient se faire via une Edge Function pour la sécurité.
        // Ici, nous insérons juste dans la table public.users.
        const { data, error } = await supabase
          .from('users')
          .insert([dataToSave])
          .select();

        if (error) throw error;

        toast({
          title: "Agent ajouté",
          description: `L'agent ${formData.full_name} a été ajouté. (L'envoi d'e-mail réel nécessite une configuration serveur/Edge Function)`,
          duration: 5000,
        });
        // Ici, vous appelleriez votre Edge Function pour créer l'utilisateur Auth et envoyer l'email
        /*
        await supabase.functions.invoke('send-welcome-email', {
          body: {
            userId: data[0].id, // ID de l'utilisateur nouvellement créé
            email: formData.email,
            fullName: formData.full_name,
            role: 'agent',
            type: 'Agent',
          },
        });
        */
      }
      setIsModalOpen(false);
      fetchAgents();
    } catch (err) {
      toast({
        variant: "destructive",
        title: `Erreur lors de l'${currentEditAgent ? 'mise à jour' : 'ajout'} de l'agent`,
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewAgentDetails = (agentId) => {
    navigate(`/dashboard/admin/users/${agentId}`); // Redirige vers la page de détails utilisateur générique
    toast({ title: "Détails Agent", description: `Redirection vers la page de détails de l'agent ${agentId}.` });
  };

  if (loading && agents.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px] text-red-600">
        <p>Erreur: {error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 p-4 md:p-6 lg:p-8"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center">
          <UserCheck className="mr-3 h-8 w-8"/>
          Gestion des Agents
        </h1>
        <Button onClick={handleAddAgentClick}>
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un agent
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rechercher un Agent</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email ou téléphone..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredAgents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucun agent trouvé.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom Complet</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell className="font-medium">{agent.full_name}</TableCell>
                      <TableCell>{agent.email}</TableCell>
                      <TableCell>{agent.phone || 'N/A'}</TableCell>
                      <TableCell className="text-right flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" title="Voir Détails" onClick={() => handleViewAgentDetails(agent.id)}>
                           <Eye className="h-4 w-4"/>
                        </Button>
                        <Button variant="ghost" size="sm" title="Modifier" onClick={() => handleEditAgentClick(agent)}>
                          <Edit className="h-4 w-4"/>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" title="Supprimer" className="text-red-600 hover:text-red-800">
                              <Trash2 className="h-4 w-4"/>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action supprimera définitivement l'agent "{agent.email}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteAgent(agent.id, agent.email)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Supprimer</AlertDialogAction>
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

      {/* Add/Edit Agent Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentEditAgent ? 'Modifier l\'agent' : 'Ajouter un nouvel agent'}</DialogTitle>
            <DialogDescription>
              {currentEditAgent ? 'Modifiez les informations de l\'agent.' : 'Remplissez les informations pour ajouter un nouvel agent.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAgent} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="full_name" className="text-right">
                Nom Complet
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={handleFormChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Téléphone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
            {/* Champs dynamiques spécifiques à l'agent */}
            {agentSpecificFields.map(field => (
              <div key={field.id} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={field.id} className="text-right">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
                {field.type === 'textarea' ? (
                  <Textarea
                    id={field.id}
                    value={formData.metadata[field.id] || ''}
                    onChange={handleMetadataChange}
                    className="col-span-3"
                    required={field.required}
                  />
                ) : (
                  <Input
                    id={field.id}
                    type={field.type}
                    value={formData.metadata[field.id] || ''}
                    onChange={handleMetadataChange}
                    className="col-span-3"
                    required={field.required}
                  />
                )}
              </div>
            ))}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={loading || dataLoading}>
                {loading && <LoadingSpinner size="small" className="mr-2" />}
                {currentEditAgent ? 'Enregistrer les modifications' : 'Ajouter l\'agent'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminAgentsPage;
