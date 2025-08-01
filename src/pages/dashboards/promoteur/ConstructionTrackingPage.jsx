import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, Search, Filter, Percent, Calendar, HardHat } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/spinner';

const initialProjects = [
  { id: 'PROJ001', name: 'Résidence Les Filaos', status: 'En construction', progress: 60, nextMilestone: 'Pose des fenêtres', dueDate: '2025-08-15' },
  { id: 'PROJ002', name: 'Saly Center', status: 'Planification', progress: 20, nextMilestone: 'Validation des plans', dueDate: '2025-07-30' },
  { id: 'PROJ003', name: 'Logements Keur Massar', status: 'Faisabilité', progress: 10, nextMilestone: 'Étude de sol', dueDate: '2025-07-10' },
];

const ConstructionTrackingPage = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProjects(initialProjects);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleAction = (message) => {
    toast({ title: "Action Simulée", description: message });
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
      <h1 className="text-2xl md:text-3xl font-bold flex items-center"><ClipboardList className="mr-3 h-8 w-8 text-primary"/>Suivi de Construction</h1>
      
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
                    <Button variant="outline" size="sm" onClick={() => handleAction(`Mise à jour du statut pour ${p.name}.`)}><HardHat className="mr-1 h-4 w-4" /> Mettre à jour</Button>
                    <Button variant="outline" size="sm" onClick={() => handleAction(`Voir le calendrier détaillé pour ${p.name}.`)}><Calendar className="mr-1 h-4 w-4" /> Calendrier</Button>
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