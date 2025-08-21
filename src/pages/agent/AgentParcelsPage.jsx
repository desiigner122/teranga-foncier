import React, { useState, useEffect } from 'react';
import { Eye, Search, Edit } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import supabase from "../../lib/supabaseClient";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";

const AgentParcelsPage = () => {
  
  
  /* REMOVED DUPLICATE */ ('');
const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dataLoading, setDataLoading] = useState(false);
const { toast } = useToast();
  const { data: parcels, loading: parcelsLoading, error: parcelsError, refetch } = useRealtimeParcels();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (parcels) {
      setFilteredData(parcels);
    }
  }, [parcels]);
  
  useEffect(() => {
    const loadParcels = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data: parcels } = await supabase
          .from('parcels')
          .select('*')
          .eq('agent_assigned', user.id)
          .order('created_at', { ascending: false });

        setParcels(parcels || [data, error]);
      } catch (error) {        setParcels([]);
      } finally {
        setLoading(false);
      }
    };

    loadParcels();
  }, []);

  const filteredParcels = parcels.filter(parcel => 
    parcel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parcel.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-3xl font-bold">Mes Parcelles Assignées</h1>
        <Button disabled title="Ajout direct désactivé (créez via interface admin ou migration)">
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une Parcelle
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher une parcelle..." 
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">ID</th>
                  <th className="text-left p-2 font-semibold">Nom</th>
                  <th className="text-left p-2 font-semibold">Client Associé</th>
                  <th className="text-left p-2 font-semibold">Statut</th>
                  <th className="text-right p-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParcels.map(parcel => (
                  <tr key={parcel.id} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-mono">{parcel.id}</td>
                    <td className="p-2 font-medium">{parcel.name}</td>
                    <td className="p-2">{parcel.client || 'Aucun'}</td>
                    <td className="p-2"><Badge>{parcel.status}</Badge></td>
                    <td className="p-2 text-right space-x-1">
                      <Button asChild variant="ghost" size="icon"><Link to={`/parcelles/${parcel.id}`}><Eye className="h-4 w-4" /></Link></Button>
                      <Button variant="ghost" size="icon" disabled title="Modification bientôt"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" disabled title="Planification bientôt"><CalendarPlus className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredParcels.length === 0 && <p className="text-center text-muted-foreground py-8">Aucune parcelle trouvée.</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AgentParcelsPage;

