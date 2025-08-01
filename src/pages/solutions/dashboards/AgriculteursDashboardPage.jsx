import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Leaf, MapPin, Thermometer, Droplets, BarChart, CalendarDays, PlusCircle, AlertTriangle, CheckCircle, TrendingUp, Filter, Maximize, Sprout, Cloudy, BookOpen, Download, ArrowRightLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { sampleAdminDashboardData } from '@/data/index.js';

const kpiData = [
  { title: "Parcelles en Exploitation", value: "3", icon: MapPin, trend: "+1", trendColor: "text-green-500", unit: "parcelles" },
  { title: "Surface Totale (Ha)", value: "12.5", icon: Leaf, trend: "+5.5 Ha", trendColor: "text-green-500", unit: "Ha" },
  { title: "Rendement Moyen (Saison)", value: "Mangues: 4T/Ha", icon: TrendingUp, trendColor: "text-green-500", trend: "+0.2T/Ha", unit: "" },
  { title: "Alertes Actives", value: "2", icon: AlertTriangle, trendColor: "text-yellow-500", trend: "Sécheresse, Ravageurs", unit: "alertes" },
];

const myParcels = [
  { id: 'ZG-AGRI-001', name: 'Champ Kagnout 1', culturePrincipale: 'Mangues', surface: '5 Ha', etatSol: 'Optimal', irrigation: 'Goutte-à-goutte', prochaineAction: 'Récolte (Juillet)', santeCulture: 'Excellente', region: 'Ziguinchor', journal: [{date: '2025-06-01', entry: 'Traitement bio appliqué.'}, {date: '2025-05-15', entry: 'Irrigation effectuée.'}] },
  { id: 'ZG-AGRI-004', name: 'Verger Anacardiers Bignona', culturePrincipale: 'Anacardiers', surface: '7 Ha', etatSol: 'Bon', irrigation: 'Pluvial', prochaineAction: 'Fertilisation (Août)', santeCulture: 'Bonne', region: 'Ziguinchor', journal: [] },
  { id: 'DK-AGRI-007', name: 'Maraîchage Niayes', culturePrincipale: 'Tomates, Piments', surface: '0.5 Ha', etatSol: 'À améliorer', irrigation: 'Manuel', prochaineAction: 'Analyse de sol', santeCulture: 'Moyenne', region: 'Dakar', journal: [{date: '2025-06-10', entry: 'Ajout de compost.'}] },
];

const phytosanitaryAlerts = [
    {id: 'alert1', type: 'Ravageur', name: 'Mouche des fruits', culture: 'Mangues', zone: 'Ziguinchor', severity: 'Élevée', action: 'Traitement immédiat recommandé'},
    {id: 'alert2', type: 'Maladie', name: 'Mildiou', culture: 'Tomates', zone: 'Dakar', severity: 'Moyenne', action: 'Surveillance accrue'},
];

const WeatherForecastChart = () => (
  <div className="h-full bg-gradient-to-br from-blue-50 to-sky-100 dark:from-blue-900/30 dark:to-sky-800/30 rounded-lg p-4 flex flex-col items-center justify-center shadow-inner">
    <Cloudy className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-3" />
    <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">Prévisions Météo (7 jours)</p>
    <div className="w-full text-xs text-center space-y-1 text-blue-700 dark:text-blue-300">
      <p><span className="font-semibold">Temp. Max:</span> 32°C | <span className="font-semibold">Min:</span> 24°C</p>
      <p><span className="font-semibold">Pluviométrie:</span> Faible (2mm)</p>
      <p><span className="font-semibold">Humidité:</span> 60% - <span className="font-semibold">Vent:</span> 15km/h NE</p>
    </div>
    <Button variant="link" size="sm" className="mt-2 text-xs p-0 h-auto text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">Détails Météo Consult (Simulé)</Button>
  </div>
);

