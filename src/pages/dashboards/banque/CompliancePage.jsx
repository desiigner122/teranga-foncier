import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import supabase from "../../lib/supabaseClient";
import { motion } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";

// We reuse documents table (category='compliance_report') as data source for compliance reports

const CompliancePage = () => {
  
  const [loading, setLoading] = useState(false);
const { toast } = useToast();
  const [reports, setReports] = useState([]);
  // Loading géré par le hook temps réel

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('id,title,created_at,category')
        .eq('category','compliance_report')
        .order('created_at',{ ascending:false })
        .limit(100);
      if (error) throw error;
      const mapped = (data||[]).map(d=>({
        id: d.id,
        title: d.title || 'Rapport',
        type: 'Conformité',
        date: d.created_at?.split('T')[0] || ''
      }));
      setReports(mapped);
    } catch (e) {
      toast({ variant:'destructive', title:'Erreur', description:'Chargement des rapports impossible.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ loadReports(); },[]);

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
      <h1 className="text-3xl font-bold flex items-center"><FolderCheck className="mr-3 h-8 w-8"/>Rapports de Conformité</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Générer un nouveau rapport</CardTitle>
          <CardDescription>Fonctionnalité à venir (génération automatique).</CardDescription>
        </CardHeader>
        <CardContent>
          <Button disabled>Générer un Rapport</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historique des Rapports</CardTitle>
          <div className="flex space-x-2 pt-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher un rapport..." className="pl-8" />
            </div>
            <Button variant="outline" disabled><Filter className="mr-2 h-4 w-4" /> Filtrer</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Titre du Rapport</th>
                  <th className="text-left p-2 font-semibold">Type</th>
                  <th className="text-left p-2 font-semibold">Date</th>
                  <th className="text-right p-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-medium">{report.title}</td>
                    <td className="p-2">{report.type}</td>
                    <td className="p-2">{report.date}</td>
                    <td className="p-2 text-right">
                      <Button variant="outline" size="sm" asChild disabled><span><Download className="mr-1 h-4 w-4" /> Télécharger</span></Button>
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

export default CompliancePage;
