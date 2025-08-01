import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Eye, Edit, CalendarPlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { sampleAgentData } from '@/data';
import { Link } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/spinner';

const AgentParcelsPage = () => {
  const { toast } = useToast();
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setParcels(sampleAgentData.parcels);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleAction = (message) => {
    toast({ title: "Action Simulée", description: message });
  };

  const filteredParcels = parcels.filter(parcel => 
    parcel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parcel.id.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-3xl font-bold">Mes Parcelles Assignées</h1>
        <Button onClick={() => handleAction("Ouverture du formulaire d'ajout de parcelle.")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une Parcelle
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher une parcelle..." 
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">ID</th>
                  <th className="text-left p-2 font-semibold">Nom</th>
                  <th className="text-left p-2 font-semibold">Client Associé</th>
                  <th className="text-left p-2 font-semibold">Statut</th>
                  <th className="text-right p-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParcels.map(parcel => (
                  <tr key={parcel.id} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-mono">{parcel.id}</td>
                    <td className="p-2 font-medium">{parcel.name}</td>
                    <td className="p-2">{parcel.client || 'Aucun'}</td>
                    <td className="p-2"><Badge>{parcel.status}</Badge></td>
                    <td className="p-2 text-right space-x-1">
                      <Button asChild variant="ghost" size="icon"><Link to={`/parcelles/${parcel.id}`}><Eye className="h-4 w-4" /></Link></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleAction(`Modification de la parcelle ${parcel.name}.`)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleAction(`Planification d'une visite pour ${parcel.name}.`)}><CalendarPlus className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredParcels.length === 0 && <p className="text-center text-muted-foreground py-8">Aucune parcelle trouvée.</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AgentParcelsPage;