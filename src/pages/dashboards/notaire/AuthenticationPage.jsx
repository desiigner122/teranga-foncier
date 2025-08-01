import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gavel, PlusCircle, Search, Filter, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/spinner';

const initialAuthRequests = [
  { id: 'AUTH001', type: 'Acte de Vente', parcelId: 'DK-ALM-002', status: 'En attente' },
  { id: 'AUTH002', type: 'Acte de Succession', parcelId: 'SLY-NGP-010', status: 'Vérifié' },
  { id: 'AUTH003', type: 'Contrat de Bail', parcelId: 'DMN-CIT-005', status: 'En attente' },
];

const AuthenticationPage = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRequests(initialAuthRequests);
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
        <h1 className="text-3xl font-bold flex items-center"><Gavel className="mr-3 h-8 w-8"/>Authentification d'Actes</h1>
        <Button onClick={() => handleAction("Ouverture du formulaire de soumission d'acte.")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Soumettre un Acte
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actes en Attente d'Authentification</CardTitle>
          <div className="flex space-x-2 pt-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par parcelle, type..." className="pl-8" />
            </div>
            <Button variant="outline" onClick={() => handleAction("Filtres d'authentification appliqués.")}><Filter className="mr-2 h-4 w-4" /> Filtrer</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Parcelle</th>
                  <th className="text-left p-2 font-semibold">Type d'Acte</th>
                  <th className="text-left p-2 font-semibold">Statut</th>
                  <th className="text-right p-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-mono">{req.parcelId}</td>
                    <td className="p-2">{req.type}</td>
                    <td className="p-2"><Badge variant={req.status === 'Vérifié' ? 'success' : 'warning'}>{req.status}</Badge></td>
                    <td className="p-2 text-right space-x-1">
                      <Button variant="outline" size="sm" onClick={() => handleAction(`Vérification du dossier ${req.id}.`)}>Vérifier</Button>
                      <Button variant="ghost" size="icon" onClick={() => handleAction(`Authentification de l'acte ${req.id}.`)}><CheckCircle className="h-4 w-4 text-green-500"/></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleAction(`Rejet de l'acte ${req.id}.`)}><XCircle className="h-4 w-4 text-red-500"/></Button>
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

export default AuthenticationPage;