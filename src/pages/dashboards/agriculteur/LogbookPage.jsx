import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, PlusCircle, Filter, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/spinner';

const initialLogbookData = [
  { id: 'LOG001', date: '2025-07-15', parcel: 'Champ Kagnout 1', activity: 'Traitement phytosanitaire préventif', notes: 'Produit bio utilisé, pas de pluie prévue.' },
  { id: 'LOG002', date: '2025-07-14', parcel: 'Maraîchage Niayes', activity: 'Irrigation', notes: '2 heures de pompage.' },
  { id: 'LOG003', date: '2025-07-12', parcel: 'Verger Anacardiers Bignona', activity: 'Taille des branches mortes', notes: '' },
];

const LogbookPage = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEntry, setNewEntry] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setLogs(initialLogbookData);
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
      <h1 className="text-3xl font-bold flex items-center"><BookOpen className="mr-3 h-8 w-8"/>Journal de Bord Agricole</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Nouvelle Entrée</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select>
            <SelectTrigger><SelectValue placeholder="Sélectionner une parcelle" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="p1">Champ Kagnout 1</SelectItem>
              <SelectItem value="p2">Verger Anacardiers Bignona</SelectItem>
              <SelectItem value="p3">Maraîchage Niayes</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Activité (ex: Semis, Récolte, Traitement...)" />
          <Textarea placeholder="Notes additionnelles..." value={newEntry} onChange={(e) => setNewEntry(e.target.value)} />
          <Button onClick={() => handleAction("Nouvelle entrée ajoutée au journal.")}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historique des Entrées</CardTitle>
          <div className="flex space-x-2 pt-2">
            <Input type="date" className="w-[180px]" />
            <Select>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filtrer par parcelle" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les parcelles</SelectItem>
                <SelectItem value="p1">Champ Kagnout 1</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => handleAction("Filtres appliqués.")}><Filter className="mr-2 h-4 w-4" /> Filtrer</Button>
            <Button variant="outline" onClick={() => handleAction("Export du journal en cours.")}><Download className="mr-2 h-4 w-4" /> Exporter</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Date</th>
                  <th className="text-left p-2 font-semibold">Parcelle</th>
                  <th className="text-left p-2 font-semibold">Activité</th>
                  <th className="text-left p-2 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b hover:bg-muted/30">
                    <td className="p-2">{log.date}</td>
                    <td className="p-2">{log.parcel}</td>
                    <td className="p-2 font-medium">{log.activity}</td>
                    <td className="p-2 text-muted-foreground">{log.notes}</td>
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

export default LogbookPage;