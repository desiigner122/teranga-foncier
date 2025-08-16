import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { motion } from 'framer-motion';
import { 
  FileClock, 
  Gavel, 
  History, 
  Scale, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  Search,
  Calendar,
  User,
  MapPin
} from 'lucide-react';

const NotairesDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dossiers');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDossier, setCurrentDossier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleAction = (action, dossierId = '') => {
    switch(action) {
      case 'verify':
        toast({
          title: "Vérification initiée",
          description: `Vérification du dossier ${dossierId} en cours.`,
        });
        break;
      case 'authenticate':
        toast({
          title: "Authentification",
          description: `Processus d'authentification démarré pour ${dossierId}.`,
        });
        break;
      case 'schedule':
        toast({
          title: "Rendez-vous planifié",
          description: "Consultation programmée avec succès.",
        });
        break;
      default:
        console.log('Action:', action, 'ID:', dossierId);
    }
  };
  
  const openModal = (dossier) => {
    setCurrentDossier(dossier);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setCurrentDossier(null);
    setIsModalOpen(false);
  };

  const handleDecision = (decision) => {
    if (currentDossier) {
      toast({
        title: decision === 'approve' ? "Dossier approuvé" : "Dossier rejeté",
        description: `${currentDossier.id} - ${decision === 'approve' ? 'Approuvé' : 'Rejeté'} avec succès.`,
      });
      closeModal();
    }
  };

  const stats = [
    { title: "Dossiers à Vérifier", value: 12, icon: FileClock, color: "text-yellow-500" },
    { title: "Actes Authentifiés (Mois)", value: 45, icon: Gavel, color: "text-green-500" },
    { title: "Procédures en Attente", value: 8, icon: History, color: "text-blue-500" },
    { title: "Vérifications de Conformité", value: 22, icon: Scale, color: "text-indigo-500" },
  ];

  const recentActivities = [
    { id: 'ACT-001', type: 'Vérification', parcelRef: 'dk-alm-002', status: 'En cours', date: 'Aujourd\'hui', client: 'Amadou Diallo' },
    { id: 'ACT-002', type: 'Authentification', parcelRef: 'sly-ngp-010', status: 'Terminé', date: 'Hier', client: 'Fatou Sow' },
    { id: 'ACT-003', type: 'Demande de certification', parcelRef: 'dmn-cit-005', status: 'Nouveau', date: 'Il y a 2 jours', client: 'Moussa Ba' },
    { id: 'ACT-004', type: 'Consultation', parcelRef: 'ths-ext-021', status: 'Confirmée', date: 'Demain à 10h', client: 'Aissatou Diop' },
  ];

  const dossiers = [
    { 
      id: 'DOS-001', 
      parcelRef: 'dk-alm-002', 
      client: 'Amadou Diallo', 
      type: 'Vente', 
      status: 'En attente vérification',
      dateCreation: '2025-01-10',
      valeur: '150,000,000 XOF',
      priority: 'high'
    },
    { 
      id: 'DOS-002', 
      parcelRef: 'sly-ngp-010', 
      client: 'Fatou Sow', 
      type: 'Succession', 
      status: 'Authentification requise',
      dateCreation: '2025-01-08',
      valeur: '32,000,000 XOF',
      priority: 'medium'
    },
    { 
      id: 'DOS-003', 
      parcelRef: 'dmn-cit-005', 
      client: 'Moussa Ba', 
      type: 'Donation', 
      status: 'Conforme',
      dateCreation: '2025-01-05',
      valeur: '25,000,000 XOF',
      priority: 'low'
    }
  ];
  
  const getStatusBadge = (status) => {
    const statusConfig = {
      'En cours': { variant: 'default', color: 'bg-yellow-100 text-yellow-800' },
      'Terminé': { variant: 'default', color: 'bg-green-100 text-green-800' },
      'Nouveau': { variant: 'default', color: 'bg-blue-100 text-blue-800' },
      'Confirmée': { variant: 'default', color: 'bg-purple-100 text-purple-800' },
      'En attente vérification': { variant: 'default', color: 'bg-yellow-100 text-yellow-800' },
      'Authentification requise': { variant: 'default', color: 'bg-orange-100 text-orange-800' },
      'Conforme': { variant: 'default', color: 'bg-green-100 text-green-800' },
    };

    const config = statusConfig[status] || { variant: 'secondary', color: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge className={config.color}>
        {status}
      </Badge>
    );
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'dossiers':
        return (
          <div className="space-y-6">
            {/* Filtres et recherche */}
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par dossier, client, ou référence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select 
                className="border rounded-md px-3 py-2"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="progress">En cours</option>
                <option value="completed">Terminé</option>
              </select>
            </div>

            {/* Liste des dossiers */}
            <div className="grid gap-4">
              {dossiers.map((dossier) => (
                <motion.div
                  key={dossier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{dossier.id}</CardTitle>
                          <CardDescription>
                            <div className="flex items-center gap-2 mt-1">
                              <User className="h-4 w-4" />
                              {dossier.client}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin className="h-4 w-4" />
                              {dossier.parcelRef}
                            </div>
                          </CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(dossier.status)}
                          <Badge variant={dossier.priority === 'high' ? 'destructive' : dossier.priority === 'medium' ? 'default' : 'secondary'}>
                            {dossier.priority === 'high' ? 'Urgent' : dossier.priority === 'medium' ? 'Normal' : 'Faible'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <Label className="text-muted-foreground">Type</Label>
                          <p className="font-medium">{dossier.type}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Valeur</Label>
                          <p className="font-medium">{dossier.valeur}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Date création</Label>
                          <p className="font-medium">{new Date(dossier.dateCreation).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openModal(dossier)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Voir
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAction('verify', dossier.id)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Vérifier
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'activites':
        return (
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <Card key={activity.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h4 className="font-semibold">{activity.type}</h4>
                      <p className="text-sm text-muted-foreground">
                        {activity.parcelRef} - {activity.client}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(activity.status)}
                      <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'planning':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Planning des Consultations</CardTitle>
              <CardDescription>Gérez vos rendez-vous et consultations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Button onClick={() => handleAction('schedule')}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Programmer un RDV
                  </Button>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-center text-muted-foreground">
                    Calendrier des consultations à venir
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard Notaire</h1>
        <p className="text-muted-foreground">Gestion des actes notariés et vérifications foncières</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Contenu principal avec onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dossiers">Dossiers</TabsTrigger>
          <TabsTrigger value="activites">Activités Récentes</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {renderTabContent()}
        </TabsContent>
      </Tabs>

      {/* Modal de détails */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du Dossier {currentDossier?.id}</DialogTitle>
            <DialogDescription>
              Vérification et validation du dossier notarial
            </DialogDescription>
          </DialogHeader>
          
          {currentDossier && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Client</Label>
                  <p>{currentDossier.client}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Référence Parcelle</Label>
                  <p>{currentDossier.parcelRef}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p>{currentDossier.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Valeur</Label>
                  <p>{currentDossier.valeur}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Statut actuel</Label>
                <div className="mt-1">
                  {getStatusBadge(currentDossier.status)}
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes de vérification</Label>
                <Textarea 
                  id="notes"
                  placeholder="Ajoutez vos observations..."
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleDecision('reject')}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejeter
            </Button>
            <Button onClick={() => handleDecision('approve')}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approuver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotairesDashboard;
