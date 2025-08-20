import React, { useState, useEffect, useMemo } from 'react';
import { useRealtimeTable, useRealtimeUsers, useRealtimeParcels, useRealtimeParcelSubmissions } from '@/hooks/useRealtimeTable';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LandPlot, PlusCircle, Search, Filter, Eye, X, Archive } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { SupabaseDataService } from '@/services/supabaseDataService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const LandManagementPage = () => {
  const { toast } = useToast();
  const { data: parcels, loading: parcelsLoading, error: parcelsError, refetch } = useRealtimeParcels();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (parcels) {
      setFilteredData(parcels);
    }
  }, [parcels]);
  
  useEffect(() => {
    const loadMunicipalParcels = async () => {
      try {
        setLoading(true);
        // Récupérer toutes les parcelles publiques/municipales
  const allParcels = await SupabaseDataService.getParcels();
  const municipalParcels = allParcels.filter(p => 
          p.owner_type === 'Mairie' || 
          p.owner_type === 'Public' ||
          p.legal_status === 'municipal'
        );
        setParcels(municipalParcels);
      } catch (error) {
        console.error('Erreur chargement parcelles municipales:', error);
        toast({ 
          variant: "destructive",
          title: "Erreur", 
          description: "Impossible de charger les terrains municipaux" 
        });
      } finally {
        setLoading(false);
      }
    };

    loadMunicipalParcels();
  }, []);

  const zones = useMemo(() => Array.from(new Set(parcels.map(p => p.zone).filter(Boolean))).sort(), [parcels]);
  const filteredParcels = useMemo(() => {
    return parcels.filter(p => {
      const matchSearch = !searchTerm || [p.reference, p.location_name, p.zone].some(v => (v||'').toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = !statusFilter || p.status === statusFilter;
      const matchZone = !zoneFilter || p.zone === zoneFilter;
      return matchSearch && matchStatus && matchZone;
    });
  }, [parcels, searchTerm, statusFilter, zoneFilter]);

  const resetForm = () => setForm({ reference:'', location_name:'', zone:'', area_sqm:'', price:'', status:'Disponible' });

  const handleCreateParcel = async (e) => {
  const updateParcelInline = async (parcel, newStatus) => {
    try {
      const updated = await SupabaseDataService.updateProperty(parcel.id, { status:newStatus });
      setParcels(ps=> ps.map(p=> p.id===parcel.id? {...p, ...updated}: p));
      toast({ title:'Statut mis à jour', description:`${parcel.reference||parcel.id} -> ${newStatus}` });
    } catch(e){ toast({ variant:'destructive', title:'Erreur', description:'Maj statut impossible'}); }
  };
  const archiveParcel = async (parcel) => {
    try {
      const updated = await SupabaseDataService.updateProperty(parcel.id, { archived:true, status:'Archivé' });
      setParcels(ps=> ps.map(p=> p.id===parcel.id? {...p, ...updated}: p));
      toast({ title:'Parcelle archivée' });
    } catch(e){ toast({ variant:'destructive', title:'Erreur', description:'Archive impossible'}); }
  };
    e.preventDefault();
    if (!form.reference || !form.location_name || !form.area_sqm) {
      toast({ variant:'destructive', title:'Champs requis', description:'Référence, localisation et surface sont obligatoires.' });
      return;
    }
    try {
      setCreating(true);
      const payload = {
        reference: form.reference.trim(),
        location_name: form.location_name.trim(),
        zone: form.zone || null,
        area_sqm: Number(form.area_sqm) || 0,
        price: form.price ? Number(form.price) : null,
        status: form.status,
        owner_type: 'Mairie',
        legal_status: 'municipal'
      };
      const created = await SupabaseDataService.createProperty(payload);
      setParcels(prev => [created, ...prev]);
      toast({ title:'Parcelle créée', description:`${created.reference || created.id} ajoutée avec succès.` });
      resetForm();
      setShowCreate(false);
    } catch (error) {
      console.error(error);
      toast({ variant:'destructive', title:'Erreur création', description:"Impossible de créer la parcelle" });
    } finally {
      setCreating(false);
    }
  };

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
        <h1 className="text-3xl font-bold flex items-center"><LandPlot className="mr-3 h-8 w-8"/>Gestion Foncière Communale</h1>
        <Button onClick={() => setShowCreate(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Terrain
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patrimoine Foncier de la Commune</CardTitle>
          <div className="flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0 pt-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher une parcelle..." className="pl-8" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
            </div>
            <select className="border rounded px-2 py-2 text-sm" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
              <option value="">Statut (Tous)</option>
              <option value="Disponible">Disponible</option>
              <option value="Occupé">Occupé</option>
              <option value="EnProjet">EnProjet</option>
            </select>
            <select className="border rounded px-2 py-2 text-sm" value={zoneFilter} onChange={e=>setZoneFilter(e.target.value)}>
              <option value="">Zone (Toutes)</option>
              {zones.map(z=> <option key={z} value={z}>{z}</option>)}
            </select>
            {(searchTerm || statusFilter || zoneFilter) && (
              <Button variant="ghost" onClick={()=>{setSearchTerm('');setStatusFilter('');setZoneFilter('');}}><X className="mr-1 h-4 w-4"/>Réinit.</Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Référence</th>
                  <th className="text-left p-2 font-semibold">Localisation</th>
                  <th className="text-left p-2 font-semibold">Surface (m²)</th>
                  <th className="text-left p-2 font-semibold">Statut</th>
                  <th className="text-right p-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParcels.map(p => (
                  <tr key={p.id} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-mono">{p.id}</td>
                    <td className="p-2">{p.location_name}</td>
                    <td className="p-2">{p.area_sqm}</td>
                    <td className="p-2">
                      <select className="border rounded px-1 py-1 text-xs" value={p.status} onChange={(e)=>updateParcelInline(p, e.target.value)}>
                        <option>Disponible</option>
                        <option>Occupé</option>
                        <option>EnProjet</option>
                        <option>Archivé</option>
                      </select>
                    </td>
                    <td className="p-2 text-right flex gap-2 justify-end">
                      <Button asChild variant="outline" size="sm"><Link to={`/parcelles/${p.id}`}><Eye className="mr-1 h-4 w-4" />Détails</Link></Button>
                      <Button size="sm" variant="ghost" onClick={()=>archiveParcel(p)} disabled={p.archived}><Archive className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
                {!filteredParcels.length && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground text-sm">Aucune parcelle ne correspond aux filtres.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-lg relative">
            <button className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground" onClick={()=>!creating && setShowCreate(false)}>
              <X className="h-5 w-5" />
            </button>
            <form onSubmit={handleCreateParcel} className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Nouvelle Parcelle Municipale</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Référence *</label>
                  <Input value={form.reference} onChange={e=>setForm(f=>({...f, reference:e.target.value}))} required />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Localisation *</label>
                  <Input value={form.location_name} onChange={e=>setForm(f=>({...f, location_name:e.target.value}))} required />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Zone</label>
                  <Input value={form.zone} onChange={e=>setForm(f=>({...f, zone:e.target.value}))} placeholder="Ex: ZAC-NORD" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Surface (m²) *</label>
                  <Input type="number" min="0" value={form.area_sqm} onChange={e=>setForm(f=>({...f, area_sqm:e.target.value}))} required />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Prix (optionnel)</label>
                  <Input type="number" min="0" value={form.price} onChange={e=>setForm(f=>({...f, price:e.target.value}))} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Statut</label>
                  <select className="border rounded w-full h-10 px-2 text-sm" value={form.status} onChange={e=>setForm(f=>({...f, status:e.target.value}))}>
                    <option value="Disponible">Disponible</option>
                    <option value="Occupé">Occupé</option>
                    <option value="EnProjet">EnProjet</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="ghost" disabled={creating} onClick={()=>{resetForm();setShowCreate(false);}}>Annuler</Button>
                <Button type="submit" disabled={creating}>{creating ? 'Création...' : 'Créer'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default LandManagementPage;