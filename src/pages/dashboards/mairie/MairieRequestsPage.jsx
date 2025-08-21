import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, FileSignature, XCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import SupabaseDataService from '../../../services/supabaseDataService';
import { motion } from 'framer-motion';
import { useToast } from '../../../components/ui/use-toast';
import { useAuth } from '../../../context/AuthContext';
import { useRealtimeTable } from '../../../hooks/useRealtimeTable';
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from "../../components/ui/table";

const MairieRequestsPage = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: requests, loading: requestsLoading, error: requestsError, refetch } = useRealtimeTable('requests');
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    if (requests) {
      const mairieRequests = requests.filter(r => {
        if (user && user.id) {
          // Requests for a mairie might have a recipient_id matching the mairie user's id
          // This logic assumes such a field exists on the request objects.
          return (r.recipient_id === user.id && r.recipient_type === 'mairie') ||
                 (r.recipient_type === 'Mairie' || r.category === 'municipal' || r.type === 'land_request');
        }
        // Fallback for general mairie-related requests if no specific user context
        return r.recipient_type === 'Mairie' || r.category === 'municipal' || r.type === 'land_request';
      });
      setFilteredData(mairieRequests);
    }
  }, [requests, user]);

  const handleRequestAction = async (requestId, action, status) => {
    try {
      const updated = await SupabaseDataService.updateRequestStatus(requestId, status);
      toast({ title: `Demande ${action}`, description: `Statut: ${updated.status}` });
      refetch();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: `Action impossible (${error.message})` });
    }
  };

  const filtered = filteredData.filter(r => {
    const matchSearch = !search || (r.user_name || r.full_name || '').toLowerCase().includes(search.toLowerCase()) || (r.request_type || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || (r.status || '').toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
  });

  if (requestsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  if (requestsError) {
    return <div className="text-red-500">Erreur de chargement des données.</div>;
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

