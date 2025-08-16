import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Brain, BarChart3, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

const MarketPredictionPage = () => {
  const [selectedRegion, setSelectedRegion] = useState('dakar');
  const [timeFrame, setTimeFrame] = useState('6months');

  const predictionData = {
    '6months': [
      { month: 'Jan 2025', actual: 98000, predicted: 102000 },
      { month: 'Fév 2025', actual: 101000, predicted: 105000 },
      { month: 'Mar 2025', actual: null, predicted: 108000 },
      { month: 'Avr 2025', actual: null, predicted: 111000 },
      { month: 'Mai 2025', actual: null, predicted: 114000 },
      { month: 'Juin 2025', actual: null, predicted: 117000 },
    ],
    '1year': [
      { month: 'Jan 2025', actual: 98000, predicted: 102000 },
      { month: 'Mar 2025', actual: null, predicted: 108000 },
      { month: 'Mai 2025', actual: null, predicted: 114000 },
      { month: 'Juil 2025', actual: null, predicted: 120000 },
      { month: 'Sep 2025', actual: null, predicted: 125000 },
      { month: 'Nov 2025', actual: null, predicted: 130000 },
      { month: 'Jan 2026', actual: null, predicted: 135000 },
    ]
  };

  const marketFactors = [
    { name: 'Urbanisation', impact: 85, trend: 'positive' },
    { name: 'Infrastructures', impact: 78, trend: 'positive' },
    { name: 'Démographie', impact: 92, trend: 'positive' },
    { name: 'Économie', impact: 65, trend: 'neutral' },
    { name: 'Politique', impact: 45, trend: 'negative' },
  ];

  const investmentRecommendations = [
    {
      zone: 'Almadies',
      potential: 'Très élevé',
      growth: '+25%',
      risk: 'Faible',
      confidence: 92,
      reasons: ['Nouveau projet d\'infrastructure', 'Zone touristique en expansion', 'Demande croissante']
    },
    {
      zone: 'Diamniadio',
      potential: 'Élevé',
      growth: '+18%',
      risk: 'Moyen',
      confidence: 85,
      reasons: ['Pole urbain en développement', 'Aéroport proche', 'Prix encore abordables']
    },
    {
      zone: 'Thiès',
      potential: 'Modéré',
      growth: '+12%',
      risk: 'Faible',
      confidence: 78,
      reasons: ['Croissance stable', 'Bonne accessibilité', 'Marché mature']
    }
  ];

  const alerts = [
    {
      type: 'opportunity',
      title: 'Opportunité détectée',
      message: 'Les prix à Diamniadio sont 15% sous-évalués selon nos modèles.',
      confidence: 87
    },
    {
      type: 'warning',
      title: 'Risque identifié',
      message: 'Possible bulle spéculative sur les terrains côtiers de Saly.',
      confidence: 73
    },
    {
      type: 'trend',
      title: 'Tendance émergente',
      message: 'Forte demande pour les terrains agricoles convertibles.',
      confidence: 81
    }
  ];

  const getPotentialBadge = (potential) => {
    const potentialConfig = {
      'Très élevé': { color: 'bg-green-100 text-green-800' },
      'Élevé': { color: 'bg-blue-100 text-blue-800' },
      'Modéré': { color: 'bg-yellow-100 text-yellow-800' },
      'Faible': { color: 'bg-red-100 text-red-800' },
    };

    const config = potentialConfig[potential] || { color: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge className={config.color}>
        {potential}
      </Badge>
    );
  };

  const getAlertIcon = (type) => {
    switch(type) {
      case 'opportunity': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'trend': return <Brain className="h-5 w-5 text-blue-500" />;
      default: return <BarChart3 className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analyse Prédictive du Marché</h1>
        <p className="text-muted-foreground">Intelligence artificielle appliquée au marché foncier sénégalais</p>
      </div>

      {/* Contrôles */}
      <div className="flex gap-4">
        <div className="flex gap-2">
          <Button 
            variant={selectedRegion === 'dakar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedRegion('dakar')}
          >
            Dakar
          </Button>
          <Button 
            variant={selectedRegion === 'thies' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedRegion('thies')}
          >
            Thiès
          </Button>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={timeFrame === '6months' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFrame('6months')}
          >
            6 mois
          </Button>
          <Button 
            variant={timeFrame === '1year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFrame('1year')}
          >
            1 an
          </Button>
        </div>
      </div>

      {/* Alertes IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Alertes Intelligence Artificielle
          </CardTitle>
          <CardDescription>Insights automatiques basés sur l'analyse des données</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <h4 className="font-semibold">{alert.title}</h4>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Confiance: {alert.confidence}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Graphique de prédiction */}
      <Card>
        <CardHeader>
          <CardTitle>Prédictions de Prix - {selectedRegion}</CardTitle>
          <CardDescription>Évolution prédite vs données historiques</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={predictionData[timeFrame]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value?.toLocaleString()} XOF/m²`, '']} />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Prix réels"
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#3b82f6" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Prédictions IA"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Facteurs de marché */}
      <Card>
        <CardHeader>
          <CardTitle>Facteurs Influençant le Marché</CardTitle>
          <CardDescription>Impact des différents facteurs sur l'évolution des prix</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketFactors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{factor.name}</span>
                  {factor.trend === 'positive' && <TrendingUp className="h-4 w-4 text-green-500" />}
                  {factor.trend === 'negative' && <TrendingDown className="h-4 w-4 text-red-500" />}
                  {factor.trend === 'neutral' && <div className="h-4 w-4 bg-gray-400 rounded-full" />}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${factor.impact}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground">{factor.impact}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommandations d'investissement */}
      <Card>
        <CardHeader>
          <CardTitle>Recommandations d'Investissement</CardTitle>
          <CardDescription>Zones à fort potentiel identifiées par l'IA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {investmentRecommendations.map((rec, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{rec.zone}</h4>
                    <p className="text-sm text-muted-foreground">Croissance prédite: {rec.growth}</p>
                  </div>
                  <div className="text-right">
                    {getPotentialBadge(rec.potential)}
                    <p className="text-sm text-muted-foreground mt-1">
                      Confiance: {rec.confidence}%
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mb-3 text-sm">
                  <span>Risque: <span className="font-medium">{rec.risk}</span></span>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Facteurs clés:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {rec.reasons.map((reason, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="h-1 w-1 bg-blue-500 rounded-full" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketPredictionPage;
