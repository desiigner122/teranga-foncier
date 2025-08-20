import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSignature, Search, Filter, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SupabaseDataService } from '@/services/supabaseDataService';
import LoadingSpinner from '@/components/ui/spinner';
import { useAuth } from '@/context/AuthContext';

const MairieRequestsPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const loadMairieRequests = async () => {
      try {
        setLoading(true);
        
        if (user && user.id) {
          // Utiliser la nouvelle méthode pour récupérer les demandes destinées spécifiquement à cette mairie
          const mairieRequests = await SupabaseDataService.getRequestsByRecipient(user.id, 'mairie');
          setRequests(mairieRequests);
        } else {
          // Fallback: récupérer toutes les demandes de type mairie si pas d'utilisateur spécifique
          const allRequests = await SupabaseDataService.getRequests();
          const mairieRequests = allRequests.filter(r => 
            r.recipient_type === 'Mairie' || 
            r.category === 'municipal' ||
            r.type === 'land_request'
          );
          setRequests(mairieRequests);
        }
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
  }, [user]);

  const handleRequestAction = async (requestId, action, status) => {
    try {
      const updated = await SupabaseDataService.updateRequestStatus(requestId, status);
      toast({ title: `Demande ${action}`, description: `Statut: ${updated.status}` });
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: updated.status } : r));
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: `Action impossible (${error.message})` });
    }
  };

  const filtered = requests.filter(r => {
    const matchSearch = !search || (r.user_name || r.full_name || '').toLowerCase().includes(search.toLowerCase()) || (r.request_type || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || (r.status || '').toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
  });

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
              <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher par demandeur ou type..." className="pl-8" />
            </div>
            <select className="border rounded px-2 text-sm" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
              <option value="all">Tous statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvé</option>
              <option value="rejected">Rejeté</option>
            </select>
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
                {filtered.map(req => (
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
                        <Button variant="outline" size="sm" onClick={() => handleRequestAction(req.id,'Instruite','in_review')}>
                          Instruire
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleRequestAction(req.id,'Approuvée','approved')}>
                          <CheckCircle className="h-4 w-4 text-green-500"/>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleRequestAction(req.id,'Rejetée','rejected')}>
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