import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  FileSignature, 
  LandPlot, 
  AlertTriangle, 
  Landmark,
  Map,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  MessageSquare,
  FileText,
  Download,
  Building
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Simulation d'une carte de cadastre
const CadastreMapSimulation = ({ onAction }) => (
  <div className="h-full bg-gradient-to-br from-blue-50 to-sky-100 dark:from-blue-900/30 dark:to-sky-800/30 rounded-lg p-4 flex flex-col items-center justify-center shadow-inner">
    <Map className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-3" />
    <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">Cadastre Numérique de la Commune</p>
    <p className="text-xs text-center mt-1 text-blue-700 dark:text-blue-300">Visualisation des parcelles, zones et plans d'urbanisme (simulation).</p>
    <img className="w-full h-auto mt-2 rounded" alt="Simulation de carte de cadastre avec parcelles colorées" src="https://images.unsplash.com/photo-1695673016023-7429b730b364" />
    <Button asChild variant="link" size="sm" className="mt-2 text-xs p-0 h-auto text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
      <Link to="/dashboard/cadastre">Explorer le Cadastre Interactif</Link>
    </Button>
  </div>
);

// Données pour les graphiques de taxes
const taxData = [
  { name: 'Jan', 'Taxe Foncière': 4000000, 'Timbres': 240000 },
  { name: 'Fev', 'Taxe Foncière': 3000000, 'Timbres': 139800 },
  { name: 'Mar', 'Taxe Foncière': 2000000, 'Timbres': 980000 },
  { name: 'Avr', 'Taxe Foncière': 2780000, 'Timbres': 390800 },
  { name: 'Mai', 'Taxe Foncière': 1890000, 'Timbres': 480000 },
  { name: 'Juin', 'Taxe Foncière': 2390000, 'Timbres': 380000 },
];

const formatPrice = (price) => new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(price);

const MairiesDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ type: null, title: '', description: '', data: null });
  const [municipalParcels, setMunicipalParcels] = useState([]);
  const [requestsForTable, setRequestsForTable] = useState([]);
  const [attributionParcel, setAttributionParcel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const kpiData = [
    { title: "Permis de Construire (Mois)", value: "28", icon: FileSignature, trend: "+5", trendColor: "text-green-500", unit: "demandes" },
    { title: "Demandes de Terrain", value: "4", icon: LandPlot, trend: "+1", trendColor: "text-green-500", unit: "nouvelles" },
    { title: "Litiges Fonciers Signalés", value: "3", icon: AlertTriangle, trendColor: "text-yellow-500", trend: "Stable", unit: "cas" },
    { title: "Terrains Communaux", value: "2", icon: Landmark, trendColor: "text-blue-500", trend: "disponibles", unit: "parcelles" },
  ];

  const demandeTerrain = [
    {
      id: 'DEM-001',
      applicant: 'Amadou Diallo',
      parcelRef: 'Requested: Zone Résidentielle Nord',
      requestType: 'Attribution terrain',
      status: 'En instruction',
      dateSubmission: '2025-01-10',
      surface: '500 m²',
      purpose: 'Construction résidentielle',
      priority: 'normal'
    },
    {
      id: 'DEM-002',
      applicant: 'Fatou Sow',
      parcelRef: 'Requested: Zone Commerciale Centre',
      requestType: 'Permis de construire',
      status: 'Documents manquants',
      dateSubmission: '2025-01-08',
      surface: '300 m²',
      purpose: 'Commerce',
      priority: 'high'
    }
  ];

  const openModal = (type, title, description, data = null) => {
    setModalContent({ type, title, description, data });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setModalContent({ type: null, title: '', description: '', data: null });
    setIsModalOpen(false);
  };
  
  useEffect(() => {
    // Simulation du chargement des données
    setTimeout(() => {
      setRequestsForTable(demandeTerrain);
      setMunicipalParcels([
        { id: 'PARC-001', name: 'Terrain Communal Centre', surface: '1000 m²' },
        { id: 'PARC-002', name: 'Terrain Communal Nord', surface: '750 m²' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);
  
  const handleOpenInstructionModal = (request) => {
    openModal('instruction', 'Instruction de Demande', `Traitement de la demande ${request.id}`, { request, user: { name: request.applicant } });
  };
  
  const handleContactApplicant = (applicantId, dossierId) => {
    toast({
      title: "Message envoyé",
      description: `Contact établi avec le demandeur pour le dossier ${dossierId}.`,
    });
  };

  const handleDecision = (request, decision, updateNote) => {
    toast({
      title: decision === 'approved' ? "Demande approuvée" : "Demande rejetée",
      description: `La demande ${request.id} a été ${decision === 'approved' ? 'approuvée' : 'rejetée'}.`,
    });
    closeModal();
  };

  const handleAttribution = (request) => {
    if (!attributionParcel) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un terrain à attribuer.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Attribution effectuée",
      description: `Le terrain ${attributionParcel} a été attribué pour la demande ${request.id}.`,
    });
    closeModal();
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'En instruction': { color: 'bg-yellow-100 text-yellow-800' },
      'Documents manquants': { color: 'bg-orange-100 text-orange-800' },
      'Approuvé': { color: 'bg-green-100 text-green-800' },
      'Rejeté': { color: 'bg-red-100 text-red-800' },
      'En attente': { color: 'bg-blue-100 text-blue-800' },
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge className={config.color}>
        {status}
      </Badge>
    );
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Carte du cadastre simulée */}
            <Card className="lg:row-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  Cadastre Municipal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CadastreMapSimulation onAction={(action) => console.log('Action cadastre:', action)} />
              </CardContent>
            </Card>

            {/* Revenus fiscaux */}
            <Card>
              <CardHeader>
                <CardTitle>Revenus Fiscaux (6 mois)</CardTitle>
                <CardDescription>Taxes foncières et timbres</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={taxData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatPrice(value)} />
                    <Bar dataKey="Taxe Foncière" fill="#3b82f6" />
                    <Bar dataKey="Timbres" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions Rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <FileSignature className="h-4 w-4 mr-2" />
                  Nouveau Permis de Construire
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <LandPlot className="h-4 w-4 mr-2" />
                  Attribution de Terrain
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Building className="h-4 w-4 mr-2" />
                  Gestion des Litiges
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'requests':
        return (
          <div className="space-y-6">
            {/* Filtres et recherche */}
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par demandeur, référence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Liste des demandes */}
            <div className="grid gap-4">
              {requestsForTable.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{request.id}</CardTitle>
                          <CardDescription>
                            <div className="flex items-center gap-2 mt-1">
                              <Users className="h-4 w-4" />
                              {request.applicant}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <LandPlot className="h-4 w-4" />
                              {request.parcelRef}
                            </div>
                          </CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(request.status)}
                          <Badge variant={request.priority === 'high' ? 'destructive' : 'secondary'}>
                            {request.priority === 'high' ? 'Urgent' : 'Normal'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <Label className="text-muted-foreground">Type</Label>
                          <p className="font-medium">{request.requestType}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Surface</Label>
                          <p className="font-medium">{request.surface}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Usage</Label>
                          <p className="font-medium">{request.purpose}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Date</Label>
                          <p className="font-medium">{new Date(request.dateSubmission).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenInstructionModal(request)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Instruire
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleContactApplicant(request.applicant, request.id)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Contacter
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'parcels':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Terrains Communaux Disponibles</CardTitle>
                <CardDescription>Gestion des parcelles municipales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {municipalParcels.map((parcel) => (
                    <div key={parcel.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{parcel.name}</h4>
                        <p className="text-sm text-muted-foreground">{parcel.surface}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        Détails
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const renderModalContent = () => {
    const { type, data } = modalContent;

    if (type === 'instruction' && data) {
      const { request } = data;
      const [updateNote, setUpdateNote] = useState("");
      
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Demandeur</Label>
              <p>{request.applicant}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Type</Label>
              <p>{request.requestType}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Surface demandée</Label>
              <p>{request.surface}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Usage prévu</Label>
              <p>{request.purpose}</p>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Statut actuel</Label>
            <div className="mt-1">
              {getStatusBadge(request.status)}
            </div>
          </div>

          {request.requestType === 'Attribution terrain' && (
            <div>
              <Label htmlFor="parcel-select">Terrain à attribuer</Label>
              <select 
                id="parcel-select"
                className="w-full border rounded-md px-3 py-2 mt-1"
                value={attributionParcel}
                onChange={(e) => setAttributionParcel(e.target.value)}
              >
                <option value="">Sélectionner un terrain</option>
                {municipalParcels.map((parcel) => (
                  <option key={parcel.id} value={parcel.id}>
                    {parcel.name} - {parcel.surface}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notes d'instruction</Label>
            <Textarea 
              id="notes"
              placeholder="Ajoutez vos observations..."
              value={updateNote}
              onChange={(e) => setUpdateNote(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={closeModal}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleDecision(request, 'rejected', updateNote)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejeter
            </Button>
            {request.requestType === 'Attribution terrain' ? (
              <Button onClick={() => handleAttribution(request)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Attribuer
              </Button>
            ) : (
              <Button onClick={() => handleDecision(request, 'approved', updateNote)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approuver
              </Button>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard Mairie</h1>
        <p className="text-muted-foreground">Gestion municipale et administrative</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
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
                    <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <p className={`text-xs ${kpi.trendColor}`}>{kpi.trend}</p>
                  </div>
                  <kpi.icon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Contenu principal avec onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="requests">Demandes</TabsTrigger>
          <TabsTrigger value="parcels">Terrains Communaux</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {renderTabContent()}
        </TabsContent>
      </Tabs>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{modalContent.title}</DialogTitle>
            <DialogDescription>{modalContent.description}</DialogDescription>
          </DialogHeader>
          {renderModalContent()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MairiesDashboard;
