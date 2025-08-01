import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Search, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/ui/spinner';

const ComplianceCheckPage = () => {
  const { toast } = useToast();
  const [parcelId, setParcelId] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleCheck = () => {
    if (!parcelId.trim()) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Veuillez entrer une référence de parcelle.' });
      return;
    }
    // Simulation
    setCheckResult({
      parcelId: parcelId,
      urbanisme: 'Conforme',
      fiscal: 'À jour',
      litiges: 'Aucun',
      overall: 'Conforme',
    });
    toast({ title: 'Vérification terminée', description: `Résultats pour la parcelle ${parcelId} affichés.` });
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
      <h1 className="text-3xl font-bold flex items-center"><ShieldCheck className="mr-3 h-8 w-8"/>Vérification de Conformité</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Lancer une Vérification</CardTitle>
          <CardDescription>Entrez la référence d'une parcelle pour vérifier sa conformité (urbanisme, fiscalité, litiges).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <div className="relative flex-grow">
              <FileText className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Réf. parcelle (ex: DK-ALM-002)" 
                className="pl-8"
                value={parcelId}
                onChange={(e) => setParcelId(e.target.value)}
              />
            </div>
            <Button onClick={handleCheck}><Search className="mr-2 h-4 w-4" /> Vérifier</Button>
          </div>
        </CardContent>
      </Card>

      {checkResult && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats pour {checkResult.parcelId}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex justify-between items-center"><span>Conformité Urbanisme:</span> <Badge variant={checkResult.urbanisme === 'Conforme' ? 'success' : 'destructive'}>{checkResult.urbanisme}</Badge></li>
              <li className="flex justify-between items-center"><span>Situation Fiscale:</span> <Badge variant={checkResult.fiscal === 'À jour' ? 'success' : 'destructive'}>{checkResult.fiscal}</Badge></li>
              <li className="flex justify-between items-center"><span>Litiges en cours:</span> <Badge variant={checkResult.litiges === 'Aucun' ? 'success' : 'destructive'}>{checkResult.litiges}</Badge></li>
              <li className="flex justify-between items-center pt-2 border-t mt-2"><strong>Verdict Global:</strong> <Badge variant={checkResult.overall === 'Conforme' ? 'success' : 'destructive'} className="text-base">{checkResult.overall}</Badge></li>
            </ul>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default ComplianceCheckPage;