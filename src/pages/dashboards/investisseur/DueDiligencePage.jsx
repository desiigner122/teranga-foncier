import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Search, PlusCircle, Download, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/spinner';

const initialDueDiligenceReports = [
  { id: 'DD001', parcelId: 'DK-ALM-002', status: 'Complété', date: '2022-12-15', riskLevel: 'Faible', summary: 'Titre foncier clair, pas de litiges.' },
  { id: 'DD002', parcelId: 'DMN-CIT-005', status: 'En cours', date: '2024-07-01', riskLevel: 'N/A', summary: 'Vérification du plan de zonage.' },
  { id: 'DD003', parcelId: 'OPP002', status: 'Demandé', date: '2025-07-16', riskLevel: 'N/A', summary: 'En attente des documents du vendeur.' },
];

const DueDiligencePage = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setReports(initialDueDiligenceReports);
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center"><ShieldCheck className="mr-3 h-8 w-8"/>Due Diligence</h1>
        <Button onClick={() => handleAction("Ouverture du formulaire de demande de Due Diligence.")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Nouvelle Demande
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suivi des Rapports de Due Diligence</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher par parcelle..." className="pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Parcelle</th>
                  <th className="text-left p-2 font-semibold">Statut</th>
                  <th className="text-left p-2 font-semibold">Niveau de Risque</th>
                  <th className="text-left p-2 font-semibold">Résumé</th>
                  <th className="text-right p-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-mono">{report.parcelId}</td>
                    <td className="p-2"><Badge variant={report.status === 'Complété' ? 'success' : 'warning'}>{report.status}</Badge></td>
                    <td className="p-2"><Badge variant={report.riskLevel === 'Faible' ? 'success' : 'secondary'}>{report.riskLevel}</Badge></td>
                    <td className="p-2 text-muted-foreground">{report.summary}</td>
                    <td className="p-2 text-right">
                      <Button variant="outline" size="sm" disabled={report.status !== 'Complété'} onClick={() => handleAction(`Téléchargement du rapport ${report.id}.`)}><Download className="mr-1 h-4 w-4" /> Rapport</Button>
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

export default DueDiligencePage;