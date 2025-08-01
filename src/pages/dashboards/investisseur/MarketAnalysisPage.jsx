import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { TrendingUp, MapPin, DollarSign, Building } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import LoadingSpinner from '@/components/ui/spinner';

const priceTrendData = [
  { name: '2022', Dakar: 150000, Saly: 60000, Diamniadio: 25000 },
  { name: '2023', Dakar: 165000, Saly: 68000, Diamniadio: 35000 },
  { name: '2024', Dakar: 180000, Saly: 75000, Diamniadio: 42000 },
  { name: '2025', Dakar: 195000, Saly: 82000, Diamniadio: 50000 },
];

const MarketAnalysisPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

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
      <h1 className="text-3xl font-bold flex items-center"><TrendingUp className="mr-3 h-8 w-8"/>Analyse de Marché</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Évolution du Prix au m² par Zone</CardTitle>
          <CardDescription>Comparaison des zones à fort potentiel.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={priceTrendData}>
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `${value/1000}k`} />
              <Tooltip formatter={(value) => new Intl.NumberFormat('fr-SN').format(value)} />
              <Legend />
              <Line type="monotone" dataKey="Dakar" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="Saly" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="Diamniadio" stroke="#22c55e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center"><MapPin className="mr-2"/>Zone la plus dynamique</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">Diamniadio</p><p className="text-sm text-muted-foreground">+20% de transactions</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center"><Building className="mr-2"/>Type de bien le plus recherché</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">Résidentiel</p><p className="text-sm text-muted-foreground">Lots de 200-300 m²</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center"><DollarSign className="mr-2"/>Rendement moyen</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">12.8% / an</p><p className="text-sm text-muted-foreground">Sur les 24 derniers mois</p></CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default MarketAnalysisPage;