import React, { useEffect, useState } from 'react';
import SupabaseDataService from '@/services/supabaseDataService';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

// Simple fallback components if shadcn variants differ
const Badge = ({ children, className='' }) => <span className={`inline-block px-2 py-0.5 text-xs rounded bg-primary/10 text-primary ${className}`}>{children}</span>;

export default function AdminInstitutionsPage() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [regionFilter, setRegionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await SupabaseDataService.listInstitutions({
      regionId: regionFilter || null,
      type: typeFilter || null,
      status: statusFilter || null,
      limit: 200
    });
    setInstitutions(data);
    setLoading(false);
  };

  useEffect(()=>{ load(); }, [regionFilter, typeFilter, statusFilter]);

  const filtered = institutions.filter(i => {
    if (!search) return true;
    const s = search.toLowerCase();
    return i.name.toLowerCase().includes(s) || (i.users?.full_name || '').toLowerCase().includes(s) || (i.slug||'').includes(s);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-semibold">Institutions</h1>
        <div className="flex gap-2 flex-wrap">
          <Input placeholder="Recherche" value={search} onChange={e=>setSearch(e.target.value)} className="w-48" />
          <Input placeholder="Region ID" value={regionFilter} onChange={e=>setRegionFilter(e.target.value)} className="w-36" />
          <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} className="border rounded px-2 py-1 text-sm">
            <option value="">Type</option>
            <option value="Mairie">Mairie</option>
            <option value="Banque">Banque</option>
            <option value="Notaire">Notaire</option>
          </select>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="border rounded px-2 py-1 text-sm">
            <option value="">Statut</option>
            <option value="pending">En attente</option>
            <option value="active">Actif</option>
            <option value="suspended">Suspendu</option>
          </select>
          <Button onClick={load} size="sm" disabled={loading}>{loading ? 'Chargement...' : 'Rafraîchir'}</Button>
        </div>
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
    </div>
  );
}
