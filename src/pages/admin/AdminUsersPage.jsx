// src/pages/admin/AdminUsersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

// --- NOUVEAU : Composant pour afficher joliment les résultats de l'IA ---
const AiAnalysisResult = ({ analysis }) => {
    if (!analysis) return null;
    if (analysis.error) return <p className="text-red-500 text-sm">{analysis.error}</p>;

    return (
        <div className="text-sm space-y-2">
            {Object.entries(analysis).map(([key, value]) => (
                <div key={key}>
                    <p className="font-semibold capitalize">{key.replace(/_/g, ' ')}:</p>
                    <p className="text-muted-foreground pl-2">{typeof value === 'boolean' ? (value ? 'Oui' : 'Non') : value}</p>
                </div>
            ))}
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
    setLoading(true);
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
  }, [fetchUsers]);

  const handleVerification = async (userId, newStatus) => {
    try {
      const { error } = await supabase.from('users').update({ verification_status: newStatus }).eq('id', userId);
      if (error) throw error;
      toast({ title: "Statut mis à jour" });
      fetchUsers();
      setIsModalOpen(false);
    } catch (err) {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    }
  };

  const handleAnalyseWithAI = async (user) => {
    if (!user.id_card_front_url || !user.id_card_back_url) {
        toast({ variant: "destructive", title: "Images manquantes", description: "L'utilisateur n'a pas soumis les deux images." });
        return;
    }
    setIsAiLoading(true);
    setAiAnalysis(null);
    try {
        // --- CORRECTION CLÉ API ---
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("La clé API Gemini (VITE_GEMINI_API_KEY) n'est pas configurée.");
        }

        const [frontRes, backRes] = await Promise.all([
            fetch(user.id_card_front_url),
            fetch(user.id_card_back_url)
        ]);
        const [frontBlob, backBlob] = await Promise.all([frontRes.blob(), backRes.blob()]);

        const toBase64 = file => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });

        const [frontBase64, backBase64] = await Promise.all([toBase64(frontBlob), toBase64(backBlob)]);

        const prompt = `Analyse ces deux images (recto et verso d'une carte d'identité sénégalaise). 
        1. Confirme si les documents semblent être des pièces d'identité valides.
        2. Extrais les informations suivantes : Nom complet, Date de naissance, Numéro de la carte.
        3. Indique toute incohérence ou signe suspect.
        Réponds au format JSON avec les clés suivantes : "document_valide" (boolean), "nom_complet" (string), "date_de_naissance" (string), "numero_carte" (string), "analyse_suspecte" (string).`;

        const payload = {
            contents: [{
                role: "user",
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: "image/jpeg", data: frontBase64 } },
                    { inlineData: { mimeType: "image/jpeg", data: backBase64 } }
                ]
            }],
            generationConfig: { responseMimeType: "application/json" }
        };
        
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Erreur API Gemini: ${response.statusText} - ${errorBody}`);
        }
        
        const result = await response.json();
        const text = result.candidates[0].content.parts[0].text;
        setAiAnalysis(JSON.parse(text));

    } catch (err) {
        toast({ variant: "destructive", title: "Erreur d'analyse IA", description: err.message });
        setAiAnalysis({ error: err.message });
    } finally {
        setIsAiLoading(false);
    }
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setAiAnalysis(null);
    setIsModalOpen(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || user.verification_status === activeTab;
    return matchesSearch && matchesTab;
  });

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'verified': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const TabButton = ({ value, label, icon: Icon, count }) => (
    <Button
      variant={activeTab === value ? "default" : "ghost"}
      onClick={() => setActiveTab(value)}
      className="w-full justify-start text-sm"
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
      <Badge variant={activeTab === value ? "secondary" : "default"} className="ml-auto">{count}</Badge>
    </Button>
  );

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 md:p-8 space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center"><Users className="mr-2" /> Gestion des Utilisateurs</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Catégories</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-row lg:flex-col lg:space-y-1 overflow-x-auto lg:overflow-x-visible">
                        <TabButton value="pending" label="En attente" icon={Clock} count={users.filter(u => u.verification_status === 'pending').length} />
                        <TabButton value="verified" label="Vérifiés" icon={UserCheck} count={users.filter(u => u.verification_status === 'verified').length} />
                        <TabButton value="rejected" label="Rejetés" icon={UserX} count={users.filter(u => u.verification_status === 'rejected').length} />
                        <TabButton value="all" label="Tous" icon={Users} count={users.length} />
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-3">
                <Card>
                    <CardHeader>
                        <Input placeholder="Rechercher par nom ou email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Utilisateur</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan="4" className="text-center h-24"><LoadingSpinner /></TableCell></TableRow>
                                    ) : filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="font-medium">{user.full_name}</div>
                                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                            </TableCell>
                                            <TableCell>{user.type}</TableCell>
                                            <TableCell><Badge variant={getStatusBadgeVariant(user.verification_status)}>{user.verification_status || 'non_vérifié'}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" onClick={() => openUserModal(user)}><Eye className="mr-2 h-4 w-4"/>Détails</Button>
                                            </TableCell>
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
            <DialogHeader>
              <DialogTitle>Vérification de l'utilisateur</DialogTitle>
              <DialogDescription>{selectedUser.full_name} - {selectedUser.email}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto">
                <div>
                    <h3 className="font-semibold mb-2">Documents Fournis</h3>
                    <div className="space-y-4">
                        <div>
                            <Label>Recto de la carte d'identité</Label>
                            {selectedUser.id_card_front_url ? <img src={selectedUser.id_card_front_url} alt="Recto CNI" className="rounded-lg border mt-1 w-full" /> : <p className="text-sm text-muted-foreground">Non fourni</p>}
                        </div>
                        <div>
                            <Label>Verso de la carte d'identité</Label>
                             {selectedUser.id_card_back_url ? <img src={selectedUser.id_card_back_url} alt="Verso CNI" className="rounded-lg border mt-1 w-full" /> : <p className="text-sm text-muted-foreground">Non fourni</p>}
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold mb-2">Assistant IA</h3>
                    <Button onClick={() => handleAnalyseWithAI(selectedUser)} disabled={isAiLoading || !selectedUser.id_card_front_url} className="w-full">
                        {isAiLoading ? <LoadingSpinner size="small" className="mr-2"/> : <Sparkles className="mr-2 h-4 w-4" />}
                        {isAiLoading ? "Analyse en cours..." : "Analyser les documents"}
                    </Button>
                    {aiAnalysis && (
                        <Card className="mt-4">
                            <CardHeader><CardTitle className="text-base">Résultat de l'analyse</CardTitle></CardHeader>
                            <CardContent>
                                {/* --- UTILISATION DU NOUVEAU COMPOSANT --- */}
                                <AiAnalysisResult analysis={aiAnalysis} />
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleVerification(selectedUser.id, 'rejected')}><XCircle className="mr-2 h-4 w-4"/>Rejeter</Button>
              <Button onClick={() => handleVerification(selectedUser.id, 'verified')} className="bg-green-600 hover:bg-green-700"><CheckCircle className="mr-2 h-4 w-4"/>Approuver</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default AdminUsersPage;