import React, { useState, useEffect } from 'react';
import { useRealtimeTable, useRealtimeUsers, useRealtimeParcels, useRealtimeParcelSubmissions } from '@/hooks/useRealtimeTable';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, DollarSign, TrendingUp, Save, History, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { SupabaseDataService } from '@/services/supabaseDataService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const RoiCalculatorPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  // Loading géré par le hook temps réel
  const [calculating, setCalculating] = useState(false);
  const { data: savedCalculations, loading: savedCalculationsLoading, error: savedCalculationsError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (savedCalculations) {
      setFilteredData(savedCalculations);
    }
  }, [savedCalculations]);
  
  useEffect(() => {
    if (user) {
      loadSavedCalculations();
    }
    setLoading(false);
  }, [user]);

  const loadSavedCalculations = async () => {
    try {
      if (!user?.id) return;

      const { data: calculations, error } = await SupabaseDataService.supabaseClient
        .from('roi_calculations')
        .select('*')
        .eq('investor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur chargement calculs:', error);
      }

      setSavedCalculations(calculations || []);
    } catch (error) {
      console.error('Erreur chargement calculs ROI:', error);
    }
  };

  const calculateRoi = async () => {
    if (!coutTotal || !revenuEstime) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez remplir au minimum le coût total et le revenu estimé"
      });
      return;
    }

    setCalculating(true);

    try {
      const cout = parseFloat(coutTotal);
      const revenu = parseFloat(revenuEstime);
      const duree = parseFloat(dureeInvestissement) || 1;
      const taux = parseFloat(tauxActualisation) / 100;
      const frais = parseFloat(fraisAnnuels) || 0;

      let calculationResults;

      if (calculationType === 'simple') {
        // ROI simple
        const gain = revenu - cout;
        const roiSimple = (gain / cout) * 100;
        const roiAnnualise = duree > 0 ? roiSimple / duree : roiSimple;

        calculationResults = {
          type: 'simple',
          roiSimple: roiSimple.toFixed(2),
          roiAnnualise: roiAnnualise.toFixed(2),
          gain: gain.toFixed(2),
          rentabilite: roiSimple > 0 ? 'Profitable' : 'Non profitable'
        };
      } else {
        // ROI actualisé (VAN/TRI)
        const fluxAnnuel = (revenu - frais) / duree;
        let van = -cout;
        
        for (let i = 1; i <= duree; i++) {
          van += fluxAnnuel / Math.pow(1 + taux, i);
        }

        const tri = calculateTRI(cout, fluxAnnuel, duree);
        const roiActualise = (van / cout) * 100;

        calculationResults = {
          type: 'advanced',
          van: van.toFixed(2),
          tri: tri.toFixed(2),
          roiActualise: roiActualise.toFixed(2),
          fluxAnnuel: fluxAnnuel.toFixed(2),
          rentabilite: van > 0 ? 'Profitable (VAN positive)' : 'Non profitable (VAN négative)'
        };
      }

      setResults(calculationResults);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur de calcul",
        description: "Vérifiez que tous les montants sont des nombres valides"
      });
    } finally {
      setCalculating(false);
    }
  };

  const calculateTRI = (investissement, fluxAnnuel, duree) => {
    // Calcul approximatif du TRI par dichotomie
    let tauxMin = -0.99;
    let tauxMax = 5.0;
    let taux, van;
    
    for (let i = 0; i < 100; i++) {
      taux = (tauxMin + tauxMax) / 2;
      van = -investissement;
      
      for (let j = 1; j <= duree; j++) {
        van += fluxAnnuel / Math.pow(1 + taux, j);
      }
      
      if (Math.abs(van) < 0.01) break;
      
      if (van > 0) tauxMin = taux;
      else tauxMax = taux;
    }
    
    return taux * 100;
  };

  const saveCalculation = async () => {
    if (!results || !calculationName.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez effectuer un calcul et donner un nom à votre simulation"
      });
      return;
    }

    try {
      const calculationData = {
        investor_id: user.id,
        name: calculationName,
        calculation_type: calculationType,
        initial_investment: parseFloat(coutTotal),
        expected_return: parseFloat(revenuEstime),
        investment_duration_years: parseFloat(dureeInvestissement) || 1,
        discount_rate: parseFloat(tauxActualisation) / 100,
        annual_costs: parseFloat(fraisAnnuels) || 0,
        results: results
      };

      const { error } = await SupabaseDataService.supabaseClient
        .from('roi_calculations')
        .insert([calculationData]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Calcul sauvegardé avec succès"
      });

      setCalculationName('');
      loadSavedCalculations();

    } catch (error) {
      console.error('Erreur sauvegarde calcul:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder le calcul"
      });
    }
  };

  const loadCalculation = (calculation) => {
    setCalculationType(calculation.calculation_type);
    setCoutTotal(calculation.initial_investment.toString());
    setRevenuEstime(calculation.expected_return.toString());
    setDureeInvestissement(calculation.investment_duration_years.toString());
    setTauxActualisation((calculation.discount_rate * 100).toString());
    setFraisAnnuels(calculation.annual_costs?.toString() || '0');
    setResults(calculation.results);
    
    toast({
      title: "Calcul chargé",
      description: `Simulation "${calculation.name}" chargée avec succès`
    });
  };

  if (loading || dataLoading) {
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
      className="space-y-6 p-4 md:p-6"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center">
          <Calculator className="mr-3 h-8 w-8 text-primary"/>
          Calculateur de ROI
        </h1>
        <Button variant="outline" size="sm" onClick={loadSavedCalculations}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Formulaire de calcul */}
        <Card>
          <CardHeader>
            <CardTitle>Simulez le Retour sur Investissement</CardTitle>
            <CardDescription>
              Entrez les paramètres de votre investissement pour calculer le ROI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="calculationType">Type de calcul</Label>
              <Select value={calculationType} onValueChange={setCalculationType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir le type de calcul" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">ROI Simple</SelectItem>
                  <SelectItem value="advanced">ROI Actualisé (VAN/TRI)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="coutTotal">Coût Total de l'Investissement (FCFA)</Label>
              <Input 
                id="coutTotal" 
                type="number" 
                placeholder="Ex: 50000000" 
                value={coutTotal} 
                onChange={(e) => setCoutTotal(e.target.value)} 
              />
            </div>

            <div>
              <Label htmlFor="revenuEstime">Revenu/Valeur de Revente Estimé (FCFA)</Label>
              <Input 
                id="revenuEstime" 
                type="number" 
                placeholder="Ex: 65000000" 
                value={revenuEstime} 
                onChange={(e) => setRevenuEstime(e.target.value)} 
              />
            </div>

            {calculationType === 'advanced' && (
              <>
                <div>
                  <Label htmlFor="dureeInvestissement">Durée de l'investissement (années)</Label>
                  <Input 
                    id="dureeInvestissement" 
                    type="number" 
                    placeholder="Ex: 5" 
                    value={dureeInvestissement} 
                    onChange={(e) => setDureeInvestissement(e.target.value)} 
                  />
                </div>

                <div>
                  <Label htmlFor="tauxActualisation">Taux d'actualisation (%)</Label>
                  <Input 
                    id="tauxActualisation" 
                    type="number" 
                    step="0.1"
                    placeholder="Ex: 5" 
                    value={tauxActualisation} 
                    onChange={(e) => setTauxActualisation(e.target.value)} 
                  />
                </div>

                <div>
                  <Label htmlFor="fraisAnnuels">Frais annuels (FCFA)</Label>
                  <Input 
                    id="fraisAnnuels" 
                    type="number" 
                    placeholder="Ex: 500000" 
                    value={fraisAnnuels} 
                    onChange={(e) => setFraisAnnuels(e.target.value)} 
                  />
                </div>
              </>
            )}

            <Button onClick={calculateRoi} disabled={calculating} className="w-full">
              {calculating ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <TrendingUp className="mr-2 h-4 w-4" />
              )}
              Calculer le ROI
            </Button>

            {results && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Nom de la simulation"
                    value={calculationName}
                    onChange={(e) => setCalculationName(e.target.value)}
                  />
                  <Button onClick={saveCalculation} variant="outline">
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Résultats */}
        <div className="space-y-6">
          {results && (
            <Card>
              <CardHeader>
                <CardTitle>Résultats du calcul</CardTitle>
                <CardDescription>
                  {results.type === 'simple' ? 'Calcul ROI simple' : 'Calcul ROI actualisé'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.type === 'simple' ? (
                    <>
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                        <p className="text-lg font-semibold text-green-800 dark:text-green-200">ROI Total</p>
                        <p className="text-4xl font-bold text-green-600">{results.roiSimple}%</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-3 border rounded">
                          <span className="text-muted-foreground">ROI Annualisé:</span>
                          <p className="text-lg font-bold">{results.roiAnnualise}%</p>
                        </div>
                        <div className="p-3 border rounded">
                          <span className="text-muted-foreground">Gain/Perte:</span>
                          <p className={`text-lg font-bold ${parseFloat(results.gain) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {parseFloat(results.gain).toLocaleString()} FCFA
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                        <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">Valeur Actuelle Nette</p>
                        <p className={`text-4xl font-bold ${parseFloat(results.van) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {parseFloat(results.van).toLocaleString()} FCFA
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-3 border rounded">
                          <span className="text-muted-foreground">TRI:</span>
                          <p className="text-lg font-bold">{results.tri}%</p>
                        </div>
                        <div className="p-3 border rounded">
                          <span className="text-muted-foreground">ROI Actualisé:</span>
                          <p className="text-lg font-bold">{results.roiActualise}%</p>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className="p-3 bg-muted rounded">
                    <strong>Conclusion:</strong> {results.rentabilite}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Historique des calculs */}
          {savedCalculations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Calculs sauvegardés
                </CardTitle>
                <CardDescription>
                  Vos simulations récentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {savedCalculations.map((calc) => (
                    <div 
                      key={calc.id}
                      className="flex justify-between items-center p-2 border rounded hover:bg-muted/50 cursor-pointer"
                      onClick={() => loadCalculation(calc)}
                    >
                      <div>
                        <p className="font-medium">{calc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(calc.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {calc.calculation_type === 'simple' ? 'ROI Simple' : 'ROI Actualisé'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(calc.initial_investment / 1000000).toFixed(1)}M FCFA
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RoiCalculatorPage;
