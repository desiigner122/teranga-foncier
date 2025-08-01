import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderCheck, Download, Filter, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/spinner';

const initialComplianceReports = [
  { id: 'REP001', title: 'Rapport de Conformité Trimestriel Q2 2025', date: '2025-07-01', type: 'Portefeuille Global' },
  { id: 'REP002', title: 'Audit de Conformité - Zone Diamniadio', date: '2025-06-15', type: 'Audit Spécifique' },
  { id: 'REP003', title: 'Rapport sur les Garanties à Risque Élevé', date: '2025-06-05', type: 'Analyse de Risque' },
];

const CompliancePage = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setReports(initialComplianceReports);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleAction = (message) => {
    toast({ title: "Action Simulée", description: message });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold flex items-center"><FolderCheck className="mr-3 h-8 w-8"/>Rapports de Conformité</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Générer un nouveau rapport</CardTitle>
          <CardDescription>Créez des rapports de conformité basés sur des modèles prédéfinis.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => handleAction("Génération d'un nouveau rapport de conformité.")}>Générer un Rapport</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historique des Rapports</CardTitle>
          <div className="flex space-x-2 pt-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher un rapport..." className="pl-8" />
            </div>
            <Button variant="outline" onClick={() => handleAction("Filtres de rapports appliqués.")}><Filter className="mr-2 h-4 w-4" /> Filtrer</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Titre du Rapport</th>
                  <th className="text-left p-2 font-semibold">Type</th>
                  <th className="text-left p-2 font-semibold">Date</th>
                  <th className="text-right p-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-medium">{report.title}</td>
                    <td className="p-2">{report.type}</td>
                    <td className="p-2">{report.date}</td>
                    <td className="p-2 text-right">
                      <Button variant="outline" size="sm" onClick={() => handleAction(`Téléchargement du rapport ${report.id}.`)}><Download className="mr-1 h-4 w-4" /> Télécharger</Button>
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

export default CompliancePage;