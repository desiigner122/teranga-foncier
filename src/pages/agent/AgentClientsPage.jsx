import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Search, MessageSquare, Phone, Edit } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { sampleAgentData } from '@/data';
import LoadingSpinner from '@/components/ui/spinner';

const AgentClientsPage = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      setClients(sampleAgentData.clients);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleAction = (message) => {
    toast({ title: "Action Simulée", description: message });
  };

  const filteredClients = clients.filter(client => 
    (client.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'all' || client.status.toLowerCase() === statusFilter)
  );

  if (loading) {
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mes Clients</h1>
        <Button onClick={() => handleAction("Ouverture du formulaire d'ajout de client.")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Client
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          <div className="flex space-x-2 pt-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher un client..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="en attente">En attente</SelectItem>
                <SelectItem value="archivé">Archivé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map(client => (
          <Card key={client.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{client.name}</CardTitle>
                  <CardDescription>{client.type}</CardDescription>
                </div>
                <Badge variant={client.status === 'Actif' ? 'success' : 'secondary'}>{client.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Dernier contact: {client.lastContact}</p>
              <p className="text-sm text-muted-foreground">Parcelles assignées: {client.assignedParcels.join(', ') || 'Aucune'}</p>
              <div className="flex space-x-2 mt-4">
                <Button variant="outline" size="icon" onClick={() => handleAction(`Contacter ${client.name} par message.`)}><MessageSquare className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" onClick={() => handleAction(`Appeler ${client.name}.`)}><Phone className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" onClick={() => handleAction(`Modifier le profil de ${client.name}.`)}><Edit className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredClients.length === 0 && <p className="text-center text-muted-foreground py-8">Aucun client trouvé.</p>}
    </motion.div>
  );
};

export default AgentClientsPage;