import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scale, PlusCircle, Search, Filter, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/spinner';

const initialValuations = [
  { id: 'VAL001', parcelId: 'DK-ALM-002', date: '2025-06-10', valeur: '150M XOF', methode: 'Comparaison Marché' },
  { id: 'VAL002', parcelId: 'SLY-NGP-010', date: '2025-06-08', valeur: '32M XOF', methode: 'Coût de Remplacement' },
  { id: 'VAL003', parcelId: 'DMN-CIT-005', date: '2025-06-05', valeur: '25M XOF', methode: 'Comparaison Marché' },
];

const LandValuationPage = () => {
  const { toast } = useToast();
  const [valuations, setValuations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setValuations(initialValuations);
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
        <h1 className="text-3xl font-bold flex items-center"><Scale className="mr-3 h-8 w-8"/>Évaluation Foncière</h1>
        <Button onClick={() => handleAction("Lancement d'une nouvelle évaluation.")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Nouvelle Évaluation
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Historique des Évaluations</CardTitle>
          <div className="flex space-x-2 pt-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par parcelle..." className="pl-8" />
            </div>
            <Button variant="outline" onClick={() => handleAction("Filtres d'évaluations appliqués.")}><Filter className="mr-2 h-4 w-4" /> Filtrer</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Parcelle</th>
                  <th className="text-left p-2 font-semibold">Date</th>
                  <th className="text-left p-2 font-semibold">Valeur Estimée</th>
                  <th className="text-left p-2 font-semibold">Méthode</th>
                  <th className="text-right p-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {valuations.map(v => (
                  <tr key={v.id} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-mono">{v.parcelId}</td>
                    <td className="p-2">{v.date}</td>
                    <td className="p-2 font-medium">{v.valeur}</td>
                    <td className="p-2">{v.methode}</td>
                    <td className="p-2 text-right">
                      <Button variant="outline" size="sm" onClick={() => handleAction(`Téléchargement du rapport d'évaluation ${v.id}.`)}><Download className="mr-1 h-4 w-4" /> Rapport</Button>
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

export default LandValuationPage;