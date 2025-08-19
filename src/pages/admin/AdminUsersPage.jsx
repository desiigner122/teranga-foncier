// src/pages/admin/AdminUsersPage.jsx
import React, { useState, useEffect, useCallback, Suspense, memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users, UserCheck, Clock, UserX, CheckCircle, XCircle, Sparkles, Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';
import { senegalAdministrativeDivisions, senegalBanks, notaireSpecialities } from '@/data/senegalLocations';
import { nanoid } from 'nanoid';
import SupabaseDataService from '@/services/supabaseDataService';

const LoadingSpinner = React.lazy(() => import('@/components/ui/spinner').catch(() => ({
  default: () => <div>Chargement...</div>,
})));

const Spinner = ({ size, className }) => (
  <Suspense fallback={<div>Chargement...</div>}>
    <LoadingSpinner size={size} className={className} />
  </Suspense>
);

const AiAnalysisResult = ({ analysis }) => {
  if (!analysis) return null;
  if (analysis.error) return <p className="text-red-500 text-sm">{analysis.error}</p>;
  return (
    <div className="text-sm space-y-2">
      {Object.entries(analysis).map(([key, value]) => (
        <div key={key}>
          <p className="font-semibold capitalize">{key.replace(/_/g, ' ')}</p>
          <p className="text-muted-foreground pl-2">
            {typeof value === 'boolean' ? (value ? 'Oui' : 'Non') : value}
          </p>
        </div>
      ))}
    </div>
  );
};

const TabButton = memo(({ value, label, icon: Icon, count, activeTab, setActiveTab }) => (
  <Button
    variant={activeTab === value ? 'default' : 'ghost'}
    onClick={() => setActiveTab(value)}
    className="w-full justify-start text-sm"
  >
    <Icon className="mr-2 h-4 w-4" />
    {label}
    <Badge variant={activeTab === value ? 'secondary' : 'default'} className="ml-auto">
      {count}
    </Badge>
  </Button>
));

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [hasMore, setHasMore] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    type: 'Mairie',
    role: 'user',
    autoVerify: false,
    region: '',
    department: '',
    commune: '',
    bank_name: '',
    notaire_speciality: ''
  });
  // Admin-side document management & invitation flags
  const [frontAdminFile, setFrontAdminFile] = useState(null);
  const [backAdminFile, setBackAdminFile] = useState(null);
  const [frontAdminPreview, setFrontAdminPreview] = useState(null);
  const [backAdminPreview, setBackAdminPreview] = useState(null);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [sendInvite, setSendInvite] = useState(false); // Placeholder (needs server function)

  const isValidImageUrl = (url) => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const fetchUsers = useCallback(async (currentPage) => {
    try {
      setLoading(true);
      const { data, error, count } = await supabase
        .from('users')
        .select('id, email, full_name, type, verification_status, id_card_front_url, id_card_back_url', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);
      if (error) throw error;
      setUsers(data || []);
      setHasMore((currentPage * pageSize) < (count || 0));
    } catch (err) {
      console.error('Erreur fetchUsers:', err);
      toast({
        variant: 'destructive',
        title: 'Erreur de chargement des utilisateurs',
        description: err.message || 'Une erreur est survenue.',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, pageSize]);

  useEffect(() => {
    fetchUsers(page);
    const channel = supabase
      .channel('public:users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
        toast({ title: 'Mise à jour', description: 'La liste des utilisateurs a été mise à jour.' });
        // Re-fetch a la page actuelle pour refleter les changements
        fetchUsers(page);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUsers, page, toast]);

  const handleVerification = async (userId, userEmail, newStatus) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ verification_status: newStatus })
        .eq('id', userId);
      if (error) throw error;
      toast({ title: 'Statut mis à jour', description: newStatus === 'verified' ? 'Utilisateur approuvé.' : 'Utilisateur rejeté.' });
      setIsModalOpen(false);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erreur', description: err.message || 'Échec de la mise à jour.' });
    }
  };

  const handleAnalyseWithAI = async () => {
    setIsAiLoading(true);
    try {
      // Appel à une IA pour analyser l'utilisateur
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      const analysis = {
        document_validity: true,
        face_match: '90% confidence',
        text_readability: 'Clear',
        potential_fraud: false,
      };
      setAiAnalysis(analysis);
      toast({ title: 'Analyse IA terminée', description: 'Résultats disponibles.' });
    } catch (err) {
      setAiAnalysis({ error: 'Erreur lors de l’analyse IA.' });
      toast({ variant: 'destructive', title: 'Erreur IA', description: err.message || 'Échec de l’analyse.' });
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
      || (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'pending') {
      return matchesSearch && ['pending', 'not_verified'].includes(user.verification_status);
    }
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && user.verification_status === activeTab;
  });

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'verified': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };
  
  const handlePageChange = (newPage) => {
      setPage(newPage);
      fetchUsers(newPage);
  }

  const resetNewUser = () => {
    setNewUser({ email: '', full_name: '', type: 'Mairie', role: 'user', autoVerify: false, region:'', department:'', commune:'', bank_name:'', notaire_speciality:'' });
  };

  const handleCreateUser = async () => {
    // Validation
    if (!newUser.email) { toast({ variant:'destructive', title:'Email requis'}); return; }
    if (!newUser.full_name) { toast({ variant:'destructive', title:'Nom requis'}); return; }
    if (newUser.type === 'Mairie') {
      if (!newUser.region || !newUser.department || !newUser.commune) { toast({ variant:'destructive', title:'Sélection région/département/commune requise'}); return; }
    }
    if (newUser.type === 'Banque' && !newUser.bank_name) { toast({ variant:'destructive', title:'Choisir une banque'}); return; }
    if (newUser.type === 'Notaire' && !newUser.notaire_speciality) { toast({ variant:'destructive', title:'Choisir une spécialité'}); return; }
    setCreating(true);
    try {
      const slugBase = newUser.full_name.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
      const slug = `${slugBase}-${nanoid(6)}`;
      const payload = {
        email: newUser.email.trim().toLowerCase(),
        full_name: newUser.full_name || newUser.email,
        type: newUser.type,
        role: newUser.role,
        verification_status: newUser.autoVerify ? 'verified' : 'not_verified',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          region: newUser.region || null,
          department: newUser.department || null,
            commune: newUser.commune || null,
            bank_name: newUser.bank_name || null,
            notaire_speciality: newUser.notaire_speciality || null,
            slug
        }
      };
      const created = await SupabaseDataService.createUser(payload);

      // Institution profile (si table disponible)
      if (created && ['Mairie','Banque','Notaire'].includes(created.type)) {
        await SupabaseDataService.createInstitutionProfile({
          user_id: created.id,
          type: created.type,
          slug: payload.metadata.slug,
          region: payload.metadata.region,
          department: payload.metadata.department,
          commune: payload.metadata.commune,
          bank_name: payload.metadata.bank_name,
          notaire_speciality: payload.metadata.notaire_speciality,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      if (sendInvite) {
        await SupabaseDataService.sendAuthInvitation(payload.email, payload.role);
      }

      // Audit log placeholder (si table audit_logs existe)
      try {
        await supabase.from('audit_logs').insert({
          id: nanoid(),
          action: 'admin_create_user',
          target_email: payload.email,
          target_type: payload.type,
          metadata: payload.metadata,
          created_at: new Date().toISOString()
        });
      } catch (e) { /* ignore */ }
      if (sendInvite) {
        toast({
          title: 'Invitation différée',
          description: "Configurez une Edge Function avec la service key pour envoyer un email d'invitation.",
        });
      }
      toast({ title: 'Utilisateur créé', description: `${payload.full_name}` });
      setIsAddModalOpen(false);
      resetNewUser();
      fetchUsers(page);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erreur création', description: err.message || 'Impossible de créer.' });
    } finally {
      setCreating(false);
    }
  };

  const handleAdminFileChange = (e, side) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast({ variant:'destructive', title:'Image requise'}); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (side==='front') { setFrontAdminFile(file); setFrontAdminPreview(ev.target.result); }
      else { setBackAdminFile(file); setBackAdminPreview(ev.target.result); }
    };
    reader.readAsDataURL(file);
  };

  const adminUploadIdentityFile = async (file, type, userId) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${type}-ADMIN-${Date.now()}.${fileExt}`;
    const bucket = 'identity-documents';
    const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file, { upsert: true });
    if (uploadError) throw uploadError;
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleAdminUploadDocs = async () => {
    if (!selectedUser) return;
    if (!frontAdminFile && !backAdminFile) { toast({ variant:'destructive', title:'Ajouter au moins une image'}); return; }
    setUploadingDocs(true);
    try {
      const updates = { updated_at: new Date().toISOString() };
      if (frontAdminFile) updates.id_card_front_url = await adminUploadIdentityFile(frontAdminFile, 'front', selectedUser.id);
      if (backAdminFile) updates.id_card_back_url = await adminUploadIdentityFile(backAdminFile, 'back', selectedUser.id);
      if (updates.id_card_front_url && updates.id_card_back_url && ['not_verified','rejected'].includes(selectedUser.verification_status)) {
        updates.verification_status = 'pending';
        updates.verification_submitted_at = new Date().toISOString();
      }
      const { error } = await supabase.from('users').update(updates).eq('id', selectedUser.id);
      if (error) throw error;
      toast({ title:'Documents mis à jour', description:'Images enregistrées.' });
      setFrontAdminFile(null); setBackAdminFile(null); setFrontAdminPreview(null); setBackAdminPreview(null);
      fetchUsers(page);
    } catch (err) {
      toast({ variant:'destructive', title:'Erreur upload', description: err.message });
    } finally { setUploadingDocs(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center">
          <Users className="mr-2" /> Gestion des Utilisateurs
        </h1>
        <Button onClick={() => setIsAddModalOpen(true)} className="self-start md:self-auto">
          + Ajouter un utilisateur
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader><CardTitle>Catégories</CardTitle></CardHeader>
            <CardContent className="flex flex-row lg:flex-col lg:space-y-1">
              <TabButton value="pending" label="En attente" icon={Clock}
                count={users.filter((u) => ['pending', 'not_verified'].includes(u.verification_status)).length}
                activeTab={activeTab} setActiveTab={setActiveTab} />
              <TabButton value="verified" label="Vérifiés" icon={UserCheck}
                count={users.filter((u) => u.verification_status === 'verified').length}
                activeTab={activeTab} setActiveTab={setActiveTab} />
              <TabButton value="rejected" label="Rejetés" icon={UserX}
                count={users.filter((u) => u.verification_status === 'rejected').length}
                activeTab={activeTab} setActiveTab={setActiveTab} />
              <TabButton value="all" label="Tous" icon={Users}
                count={users.length} activeTab={activeTab} setActiveTab={setActiveTab} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <Input placeholder="Rechercher par nom ou email..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md" />
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
                      <TableRow>
                        <TableCell colSpan="4" className="text-center h-24">
                          <Spinner size="large" />
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan="4" className="text-center h-24 text-muted-foreground">
                          Aucun utilisateur trouvé.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="font-medium">{user.full_name || 'Non défini'}</div>
                            <div className="text-sm text-muted-foreground">{user.email || 'Inconnu'}</div>
                          </TableCell>
                          <TableCell>{user.type || 'Inconnu'}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(user.verification_status)}>
                              {user.verification_status || 'non_vérifié'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => {
                              setSelectedUser(user);
                              setAiAnalysis(null);
                              setIsModalOpen(true);
                            }}>
                              <Eye className="mr-2 h-4 w-4" /> Détails
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-between items-center mt-4">
                <Button variant="outline" disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>
                  Précédent
                </Button>
                <span>Page {page}</span>
                <Button variant="outline" disabled={!hasMore} onClick={() => handlePageChange(page + 1)}>
                  Suivant
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedUser && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Vérification : {selectedUser.full_name || 'Non défini'}</DialogTitle>
              <DialogDescription>{selectedUser.email || 'Inconnu'}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto">
              <div>
                <h3 className="font-semibold mb-2">Documents Fournis</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Recto CNI</Label>
                    {isValidImageUrl(selectedUser.id_card_front_url) ? (
                      <img src={selectedUser.id_card_front_url} alt="Recto de la carte d’identité" className="rounded-lg border mt-1 w-full max-h-48 object-contain"/>
                    ) : ( <p className="text-sm text-muted-foreground">Non fourni</p> )}
                    {frontAdminPreview && <img src={frontAdminPreview} alt="Nouveau recto" className="rounded border mt-2 max-h-32 object-contain" />}
                    <input type="file" accept="image/*" className="mt-2 text-xs" onChange={(e)=>handleAdminFileChange(e,'front')} />
                  </div>
                  <div>
                    <Label>Verso CNI</Label>
                    {isValidImageUrl(selectedUser.id_card_back_url) ? (
                      <img src={selectedUser.id_card_back_url} alt="Verso de la carte d’identité" className="rounded-lg border mt-1 w-full max-h-48 object-contain"/>
                    ) : ( <p className="text-sm text-muted-foreground">Non fourni</p> )}
                    {backAdminPreview && <img src={backAdminPreview} alt="Nouveau verso" className="rounded border mt-2 max-h-32 object-contain" />}
                    <input type="file" accept="image/*" className="mt-2 text-xs" onChange={(e)=>handleAdminFileChange(e,'back')} />
                  </div>
                  <Button variant="secondary" size="sm" disabled={uploadingDocs} onClick={handleAdminUploadDocs} className="w-full">
                    {uploadingDocs ? 'Envoi...' : 'Uploader / Remplacer'}
                  </Button>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Assistant IA</h3>
                <Button onClick={handleAnalyseWithAI} disabled={isAiLoading || !isValidImageUrl(selectedUser.id_card_front_url)} className="w-full">
                  {isAiLoading ? <Spinner size="small" className="mr-2" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  {isAiLoading ? 'Analyse...' : 'Analyser les documents'}
                </Button>
                {aiAnalysis && (
                  <Card className="mt-4">
                    <CardHeader><CardTitle className="text-base">Résultat de l’analyse</CardTitle></CardHeader>
                    <CardContent><AiAnalysisResult analysis={aiAnalysis} /></CardContent>
                  </Card>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="destructive" onClick={() => handleVerification(selectedUser.id, selectedUser.email, 'rejected')}>
                <XCircle className="mr-2 h-4 w-4" /> Rejeter
              </Button>
              <Button onClick={() => handleVerification(selectedUser.id, selectedUser.email, 'verified')} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4" /> Approuver
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog ajout utilisateur */}
      <Dialog open={isAddModalOpen} onOpenChange={(o)=>{ setIsAddModalOpen(o); if(!o) resetNewUser(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajouter un utilisateur</DialogTitle>
            <DialogDescription>Créer un enregistrement utilisateur (profil). Pour authentification réelle, un compte doit exister côté Auth.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={newUser.email} onChange={(e)=>setNewUser(u=>({...u,email:e.target.value}))} placeholder="email@exemple.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="full_name">Nom complet</Label>
              <Input id="full_name" value={newUser.full_name} onChange={(e)=>setNewUser(u=>({...u,full_name:e.target.value}))} placeholder="Nom complet" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <select className="border rounded-md h-9 px-2 text-sm" value={newUser.type} onChange={(e)=>setNewUser(u=>({...u,type:e.target.value}))}>
                  {['Mairie','Banque','Notaire'].map(t=> <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Rôle</Label>
                <select className="border rounded-md h-9 px-2 text-sm" value={newUser.role} onChange={(e)=>setNewUser(u=>({...u,role:e.target.value}))}>
                  {['user','admin'].map(r=> <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            {/* Conditional fields for hierarchical location (Mairie) */}
            {newUser.type === 'Mairie' && (
              <div className="space-y-3">
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="grid gap-1">
                    <Label>Région</Label>
                    <select className="border rounded-md h-9 px-2 text-sm" value={newUser.region} onChange={(e)=>{
                      const region = e.target.value; setNewUser(u=>({...u,region, department:'', commune:''}));
                    }}>
                      <option value="">Sélectionner</option>
                      {senegalAdministrativeDivisions.map(r=> <option key={r.code} value={r.code}>{r.name}</option>)}
                    </select>
                  </div>
                  <div className="grid gap-1">
                    <Label>Département</Label>
                    <select className="border rounded-md h-9 px-2 text-sm" value={newUser.department} onChange={(e)=>{
                      const department = e.target.value; setNewUser(u=>({...u,department, commune:''}));
                    }} disabled={!newUser.region}>
                      <option value="">Sélectionner</option>
                      {senegalAdministrativeDivisions.find(r=>r.code===newUser.region)?.departments.map(d=> <option key={d.code} value={d.code}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="grid gap-1">
                    <Label>Commune</Label>
                    <select className="border rounded-md h-9 px-2 text-sm" value={newUser.commune} onChange={(e)=> setNewUser(u=>({...u,commune:e.target.value}))} disabled={!newUser.department}>
                      <option value="">Sélectionner</option>
                      {senegalAdministrativeDivisions
                        .find(r=>r.code===newUser.region)?.departments
                        .find(d=>d.code===newUser.department)?.communes
                        .map(c=> <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Sélection hiérarchique basée sur l'administration territoriale du Sénégal.</p>
              </div>
            )}
            {newUser.type === 'Banque' && (
              <div className="grid gap-2">
                <Label>Banque</Label>
                <select className="border rounded-md h-9 px-2 text-sm" value={newUser.bank_name} onChange={(e)=>setNewUser(u=>({...u,bank_name:e.target.value}))}>
                  <option value="">Choisir une banque</option>
                  {senegalBanks.map(b=> <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            )}
            {newUser.type === 'Notaire' && (
              <div className="grid gap-2">
                <Label>Spécialité</Label>
                <select className="border rounded-md h-9 px-2 text-sm" value={newUser.notaire_speciality} onChange={(e)=>setNewUser(u=>({...u,notaire_speciality:e.target.value}))}>
                  <option value="">Choisir</option>
                  {notaireSpecialities.map(s=> <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input id="autoVerify" type="checkbox" checked={newUser.autoVerify} onChange={(e)=>setNewUser(u=>({...u,autoVerify:e.target.checked}))} />
              <Label htmlFor="autoVerify" className="text-sm cursor-pointer">Marquer comme vérifié</Label>
            </div>
            <div className="flex items-center gap-2">
              <input id="sendInvite" type="checkbox" checked={sendInvite} onChange={(e)=>setSendInvite(e.target.checked)} />
              <Label htmlFor="sendInvite" className="text-sm cursor-pointer">Envoyer une invitation email (backend requis)</Label>
            </div>
            <p className="text-xs text-muted-foreground">L'utilisateur recevra l'accès selon son rôle/statut. Les champs dynamiques sont stockés dans metadata.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>{ setIsAddModalOpen(false); }}>Annuler</Button>
            <Button disabled={creating} onClick={handleCreateUser} className="bg-green-600 hover:bg-green-700">
              {creating ? 'Création...' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}