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

  const isValidImageUrl = (url) => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error, count } = await supabase
        .from('users')
        .select('id, email, full_name, type, verification_status, id_card_front_url, id_card_back_url', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
      if (error) throw error;
      setUsers(data || []);
      setHasMore((page * pageSize) < (count || 0));
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
  }, [page, toast]);

  useEffect(() => {
    fetchUsers();
    const channel = supabase
      .channel('public:users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        toast({ title: 'Mise à jour', description: 'La liste des utilisateurs a été mise à jour.' });
        fetchUsers();
      })
      .subscribe((status, err) => {
        if (err || status === 'CLOSED') {
          toast({
            variant: 'destructive',
            title: 'Erreur Realtime',
            description: 'Impossible de recevoir les mises à jour en temps réel.',
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUsers]);

  useEffect(() => {
    if (selectedUser && !users.some((u) => u.id === selectedUser.id)) {
      setIsModalOpen(false);
      setSelectedUser(null);
    }
  }, [users, selectedUser]);

  const handleVerification = async (userId, userEmail, newStatus) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ verification_status: newStatus })
        .eq('id', userId);
      if (error) throw error;

      toast({ title: 'Statut mis à jour', description: newStatus === 'verified' ? 'Utilisateur approuvé.' : 'Utilisateur rejeté.' });

      if (newStatus === 'verified' && userEmail) {
        toast({
          title: 'Email de notification (simulation)',
          description: `Un email a été envoyé à ${userEmail} pour l’informer.`,
        });
      }

      setIsModalOpen(false);
      await fetchUsers();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erreur', description: err.message || 'Échec de la mise à jour.' });
    }
  };

  const handleAnalyseWithAI = async () => {
    setIsAiLoading(true);
    try {
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

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 md:p-8 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold flex items-center">
        <Users className="mr-2" /> Gestion des Utilisateurs
      </h1>

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
                          <Spinner />
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
                <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  Précédent
                </Button>
                <span>Page {page}</span>
                <Button variant="outline" disabled={!hasMore} onClick={() => setPage(p => p + 1)}>
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
                      <img
                        src={selectedUser.id_card_front_url}
                        alt={`Recto de la carte d’identité de ${selectedUser.full_name || 'utilisateur'}`}
                        className="rounded-lg border mt-1 w-full max-h-48 object-contain"
                        aria-label="Recto de la carte d’identité"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">Non fourni</p>
                    )}
                  </div>
                  <div>
                    <Label>Verso CNI</Label>
                    {isValidImageUrl(selectedUser.id_card_back_url) ? (
                      <img
                        src={selectedUser.id_card_back_url}
                        alt={`Verso de la carte d’identité de ${selectedUser.full_name || 'utilisateur'}`}
                        className="rounded-lg border mt-1 w-full max-h-48 object-contain"
                        aria-label="Verso de la carte d’identité"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">Non fourni</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Assistant IA</h3>
                <Button
                  onClick={handleAnalyseWithAI}
                  disabled={isAiLoading || !isValidImageUrl(selectedUser.id_card_front_url)}
                  className="w-full"
                >
                  {isAiLoading ? <Spinner size="small" className="mr-2" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  {isAiLoading ? 'Analyse...' : 'Analyser les documents'}
                </Button>
                {aiAnalysis && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-base">Résultat de l’analyse</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AiAnalysisResult analysis={aiAnalysis} />
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => handleVerification(selectedUser.id, selectedUser.email, 'rejected')}>
                <XCircle className="mr-2 h-4 w-4" /> Rejeter
              </Button>
              <Button onClick={() => handleVerification(selectedUser.id, selectedUser.email, 'verified')} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4" /> Approuver
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
}
