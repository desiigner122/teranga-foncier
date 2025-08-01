import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSignature, Search, Filter, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { sampleRequests, sampleUsers } from '@/data';
import LoadingSpinner from '@/components/ui/spinner';

const initialMairieRequests = sampleRequests.filter(r => r.recipient === 'Mairie de Saly');

const MairieRequestsPage = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRequests(initialMairieRequests);
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
      <h1 className="text-3xl font-bold flex items-center"><FileSignature className="mr-3 h-8 w-8"/>Demandes Administratives</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Suivi des Demandes (Permis, DIA, etc.)</CardTitle>
          <div className="flex space-x-2 pt-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par demandeur, parcelle..." className="pl-8" />
            </div>
            <Button variant="outline" onClick={() => handleAction("Filtres de demandes appliqués.")}><Filter className="mr-2 h-4 w-4" /> Filtrer</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Demandeur</th>
                  <th className="text-left p-2 font-semibold">Type</th>
                  <th className="text-left p-2 font-semibold">Objet</th>
                  <th className="text-left p-2 font-semibold">Statut</th>
                  <th className="text-right p-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => {
                  const user = sampleUsers.find(u => u.id === req.user_id);
                  return (
                    <tr key={req.id} className="border-b hover:bg-muted/30">
                      <td className="p-2">{user?.name || 'N/A'}</td>
                      <td className="p-2 capitalize">{req.request_type}</td>
                      <td className="p-2 text-muted-foreground">{req.message.substring(0, 50)}...</td>
                      <td className="p-2"><Badge variant={req.status === 'Nouvelle' ? 'warning' : 'secondary'}>{req.status}</Badge></td>
                      <td className="p-2 text-right space-x-1">
                        <Button variant="outline" size="sm" onClick={() => handleAction(`Instruction du dossier ${req.id}.`)}>Instruire</Button>
                        <Button variant="ghost" size="icon" onClick={() => handleAction(`Approbation du dossier ${req.id}.`)}><CheckCircle className="h-4 w-4 text-green-500"/></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleAction(`Rejet du dossier ${req.id}.`)}><XCircle className="h-4 w-4 text-red-500"/></Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MairieRequestsPage;