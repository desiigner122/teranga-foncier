import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileClock, Search, PlusCircle, Users, Gavel, Scale, Download, History, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const NotairesDashboardPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dossiers');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDossier, setCurrentDossier] = useState(null);

  const handleAction = (action, dossierId = '') => {
    toast({
      title: "Action Simulée",
      description: `${action} ${dossierId ? `pour le dossier ${dossierId}` : ''}`,
    });
  };
  
  const openModal = (dossier) => {
    setCurrentDossier(dossier);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
      setIsModalOpen(false);
      setCurrentDossier(null);
  }

  const handleDecision = (decision) => {
    if (!currentDossier) return;
    toast({
        title: "Décision Enregistrée",
        description: `La décision '${decision}' a été enregistrée pour le dossier ${currentDossier.id}.`,
    });
    closeModal();
  };

  const stats = [
    { title: "Dossiers à Vérifier", value: 12, icon: FileClock, color: "text-yellow-500" },
    { title: "Actes Authentifiés (Mois)", value: 45, icon: Gavel, color: "text-green-500" },
    { title: "Procédures en Attente", value: 8, icon: History, color: "text-blue-500" },
    { title: "Vérifications de Conformité", value: 22, icon: Scale, color: "text-indigo-500" },
  ];

  const recentActivities = [
    { id: 'ACT-001', type: 'Vérification', parcelRef: 'dk-alm-002', status: 'En cours', date: 'Aujourd\'hui' },
    { id: 'ACT-002', type: 'Authentification', parcelRef: 'sly-ngp-010', status: 'Terminé', date: 'Hier' },
    { id: 'ACT-003', type: 'Demande de certification', parcelRef: 'dmn-cit-005', status: 'Nouveau', date: 'Il y a 2 jours' },
    { id: 'ACT-004', type: 'Consultation', parcelRef: 'ths-ext-021', status: 'Confirmée', date: 'Demain à 10h' },
  ];
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Terminé': return <Badge variant="success">{status}</Badge>;
      case 'En cours': case 'Confirmée': return <Badge variant="default">{status}</Badge>;
      case 'Nouveau': return <Badge variant="warning">{status}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <Card key={index} className="border-l-4 border-indigo-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {index === 1 ? "+5.2% vs mois dernier" : ""}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Accès Rapides</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-20 flex-col" onClick={() => handleAction("Lancement d'une nouvelle procédure.")}><PlusCircle className="h-6 w-6 mb-1"/>Nouvelle Procédure</Button>
                    <Button variant="outline" className="h-20 flex-col" onClick={() => handleAction("Recherche dans les archives.")}><History className="h-6 w-6 mb-1"/>Rechercher Acte</Button>
                    <Button variant="outline" className="h-20 flex-col" onClick={() => handleAction("Ouverture du module de conformité.")}><Scale className="h-6 w-6 mb-1"/>Vérif. Conformité</Button>
                    <Button variant="outline" className="h-20 flex-col" onClick={() => handleAction("Téléchargement des modèles d'actes.")}><Download className="h-6 w-6 mb-1"/>Modèles d'Actes</Button>
                </CardContent>
            </Card>
          </>
        );
      case 'dossiers':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Activités Récentes et Dossiers</CardTitle>
              <CardDescription>Suivi des dernières opérations et demandes.</CardDescription>
               <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 mt-2">
                <Input type="search" placeholder="Rechercher par réf, type..." className="w-full sm:w-[250px]" />
                 <Select>
                    <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filtrer par statut" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous statuts</SelectItem>
                        <SelectItem value="nouveau">Nouveau</SelectItem>
                        <SelectItem value="en_cours">En cours</SelectItem>
                        <SelectItem value="termine">Terminé</SelectItem>
                    </SelectContent>
                </Select>
               </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Référence</th>
                      <th className="text-left py-2 px-2">Type</th>
                      <th className="text-left py-2 px-2">Parcelle</th>
                      <th className="text-left py-2 px-2">Statut</th>
                      <th className="text-right py-2 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivities.map(activity => (
                      <tr key={activity.id} className="border-b hover:bg-muted/30">
                        <td className="py-3 px-2 font-medium">{activity.id}</td>
                        <td className="py-3 px-2">{activity.type}</td>
                        <td className="py-3 px-2 font-mono text-sm text-primary hover:underline"><Link to={`/parcelles/${activity.parcelRef}`}>{activity.parcelRef}</Link></td>
                        <td className="py-3 px-2">
                          {getStatusBadge(activity.status)}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Button variant="outline" size="sm" onClick={() => openModal(activity)}>
                            Instruire
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 p-4 md:p-6 lg:p-8"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center"><Scale className="h-8 w-8 mr-3 text-indigo-600"/>Tableau de Bord Notaire</h1>
      </div>

       <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {['dossiers', 'overview'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
            >
              {tab === 'dossiers' ? 'Gestion des Dossiers' : 'Vue d\'ensemble'}
            </button>
          ))}
        </nav>
      </div>

       <div className="mt-6">
        {renderTabContent()}
      </div>
    </motion.div>
    
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Instruction du Dossier: {currentDossier?.id}</DialogTitle>
          <DialogDescription>
            Examinez les documents et statuez sur le dossier.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 text-sm">
          <p><span className="font-semibold">Parcelle:</span> <Link to={`/parcelles/${currentDossier?.parcelRef}`} className="text-primary underline">{currentDossier?.parcelRef}</Link></p>
          <p><span className="font-semibold">Type de procédure:</span> {currentDossier?.type}</p>
          <div className="space-y-2 pt-2">
            <h4 className="font-semibold">Documents à vérifier (Simulation)</h4>
            <ul className="list-disc list-inside text-muted-foreground">
              <li>Acte de vente préliminaire <Button variant="link" size="sm" className="p-0 h-auto ml-2" onClick={() => handleAction("Visualisation de l'acte de vente.")}>Voir</Button></li>
              <li>Certificat de propriété <Button variant="link" size="sm" className="p-0 h-auto ml-2" onClick={() => handleAction("Visualisation du certificat.")}>Voir</Button></li>
              <li>Rapport de conformité urbanisme <Badge variant="success">Conforme</Badge></li>
            </ul>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
            <Button type="button" variant="destructive" onClick={() => handleDecision('Rejet avec réserves')}>Rejeter avec Réserves</Button>
            <div className="space-x-2">
                <Button type="button" variant="outline" onClick={closeModal}>Fermer</Button>
                <Button type="button" onClick={() => handleDecision('Validé et authentifié')}>Valider et Authentifier</Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default NotairesDashboardPage;