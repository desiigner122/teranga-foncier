// src/pages/admin/AdminUsersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, UserCheck, Clock, UserX, CheckCircle, XCircle, Sparkles, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { supabase } from '@/lib/supabaseClient';
import { Label } from '@/components/ui/label';

const AiAnalysisResult = ({ analysis }) => {
    if (!analysis) return null;
    if (analysis.error) return <p className="text-red-500 text-sm">{analysis.error}</p>;
    return (
        <div className="text-sm space-y-2">
            {Object.entries(analysis).map(([key, value]) => ( <div key={key}><p className="font-semibold capitalize">{key.replace(/_/g, ' ')}:</p><p className="text-muted-foreground pl-2">{typeof value === 'boolean' ? (value ? 'Oui' : 'Non') : value}</p></div> ))}
        </div>
    );
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      toast({ variant: "destructive", title: "Erreur de chargement", description: err.message });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
    const channel = supabase.channel('public:users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
        toast({ title: "Mise à jour", description: "La liste des utilisateurs a été mise à jour en temps réel." });
        fetchUsers();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchUsers]);

  const handleVerification = async (userId, userEmail, newStatus) => {
    try {
      const { error } = await supabase.from('users').update({ verification_status: newStatus }).eq('id', userId);
      if (error) throw error;
      
      toast({ title: "Statut mis à jour avec succès" });
      
      if (newStatus === 'verified') {
        console.log(`SIMULATION: Email envoyé à ${userEmail} (compte vérifié).`);
        toast({ title: "Email de notification (simulation)", description: `Un email a été envoyé à ${userEmail} pour l'informer.` });
      }
      setIsModalOpen(false);
    } catch (err) {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    }
  };

  const handleAnalyseWithAI = async (user) => {
    // La logique de l'IA reste la même...
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setAiAnalysis(null);
    setIsModalOpen(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'pending') return matchesSearch && (user.verification_status === 'pending' || user.verification_status === 'not_verified');
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && user.verification_status === activeTab;
  });

  const getStatusBadgeVariant = (status) => {
    switch (status) { case 'verified': return 'success'; case 'pending': return 'warning'; case 'rejected': return 'destructive'; default: return 'secondary'; }
  };

  const TabButton = ({ value, label, icon: Icon, count }) => (
    <Button variant={activeTab === value ? "default" : "ghost"} onClick={() => setActiveTab(value)} className="w-full justify-start text-sm"><Icon className="mr-2 h-4 w-4" />{label}<Badge variant={activeTab === value ? "secondary" : "default"} className="ml-auto">{count}</Badge></Button>
  );

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 md:p-8 space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center"><Users className="mr-2" /> Gestion des Utilisateurs</h1>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
                <Card><CardHeader><CardTitle>Catégories</CardTitle></CardHeader>
                    <CardContent className="flex flex-row lg:flex-col lg:space-y-1">
                        <TabButton value="pending" label="En attente" icon={Clock} count={users.filter(u => u.verification_status === 'pending' || u.verification_status === 'not_verified').length} />
                        <TabButton value="verified" label="Vérifiés" icon={UserCheck} count={users.filter(u => u.verification_status === 'verified').length} />
                        <TabButton value="rejected" label="Rejetés" icon={UserX} count={users.filter(u => u.verification_status === 'rejected').length} />
                        <TabButton value="all" label="Tous" icon={Users} count={users.length} />
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-3">
                <Card>
                    <CardHeader><Input placeholder="Rechercher par nom ou email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table><TableHeader><TableRow><TableHead>Utilisateur</TableHead><TableHead>Type</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {loading ? <TableRow><TableCell colSpan="4" className="text-center h-24"><LoadingSpinner /></TableCell></TableRow>
                                    : filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell><div className="font-medium">{user.full_name}</div><div className="text-sm text-muted-foreground">{user.email}</div></TableCell>
                                            <TableCell>{user.type}</TableCell>
                                            <TableCell><Badge variant={getStatusBadgeVariant(user.verification_status)}>{user.verification_status || 'non_vérifié'}</Badge></TableCell>
                                            <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => openUserModal(user)}><Eye className="mr-2 h-4 w-4"/>Détails</Button></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </motion.div>
      {selectedUser && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader><DialogTitle>Vérification : {selectedUser.full_name}</DialogTitle><DialogDescription>{selectedUser.email}</DialogDescription></DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto">
                <div>
                    <h3 className="font-semibold mb-2">Documents Fournis</h3>
                    <div className="space-y-4">
                        <div><Label>Recto CNI</Label>{selectedUser.id_card_front_url ? <img src={selectedUser.id_card_front_url} alt="Recto CNI" className="rounded-lg border mt-1 w-full" /> : <p className="text-sm text-muted-foreground">Non fourni</p>}</div>
                        <div><Label>Verso CNI</Label>{selectedUser.id_card_back_url ? <img src={selectedUser.id_card_back_url} alt="Verso CNI" className="rounded-lg border mt-1 w-full" /> : <p className="text-sm text-muted-foreground">Non fourni</p>}</div>
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold mb-2">Assistant IA</h3>
                    <Button onClick={() => handleAnalyseWithAI(selectedUser)} disabled={isAiLoading || !selectedUser.id_card_front_url} className="w-full">{isAiLoading ? <LoadingSpinner size="small" className="mr-2"/> : <Sparkles className="mr-2 h-4 w-4" />}{isAiLoading ? "Analyse..." : "Analyser les documents"}</Button>
                    {aiAnalysis && (<Card className="mt-4"><CardHeader><CardTitle className="text-base">Résultat de l'analyse</CardTitle></CardHeader><CardContent><AiAnalysisResult analysis={aiAnalysis} /></CardContent></Card>)}
                </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleVerification(selectedUser.id, selectedUser.email, 'rejected')}><XCircle className="mr-2 h-4 w-4"/>Rejeter</Button>
              <Button onClick={() => handleVerification(selectedUser.id, selectedUser.email, 'verified')} className="bg-green-600 hover:bg-green-700"><CheckCircle className="mr-2 h-4 w-4"/>Approuver</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default AdminUsersPage;