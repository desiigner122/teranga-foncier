import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, DollarSign, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/spinner';

const RoiCalculatorPage = () => {
  const [coutTotal, setCoutTotal] = useState('');
  const [revenuEstime, setRevenuEstime] = useState('');
  const [roi, setRoi] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const calculateRoi = () => {
    if (coutTotal > 0 && revenuEstime > 0) {
      const gain = revenuEstime - coutTotal;
      const calculatedRoi = (gain / coutTotal) * 100;
      setRoi(calculatedRoi.toFixed(2));
    } else {
      setRoi(null);
    }
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
      <h1 className="text-3xl font-bold flex items-center"><Calculator className="mr-3 h-8 w-8"/>Calculateur de ROI</h1>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Simulez le Retour sur Investissement</CardTitle>
          <CardDescription>Entrez les coûts et revenus estimés pour calculer le ROI potentiel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="coutTotal">Coût Total de l'Investissement (FCFA)</Label>
            <Input id="coutTotal" type="number" placeholder="Ex: 50000000" value={coutTotal} onChange={(e) => setCoutTotal(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="revenuEstime">Revenu/Valeur de Revente Estimé (FCFA)</Label>
            <Input id="revenuEstime" type="number" placeholder="Ex: 65000000" value={revenuEstime} onChange={(e) => setRevenuEstime(e.target.value)} />
          </div>
          <Button onClick={calculateRoi}><TrendingUp className="mr-2 h-4 w-4"/> Calculer le ROI</Button>
          {roi !== null && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
              <p className="text-lg font-semibold text-green-800 dark:text-green-200">ROI Estimé</p>
              <p className="text-4xl font-bold text-green-600">{roi}%</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RoiCalculatorPage;