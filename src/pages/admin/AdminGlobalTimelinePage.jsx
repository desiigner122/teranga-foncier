import React, { useEffect, useState } from 'react';
import { CardHeader, CardTitle } from '../../components/ui/card';
import SupabaseDataService from '../../services/supabaseDataService';
import supabase from "../../lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminGlobalTimelinePage() {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ entityType:'', entityId:'', eventType:'', importanceMin:'', source:'' });
  const [loading, setLoading] = useState(false);
  const [livePulse, setLivePulse] = useState(false);

  useEffect(()=>{ load(); /* eslint-disable-next-line */ },[page]);

  // Realtime global events (all inserts). Lightweight gating: only prepend if filters empty or match.
  useEffect(()=>{
    const channel = supabase.channel('global-events-admin')
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'events' }, payload => {
        const ev = payload.new;
        // Match current filters (if set) before injecting
        if (filters.entityType && ev.entity_type !== filters.entityType) return;
        if (filters.entityId && ev.entity_id !== filters.entityId) return;
        if (filters.eventType && ev.event_type !== filters.eventType) return;
        if (filters.importanceMin !== '' && ev.importance < Number(filters.importanceMin)) return;
        if (filters.source && ev.source !== filters.source) return;
        setEvents(prev => [ev, ...prev].slice(0, pageSize));
        setTotal(t=>t+1);
        setLivePulse(true); setTimeout(()=>setLivePulse(false), 5000);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [filters, pageSize]);

  async function load() {
    setLoading(true);
    const res = await SupabaseDataService.listEvents({
      entityType: filters.entityType || null,
      entityId: filters.entityId || null,
      eventType: filters.eventType || null,
      importanceMin: filters.importanceMin === '' ? null : Number(filters.importanceMin),
      source: filters.source || null,
      page, pageSize
    });
    setEvents(res.data); setTotal(res.total); setLoading(false);
  }

  function updateFilter(k,v){ setFilters(f=>({...f,[k]:v})); }
  function apply(){ setPage(1); load(); }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader><CardTitle>Timeline Globale {livePulse && <span className="ml-2 px-2 py-0.5 text-xs rounded bg-red-500 text-white animate-pulse">LIVE</span>}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-3">
            <Input placeholder="Entity Type" value={filters.entityType} onChange={e=>updateFilter('entityType', e.target.value)} />
            <Input placeholder="Entity ID" value={filters.entityId} onChange={e=>updateFilter('entityId', e.target.value)} />
            <Input placeholder="Event Type" value={filters.eventType} onChange={e=>updateFilter('eventType', e.target.value)} />
            <Input placeholder="Min Importance" value={filters.importanceMin} onChange={e=>updateFilter('importanceMin', e.target.value)} />
            <Input placeholder="Source" value={filters.source} onChange={e=>updateFilter('source', e.target.value)} />
            <Button variant="outline" onClick={apply}>Filtrer</Button>
          </div>
          {loading && <div className="text-sm text-gray-500">Chargement...</div>}
          {!loading && events.length===0 && <div className="text-sm text-gray-500">Aucun événement.</div>}
          <ul className="divide-y max-h-[60vh] overflow-y-auto text-sm">
            {events.map(ev => (
              <li key={ev.id} className="py-2">
                <div className="flex justify-between">
                  <span className="font-medium">{ev.event_type}</span>
                  <span className="text-xs text-gray-500">{new Date(ev.created_at).toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-600 flex flex-wrap gap-2 mt-1">
                  <span>Entity: {ev.entity_type} #{ev.entity_id}</span>
                  {ev.importance ? <span>Importance: {ev.importance}</span> : null}
                  {ev.source ? <span>Source: {ev.source}</span> : null}
                  {ev.actor_user_id ? <span>Actor: {ev.actor_user_id}</span> : null}
                </div>
                {ev.data && Object.keys(ev.data||{}).length > 0 && (
                  <pre className="mt-1 bg-gray-50 border text-[10px] p-2 rounded overflow-x-auto">{JSON.stringify(ev.data,null,2)}</pre>
                )}
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center mt-3 text-sm">
            <Button variant="outline" size="sm" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Précédent</Button>
            <span>Page {page} / {totalPages} ({total} événements)</span>
            <Button variant="outline" size="sm" disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Suivant</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
