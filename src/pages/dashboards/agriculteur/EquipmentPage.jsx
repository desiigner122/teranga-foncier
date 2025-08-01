import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tractor, Wrench, PlusCircle, Calendar, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/spinner';

const initialEquipmentData = [
  { id: 'EQ001', name: 'Tracteur John Deere 5055E', type: 'Tracteur', status: 'Opérationnel', nextMaintenance: '2025-09-15', location: 'Champ Kagnout 1' },
  { id: 'EQ002', name: 'Pulvérisateur Hardi', type: 'Pulvérisateur', status: 'En maintenance', nextMaintenance: '2025-07-25', location: 'Atelier' },
  { id: 'EQ003', name: 'Motopompe', type: 'Pompe', status: 'Opérationnel', nextMaintenance: '2025-10-01', location: 'Maraîchage Niayes' },
];

const EquipmentPage = () => {
  const { toast } = useToast();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setEquipment(initialEquipmentData);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleAction = (message) => {
    toast({ title: "Action Simulée", description: message });
  };

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
        <h1 className="text-3xl font-bold flex items-center"><Tractor className="mr-3 h-8 w-8"/>Gestion d'Équipement</h1>
        <Button onClick={() => handleAction("Ouverture du formulaire d'ajout d'équipement.")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Équipement
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un équipement..." className="pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {equipment.map(eq => (
              <Card key={eq.id}>
                <CardHeader>
                  <CardTitle>{eq.name}</CardTitle>
                  <CardDescription>{eq.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Statut: <Badge variant={eq.status === 'Opérationnel' ? 'success' : 'warning'}>{eq.status}</Badge></p>
                  <p className="text-sm">Localisation: {eq.location}</p>
                  <p className="text-sm">Prochaine maintenance: {eq.nextMaintenance}</p>
                  <div className="flex space-x-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => handleAction(`Planification de la maintenance pour ${eq.name}.`)}><Calendar className="mr-1 h-4 w-4" /> Planifier</Button>
                    <Button variant="outline" size="sm" onClick={() => handleAction(`Déclaration d'une panne pour ${eq.name}.`)}><Wrench className="mr-1 h-4 w-4" /> Panne</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EquipmentPage;