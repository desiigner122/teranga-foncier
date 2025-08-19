import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Landmark, Search, Layers, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/ui/spinner';

const UrbanPlanPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Future integration: dynamic urban zoning layers + regulation PDF download from storage

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
      <h1 className="text-3xl font-bold flex items-center"><Landmark className="mr-3 h-8 w-8"/>Plan d'Urbanisme</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Plan Directeur d'Urbanisme (PDU)</CardTitle>
          <CardDescription>Consultez les zonages, les règlements et les projets d'aménagement.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[500px] bg-muted rounded-lg flex items-center justify-center">
            <img src="https://images.unsplash.com/photo-1614783702763-48dcc1f32a91" alt="Carte d'urbanisme" className="w-full h-full object-cover rounded-lg" />
          </div>
          <div className="flex space-x-2 mt-4">
            <Button variant="outline" disabled title="Bientôt: couches dynamiques basées sur urban_zones">
              <Layers className="mr-2 h-4 w-4" /> Afficher les Zones
            </Button>
            <Button variant="outline" disabled title="Bientôt: téléchargement PDF règlement">
              <Download className="mr-2 h-4 w-4" /> Télécharger le Règlement
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UrbanPlanPage;