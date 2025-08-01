import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from '@/components/ui/spinner';
import { Building2, Search, FileCheck, TrendingUp, CalendarDays, DollarSign, Lightbulb, Users, Map, PlusCircle, Filter, Calculator, LandPlot, Coins as HandCoins } from 'lucide-react'; // <<< ASSUREZ-VOUS QUE PlusCircle EST ICI ! >>>
import { supabase } from '@/lib/supabaseClient';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PromoteursDashboardPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('projects') // Assuming you have a 'projects' table
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data);
    } catch (err) {
      console.error("Erreur lors du chargement des projets:", err.message);
      setError("Impossible de charger les projets. Veuillez vérifier votre connexion ou les données Supabase.");
      toast({
        title: "Erreur de chargement",
        description: "Impossible de récupérer les projets.",
        variant: "destructive",
      });
      setProjects([]); // Clear data on error
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSimulatedAction = (actionType, projectId = null) => {
    toast({
      title: `${actionType} en cours`,
      description: `${actionType} du projet ${projectId ? projectId.substring(0, 8) + '...' : ''} simulée. (Fonctionnalité complète à implémenter)`,
      duration: 3000,
    });
  };

  const filteredProjects = projects.filter(project =>
    project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-red-500">
        <p>{error}</p>
        <p className="text-sm text-muted-foreground mt-2">Veuillez réessayer plus tard.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 p-4 md:p-6 lg:p-8"
    >
      <h1 className="text-3xl font-bold flex items-center">
        <Building2 className="mr-3 h-8 w-8 text-primary" /> Tableau de Bord Promoteur
      </h1>
      <p className="text-muted-foreground">
        Gérez vos projets immobiliers, suivez les avancements et les acquisitions foncières.
      </p>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher un projet par nom, statut ou localisation..."
            className="pl-9 pr-3 py-2 border rounded-md w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => handleSimulatedAction("Création d'un nouveau projet.")}>
          <PlusCircle className="mr-2 h-5 w-5"/> Nouveau Projet {/* Utilise PlusCircle ici */}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mes Projets Immobiliers</CardTitle>
          <CardDescription>Vue d'ensemble de vos projets en cours et terminés.</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProjects.length === 0 && !loading ? (
            <p className="text-center text-muted-foreground py-8">Aucun projet trouvé.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom du Projet</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Date de Début</TableHead>
                    <TableHead>Budget Estimé</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>
                        <Badge variant={project.status === 'En cours' ? 'secondary' : 'default'}>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{project.location}</TableCell>
                      <TableCell>{new Date(project.start_date).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell>{new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(project.estimated_budget)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleSimulatedAction("Affichage des détails", project.id)} className="mr-2">
                          Détails
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">Supprimer</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action supprimera définitivement le projet "{project.name}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleSimulatedAction("Suppression", project.id)}>Supprimer</AlertDialogAction>
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
          {loading && projects.length > 0 && (
            <div className="flex justify-center py-4">
              <LoadingSpinner size="medium" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ajoutez d'autres sections ou graphiques ici si nécessaire */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projets Actifs</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.filter(p => p.status === 'En cours').length}</div>
            <p className="text-xs text-muted-foreground">
              Projets en cours de développement
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acquisitions Foncières</CardTitle>
            <LandPlot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div> {/* Donnée fictive */}
            <p className="text-xs text-muted-foreground">
              Parcelles acquises ce mois-ci
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(projects.reduce((sum, p) => sum + p.estimated_budget, 0))}</div>
            <p className="text-xs text-muted-foreground">
              Budget estimé pour tous les projets
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Avancement des Projets</CardTitle>
            <CardDescription>Statut actuel de vos projets.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Vous pouvez intégrer un graphique ici (ex: Recharts PieChart) */}
            <div className="h-40 flex items-center justify-center text-muted-foreground">
              Graphique d'avancement (à implémenter)
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tâches à Venir</CardTitle>
            <CardDescription>Les prochaines étapes importantes de vos projets.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Liste des tâches à venir */}
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><CalendarDays className="inline-block h-4 w-4 mr-2" /> Réunion avec les architectes (Projet A) - 15/08</li>
              <li><FileCheck className="inline-block h-4 w-4 mr-2" /> Dépôt du permis de construire (Projet B) - 20/08</li>
              <li><HandCoins className="inline-block h-4 w-4 mr-2" /> Négociation foncière (Projet C) - 22/08</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default PromoteursDashboardPage;
