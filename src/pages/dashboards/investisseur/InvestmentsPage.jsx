import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, TrendingUp, Download, Filter } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/spinner';

const initialInvestments = [
  { id: 'DK-ALM-002', name: 'Terrain Résidentiel Almadies', purchasePrice: '150M XOF', currentValue: '170M XOF', gain: '+20M XOF', gainPercent: '+13.3%' },
  { id: 'DMN-CIT-005', name: 'Pôle Diamniadio (Commercial)', purchasePrice: '25M XOF', currentValue: '32M XOF', gain: '+7M XOF', gainPercent: '+28.0%' },
  { id: 'ZG-AGRI-001', name: 'Agricole Casamance (Export)', purchasePrice: '45M XOF', currentValue: '60M XOF', gain: '+15M XOF', gainPercent: '+33.3%' },
];

const InvestmentsPage = () => {
  const { toast } = useToast();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInvestments(initialInvestments);
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
        <h1 className="text-3xl font-bold flex items-center"><Briefcase className="mr-3 h-8 w-8"/>Mes Investissements</h1>
        <Button variant="outline" onClick={() => handleAction("Export du portefeuille au format PDF.")}>
          <Download className="mr-2 h-4 w-4" /> Exporter
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance du Portefeuille</CardTitle>
          <CardDescription>Suivez la valeur et la performance de vos actifs fonciers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Actif</th>
                  <th className="text-left p-2 font-semibold">Prix d'Achat</th>
                  <th className="text-left p-2 font-semibold">Valeur Actuelle</th>
                  <th className="text-left p-2 font-semibold">Plus/Moins-Value</th>
                  <th className="text-right p-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {investments.map(inv => (
                  <tr key={inv.id} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-medium">{inv.name}</td>
                    <td className="p-2">{inv.purchasePrice}</td>
                    <td className="p-2 font-semibold">{inv.currentValue}</td>
                    <td className="p-2 text-green-600 font-medium">{inv.gain} ({inv.gainPercent})</td>
                    <td className="p-2 text-right">
                      <Button asChild variant="outline" size="sm"><Link to={`/parcelles/${inv.id}`}><TrendingUp className="mr-1 h-4 w-4" />Analyse</Link></Button>
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

export default InvestmentsPage;