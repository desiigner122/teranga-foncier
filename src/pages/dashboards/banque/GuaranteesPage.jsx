import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Search, Filter, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/spinner';

const initialGuarantees = [
  { id: 'GAR001', parcelId: 'DK-ALM-002', valeur: '150M XOF', risque: 'Faible', client: 'Promoteur Immo SA' },
  { id: 'GAR002', parcelId: 'ZG-AGRI-001', valeur: '50M XOF', risque: 'Moyen', client: 'Agri-Business SA' },
  { id: 'GAR003', parcelId: 'SLY-NGP-010', valeur: '30M XOF', risque: 'Faible', client: 'Particulier M. Ba' },
];

const GuaranteesPage = () => {
  const { toast } = useToast();
  const [guarantees, setGuarantees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setGuarantees(initialGuarantees);
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
      <h1 className="text-3xl font-bold flex items-center"><ShieldCheck className="mr-3 h-8 w-8"/>Portefeuille de Garanties</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Suivi des Garanties Foncières</CardTitle>
          <div className="flex space-x-2 pt-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par parcelle, client..." className="pl-8" />
            </div>
            <Button variant="outline" onClick={() => handleAction("Filtres de garanties appliqués.")}><Filter className="mr-2 h-4 w-4" /> Filtrer</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Parcelle (Garantie)</th>
                  <th className="text-left p-2 font-semibold">Client</th>
                  <th className="text-left p-2 font-semibold">Valeur Estimée</th>
                  <th className="text-left p-2 font-semibold">Niveau de Risque</th>
                  <th className="text-right p-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {guarantees.map(g => (
                  <tr key={g.id} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-mono">{g.parcelId}</td>
                    <td className="p-2">{g.client}</td>
                    <td className="p-2">{g.valeur}</td>
                    <td className="p-2"><Badge variant={g.risque === 'Faible' ? 'success' : 'warning'}>{g.risque}</Badge></td>
                    <td className="p-2 text-right">
                      <Button asChild variant="outline" size="sm"><Link to={`/parcelles/${g.parcelId}`}><Eye className="mr-1 h-4 w-4" />Détails</Link></Button>
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

export default GuaranteesPage;