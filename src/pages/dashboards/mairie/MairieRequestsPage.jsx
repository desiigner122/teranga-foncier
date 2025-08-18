import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSignature, Search, Filter, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import SupabaseDataService from '@/services/supabaseDataService';
import LoadingSpinner from '@/components/ui/spinner';

const MairieRequestsPage = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMairieRequests = async () => {
      try {
        setLoading(true);
        // Récupérer les demandes destinées à la mairie
        const allRequests = await SupabaseDataService.getRequests();
        const mairieRequests = allRequests.filter(r => 
          r.recipient_type === 'Mairie' || 
          r.category === 'municipal' ||
          r.type === 'land_request'
        );
        setRequests(mairieRequests);
      } catch (error) {
        console.error('Erreur chargement demandes mairie:', error);
        toast({ 
          variant: "destructive",
          title: "Erreur", 
          description: "Impossible de charger les demandes" 
        });
      } finally {
        setLoading(false);
      }
    };

    loadMairieRequests();
  }, []);

  const handleRequestAction = async (requestId, action, status) => {
    try {
      await SupabaseDataService.updateRequestStatus(requestId, status);
      toast({ 
        title: `Demande ${action}`, 
        description: `La demande a été ${action.toLowerCase()}` 
      });
      
      // Recharger les demandes
      setRequests(prev => prev.map(r => 
        r.id === requestId ? { ...r, status } : r
      ));
    } catch (error) {
      toast({ 
        variant: "destructive",
        title: "Erreur", 
        description: `Impossible de ${action.toLowerCase()} la demande` 
      });
    }
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
                {requests.map(req => (
                    <tr key={req.id} className="border-b hover:bg-muted/30">
                      <td className="p-2">{req.user_name || req.full_name || 'Utilisateur inconnu'}</td>
                      <td className="p-2 capitalize">{req.request_type || req.type}</td>
                      <td className="p-2 text-muted-foreground">{(req.message || req.description || '').substring(0, 50)}...</td>
                      <td className="p-2">
                        <Badge variant={
                          req.status === 'pending' || req.status === 'Nouvelle' ? 'warning' : 
                          req.status === 'approved' ? 'default' : 
                          'secondary'
                        }>
                          {req.status}
                        </Badge>
                      </td>
                      <td className="p-2 text-right space-x-1">
                        <Button variant="outline" size="sm" onClick={() => handleRealAction('instruction', `Instruction du dossier ${req.id}.`)}>
                          Instruire
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleRealAction('approval', `Approbation du dossier ${req.id}.`)}>
                          <CheckCircle className="h-4 w-4 text-green-500"/>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleRealAction('rejection', `Rejet du dossier ${req.id}.`)}>
                          <XCircle className="h-4 w-4 text-red-500"/>
                        </Button>
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

export default MairieRequestsPage;