import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Filter, AlertCircle, ShieldCheck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/spinner';

const initialOpportunities = [
  { id: 'OPP001', name: 'Terrain bord de mer Popenguine', potentiel: 'Touristique Haut Standing', prixEst: '75M XOF', risque: 'Faible', dueDiligence: 'Disponible' },
  { id: 'OPP002', name: 'Parcelle industrielle Diamniadio', potentiel: 'Logistique / Usine', prixEst: '120M XOF', risque: 'Moyen', dueDiligence: 'Demandable' },
  { id: 'OPP003', name: 'Lot résidentiel Thiès Plateau', potentiel: 'Résidentiel moyen standing', prixEst: '20M XOF', risque: 'Faible', dueDiligence: 'Partielle' },
];

const OpportunitiesPage = () => {
  const { toast } = useToast();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpportunities(initialOpportunities);
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
      <h1 className="text-3xl font-bold flex items-center"><Search className="mr-3 h-8 w-8"/>Opportunités d'Investissement</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Terrains à Potentiel Sélectionnés</CardTitle>
          <div className="flex space-x-2 pt-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par zone, potentiel..." className="pl-8" />
            </div>
            <Button variant="outline" onClick={() => handleAction("Filtres d'opportunités appliqués.")}><Filter className="mr-2 h-4 w-4" /> Filtrer</Button>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {opportunities.map(opp => (
              <li key={opp.id} className="p-4 border rounded-lg flex justify-between items-center hover:bg-muted/50">
                <div>
                  <p className="font-semibold">{opp.name}</p>
                  <p className="text-sm text-muted-foreground">Potentiel: {opp.potentiel} | Prix Est.: {opp.prixEst}</p>
                  <p className="text-sm">Risque: <Badge variant={opp.risque === 'Faible' ? 'success' : 'warning'}>{opp.risque}</Badge> | Due Diligence: <Badge variant="secondary">{opp.dueDiligence}</Badge></p>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleAction(`Demande de Due Diligence pour ${opp.name}.`)}><ShieldCheck className="mr-1 h-4 w-4" /> Due Diligence</Button>
                  <Button size="sm" onClick={() => handleAction(`Ajout de ${opp.name} à la liste de suivi.`)}><AlertCircle className="mr-1 h-4 w-4" /> Suivre</Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OpportunitiesPage;