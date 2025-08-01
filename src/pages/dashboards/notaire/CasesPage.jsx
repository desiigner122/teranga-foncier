import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Search, Filter, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/spinner';

const initialCases = [
  { id: 'DOS001', parcelId: 'dk-alm-002', type: 'Vente', status: 'Signature Contrat', client: 'Moussa Diop' },
  { id: 'DOS002', parcelId: 'sly-ngp-010', type: 'Vente', status: 'Vérification Fiscale', client: 'Aïssatou Gueye' },
  { id: 'DOS003', parcelId: 'ths-ext-021', type: 'Succession', status: 'En attente documents', client: 'Famille Sarr' },
];

const CasesPage = () => {
  const { toast } = useToast();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCases(initialCases);
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
      <h1 className="text-3xl font-bold flex items-center"><Briefcase className="mr-3 h-8 w-8"/>Dossiers en Cours</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Suivi des Dossiers Actifs</CardTitle>
          <div className="flex space-x-2 pt-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par parcelle, client..." className="pl-8" />
            </div>
            <Button variant="outline" onClick={() => handleAction("Filtres de dossiers appliqués.")}><Filter className="mr-2 h-4 w-4" /> Filtrer</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Parcelle</th>
                  <th className="text-left p-2 font-semibold">Client</th>
                  <th className="text-left p-2 font-semibold">Type</th>
                  <th className="text-left p-2 font-semibold">Étape Actuelle</th>
                  <th className="text-right p-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.map(c => (
                  <tr key={c.id} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-mono"><Link to={`/parcelles/${c.parcelId}`} className="text-primary hover:underline">{c.parcelId}</Link></td>
                    <td className="p-2">{c.client}</td>
                    <td className="p-2">{c.type}</td>
                    <td className="p-2"><Badge>{c.status}</Badge></td>
                    <td className="p-2 text-right">
                      <Button variant="outline" size="sm" onClick={() => handleAction(`Ouverture du dossier ${c.id}`)}><Eye className="mr-1 h-4 w-4" />Dossier</Button>
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

export default CasesPage;