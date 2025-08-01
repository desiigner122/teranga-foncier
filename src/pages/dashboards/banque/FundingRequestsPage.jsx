import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Banknote, Search, Filter, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/spinner';

const initialFundingRequests = [
  { id: 'FIN001', client: 'Promoteur Immo SA', projet: 'Résidence Les Filaos', montant: '1 Md XOF', garantie: 'DK-ALM-002', statut: 'Approuvée' },
  { id: 'FIN002', client: 'Agri-Business SA', projet: 'Extension Verger', montant: '250M XOF', garantie: 'ZG-AGRI-001', statut: 'En étude' },
  { id: 'FIN003', client: 'Particulier M. Ba', projet: 'Achat terrain Saly', montant: '25M XOF', garantie: 'SLY-NGP-010', statut: 'Rejetée' },
];

const FundingRequestsPage = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRequests(initialFundingRequests);
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
      <h1 className="text-3xl font-bold flex items-center"><Banknote className="mr-3 h-8 w-8"/>Demandes de Financement</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Suivi des Demandes</CardTitle>
          <div className="flex space-x-2 pt-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par client, projet..." className="pl-8" />
            </div>
            <Button variant="outline" onClick={() => handleAction("Filtres de demandes appliqués.")}><Filter className="mr-2 h-4 w-4" /> Filtrer</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Client / Projet</th>
                  <th className="text-left p-2 font-semibold">Montant</th>
                  <th className="text-left p-2 font-semibold">Garantie (Parcelle)</th>
                  <th className="text-left p-2 font-semibold">Statut</th>
                  <th className="text-right p-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id} className="border-b hover:bg-muted/30">
                    <td className="p-2">
                      <p className="font-medium">{req.client}</p>
                      <p className="text-xs text-muted-foreground">{req.projet}</p>
                    </td>
                    <td className="p-2">{req.montant}</td>
                    <td className="p-2 font-mono">{req.garantie}</td>
                    <td className="p-2"><Badge variant={req.statut === 'Approuvée' ? 'success' : req.statut === 'En étude' ? 'warning' : 'destructive'}>{req.statut}</Badge></td>
                    <td className="p-2 text-right space-x-1">
                      <Button variant="outline" size="sm" onClick={() => handleAction(`Étude du dossier ${req.id}.`)}>Étudier</Button>
                      <Button variant="ghost" size="icon" onClick={() => handleAction(`Approbation du dossier ${req.id}.`)}><CheckCircle className="h-4 w-4 text-green-500"/></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleAction(`Rejet du dossier ${req.id}.`)}><XCircle className="h-4 w-4 text-red-500"/></Button>
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

export default FundingRequestsPage;