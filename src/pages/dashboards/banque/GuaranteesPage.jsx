import React, { useState, useEffect } from 'react';
// Data source: bank_guarantees table (expected). Falls back to empty list if missing.

const GuaranteesPage = () => {
  const { toast } = useToast();
  const [guarantees, setGuarantees] = useState([]);
  // Loading géré par le hook temps réel

  const loadGuarantees = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_guarantees')
        .select('id,parcel_id,client_name,estimated_value,risk_level')
        .order('created_at',{ ascending:false })
        .limit(200);
      if (error) throw error;
      const mapped = (data||[]).map(g => ({
        id: g.id,
        parcelId: g.parcel_id,
        valeur: g.estimated_value ? new Intl.NumberFormat('fr-FR').format(g.estimated_value) + ' XOF' : '—',
        risque: g.risk_level || '—',
        client: g.client_name || '—'
      }));
      setGuarantees(mapped);
    } catch (e) {
      // Silent fallback, maybe table not present yet
      if (process.env.NODE_ENV !== 'production') console.warn('Garanties non chargées', e.message || e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ loadGuarantees(); },[]);

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
      <h1 className="text-3xl font-bold flex items-center"><ShieldCheck className="mr-3 h-8 w-8"/>Portefeuille de Garanties</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Suivi des Garanties Foncières</CardTitle>
          <div className="flex space-x-2 pt-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par parcelle, client..." className="pl-8" />
            </div>
            <Button variant="outline" disabled><Filter className="mr-2 h-4 w-4" /> Filtrer</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Parcelle (Garantie)</th>
                  <th className="text-left p-2 font-semibold">Client</th>
                  <th className="text-left p-2 font-semibold">Valeur Estimée</th>
                  <th className="text-left p-2 font-semibold">Niveau de Risque</th>
                  <th className="text-right p-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {guarantees.map(g => (
                  <tr key={g.id} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-mono">{g.parcelId}</td>
                    <td className="p-2">{g.client}</td>
                    <td className="p-2">{g.valeur}</td>
                    <td className="p-2"><Badge variant={g.risque === 'Faible' ? 'success' : 'warning'}>{g.risque}</Badge></td>
                    <td className="p-2 text-right">
                      <Button asChild variant="outline" size="sm"><Link to={`/parcelles/${g.parcelId}`}><Eye className="mr-1 h-4 w-4" />Détails</Link></Button>
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

export default GuaranteesPage;
