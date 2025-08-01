import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Banknote, ShieldCheck, FileText, BarChart3, Users, MapPin, DollarSign, TrendingUp, AlertTriangle, Download, Filter, Search, PlusCircle, FileWarning, Layers, Maximize } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { sampleAdminDashboardData } from '@/data/index.js';

const kpiData = [
  { title: "Garanties Évaluées (Mois)", value: "18", icon: FileText, trend: "+8%", trendColor: "text-green-500", unit: "dossiers" },
  { title: "Valeur Totale des Garanties", value: "1.5", icon: DollarSign, trend: "+3.2%", trendColor: "text-green-500", unit: "Mds XOF" },
  { title: "Risque Portefeuille Moyen", value: "Faible (2.1)", icon: ShieldCheck, trendColor: "text-green-500", trend: "Amélioration", unit: "score" },
  { title: "Dossiers Complexes", value: "2", icon: FileWarning, trendColor: "text-yellow-500", trend: "Nécessite Expertise", unit: "dossiers" },
];

const recentEvaluations = [
  { id: 'DK-ALM-002', type: 'Résidentiel', zone: 'Dakar', valeurEstimee: "150M XOF", risqueScore: 1.8, risqueLevel: 'Faible', date: '2025-06-10', rapportLien: '#' },
  { id: 'SLY-NGP-010', type: 'Résidentiel', zone: 'Saly', valeurEstimee: "32M XOF", risqueScore: 2.5, risqueLevel: 'Moyen', date: '2025-06-08', rapportLien: '#' },
  { id: 'DMN-CIT-005', type: 'Commercial', zone: 'Diamniadio', valeurEstimee: "25M XOF", risqueScore: 1.5, risqueLevel: 'Très Faible', date: '2025-06-05', rapportLien: '#' },
  { id: 'THS-EXT-021', type: 'Mixte', zone: 'Thiès', valeurEstimee: "18M XOF", risqueScore: 2.0, risqueLevel: 'Faible', date: '2025-06-02', rapportLien: '#' },
  {id: 'DK-YOF-007', type: 'Industriel', zone: 'Dakar', valeurEstimee: "350M XOF", risqueScore: 3.1, risqueLevel: 'Élevé', date: '2025-06-01', rapportLien: '#' , isComplex: true},
];

const PortfolioDistributionChart = () => (
  <div className="h-full bg-gradient-to-br from-sky-50 to-blue-100 dark:from-sky-900/30 dark:to-blue-800/30 rounded-lg p-4 flex flex-col items-center justify-center shadow-inner">
    <Layers className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-3" />
    <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">Distribution du Portefeuille (Type)</p>
    <div className="w-full mt-2 space-y-1.5">
      <div className="flex items-center text-xs">
        <div className="w-1/3 text-blue-700 dark:text-blue-300">Résidentiel</div>
        <div className="w-2/3 bg-blue-200 dark:bg-blue-700 rounded-full h-2.5"><div className="bg-blue-500 dark:bg-blue-400 h-2.5 rounded-full" style={{width: "60%"}}></div></div>
        <div className="w-1/6 text-right text-blue-700 dark:text-blue-300">60%</div>
      </div>
      <div className="flex items-center text-xs">
        <div className="w-1/3 text-blue-700 dark:text-blue-300">Commercial</div>
        <div className="w-2/3 bg-green-200 dark:bg-green-700 rounded-full h-2.5"><div className="bg-green-500 dark:bg-green-400 h-2.5 rounded-full" style={{width: "25%"}}></div></div>
        <div className="w-1/6 text-right text-blue-700 dark:text-blue-300">25%</div>
      </div>
      <div className="flex items-center text-xs">
        <div className="w-1/3 text-blue-700 dark:text-blue-300">Industriel</div>
        <div className="w-2/3 bg-orange-200 dark:bg-orange-700 rounded-full h-2.5"><div className="bg-orange-500 dark:bg-orange-400 h-2.5 rounded-full" style={{width: "10%"}}></div></div>
        <div className="w-1/6 text-right text-blue-700 dark:text-blue-300">10%</div>
      </div>
      <div className="flex items-center text-xs">
        <div className="w-1/3 text-blue-700 dark:text-blue-300">Autre (Mixte)</div>
        <div className="w-2/3 bg-yellow-200 dark:bg-yellow-700 rounded-full h-2.5"><div className="bg-yellow-500 dark:bg-yellow-400 h-2.5 rounded-full" style={{width: "5%"}}></div></div>
        <div className="w-1/6 text-right text-blue-700 dark:text-blue-300">5%</div>
      </div>
    </div>
     <Button variant="link" size="sm" className="mt-3 text-xs p-0 h-auto text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">Rapport Détaillé de Portefeuille</Button>
  </div>
);

