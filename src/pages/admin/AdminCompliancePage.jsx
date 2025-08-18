import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldCheck, PlusCircle, Edit, Trash2, Search, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/ui/spinner';
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminCompliancePage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [complianceChecks, setComplianceChecks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCheck, setCurrentCheck] = useState(null); // Vérification en cours de modification
  const [formData, setFormData] = useState({
    entity_id: '',
    entity_type: '',
    check_type: '',
    status: 'en_cours',
    details: '', // Stockera un JSON stringifié
    check_date: new Date().toISOString().split('T')[0], // Date du jour par défaut
  });
  const { toast } = useToast();

  const fetchComplianceChecks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('compliance_checks')
        .select('*')
        .order('check_date', { ascending: false });

      if (error) throw error;
      setComplianceChecks(data || []);
    } catch (err) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Erreur de chargement des vérifications de conformité",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchComplianceChecks();
  }, [fetchComplianceChecks]);

  const handleAddCheckClick = () => {
    setCurrentCheck(null);
    setFormData({
      entity_id: '',
      entity_type: '',
      check_type: '',
      status: 'en_cours',
      details: '',
      check_date: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleEditCheckClick = (check) => {
    setCurrentCheck(check);
    setFormData({
      entity_id: check.entity_id || '',
      entity_type: check.entity_type || '',
      check_type: check.check_type || '',
      status: check.status || 'en_cours',
      details: check.details ? JSON.stringify(check.details, null, 2) : '', // Convertir l'objet JSON en string
      check_date: check.check_date ? new Date(check.check_date).toISOString().split('T')[0] : '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteCheck = async (checkId) => {
    try {
      const { error } = await supabase.from('compliance_checks').delete().eq('id', checkId);
      if (error) throw error;
      
      setComplianceChecks(prevChecks => prevChecks.filter(check => check.id !== checkId));
      toast({
        title: "Vérification supprimée",
        description: "La vérification de conformité a été supprimée.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur de suppression",
        description: err.message,
      });
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let parsedDetails = null;
      if (formData.details) {
        try {
          parsedDetails = JSON.parse(formData.details);
        } catch (jsonError) {
          throw new Error("Les détails doivent être un JSON valide.");
        }
      }

      const dataToSave = {
        ...formData,
        details: parsedDetails, // Sauvegarder l'objet JSON
      };

      if (currentCheck) {
        const { error } = await supabase
          .from('compliance_checks')
          .update(dataToSave)
          .eq('id', currentCheck.id);
        if (error) throw error;
        toast({ title: "Vérification mise à jour", description: "La vérification de conformité a été mise à jour." });
      } else {
        const { error } = await supabase
          .from('compliance_checks')
          .insert([dataToSave]);
        if (error) throw error;
        toast({ title: "Vérification ajoutée", description: "Une nouvelle vérification de conformité a été ajoutée." });
      }
      setIsModalOpen(false);
      fetchComplianceChecks();
    } catch (err) {
      toast({
        variant: "destructive",
        title: `Erreur lors de l'${currentCheck ? 'mise à jour' : 'ajout'} de la vérification`,
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCheck(null);
    setFormData({
      entity_id: '', entity_type: '', check_type: '', status: 'en_cours', details: '', check_date: new Date().toISOString().split('T')[0],
    });
  };

  if (loading && complianceChecks.length === 0) {
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center">
          <ShieldCheck className="mr-3 h-8 w-8"/>
          Gestion de la Conformité
        </h1>
        <Button onClick={handleAddCheckClick}>
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une vérification
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Vérifications</CardTitle>
          <CardDescription>Gérez les statuts de conformité des entités.</CardDescription>
        </CardHeader>
        <CardContent>
          {complianceChecks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucune vérification de conformité trouvée.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Entité</TableHead>
                    <TableHead>Type Entité</TableHead>
                    <TableHead>Type Vérif.</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceChecks.map((check) => (
                    <TableRow key={check.id}>
                      <TableCell className="font-medium">{check.entity_id}</TableCell>
                      <TableCell>{check.entity_type}</TableCell>
                      <TableCell>{check.check_type}</TableCell>
                      <TableCell>
                        <Badge variant={check.status === 'conforme' ? 'success' : check.status === 'non_conforme' ? 'destructive' : 'secondary'}>
                          {check.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(check.check_date).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell className="text-right flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" title="Modifier" onClick={() => handleEditCheckClick(check)}>
                          <Edit className="h-4 w-4"/>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" title="Supprimer" className="text-red-600 hover:text-red-800">
                              <Trash2 className="h-4 w-4"/>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action supprimera définitivement cette vérification de conformité.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCheck(check.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Supprimer</AlertDialogAction>
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

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-6">
          <DialogHeader>
            <DialogTitle>{currentCheck ? 'Modifier la vérification' : 'Ajouter une nouvelle vérification'}</DialogTitle>
            <DialogDescription>
              {currentCheck ? 'Modifiez les informations de la vérification de conformité.' : 'Remplissez les informations pour ajouter une nouvelle vérification.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="entity_id" className="text-right">ID Entité</Label>
              <Input id="entity_id" value={formData.entity_id} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="entity_type" className="text-right">Type Entité</Label>
              <Select value={formData.entity_type} onValueChange={(value) => handleSelectChange('entity_type', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un type d'entité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parcel">Parcelle</SelectItem>
                  <SelectItem value="user">Utilisateur</SelectItem>
                  <SelectItem value="contract">Contrat</SelectItem>
                  <SelectItem value="transaction">Transaction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="check_type" className="text-right">Type Vérification</Label>
              <Input id="check_type" value={formData.check_type} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="check_date" className="text-right">Date Vérification</Label>
              <Input id="check_date" type="date" value={formData.check_date} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Statut</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_cours">En Cours</SelectItem>
                  <SelectItem value="conforme">Conforme</SelectItem>
                  <SelectItem value="non_conforme">Non Conforme</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="details" className="text-right">Détails (JSON)</Label>
              <Textarea
                id="details"
                value={formData.details}
                onChange={handleInputChange}
                placeholder='Ex: {"reason": "Missing document", "document_id": "xyz"}'
                rows={5}
                className="col-span-3"
              />
              <p className="col-span-4 text-xs text-muted-foreground mt-1 text-right">Doit être un JSON valide.</p>
            </div>
            <DialogFooter className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={closeModal}>Annuler</Button>
              <Button type="submit" disabled={loading}>
                {loading && <LoadingSpinner size="small" className="mr-2" />}
                {currentCheck ? 'Mettre à Jour' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminCompliancePage;
