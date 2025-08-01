import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LandPlot, PlusCircle, Map, BookOpen } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/spinner';

const initialMyLandsData = [
  { id: 'ZG-AGRI-001', name: 'Champ Kagnout 1', culture: 'Mangues', surface: '5 Ha', sante: 'Excellente' },
  { id: 'ZG-AGRI-004', name: 'Verger Anacardiers Bignona', culture: 'Anacardiers', surface: '7 Ha', sante: 'Bonne' },
  { id: 'DK-AGRI-007', name: 'Maraîchage Niayes', culture: 'Tomates, Piments', surface: '0.5 Ha', sante: 'Moyenne' },
];

const MyLandsPage = () => {
  const { toast } = useToast();
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLands(initialMyLandsData);
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
        <h1 className="text-3xl font-bold flex items-center"><LandPlot className="mr-3 h-8 w-8"/>Mes Parcelles Agricoles</h1>
        <Button onClick={() => handleAction("Recherche de nouvelles parcelles agricoles.")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Trouver une nouvelle parcelle
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {lands.map(land => (
          <Card key={land.id}>
            <CardHeader>
              <CardTitle>{land.name}</CardTitle>
              <CardDescription>Culture principale: {land.culture}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Surface: {land.surface}</p>
              <p className="text-sm">Santé de la culture: <Badge variant={land.sante === 'Excellente' ? 'success' : land.sante === 'Bonne' ? 'default' : 'warning'}>{land.sante}</Badge></p>
              <div className="flex space-x-2 mt-4">
                <Button asChild variant="outline" size="sm"><Link to={`/parcelles/${land.id}`}><Map className="mr-1 h-4 w-4" /> Carte</Link></Button>
                <Button asChild variant="outline" size="sm"><Link to="/dashboard/logbook"><BookOpen className="mr-1 h-4 w-4" /> Journal</Link></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

export default MyLandsPage;