const RiskMapSimulation = () => (
  <div className="h-full bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900/30 dark:to-pink-800/30 rounded-lg p-4 flex flex-col items-center justify-center shadow-inner">
    <MapPin className="h-12 w-12 text-red-600 dark:text-red-400 mb-3" />
    <p className="text-sm font-semibold text-red-800 dark:text-red-200">Carte des Risques Fonciers</p>
    <p className="text-xs text-center mt-1 text-red-700 dark:text-red-300">Visualisation des niveaux de risque par zone (données fictives).</p>
    <img  className="w-full h-auto mt-2 rounded" alt="Simulation de carte des risques fonciers avec zones colorées et icônes de danger" src="https://images.unsplash.com/photo-1542617752-e09fd73c3513" />
    <Button variant="link" size="sm" className="mt-2 text-xs p-0 h-auto text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">Explorer la Carte Interactive</Button>
  </div>
);


const BanquesDashboardPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const handleSimulatedAction = (message) => {
    toast({ title: "Action Simulée", description: message });
  };
  
  const getRiskColor = (level) => {
    if (level === 'Très Faible' || level === 'Faible') return 'text-green-600';
    if (level === 'Moyen') return 'text-yellow-600';
    if (level === 'Élevé') return 'text-red-600';
    return 'text-muted-foreground';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {kpiData.map((kpi, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow border-l-4 border-blue-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                    <kpi.icon className="h-5 w-5 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{kpi.value} <span className="text-sm text-muted-foreground">{kpi.unit}</span></div>
                    {kpi.trend && <p className={`text-xs ${kpi.trendColor}`}>{kpi.trend}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-3 mt-6">
                <div className="lg:col-span-1 space-y-6">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center text-blue-700 dark:text-blue-300"><Layers className="mr-2 h-5 w-5"/>Distribution du Portefeuille</CardTitle>
                    </CardHeader>
                    <CardContent className="h-full flex flex-col">
                      <PortfolioDistributionChart />
                    </CardContent>
                  </Card>
                </div>
                 <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center text-red-700 dark:text-red-300"><MapPin className="mr-2 h-5 w-5"/>Carte des Risques Fonciers</CardTitle>
                      <CardDescription>Visualisation des niveaux de risque par zone (simulation).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RiskMapSimulation />
                    </CardContent>
                  </Card>
            </div>
          </>
        );
      case 'evaluations':
        return (
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5"/>Évaluations de Garanties</CardTitle>
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 mt-2">
                <div className="relative w-full sm:w-auto sm:flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Rechercher par réf, zone..." className="pl-8 w-full sm:w-[300px]" onChange={(e) => handleSimulatedAction(`Recherche: ${e.target.value}`)} />
                </div>
                <Select onValueChange={(value) => handleSimulatedAction(`Filtrage par type de bien: ${value}`)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrer par type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous types</SelectItem>
                    <SelectItem value="residentiel">Résidentiel</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="industriel">Industriel</SelectItem>
                    <SelectItem value="mixte">Mixte</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={(value) => handleSimulatedAction(`Filtrage par risque: ${value}`)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrer par risque" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les risques</SelectItem>
                    <SelectItem value="faible">Faible</SelectItem>
                    <SelectItem value="moyen">Moyen</SelectItem>
                    <SelectItem value="eleve">Élevé</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="date" className="w-full sm:w-[180px]" onChange={(e) => handleSimulatedAction(`Filtrage par date: ${e.target.value}`)} />
                <Button variant="outline" onClick={() => handleSimulatedAction("Nouvelle évaluation.")}><PlusCircle className="mr-2 h-4 w-4"/>Nouvelle Évaluation</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-semibold">Référence</th>
                      <th className="text-left p-2 font-semibold">Zone</th>
                      <th className="text-left p-2 font-semibold">Type</th>
                      <th className="text-left p-2 font-semibold">Valeur Estimée</th>
                      <th className="text-left p-2 font-semibold">Risque</th>
                      <th className="text-left p-2 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEvaluations.map((evalItem) => (
                      <tr key={evalItem.id} className={`border-b hover:bg-muted/30 ${evalItem.isComplex ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}`}>
                        <td className="p-2 text-primary hover:underline">
                          <Link to={`/parcelles/${evalItem.id}`}>{evalItem.id}{evalItem.isComplex && <FileWarning className="inline ml-1 h-3 w-3 text-yellow-600"/>}</Link>
                        </td>
                        <td className="p-2">{evalItem.zone}</td>
                        <td className="p-2">{evalItem.type}</td>
                        <td className="p-2">{evalItem.valeurEstimee}</td>
                        <td className={`p-2 font-medium ${getRiskColor(evalItem.risqueLevel)}`}>{evalItem.risqueLevel} ({evalItem.risqueScore})</td>
                        <td className="p-2 space-x-1">
                           <Button variant="outline" size="xs" onClick={() => handleSimulatedAction(`Lancement analyse de risque détaillée pour ${evalItem.id}`)}>Analyser</Button>
                          <Button variant="ghost" size="xs" onClick={() => handleSimulatedAction(`Téléchargement du rapport pour ${evalItem.id}`)} title="Télécharger le rapport">
                            <Download className="h-3.5 w-3.5"/>
                          </Button>
                          <Button variant="ghost" size="xs" onClick={() => handleSimulatedAction(`Affichage des détails cartographiques pour ${evalItem.id}`)} title="Voir sur carte">
                            <Maximize className="h-3.5 w-3.5"/>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button variant="link" className="mt-4 p-0" onClick={() => handleSimulatedAction("Affichage de toutes les évaluations.")}>Voir toutes les évaluations</Button>
            </CardContent>
          </Card>
        );
      case 'reports':
         return (
            <Card>
                <CardHeader>
                    <CardTitle>Rapports et Analyses Avancées</CardTitle>
                    <CardDescription>Générez des rapports personnalisés et accédez à des analyses approfondies.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 border rounded-md">
                        <h3 className="font-semibold text-sm mb-2">Rapport de Portefeuille Mensuel</h3>
                        <p className="text-xs text-muted-foreground mb-2">Synthèse de la performance, évaluation des risques et évolution de la valeur de votre portefeuille.</p>
                        <Button onClick={() => handleSimulatedAction("Génération du rapport de portefeuille (Juin 2025).")}><Download className="mr-2 h-4 w-4"/>Générer Rapport (Juin 2025)</Button>
                    </div>
                    <div className="p-4 border rounded-md">
                        <h3 className="font-semibold text-sm mb-2">Analyse de Risque par Zone</h3>
                        <p className="text-xs text-muted-foreground mb-2">Comparez les niveaux de risque, les types de litiges fréquents et les tendances d'évolution par zone géographique.</p>
                         <Select onValueChange={(value) => handleSimulatedAction(`Génération rapport risque pour ${value}.`)}>
                            <SelectTrigger className="w-full sm:w-[220px]">
                                <SelectValue placeholder="Sélectionner une zone" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="dakar_plateau">Dakar Plateau</SelectItem>
                                <SelectItem value="almadies">Almadies</SelectItem>
                                <SelectItem value="diamniadio_pole">Diamniadio Pôle Urbain</SelectItem>
                                <SelectItem value="saly_portudal">Saly Portudal</SelectItem>
                                <SelectItem value="thies_ville">Thiès Ville</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="p-4 border rounded-md">
                        <h3 className="font-semibold text-sm mb-2">Simulation de Scénarios de Portefeuille</h3>
                        <p className="text-xs text-muted-foreground mb-2">Testez l'impact de l'ajout ou de la cession d'actifs sur la performance globale de votre portefeuille.</p>
                        <Button variant="outline" onClick={() => handleSimulatedAction("Ouverture du module de simulation de scénarios.")}>Lancer une Simulation</Button>
                    </div>
                </CardContent>
            </Card>
         );
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 p-4 md:p-6 lg:p-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center">
            <Banknote className="h-8 w-8 mr-3 text-blue-600"/>
            Tableau de Bord Banques & Institutions Financières
          </h1>
          <p className="text-muted-foreground">Outils et analyses pour la gestion des actifs fonciers et l'évaluation des risques.</p>
        </div>
        <Button asChild variant="outline">
            <Link to="/solutions/banques">Retour aux Solutions Banques</Link>
        </Button>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {['overview', 'evaluations', 'reports'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
            >
              {tab === 'overview' ? 'Vue d\'ensemble' : tab === 'evaluations' ? 'Évaluations Détaillées' : 'Rapports & Analyses'}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {renderTabContent()}
      </div>
    </motion.div>
  );
};

export default BanquesDashboardPage;