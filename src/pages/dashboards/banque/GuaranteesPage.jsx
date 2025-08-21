import React, { useState, useEffect, useMemo } from 'react';
import { Eye, Search, Filter, ShieldCheck } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import { useRealtimeTable } from '../../../hooks/useRealtimeTable';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '../../../components/ui/use-toast';
import { useAuth } from "../../contexts/AuthContext";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from "../../components/ui/table";

const GuaranteesPage = () => {
  const { toast } = useToast();
  const { 
    data: guaranteesData, 
    loading, 
    error 
  } = useRealtimeTable('bank_guarantees', 'created_at');

  const guarantees = useMemo(() => {
    if (!guaranteesData) return [];
    return guaranteesData.map(g => ({
      id: g.id,
      parcelId: g.parcel_id,
      valeur: g.estimated_value ? new Intl.NumberFormat('fr-FR').format(g.estimated_value) + ' XOF' : '—',
      risque: g.risk_level || '—',
      client: g.client_name || '—'
    }));
  }, [guaranteesData]);

  useEffect(() => {
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur de chargement',
        description: 'Impossible de charger le portefeuille de garanties.',
      });
    }
  }, [error, toast]);

  if (loading && guarantees.length === 0) {
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
