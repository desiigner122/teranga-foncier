import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, PlusCircle, Search, Filter, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/spinner';

const initialProjects = [
  { id: 'PROJ001', name: 'Résidence Les Filaos', zone: 'Diamniadio', type: 'Résidentiel', status: 'En construction' },
  { id: 'PROJ002', name: 'Saly Center', zone: 'Saly', type: 'Commercial', status: 'Planification' },
  { id: 'PROJ003', name: 'Logements Keur Massar', zone: 'Dakar', type: 'Social', status: 'Faisabilité' },
];

const ProjectsPage = () => {
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
        case 'Vendu': return 'success';
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center"><Building2 className="mr-3 h-8 w-8 text-primary"/>Mes Projets Immobiliers</h1>
        <Button onClick={() => handleAction("Ouverture du formulaire de création de projet.")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Nouveau Projet
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Projets</CardTitle>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher un projet..." className="pl-8" />
            </div>
            <Button variant="outline" onClick={() => handleAction("Filtres de projets appliqués.")}><Filter className="mr-2 h-4 w-4" /> Filtrer</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Nom du Projet</th>
                  <th className="text-left p-2 font-semibold hidden md:table-cell">Zone</th>
                  <th className="text-left p-2 font-semibold hidden sm:table-cell">Type</th>
                  <th className="text-left p-2 font-semibold">Statut</th>
                  <th className="text-right p-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p.id} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-medium">{p.name}</td>
                    <td className="p-2 hidden md:table-cell">{p.zone}</td>
                    <td className="p-2 hidden sm:table-cell">{p.type}</td>
                    <td className="p-2"><Badge variant={getStatusBadge(p.status)}>{p.status}</Badge></td>
                    <td className="p-2 text-right">
                      <Button asChild variant="outline" size="sm"><Link to="/dashboard/construction-tracking"><Eye className="mr-1 h-4 w-4" />Détails</Link></Button>
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

export default ProjectsPage;