import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Leaf, TestTube, PlusCircle, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LoadingSpinner from '@/components/ui/spinner';

const initialAnalysisData = [
  { id: 'ANL001', parcel: 'Champ Kagnout 1', date: '2025-03-10', ph: 6.5, organicMatter: '2.5%', nitrogen: 'Moyen', phosphorus: 'Élevé', potassium: 'Bon' },
  { id: 'ANL002', parcel: 'Maraîchage Niayes', date: '2025-05-20', ph: 5.8, organicMatter: '1.8%', nitrogen: 'Faible', phosphorus: 'Moyen', potassium: 'Faible' },
];

const SoilAnalysisPage = () => {
  const { toast } = useToast();
  const [analysisData, setAnalysisData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnalysisData(initialAnalysisData);
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
        <h1 className="text-3xl font-bold flex items-center"><Leaf className="mr-3 h-8 w-8"/>Analyse de Sol</h1>
        <Button onClick={() => handleAction("Ouverture du formulaire de demande d'analyse.")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Demander une Analyse
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rapports d'Analyse</CardTitle>
          <Select>
            <SelectTrigger className="w-[280px] mt-2">
              <SelectValue placeholder="Sélectionner une parcelle pour voir l'analyse" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="p1">Champ Kagnout 1</SelectItem>
              <SelectItem value="p2">Maraîchage Niayes</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Parcelle</th>
                  <th className="text-left p-2 font-semibold">Date</th>
                  <th className="text-left p-2 font-semibold">pH</th>
                  <th className="text-left p-2 font-semibold">M. Organique</th>
                  <th className="text-left p-2 font-semibold">Azote (N)</th>
                  <th className="text-left p-2 font-semibold">Phosphore (P)</th>
                  <th className="text-left p-2 font-semibold">Potassium (K)</th>
                  <th className="text-right p-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {analysisData.map(data => (
                  <tr key={data.id} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-medium">{data.parcel}</td>
                    <td className="p-2">{data.date}</td>
                    <td className="p-2">{data.ph}</td>
                    <td className="p-2">{data.organicMatter}</td>
                    <td className="p-2">{data.nitrogen}</td>
                    <td className="p-2">{data.phosphorus}</td>
                    <td className="p-2">{data.potassium}</td>
                    <td className="p-2 text-right">
                      <Button variant="outline" size="sm" onClick={() => handleAction(`Téléchargement du rapport ${data.id}.`)}><Download className="mr-1 h-4 w-4" /> PDF</Button>
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

export default SoilAnalysisPage;