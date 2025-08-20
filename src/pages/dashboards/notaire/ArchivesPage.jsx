import React, { useState, useEffect } from 'react';
import { useRealtimeTable, useRealtimeUsers, useRealtimeParcels, useRealtimeParcelSubmissions } from '@/hooks/useRealtimeTable';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Archive, Search, Filter, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Source: documents table categories actes

const ArchivesPage = () => {
  const { toast } = useToast();
  const { data: archives, loading: archivesLoading, error: archivesError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (archives) {
      setFilteredData(archives);
    }
  }, [archives]);
  
  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('id,title,category,created_at,parties')
          .in('category',[ 'acte_vente','acte_succession','acte_autre' ])
          .order('created_at',{ ascending:false })
          .limit(300);
        if (error) throw error;
        const mapCategory = (c) => c==='acte_vente' ? 'Vente' : c==='acte_succession' ? 'Succession' : 'Autre';
        const mapped = (data||[]).map(d=>({ id:d.id, acteId:d.title || d.id, type:mapCategory(d.category), date:d.created_at?.split('T')[0]||'', parties:d.parties||'—' }));
        setArchives(mapped);
      } catch(e) {
        if (process.env.NODE_ENV !== 'production') console.warn('Archives non chargées', e.message||e);
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
      <h1 className="text-3xl font-bold flex items-center"><Archive className="mr-3 h-8 w-8"/>Archives Notariales</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Recherche dans les Archives</CardTitle>
          <div className="flex space-x-2 pt-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par ID, parties, date..." className="pl-8" />
            </div>
              <Button variant="outline" disabled><Filter className="mr-2 h-4 w-4" /> Filtrer</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">ID Acte</th>
                  <th className="text-left p-2 font-semibold">Type</th>
                  <th className="text-left p-2 font-semibold">Date</th>
                  <th className="text-left p-2 font-semibold">Parties</th>
                  <th className="text-right p-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {archives.map(a => (
                  <tr key={a.id} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-mono">{a.acteId}</td>
                    <td className="p-2">{a.type}</td>
                    <td className="p-2">{a.date}</td>
                    <td className="p-2">{a.parties}</td>
                    <td className="p-2 text-right">
                      <Button variant="outline" size="sm" onClick={() => handleAction(`Consultation de l'acte ${a.acteId}.`)}><Download className="mr-1 h-4 w-4" /> Consulter</Button>
                        <Button variant="outline" size="sm" disabled title="Consultation à venir"><Download className="mr-1 h-4 w-4" /> Consulter</Button>
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

export default ArchivesPage;