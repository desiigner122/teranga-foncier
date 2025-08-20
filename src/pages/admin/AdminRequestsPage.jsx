import React, { useState, useEffect, useCallback } from 'react';
import { useRealtimeTable, useRealtimeUsers, useRealtimeParcels, useRealtimeParcelSubmissions } from '@/hooks/useRealtimeTable';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Edit, Trash2, FileSignature, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/lib/supabaseClient';

const AdminRequestsPage = () => {
  const { data: requests, loading: requestsLoading, error: requestsError, refetch } = useRealtimeRequests();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (requests) {
      setFilteredData(requests);
    }
  }, [requests]);
  
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleUpdateRequestStatus = async (requestId, newStatus, requestType) => {
    try {
      const { error } = await supabase
        .from('requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Statut de la demande mis à jour",
        description: `La demande de type "${requestType}" est maintenant "${newStatus}".`,
      });
      fetchRequests(); // Recharger les demandes après la mise à jour
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur de mise à jour du statut",
        description: err.message,
      });
    }
  };

  const handleDeleteRequest = async (requestId, requestType) => {
    try {
      const { error } = await supabase.from('requests').delete().eq('id', requestId);
      if (error) throw error;
      
      toast({
        title: "Demande supprimée",
        description: `La demande de type "${requestType}" a été supprimée.`,
      });
      fetchRequests(); // Recharger après suppression
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur de suppression",
        description: err.message,
      });
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'destructive';
      case 'completed':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px] text-red-600">
        <p>Erreur: {error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 p-4 md:p-6 lg:p-8"
    >
      <h1 className="text-3xl font-bold flex items-center">
        <FileSignature className="mr-3 h-8 w-8"/>
        Gestion des Demandes
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Filtrer et Rechercher les Demandes</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par type de demande ou statut..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvée</SelectItem>
                <SelectItem value="rejected">Rejetée</SelectItem>
                <SelectItem value="completed">Terminée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucune demande trouvée.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Demandeur</TableHead>
                    <TableHead>Type de Demande</TableHead>
                    <TableHead>Parcelle Concernée</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.users?.full_name || 'N/A'}
                        <p className="text-xs text-muted-foreground">{request.users?.email}</p>
                      </TableCell>
                      <TableCell className="capitalize">{request.request_type}</TableCell>
                      <TableCell>
                        {request.parcels ? (
                          <Link to={`/parcelles/${request.parcel_id}`} className="text-primary hover:underline">
                            {request.parcels.name || request.parcels.reference}
                          </Link>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(request.status)}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          title="Approuver"
                          onClick={() => handleUpdateRequestStatus(request.id, 'approved', request.request_type)}
                          disabled={request.status === 'approved' || request.status === 'rejected' || request.status === 'completed'}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" /> Approuver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          title="Rejeter"
                          onClick={() => handleUpdateRequestStatus(request.id, 'rejected', request.request_type)}
                          disabled={request.status === 'approved' || request.status === 'rejected' || request.status === 'completed'}
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Rejeter
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" title="Supprimer" className="text-red-600 hover:text-red-800 ml-2">
                              <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action supprimera définitivement la demande de type "{request.request_type}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteRequest(request.id, request.request_type)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminRequestsPage;
