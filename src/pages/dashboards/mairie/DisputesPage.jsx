import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, PlusCircle, Search, Filter, Gavel } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/spinner';

const initialDisputes = [
  { id: 'LIT001', parcelId: 'DK-YOF-007', parties: 'Voisin A vs Voisin B', type: 'Limite de propriété', status: 'En médiation' },
  { id: 'LIT002', parcelId: 'SLY-NGP-010', parties: 'Héritiers Famille Faye', type: 'Succession', status: 'Résolu' },
  { id: 'LIT003', parcelId: 'THS-EXT-021', parties: 'Promoteur vs Association locale', type: 'Droit de passage', status: 'Nouveau' },
];

const DisputesPage = () => {
  const { toast } = useToast();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisputes(initialDisputes);
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
        <h1 className="text-3xl font-bold flex items-center"><AlertTriangle className="mr-3 h-8 w-8"/>Gestion des Litiges Fonciers</h1>
        <Button onClick={() => handleAction("Ouverture du formulaire de déclaration de litige.")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Nouveau Litige
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suivi des Litiges</CardTitle>
          <div className="flex space-x-2 pt-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par parcelle, parties..." className="pl-8" />
            </div>
            <Button variant="outline" onClick={() => handleAction("Filtres de litiges appliqués.")}><Filter className="mr-2 h-4 w-4" /> Filtrer</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Parcelle</th>
                  <th className="text-left p-2 font-semibold">Parties Impliquées</th>
                  <th className="text-left p-2 font-semibold">Type de Litige</th>
                  <th className="text-left p-2 font-semibold">Statut</th>
                  <th className="text-right p-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map(d => (
                  <tr key={d.id} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-mono">{d.parcelId}</td>
                    <td className="p-2">{d.parties}</td>
                    <td className="p-2">{d.type}</td>
                    <td className="p-2"><Badge variant={d.status === 'Résolu' ? 'success' : d.status === 'Nouveau' ? 'warning' : 'secondary'}>{d.status}</Badge></td>
                    <td className="p-2 text-right">
                      <Button variant="outline" size="sm" onClick={() => handleAction(`Ouverture du dossier de médiation pour ${d.id}.`)}><Gavel className="mr-1 h-4 w-4" />Médiation</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DisputesPage;