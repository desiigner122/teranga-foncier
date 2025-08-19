import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, Search, Filter, Calendar, HardHat, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/spinner';

import SupabaseDataService from '@/services/supabaseDataService';
import { useAuth } from '@/context/AuthContext';

// Helper to compute progress placeholder until a dedicated progress tracking table exists
const deriveProgress = (project) => {
  // If units_total available, approximate progress by units_sold ratio
  if (project?.units_total && project.units_total > 0) {
    return Math.min(100, Math.round((project.units_sold || 0) / project.units_total * 100));
  }
  // Map status to rough progression
  const statusMap = {
    'Faisabilité': 10,
    'Planification': 25,
    'En construction': 60,
    'Achevé': 100
  };
  return statusMap[project.status] ?? 0;
};

const ConstructionTrackingPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProjects = async () => {
    try {
      setRefreshing(true);
      const data = await SupabaseDataService.getPromoteurProjects();
      // Normalize into UI shape
      const normalized = data.map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
        progress: deriveProgress(p),
        nextMilestone: p.workflow_next_milestone || '—',
        dueDate: p.estimated_completion || '—'
      }));
      setProjects(normalized);
    } catch (e) {
      toast({ title: 'Erreur', description: 'Impossible de charger les projets promoteur.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadProjects(); }, []);

  const handleStatusAdvance = async (project) => {
    // Simple linear advancement through statuses; adjust as needed
    const order = ['Faisabilité','Planification','En construction','Achevé'];
    const idx = order.indexOf(project.status);
    const next = idx >=0 && idx < order.length -1 ? order[idx+1] : null;
    if (!next) {
      toast({ title: 'Statut', description: 'Projet déjà au dernier statut.' });
      return;
    }
    try {
      const updated = await SupabaseDataService.updatePromoteurProjectStatus(project.id, next);
      if (updated) {
        setProjects(prev => prev.map(p => p.id === project.id ? { ...p, status: next, progress: deriveProgress({ ...p, status: next }) } : p));
        toast({ title: 'Statut mis à jour', description: `${project.name}: ${next}` });
      }
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour le statut.' });
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
        case 'En construction': return 'warning';
        case 'Planification': return 'default';
        case 'Faisabilité': return 'secondary';
        default: return 'outline';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 p-4 md:p-6"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center"><ClipboardList className="mr-3 h-8 w-8 text-primary"/>Suivi de Construction</h1>
        <Button variant="outline" size="sm" onClick={loadProjects} disabled={refreshing} className="flex items-center">
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Rafraîchir
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Avancement des Projets</CardTitle>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher un projet..." className="pl-8" />
            </div>
            <Button variant="outline" onClick={() => handleAction("Filtres de projets appliqués.")}><Filter className="mr-2 h-4 w-4" /> Filtrer</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.length === 0 && (
              <div className="text-sm text-muted-foreground p-4 border rounded-md">
                Aucun projet trouvé. Créez un projet dans la base (table promoteur_projects) pour le voir ici.
              </div>
            )}
            {projects.map(p => (
              <Card key={p.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <CardTitle>{p.name}</CardTitle>
                    <Badge variant={getStatusBadge(p.status)} className="mt-2 sm:mt-0">{p.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progression</span>
                      <span>{p.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: `${p.progress}%` }}></div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Prochaine étape: {p.nextMilestone} (Échéance: {p.dueDate})</p>
                  <div className="flex flex-wrap space-x-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => handleStatusAdvance(p)}><HardHat className="mr-1 h-4 w-4" /> Avancer statut</Button>
                    <Button variant="outline" size="sm" disabled><Calendar className="mr-1 h-4 w-4" /> Calendrier (bientôt)</Button>
                     <Button asChild variant="link" size="sm" className="p-0 h-auto"><Link to="/dashboard/sales">Voir les ventes</Link></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ConstructionTrackingPage;