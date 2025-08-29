import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LandPlot, PlusCircle, Eye, X, Archive, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { SupabaseDataService } from '@/services/supabaseDataService';
import LoadingSpinner from '@/components/ui/spinner';
import DocumentWallet from '@/components/mairie/DocumentWallet';
import ParcelTimeline from '@/components/mairie/ParcelTimeline';
import AttributionForm from '@/components/mairie/AttributionForm';

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
  const [showTimeline, setShowTimeline] = useState(false);
  const [timelineParcel, setTimelineParcel] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const allParcels = await SupabaseDataService.getParcels();
        setParcels(allParcels.filter(p =>
          p.owner_type === 'Mairie' ||
          p.owner_type === 'Public' ||
          p.legal_status === 'municipal'
        ));
        const { data, error } = await SupabaseDataService.listUsers({ type: 'Particulier' });
        if (!error && data) setUsers(data);
      } catch (error) {
        toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les données" });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [toast]);

  const zones = useMemo(() => Array.from(new Set(parcels.map(p => p.zone).filter(Boolean))).sort(), [parcels]);
  const filteredParcels = useMemo(() => parcels.filter(p => {
    const matchSearch = !searchTerm || [p.reference, p.location_name, p.zone].some(v => (v || '').toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = !statusFilter || p.status === statusFilter;
    const matchZone = !zoneFilter || p.zone === zoneFilter;
    return matchSearch && matchStatus && matchZone;
  }), [parcels, searchTerm, statusFilter, zoneFilter]);
  const allDocuments = useMemo(() => parcels
    .filter(p => Array.isArray(p.documents) && p.documents.length)
    .flatMap(p => p.documents.map((doc, idx) => ({
      ...doc,
      parcelReference: p.reference,
      id: doc.id || doc.url || doc.name || `${p.reference}-${idx}`,
      url: doc.url || doc.link || '',
    })))
    .filter(doc => !!doc.url), [parcels]);

  const updateParcelInline = async (parcel, newStatus) => {
    try {
      const updated = await SupabaseDataService.updateProperty(parcel.id, { status: newStatus });
      setParcels(ps => ps.map(p => p.id === parcel.id ? { ...p, ...updated } : p));
      toast({ title: 'Statut mis à jour', description: `${parcel.reference || parcel.id} -> ${newStatus}` });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Maj statut impossible' });
    }
  };
  const archiveParcel = async (parcel) => {
    if (!window.confirm('Voulez-vous vraiment archiver cette parcelle ?')) return;
    try {
      const updated = await SupabaseDataService.updateProperty(parcel.id, { archived: true, status: 'Archivé' });
      setParcels(ps => ps.map(p => p.id === parcel.id ? { ...p, ...updated } : p));
      toast({ title: 'Parcelle archivée' });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Archive impossible' });
    }
  };
  const handleAttribution = async (data) => {
    try {
      setCreating(true);
      const created = await SupabaseDataService.createProperty(data);
      setParcels(prev => [created, ...prev]);
      toast({ title: 'Parcelle attribuée', description: `${created.reference || created.id} attribuée avec succès.` });
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
      toast({ variant: 'destructive', title: 'Erreur attribution', description: "Impossible d'attribuer la parcelle" });
    } finally {
      setCreating(false);
    }
  };

  const getParcelHistory = (parcel) => {
    if (!parcel || typeof parcel !== 'object') return [];
    const safe = (v) => (typeof v === 'string' ? v : (v ? String(v) : ''));
    const history = [];
    if (parcel.created_at) history.push({ status: 'created', date: safe(parcel.created_at), description: 'Parcelle créée' });
    if ((parcel.status === 'Attribuée' && parcel.beneficiary_id) && parcel.updated_at) history.push({ status: 'attributed', date: safe(parcel.updated_at), description: 'Attribuée au bénéficiaire' });
    if ((parcel.status === 'Validée' || parcel.validated_by_notary) && parcel.validated_at) history.push({ status: 'validated', date: safe(parcel.validated_at), description: 'Validée par notaire' });
    if ((parcel.status === 'Archivée' || parcel.archived) && parcel.archived_at) history.push({ status: 'archived', date: safe(parcel.archived_at), description: 'Parcelle archivée' });
    return history.filter(e => e && typeof e === 'object' && e.status && e.date && e.description);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center"><LandPlot className="mr-3 h-8 w-8" />Gestion Foncière Communale</h1>
        <Button onClick={() => setShowCreate(true)}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Terrain</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patrimoine Foncier de la Commune</CardTitle>
          <div className="flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0 pt-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher une parcelle..." className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <select className="border rounded px-2 py-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">Statut (Tous)</option>
              <option value="Disponible">Disponible</option>
              <option value="Occupé">Occupé</option>
              <option value="EnProjet">EnProjet</option>
            </select>
            <select className="border rounded px-2 py-2 text-sm" value={zoneFilter} onChange={e => setZoneFilter(e.target.value)}>
              <option value="">Zone (Toutes)</option>
              {zones.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
            {(searchTerm || statusFilter || zoneFilter) && (
              <Button variant="ghost" onClick={() => { setSearchTerm(''); setStatusFilter(''); setZoneFilter(''); }}>
                <X className="mr-1 h-4 w-4" />Réinit.
              </Button>
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
                    <td className="p-2 font-mono">{p.reference}</td>
                    <td className="p-2">{p.location_name}</td>
                    <td className="p-2">{p.area_sqm}</td>
                    <td className="p-2">
                      <select className="border rounded px-1 py-1 text-xs" value={p.status} onChange={e => updateParcelInline(p, e.target.value)}>
                        <option>Disponible</option>
                        <option>Occupé</option>
                        <option>EnProjet</option>
                        <option>Archivé</option>
                      </select>
                    </td>
                    <td className="p-2 text-right flex gap-2 justify-end">
                      <Button asChild variant="outline" size="sm"><Link to={`/parcelles/${p.id}`}><Eye className="mr-1 h-4 w-4" />Détails</Link></Button>
                      <Button size="sm" variant="ghost" onClick={() => archiveParcel(p)} disabled={p.archived}><Archive className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => { if (p && typeof p === 'object' && p.id) { setTimelineParcel(p); setShowTimeline(true); } }}>Timeline</Button>
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
            <button className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground" onClick={() => !creating && setShowCreate(false)}>
              <X className="h-5 w-5" />
            </button>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Attribuer une parcelle</h2>
              <AttributionForm onSubmit={handleAttribution} users={users} loading={creating} />
            </div>
          </div>
        </div>
      )}

      <DocumentWallet documents={allDocuments} />

      {showTimeline && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-lg relative p-6">
            <button className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground" onClick={() => setShowTimeline(false)}>
              <span className="text-lg">×</span>
            </button>
            {(() => {
              try {
                const history = getParcelHistory(timelineParcel);
                if (timelineParcel && typeof timelineParcel === 'object' && Array.isArray(history) && history.length > 0) {
                  return (
                    <React.Fragment>
                      <h2 className="text-xl font-semibold mb-4">Historique de la parcelle {timelineParcel.reference}</h2>
                      <ParcelTimeline history={history} />
                    </React.Fragment>
                  );
                } else {
                  return <div className="text-red-600 font-bold">Impossible d’afficher la timeline : données de parcelle absentes, invalides ou sans historique.<br />Contactez le support si le problème persiste.</div>;
                }
              } catch (err) {
                return <div className="text-red-700 font-bold">Erreur inattendue lors du rendu de la timeline : {String(err && err.message ? err.message : err)}<br />Contactez le support.</div>;
              }
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default LandManagementPage;