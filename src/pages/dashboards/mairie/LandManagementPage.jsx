import React, { useState, useEffect, useMemo } from 'react';
import DocumentWallet from '@/components/mairie/DocumentWallet';
import ParcelTimeline from '@/components/mairie/ParcelTimeline';
import AttributionForm from '@/components/mairie/AttributionForm';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LandPlot, PlusCircle, Search, Eye, X, Archive } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { SupabaseDataService } from '@/services/supabaseDataService';
import LoadingSpinner from '@/components/ui/spinner';

const LandManagementPage = () => {
  const { toast } = useToast();
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [parcelsData, usersData] = await Promise.all([
          SupabaseDataService.getParcels(),
          SupabaseDataService.listUsers({ type: 'Particulier' })
        ]);

        const municipalParcels = parcelsData.filter(p =>
          p.owner_type === 'Mairie' ||
          p.owner_type === 'Public' ||
          p.legal_status === 'municipal'
        );
        
        console.log("DONNÉES BRUTES DES PARCELLES REÇUES :", municipalParcels);
        setParcels(municipalParcels);
        
        if (usersData && !usersData.error) {
          setUsers(usersData.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les données de la page."
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [toast]);
  
  // ... (le reste des fonctions handle, update, etc. reste identique)

  const zones = useMemo(() => Array.from(new Set(parcels.map(p => p.zone).filter(Boolean))).sort(), [parcels]);
  const filteredParcels = useMemo(() => {
    return parcels.filter(p => {
      const matchSearch = !searchTerm || [p.reference, p.location_name, p.zone].some(v => (v||'').toString().toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = !statusFilter || p.status === statusFilter;
      const matchZone = !zoneFilter || p.zone === zoneFilter;
      return matchSearch && matchStatus && matchZone;
    });
  }, [parcels, searchTerm, statusFilter, zoneFilter]);

  const updateParcelInline = async (parcel, newStatus) => {
    try {
      const updated = await SupabaseDataService.updateProperty(parcel.id, { status:newStatus });
      setParcels(ps=> ps.map(p=> p.id===parcel.id? {...p, ...updated}: p));
      toast({ title:'Statut mis à jour', description:`${parcel.reference||parcel.id} -> ${newStatus}` });
    } catch(e){ toast({ variant:'destructive', title:'Erreur', description:'Maj statut impossible'}); }
  };
  const archiveParcel = async (parcel) => {
    if (!window.confirm('Voulez-vous vraiment archiver cette parcelle ?')) return;
    try {
      const updated = await SupabaseDataService.updateProperty(parcel.id, { archived:true, status:'Archivé' });
      setParcels(ps=> ps.map(p=> p.id===parcel.id? {...p, ...updated}: p));
      toast({ title:'Parcelle archivée' });
    } catch(e){ toast({ variant:'destructive', title:'Erreur', description:'Archive impossible'}); }
  };
  const handleAttribution = async (data) => {
    try {
      setCreating(true);
      const created = await SupabaseDataService.createProperty(data);
      setParcels(prev => [created, ...prev]);
      toast({ title:'Parcelle attribuée', description:`${created.reference || created.id} attribuée avec succès.` });
      setShowCreate(false);
      if (data.beneficiary_id) {
        await SupabaseDataService.createNotification({
          userId: data.beneficiary_id,
          type: 'attribution',
          title: 'Nouvelle parcelle attribuée',
          body: `Une parcelle (${created.reference}) vous a été attribuée par la mairie.`,
          data: { parcelId: created.id, reference: created.reference }
        });
      }
    } catch (error) {
      console.error(error);
      toast({ variant:'destructive', title:'Erreur attribution', description:"Impossible d'attribuer la parcelle" });
    } finally {
      setCreating(false);
    }
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
      {/* ... Le reste du JSX (l'affichage) reste identique ... */}
      {/* Pour simplifier, nous savons que l'erreur vient du tableau, le reste n'est pas crucial pour le debug */}
      <Card>
        <CardHeader>
          <CardTitle>Patrimoine Foncier de la Commune</CardTitle>
          {/* ... filtres ... */}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2 font-semibold">Référence</th>
                  <th className="text-left p-2 font-semibold">Localisation</th>
                  <th className="text-left p-2 font-semibold">Surface (m²)</th>
                  <th className="text-left p-2 font-semibold">Statut</th>
                  <th className="text-right p-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParcels.map(p => {
                  // =================================================================
                  // DÉBOGAGE : Affiche la structure exacte de chaque parcelle
                  // C'est cette ligne qui nous donnera la solution.
                  console.log('[DEBUG PARCELLE]', p);
                  // =================================================================
                  return (
                    <tr key={p.id} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-mono">{p.reference}</td>
                      <td className="p-2">{/*{p.location_name}*/}</td>
                      <td className="p-2">{/*{p.area_sqm}*/}</td>
                      <td className="p-2">{p.status}</td>
                      <td className="p-2 text-right flex gap-2 justify-end">
                        <Button asChild variant="outline" size="sm"><Link to={`/parcelles/${p.id}`}><Eye className="mr-1 h-4 w-4" />Détails</Link></Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LandManagementPage;