const SoilAnalysisSimulation = ({ parcelName }) => (
    <div className="h-full bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/30 dark:to-amber-800/30 rounded-lg p-4 flex flex-col items-center justify-center shadow-inner">
        <Droplets className="h-12 w-12 text-yellow-600 dark:text-yellow-400 mb-3"/>
        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Analyse de Sol ({parcelName})</p>
        <ul className="text-xs mt-1 list-disc list-inside text-left w-full px-2 text-yellow-700 dark:text-yellow-300">
            <li>pH: 6.5 (Optimal)</li>
            <li>Matière Organique: 2.5% (Bon)</li>
            <li>Azote (N): Moyen <span className="text-orange-600 dark:text-orange-400">(Action requise)</span></li>
            <li>Phosphore (P): Élevé</li>
            <li>Potassium (K): Bon</li>
        </ul>
        <Button variant="link" size="sm" className="mt-2 text-xs p-0 h-auto text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300">Recommandations Agence Agricole (Simulé)</Button>
    </div>
);


const AgriculteursDashboardPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedParcel, setSelectedParcel] = useState(myParcels[0]);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [journalEntry, setJournalEntry] = useState("");

  const handleSimulatedAction = (message) => {
    toast({
      title: "Action Simulée",
      description: message,
    });
  };

  const openJournalModal = (parcel) => {
    setSelectedParcel(parcel);
    setIsJournalModalOpen(true);
  };

  const handleAddJournalEntry = () => {
    if (!journalEntry.trim()) {
      toast({ title: "Erreur", description: "L'entrée du journal ne peut pas être vide.", variant: "destructive"});
      return;
    }
    const updatedParcel = {
      ...selectedParcel,
      journal: [...selectedParcel.journal, { date: new Date().toISOString().split('T')[0], entry: journalEntry }]
    };

    const parcelIndex = myParcels.findIndex(p => p.id === selectedParcel.id);
    myParcels[parcelIndex] = updatedParcel; 

    setSelectedParcel(updatedParcel);
    setJournalEntry("");
    toast({ title: "Entrée ajoutée", description: `Journal de bord pour ${selectedParcel.name} mis à jour.` });
    setIsJournalModalOpen(false); 
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {kpiData.map((kpi, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow border-l-4 border-green-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                    <kpi.icon className="h-5 w-5 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{kpi.value} <span className="text-sm text-muted-foreground">{kpi.unit}</span></div>
                    {kpi.trend && <p className={`text-xs ${kpi.trendColor}`}>{kpi.trend}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
             <div className="grid gap-6 lg:grid-cols-2 mt-6">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-700 dark:text-blue-300"><Thermometer className="mr-2 h-5 w-5"/>Prévisions Météo Locales</CardTitle>
                  </CardHeader>
                  <CardContent className="h-full flex flex-col">
                    <WeatherForecastChart />
                  </CardContent>
                </Card>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center text-yellow-700 dark:text-yellow-300"><Droplets className="mr-2 h-5 w-5"/>Analyse de Sol ({selectedParcel?.name || myParcels[0].name})</CardTitle>
                     <CardDescription>
                      <Select defaultValue={selectedParcel?.id || myParcels[0].id} onValueChange={(value) => setSelectedParcel(myParcels.find(p => p.id === value))}>
                        <SelectTrigger className="w-full sm:w-[200px] h-8 text-xs mt-1">
                          <SelectValue placeholder="Changer de parcelle" />
                        </SelectTrigger>
                        <SelectContent>
                          {myParcels.map(p => <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-full flex flex-col">
                    <SoilAnalysisSimulation parcelName={selectedParcel?.name || myParcels[0].name} />
                  </CardContent>
                </Card>
              </div>
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center text-red-700 dark:text-red-300"><AlertTriangle className="mr-2 h-5 w-5"/>Alertes Phytosanitaires Actives</CardTitle>
                </CardHeader>
                <CardContent>
                    {phytosanitaryAlerts.length > 0 ? (
                         <ul className="space-y-3">
                            {phytosanitaryAlerts.map(alert => (
                                <li key={alert.id} className={`p-3 rounded-md border-l-4 ${alert.severity === 'Élevée' ? 'border-red-500 bg-red-50 dark:bg-red-900/30' : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">{alert.name} ({alert.culture} - {alert.zone})</p>
                                            <p className="text-xs text-muted-foreground">Sévérité: {alert.severity}</p>
                                        </div>
                                        <Button variant="link" size="xs" className="text-xs p-0 h-auto" onClick={() => handleSimulatedAction(`Détails pour alerte ${alert.name}`)}>Action: {alert.action}</Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-muted-foreground">Aucune alerte phytosanitaire active.</p>}
                </CardContent>
            </Card>
          </>
        );
      case 'parcels':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><MapPin className="mr-2 h-5 w-5"/>Gestion des Parcelles Agricoles</CardTitle>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-2">
                <Input type="search" placeholder="Rechercher par nom, culture..." className="max-w-xs" onChange={(e) => handleSimulatedAction(`Recherche de parcelles: ${e.target.value}`)} />
                <Select onValueChange={(value) => handleSimulatedAction(`Filtrage par région: ${value}`)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrer par région" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les régions</SelectItem>
                    <SelectItem value="dakar">Dakar</SelectItem>
                    <SelectItem value="ziguinchor">Ziguinchor</SelectItem>
                    <SelectItem value="thies">Thiès</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => handleSimulatedAction("Tri des parcelles.")}><Filter className="mr-2 h-4 w-4" />Trier</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-semibold">Parcelle / Nom</th>
                      <th className="text-left p-2 font-semibold">Culture</th>
                      <th className="text-left p-2 font-semibold">Surface</th>
                      <th className="text-left p-2 font-semibold">Santé Culture</th>
                      <th className="text-left p-2 font-semibold">Prochaine Action</th>
                      <th className="text-left p-2 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myParcels.map((parcel) => (
                      <tr key={parcel.id} className="border-b hover:bg-muted/30">
                        <td className="p-2 text-primary hover:underline"><Link to={`/parcelles/${parcel.id}`}>{parcel.name}</Link></td>
                        <td className="p-2">{parcel.culturePrincipale}</td>
                        <td className="p-2">{parcel.surface}</td>
                        <td className={`p-2 font-medium ${parcel.santeCulture === 'Excellente' ? 'text-green-600' : parcel.santeCulture === 'Bonne' ? 'text-green-500' : 'text-yellow-600'}`}>{parcel.santeCulture}</td>
                        <td className="p-2">{parcel.prochaineAction}</td>
                        <td className="p-2 space-x-1">
                          <Button variant="outline" size="xs" onClick={() => {setSelectedParcel(parcel); setActiveTab('overview'); handleSimulatedAction(`Voir détails pour ${parcel.name}`)}}>Détails</Button>
                          <Button variant="outline" size="xs" onClick={() => openJournalModal(parcel)}><BookOpen className="h-3 w-3"/></Button>
                          <Button variant="ghost" size="xs" onClick={() => handleSimulatedAction(`Ouvrir la carte pour ${parcel.name}`)}><Maximize className="h-3 w-3"/></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
               <Button variant="ghost" className="mt-4 text-primary p-0 hover:bg-transparent" onClick={() => handleSimulatedAction("Ouverture du formulaire d'ajout de parcelle.")}>
                 <PlusCircle className="h-4 w-4 mr-2"/> Ajouter une nouvelle parcelle
               </Button>
            </CardContent>
          </Card>
        );
      case 'calendar':
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><CalendarDays className="mr-2 h-5 w-5"/>Calendrier Agricole Personnalisé</CardTitle>
                    <CardDescription>Planifiez vos semences, récoltes et traitements (simulation).</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-muted/50 rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold">Prochaines Tâches (Juillet 2025)</h3>
                            <div className="flex space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handleSimulatedAction("Mois précédent")}>&lt;</Button>
                                <Button variant="outline" size="sm" onClick={() => handleSimulatedAction("Mois suivant")}>&gt;</Button>
                                <Button variant="outline" size="sm" onClick={() => handleSimulatedAction("Affichage du calendrier complet.")}>Vue Annuelle</Button>
                            </div>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex items-center p-3 bg-background rounded-md shadow-sm">
                                <CalendarDays className="h-5 w-5 mr-3 text-green-600"/>
                                <div>
                                    <p className="font-medium">Récolte Mangues (Champ Kagnout 1)</p>
                                    <p className="text-xs text-muted-foreground">Date prévue: 15 Juillet 2025</p>
                                </div>
                                <Button variant="ghost" size="xs" className="ml-auto" onClick={() => handleSimulatedAction("Marquer comme fait: Récolte Mangues")}><CheckCircle className="h-5 w-5 text-gray-400 hover:text-green-500"/></Button>
                            </li>
                            <li className="flex items-center p-3 bg-background rounded-md shadow-sm">
                                <CalendarDays className="h-5 w-5 mr-3 text-yellow-600"/>
                                <div>
                                    <p className="font-medium">Fertilisation Anacardiers (Verger Bignona)</p>
                                    <p className="text-xs text-muted-foreground">Date prévue: 01 Août 2025</p>
                                </div>
                                <Button variant="ghost" size="xs" className="ml-auto" onClick={() => handleSimulatedAction("Marquer comme fait: Fertilisation")}><CheckCircle className="h-5 w-5 text-gray-400 hover:text-green-500"/></Button>
                            </li>
                        </ul>
                         <Button variant="ghost" className="mt-4 text-primary p-0 hover:bg-transparent" onClick={() => handleSimulatedAction("Ouverture du formulaire d'ajout de tâche.")}>
                            <PlusCircle className="h-4 w-4 mr-2"/> Ajouter une tâche au calendrier
                        </Button>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center">
            <Sprout className="h-8 w-8 mr-3 text-green-600"/>
            Tableau de Bord Agriculteurs
          </h1>
          <p className="text-muted-foreground">Gestion de vos exploitations et données agricoles optimisées.</p>
        </div>
        <Button asChild variant="outline">
            <Link to="/solutions/agriculteurs">Retour aux Solutions Agriculteurs</Link>
        </Button>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {['overview', 'parcels', 'calendar'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
            >
              {tab === 'overview' ? 'Vue d\'ensemble' : tab === 'parcels' ? 'Mes Parcelles' : 'Calendrier Agricole'}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {renderTabContent()}
      </div>
    </motion.div>

    <Dialog open={isJournalModalOpen} onOpenChange={setIsJournalModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Journal de Bord: {selectedParcel?.name}</DialogTitle>
            <DialogDescription>
              Ajoutez et consultez les entrées du journal pour cette parcelle.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-60 overflow-y-auto my-4 pr-2 space-y-2">
            {selectedParcel?.journal?.length > 0 ? selectedParcel.journal.map((entry, index) => (
                <div key={index} className="text-xs p-2 bg-muted/50 rounded">
                    <p className="font-semibold">{new Date(entry.date).toLocaleDateString('fr-FR')}:</p>
                    <p>{entry.entry}</p>
                </div>
            )) : <p className="text-sm text-muted-foreground">Aucune entrée pour le moment.</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="journalEntry">Nouvelle Entrée</Label>
            <Textarea id="journalEntry" value={journalEntry} onChange={(e) => setJournalEntry(e.target.value)} placeholder="Ex: Semis effectué, traitement appliqué..." />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsJournalModalOpen(false)}>Fermer</Button>
            <Button type="button" onClick={handleAddJournalEntry}>Ajouter l'Entrée</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AgriculteursDashboardPage;