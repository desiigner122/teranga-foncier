import React, { useState, useEffect } from 'react';
// Data source: land_disputes table (expected). Fallback: empty.

const DisputesPage = () => {
  const { toast } = useToast();
  const { data: disputes, loading: disputesLoading, error: disputesError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (disputes) {
      setFilteredData(disputes);
    }
  }, [disputes]);
  
  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('land_disputes')
          .select('id,parcel_id,parties,type,status,created_at')
          .order('created_at', { ascending: false })
          .limit(200);
        if (error) throw error;
        const mapped = (data || [data, error]).map(d => ({ id: d.id, parcelId: d.parcel_id, parties: d.parties, type: d.type, status: d.status }));
        setDisputes(mapped);
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') console.warn('Litiges non chargés', e.message || e);
      } finally { setLoading(false); }
    };
    load();
  }, []);

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
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center"><AlertTriangle className="mr-3 h-8 w-8"/>Gestion des Litiges Fonciers</h1>
        <Button disabled title="Création à venir">
          <PlusCircle className="mr-2 h-4 w-4" /> Nouveau Litige
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suivi des Litiges</CardTitle>
          <div className="flex space-x-2 pt-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par parcelle, parties..." className="pl-8" />
            </div>
        <Button variant="outline" disabled><Filter className="mr-2 h-4 w-4" /> Filtrer</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Parcelle</th>
                  <th className="text-left p-2 font-semibold">Parties Impliquées</th>
                  <th className="text-left p-2 font-semibold">Type de Litige</th>
                  <th className="text-left p-2 font-semibold">Statut</th>
                  <th className="text-right p-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map(d => (
                  <tr key={d.id} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-mono">{d.parcelId}</td>
                    <td className="p-2">{d.parties}</td>
                    <td className="p-2">{d.type}</td>
                    <td className="p-2"><Badge variant={d.status === 'Résolu' ? 'success' : d.status === 'Nouveau' ? 'warning' : 'secondary'}>{d.status}</Badge></td>
                    <td className="p-2 text-right">
                        <Button variant="outline" size="sm" disabled title="Médiation à venir"><Gavel className="mr-1 h-4 w-4" />Médiation</Button>
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

export default DisputesPage;
