// src/pages/admin/AdminContractsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Search, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { jsPDF } from "jspdf";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

const AdminContractsPage = () => {
  const { toast } = useToast();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // --- REQUÊTE FINALE AVEC LE NOM EXACT DE LA CONTRAINTE ---
      // J'utilise fk_contracts_user_id (de votre screenshot) et je suppose fk_contracts_parcel_id pour la parcelle.
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          user:users!fk_contracts_user_id(*),
          parcel:parcels!contracts_parcel_id_fkey(*)
        `)
        .order('date', { ascending: false });

      if (error) throw error;

      const formattedContracts = data.map(contract => ({
        id: contract.id,
        type: contract.type,
        parcelId: contract.parcel?.reference || 'N/A',
        parcelName: contract.parcel?.name || 'N/A',
        userName: contract.user?.full_name || 'N/A',
        userEmail: contract.user?.email || 'N/A',
        date: new Date(contract.date).toLocaleDateString('fr-FR'),
        status: contract.status,
        rawContract: contract,
      }));
      setContracts(formattedContracts || []);
    } catch (err) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Erreur de chargement des contrats",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const filteredContracts = contracts.filter(contract =>
    (contract.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contract.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contract.parcelId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contract.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contract.status || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generatePdf = (contract) => {
    const doc = new jsPDF();
    doc.text(`Contrat ID: ${contract.id}`, 10, 10);
    doc.text(`Type: ${contract.type}`, 10, 20);
    doc.text(`Parcelle: ${contract.parcelName} (${contract.parcelId})`, 10, 30);
    doc.text(`Client: ${contract.userName} (${contract.userEmail})`, 10, 40);
    doc.text(`Date: ${contract.date}`, 10, 50);
    doc.text(`Statut: ${contract.status}`, 10, 60);
    doc.save(`contrat-${contract.id}.pdf`);
  };
  
  const handleViewDetails = (contractId) => {
    toast({ title: "Détails Contrat", description: `Affichage des détails pour ${contractId}. (À implémenter)` });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full min-h-[500px]"><LoadingSpinner size="large" /></div>;
  }
  if (error) {
    return <div className="flex items-center justify-center h-full min-h-[500px] text-red-600"><p>Erreur: {error}</p></div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 p-4 md:p-6 lg:p-8"
    >
      <h1 className="text-3xl font-bold flex items-center"><FileText className="mr-3 h-8 w-8"/>Gestion des Contrats</h1>
      <p className="text-muted-foreground">Visualisez et gérez tous les contrats fonciers sur la plateforme.</p>

      <Card>
        <CardHeader>
          <CardTitle>Rechercher des Contrats</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par ID, type, parcelle, nom client ou statut..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredContracts.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Aucun contrat trouvé.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Parcelle</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-mono text-xs">{contract.id}</TableCell>
                      <TableCell>{contract.type}</TableCell>
                      <TableCell>{contract.parcelId}</TableCell>
                      <TableCell>{contract.userName}</TableCell>
                      <TableCell>{contract.date}</TableCell>
                      <TableCell><Badge variant={contract.status === 'Signé' ? 'success' : 'secondary'}>{contract.status}</Badge></TableCell>
                      <TableCell className="text-right flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" title="Télécharger PDF" onClick={() => generatePdf(contract)}>
                           <Download className="h-4 w-4"/>
                        </Button>
                        <Button variant="ghost" size="sm" title="Détails" onClick={() => handleViewDetails(contract.id)}>
                          <Eye className="h-4 w-4"/>
                        </Button>
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

export default AdminContractsPage;
