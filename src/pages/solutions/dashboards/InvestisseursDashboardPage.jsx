import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { TrendingUp, ShieldCheck, Briefcase, DollarSign, MapPin, BarChartHorizontalBig, Filter, Eye, Search, AlertCircle, ExternalLink, FileSearch, Users, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { sampleAdminDashboardData } from '@/data/index.js';

const kpiData = [
  { title: "Investissements Actifs", value: "8", icon: Briefcase, trend: "+2", trendColor: "text-green-500", unit: "biens" },
  { title: "Valeur Portefeuille Estimée", value: "875", icon: DollarSign, trend: "+75M", trendColor: "text-green-500", unit: "M XOF" },
  { title: "Rendement Annuel Moyen", value: "12.8", icon: TrendingUp, trendColor: "text-green-500", trend: "+0.8%", unit: "%" },
  { title: "Opportunités Suivies", value: "6", icon: Filter, trendColor: "text-blue-500", trend: "2 nouvelles", unit: "opportunités" },
];

const portfolioHighlights = [
  { id: 'DK-ALM-002', name: 'Terrain Almadies (Résidentiel)', valeurActuelle: "170M XOF", plusValueLatente: "+20M XOF", zone: 'Dakar', dateAcquisition: '2023-01-15', type: 'Résidentiel', rendementAnnuelEst: '15%' },
  { id: 'DMN-CIT-005', name: 'Pôle Diamniadio (Commercial)', valeurActuelle: "32M XOF", plusValueLatente: "+7M XOF", zone: 'Diamniadio', dateAcquisition: '2024-06-10', type: 'Commercial', rendementAnnuelEst: '10%' },
  { id: 'ZG-AGRI-001', name: 'Agricole Casamance (Export)', valeurActuelle: "60M XOF", plusValueLatente: "+15M XOF", zone: 'Ziguinchor', dateAcquisition: '2022-09-01', type: 'Agricole', rendementAnnuelEst: '18%' },
  { id: 'SLY-SOM-003', name: 'Villa Somone (Touristique)', valeurActuelle: "48M XOF", plusValueLatente: "+11M XOF", zone: 'Saly', dateAcquisition: '2023-11-20', type: 'Touristique', rendementAnnuelEst: '12%' },
];

const newOpportunities = [
    {id: 'OPP001', name: 'Terrain bord de mer Popenguine', potentiel: 'Touristique Haut Standing', prixEst: '75M XOF', zone: 'Popenguine', risque: 'Faible', dueDiligenceStatus: 'Disponible'}, 
    {id: 'OPP002', name: 'Parcelle industrielle Diamniadio', potentiel: 'Logistique / Usine', prixEst: '120M XOF', zone: 'Diamniadio', risque: 'Moyen', dueDiligenceStatus: 'Demandable'},
    {id: 'OPP003', name: 'Lot résidentiel Thiès Plateau', potentiel: 'Résidentiel moyen standing', prixEst: '20M XOF', zone: 'Thiès', risque: 'Faible', dueDiligenceStatus: 'Partielle'},
    {id: 'OPP004', name: 'Ferme Agricole Région de Kaolack', potentiel: 'Arachide/Mil Bio', prixEst: '35M XOF', zone: 'Kaolack', risque: 'Moyen', dueDiligenceStatus: 'Demandable'},
];

const InvestmentValueChart = () => (
  <div className="h-full bg-gradient-to-br from-pink-50 to-red-100 dark:from-pink-900/30 dark:to-red-800/30 rounded-lg p-4 flex flex-col items-center justify-center shadow-inner">
    <BarChartHorizontalBig className="h-12 w-12 text-red-600 dark:text-red-400 mb-3" />
    <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">Évolution Valeur Portefeuille</p>
    <div className="w-full mt-2 space-y-1.5">
      {[
        { year: '2023', value: 50, label: '500M XOF', color: 'bg-red-400 dark:bg-red-600' },
        { year: '2024', value: 70, label: '700M XOF', color: 'bg-red-500 dark:bg-red-500' },
        { year: '2025 (Proj.)', value: 90, label: '900M XOF', color: 'bg-red-600 dark:bg-red-400' }
      ].map(item => (
        <div key={item.year} className="flex items-center text-xs text-red-700 dark:text-red-300">
          <div className="w-1/4">{item.year}</div>
          <div className="w-2/4 bg-red-200 dark:bg-red-700 rounded-full h-3"><div className={`${item.color} h-3 rounded-full`} style={{width: `${item.value}%`}}></div></div>
          <div className="w-1/4 text-right">{item.label}</div>
        </div>
      ))}
    </div>
    <Button variant="link" size="sm" className="mt-3 text-xs p-0 h-auto text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">Analyse Détaillée des Performances</Button>
  </div>
);

const DiversificationPieChart = () => (
    <div className="h-full bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-900/30 dark:to-purple-800/30 rounded-lg p-4 flex flex-col items-center justify-center shadow-inner">
        <Briefcase className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mb-3"/>
        <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200 mb-2">Diversification du Portefeuille</p>
        <img  className="w-3/4 h-auto my-2" alt="Diagramme circulaire de diversification de portefeuille d'investissement avec légendes colorées" src="https://images.unsplash.com/photo-1689732888407-310424e3a372" />
        <ul className="text-xs mt-1 grid grid-cols-2 gap-x-4 text-indigo-700 dark:text-indigo-300">
            <li><span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>Résidentiel: 40%</li>
            <li><span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>Commercial: 30%</li>
            <li><span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>Agricole: 20%</li>
            <li><span className="inline-block w-2 h-2 bg-purple-500 rounded-full mr-1"></span>Industriel: 10%</li>
        </ul>
        <Button variant="link" size="sm" className="mt-2 text-xs p-0 h-auto text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">Optimiser la Diversification (Sim.)</Button>
    </div>
);

const InvestisseursDashboardPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const handleSimulatedAction = (message) => {
    toast({ title: "Action Simulée", description: message });
  };

  const renderTabContent = () => {
    switch(activeTab) {
        case 'overview':
            return (
                <>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {kpiData.map((kpi, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow border-l-4 border-red-500">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                            <kpi.icon className="h-5 w-5 text-red-600" />
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
                            <CardTitle className="flex items-center text-red-700 dark:text-red-300"><BarChartHorizontalBig className="mr-2 h-5 w-5"/>Évolution de la Valeur du Portefeuille</CardTitle>
                        </CardHeader>
                        <CardContent className="h-full flex flex-col">
                            <InvestmentValueChart />
                        </CardContent>
                        </Card>
                        <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center text-indigo-700 dark:text-indigo-300"><ShieldCheck className="mr-2 h-5 w-5"/>Diversification du Portefeuille</CardTitle>
                        </CardHeader>
                        <CardContent className="h-full flex flex-col">
                            <DiversificationPieChart />
                        </CardContent>
                        </Card>
                    </div>
                </>
            );
        case 'portfolio':
            return (
                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center"><Briefcase className="mr-2 h-5 w-5"/>Mon Portefeuille d'Investissements</CardTitle>
                     <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 mt-2">
                        <div className="relative w-full sm:w-auto sm:flex-grow">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input type="search" placeholder="Rechercher par nom, zone..." className="pl-8 w-full sm:w-[300px]" onChange={(e) => handleSimulatedAction(`Recherche portefeuille: ${e.target.value}`)} />
                        </div>
                        <Select onValueChange={(value) => handleSimulatedAction(`Filtrage portefeuille par type: ${value}`)}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filtrer par type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous types</SelectItem>
                            <SelectItem value="residentiel">Résidentiel</SelectItem>
                            <SelectItem value="commercial">Commercial</SelectItem>
                            <SelectItem value="agricole">Agricole</SelectItem>
                             <SelectItem value="touristique">Touristique</SelectItem>
                        </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={() => handleSimulatedAction("Export du portefeuille au format PDF.")}>
                            <Download className="mr-2 h-4 w-4" /> Exporter PDF
                        </Button>
                    </div>
                    </CardHeader>
                    <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                            <th className="text-left p-2 font-semibold">Nom / Référence</th>
                            <th className="text-left p-2 font-semibold">Zone</th>
                            <th className="text-left p-2 font-semibold">Valeur Actuelle</th>
                            <th className="text-left p-2 font-semibold">Rdt. Annuel Est.</th>
                            <th className="text-left p-2 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {portfolioHighlights.map((item) => (
                            <tr key={item.id} className="border-b hover:bg-muted/30">
                                <td className="p-2 text-primary hover:underline"><Link to={`/parcelles/${item.id}`}>{item.name}</Link></td>
                                <td className="p-2">{item.zone}</td>
                                <td className="p-2">{item.valeurActuelle}</td>
                                <td className="p-2 text-green-600">{item.rendementAnnuelEst}</td>
                                <td className="p-2 space-x-1">
                                <Button variant="outline" size="xs" onClick={() => handleSimulatedAction(`Affichage des détails de performance pour ${item.name}`)}>Performance</Button>
                                <Button variant="ghost" size="xs" onClick={() => handleSimulatedAction(`Affichage des documents pour ${item.name}`)} title="Documents">
                                    <FileSearch className="h-3.5 w-3.5"/>
                                </Button>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                    <Button variant="link" className="mt-4 p-0" onClick={() => handleSimulatedAction("Affichage du portefeuille complet.")}>Voir le portefeuille complet</Button>
                    </CardContent>
                </Card>
            );
        case 'opportunities':
            return (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><Filter className="mr-2 h-5 w-5"/>Nouvelles Opportunités d'Investissement</CardTitle>
                        <CardDescription>Terrains sélectionnés pour leur potentiel (simulation).</CardDescription>
                        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 mt-2">
                            <Input type="search" placeholder="Rechercher par zone, potentiel..." className="w-full sm:w-[250px]" onChange={(e) => handleSimulatedAction(`Recherche opportunités: ${e.target.value}`)} />
                             <Select onValueChange={(value) => handleSimulatedAction(`Filtrage opportunités par risque: ${value}`)}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filtrer par risque" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous risques</SelectItem>
                                    <SelectItem value="faible">Faible</SelectItem>
                                    <SelectItem value="moyen">Moyen</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {newOpportunities.map(opp => (
                                <li key={opp.id} className="p-3 bg-muted/30 rounded-md flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                    <div>
                                        <p className="font-medium text-primary">{opp.name} ({opp.zone})</p>
                                        <p className="text-xs text-muted-foreground">Potentiel: {opp.potentiel} | Prix estimé: {opp.prixEst} | Risque: <span className={opp.risque === 'Faible' ? 'text-green-600' : 'text-yellow-600'}>{opp.risque}</span></p>
                                        <p className="text-xs text-muted-foreground">Diligence: {opp.dueDiligenceStatus}</p>
                                    </div>
                                    <div className="flex space-x-2 shrink-0">
                                        <Button size="sm" variant="outline" onClick={() => handleSimulatedAction(`Demande de Due Diligence pour ${opp.name}`)} disabled={opp.dueDiligenceStatus !== 'Demandable'}>Due Diligence</Button>
                                        <Button size="sm" onClick={() => handleSimulatedAction(`Ajout de ${opp.name} à la liste de suivi.`)}><AlertCircle className="mr-1 h-4 w-4"/>Suivre</Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <Button variant="link" className="mt-4 p-0" onClick={() => handleSimulatedAction("Affichage de toutes les opportunités.")}>Voir toutes les opportunités</Button>
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
            <TrendingUp className="h-8 w-8 mr-3 text-red-600"/>
            Tableau de Bord Investisseurs
          </h1>
          <p className="text-muted-foreground">Suivi de portefeuille, analyse de performances et détection d'opportunités.</p>
        </div>
        <Button asChild variant="outline">
            <Link to="/solutions/investisseurs">Retour aux Solutions Investisseurs</Link>
        </Button>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {['overview', 'portfolio', 'opportunities'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
            >
              {tab === 'overview' ? 'Vue d\'ensemble' : tab === 'portfolio' ? 'Mon Portefeuille Actif' : 'Nouvelles Opportunités'}
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

export default InvestisseursDashboardPage;