import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import SupabaseDataService from '../../services/supabaseDataService';
import supabase from '../../lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";

// Simple fallback components if shadcn variants differ
const Badge = ({ children, className='' }) => <span className={`inline-block px-2 py-0.5 text-xs rounded bg-primary/10 text-primary ${className}`}>{children}</span>;

export default function AdminInstitutionsPage() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [regionFilter, setRegionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [regions, setRegions] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [statusCounts, setStatusCounts] = useState({ pending:0, active:0, suspended:0 });
  const [createdAfter, setCreatedAfter] = useState('');
  const [createdBefore, setCreatedBefore] = useState('');

  const load = async () => {
    setLoading(true);
    const { data, total: t } = await SupabaseDataService.listInstitutionsPaged({
      regionId: regionFilter || null,
      type: typeFilter || null,
      status: statusFilter || null,
      page,
      pageSize,
      sortBy,
      sortDir,
      createdAfter: createdAfter || null,
      createdBefore: createdBefore || null
    });
    setInstitutions(data);
    setTotal(t);
    const counts = await SupabaseDataService.getInstitutionStatusCounts({ regionId: regionFilter || null, type: typeFilter || null, createdAfter: createdAfter || null, createdBefore: createdBefore || null });
    setStatusCounts(counts);
    setLoading(false);
  };

  useEffect(()=>{ load(); }, [regionFilter, typeFilter, statusFilter, page, pageSize, sortBy, sortDir, createdAfter, createdBefore]);

  useEffect(()=> {
    (async ()=>{
      const { data, error } = await supabase.from('regions').select('id,name').order('name');
      if (!error) setRegions(data);
    })();
  }, []);

  const updateStatus = async (inst, newStatus) => {
    setUpdatingId(inst.id);
    try {
      const { error } = await supabase.from('institution_profiles').update({ status: newStatus }).eq('id', inst.id);
      if (error) throw error;
      await load();
    } catch (e) {
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = institutions.filter(i => {
    if (!search) return true;
    const s = search.toLowerCase();
    return i.name.toLowerCase().includes(s) || (i.users?.full_name || '').toLowerCase().includes(s) || (i.slug||'').includes(s);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-semibold">Institutions</h1>
        <div className="flex gap-2 flex-wrap items-center">
          <Input placeholder="Recherche" value={search} onChange={e=>{setSearch(e.target.value); setPage(1);}} className="w-48" />
          <select value={regionFilter} onChange={e=>{setRegionFilter(e.target.value); setPage(1);}} className="border rounded px-2 py-1 text-sm w-40">
            <option value="">Région</option>
            {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <select value={typeFilter} onChange={e=>{setTypeFilter(e.target.value); setPage(1);}} className="border rounded px-2 py-1 text-sm">
            <option value="">Type</option>
            <option value="Mairie">Mairie</option>
            <option value="Banque">Banque</option>
            <option value="Notaire">Notaire</option>
          </select>
          <select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value); setPage(1);}} className="border rounded px-2 py-1 text-sm">
            <option value="">Statut</option>
            <option value="pending">En attente</option>
            <option value="active">Actif</option>
            <option value="suspended">Suspendu</option>
          </select>
          <select value={sortBy} onChange={e=>{setSortBy(e.target.value); setPage(1);}} className="border rounded px-2 py-1 text-sm">
            <option value="created_at">Tri: Date</option>
            <option value="name">Tri: Nom</option>
            <option value="status">Tri: Statut</option>
          </select>
          <button onClick={()=>{setSortDir(d=>d==='asc'?'desc':'asc'); setPage(1);}} className="text-xs underline">
            {sortDir === 'asc' ? 'Asc' : 'Desc'}
          </button>
          <select value={pageSize} onChange={e=>{setPageSize(Number(e.target.value)); setPage(1);}} className="border rounded px-2 py-1 text-sm">
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
          </select>
          <input type="date" value={createdAfter} onChange={e=>{setCreatedAfter(e.target.value); setPage(1);}} className="border rounded px-2 py-1 text-xs" />
          <input type="date" value={createdBefore} onChange={e=>{setCreatedBefore(e.target.value); setPage(1);}} className="border rounded px-2 py-1 text-xs" />
          <Button size="sm" variant="outline" onClick={()=>{setCreatedAfter(''); setCreatedBefore('');}}>Reset Dates</Button>
          <Button onClick={load} size="sm" disabled={loading}>{loading ? '...' : 'Rafraîchir'}</Button>
          <Button size="sm" variant="secondary" onClick={()=>{
            const csv = SupabaseDataService.toCSV(institutions, [
              { label:'ID', accessor: r=>r.id },
              { label:'Nom', accessor: r=>r.name },
              { label:'Slug', accessor: r=>r.slug },
              { label:'Type', accessor: r=>r.institution_type },
              { label:'Statut', accessor: r=>r.status },
              { label:'Region', accessor: r=>r.regions?.name || '' },
              { label:'Departement', accessor: r=>r.departments?.name || '' },
              { label:'Commune', accessor: r=>r.communes?.name || '' },
              { label:'CreatedAt', accessor: r=>r.created_at }
            ]);
            SupabaseDataService.downloadCSV('institutions.csv', csv);
          }}>Export CSV</Button>
        </div>
      </div>
      <div className="flex gap-4 text-xs">
        <span>En attente: <strong>{statusCounts.pending}</strong></span>
        <span>Actifs: <strong>{statusCounts.active}</strong></span>
        <span>Suspendus: <strong>{statusCounts.suspended}</strong></span>
        <span>Total filtré: <strong>{total}</strong></span>
      </div>
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map(inst => (
          <Card key={inst.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-lg">{inst.name}</h2>
                <p className="text-xs text-muted-foreground">{inst.slug}</p>
              </div>
              <Badge>{inst.institution_type}</Badge>
            </div>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Utilisateur:</span> {inst.users?.full_name || '—'} ({inst.users?.email})</p>
              <p><span className="font-medium">Région:</span> {inst.regions?.name || '—'}</p>
              <p><span className="font-medium">Département:</span> {inst.departments?.name || '—'}</p>
              <p><span className="font-medium">Commune:</span> {inst.communes?.name || '—'}</p>
              <p><span className="font-medium">Statut:</span> <Badge className="ml-1">{inst.status}</Badge></p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {inst.status !== 'active' && (
                <Button size="xs" variant="outline" disabled={updatingId===inst.id} onClick={()=>updateStatus(inst,'active')}>{updatingId===inst.id?'...':'Activer'}</Button>
              )}
              {inst.status === 'active' && (
                <Button size="xs" variant="destructive" disabled={updatingId===inst.id} onClick={()=>updateStatus(inst,'suspended')}>{updatingId===inst.id?'...':'Suspendre'}</Button>
              )}
              {inst.status === 'suspended' && (
                <Button size="xs" variant="outline" disabled={updatingId===inst.id} onClick={()=>updateStatus(inst,'active')}>{updatingId===inst.id?'...':'Réactiver'}</Button>
              )}
              <a href={`/dashboard/admin/audit-logs?target=${inst.user_id}`} className="text-xs underline text-primary">Voir audit</a>
            </div>
            {inst.metadata && Object.keys(inst.metadata).length > 0 && (
              <details className="text-xs">
                <summary className="cursor-pointer font-medium">Métadonnées</summary>
                <pre className="mt-1 max-h-40 overflow-auto bg-muted/30 p-2 rounded text-[10px]">{JSON.stringify(inst.metadata, null, 2)}</pre>
              </details>
            )}
            <div className="text-[10px] text-muted-foreground">Créé le {new Date(inst.created_at).toLocaleString('fr-FR')}</div>
          </Card>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-10">Aucune institution trouvée.</div>
        )}
      </div>
      <div className="flex items-center justify-between pt-4">
        <Button size="sm" variant="outline" disabled={page===1 || loading} onClick={()=>setPage(p=>p-1)}>Précédent</Button>
        <div className="text-xs">Page {page} / {Math.max(1, Math.ceil(total / pageSize))}</div>
        <Button size="sm" variant="outline" disabled={(page * pageSize) >= total || loading} onClick={()=>setPage(p=>p+1)}>Suivant</Button>
      </div>
    </div>
  );
}
