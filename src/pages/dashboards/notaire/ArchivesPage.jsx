import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Archive, Search, Filter, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/spinner';

const initialArchives = [
  { id: 'ARC001', acteId: 'VENTE-2022-058', type: 'Vente', date: '2022-10-15', parties: 'Dupont / Diallo' },
  { id: 'ARC002', acteId: 'SUCC-2021-012', type: 'Succession', date: '2021-08-20', parties: 'Famille Ndiaye' },
  { id: 'ARC003', acteId: 'VENTE-2020-115', type: 'Vente', date: '2020-12-01', parties: 'Sow / Ba' },
];

const ArchivesPage = () => {
  const { toast } = useToast();
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setArchives(initialArchives);
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
      <h1 className="text-3xl font-bold flex items-center"><Archive className="mr-3 h-8 w-8"/>Archives Notariales</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Recherche dans les Archives</CardTitle>
          <div className="flex space-x-2 pt-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par ID, parties, date..." className="pl-8" />
            </div>
            <Button variant="outline" onClick={() => handleAction("Filtres d'archives appliqués.")}><Filter className="mr-2 h-4 w-4" /> Filtrer</Button>
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