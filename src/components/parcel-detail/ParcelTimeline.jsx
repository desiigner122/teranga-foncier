import React, { useEffect, useState } from 'react';
import { SupabaseDataService } from '@/services/supabaseDataService';
import { supabase } from '@/lib/supabaseClient';

/** ParcelTimeline
 * Displays unified parcel timeline (events + price changes) with basic pagination.
 */
export default function ParcelTimeline({ parcelId }) {
  const { data: items, loading: itemsLoading, error: itemsError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (items) {
      setFilteredData(items);
    }
  }, [items]);
  
  useEffect(() => { fetchData(page); }, [parcelId, page]);

  // Realtime subscription
  useEffect(()=>{
    if (!parcelId) return;
    const channel = supabase.channel(`parcel-events-${parcelId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events', filter: `entity_type=eq.parcel,entity_id=eq.${parcelId}` }, payload => {
        setItems(prev => [{ ...payload.new, source_type:'event' }, ...prev].slice(0, pageSize));
        setTotal(t=>t+1);
        setLivePulse(true);
        setTimeout(()=>setLivePulse(false), 5000);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [parcelId, pageSize]);

  async function fetchData(p) {
    if (!parcelId) return;
    setLoading(true); setError(null);
    const res = await SupabaseDataService.getParcelTimeline(parcelId, { page: p, pageSize });
    if (res && res.data) { setItems(res.data); setTotal(res.total || 0); } else { setError('Impossible de charger la timeline'); }
    setLoading(false);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="bg-white rounded shadow p-4 mt-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Timeline Parcelle {livePulse && <span className="ml-2 px-2 py-0.5 text-xs rounded bg-red-500 text-white animate-pulse">LIVE</span>}</h3>
        <div className="text-sm text-gray-500">{total} événements</div>
      </div>
      {loading && <div className="text-sm text-gray-500">Chargement...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {!loading && !error && items.length === 0 && (
        <div className="text-sm text-gray-500">Aucun événement.</div>
      )}
      <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {items.map(ev => (
          <li key={`${ev.source_type}-${ev.timeline_id || ev.id}`} className="border border-gray-200 rounded p-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">{formatEventType(ev.event_type)}</span>
              <span className="text-xs text-gray-500">{new Date(ev.created_at).toLocaleString()}</span>
            </div>
            {renderDetails(ev)}
          </li>
        ))}
      </ul>
      <div className="flex justify-between items-center mt-3 text-sm">
        <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-2 py-1 border rounded disabled:opacity-40">Précédent</button>
        <span>Page {page} / {totalPages}</span>
        <button disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="px-2 py-1 border rounded disabled:opacity-40">Suivant</button>
      </div>
    </div>
  );
}

function formatEventType(type) {
  if (!type) return 'Événement';
  return type.replace('parcel.','Parcelle: ').replace('_',' ');
}

function renderDetails(ev) {
  if (ev.source_type === 'price_history' || ev.event_type === 'parcel.price_changed') {
    return (
      <div className="text-xs mt-1">
        <div>Prix: {ev.old_price != null ? formatPrice(ev.old_price) : '—'} → {ev.new_price != null ? formatPrice(ev.new_price) : '—'}</div>
      </div>
    );
  }
  if (ev.data) {
    const keys = Object.keys(ev.data||{}).slice(0,4);
    if (keys.length) {
      return (
        <div className="text-xs text-gray-600 mt-1 flex flex-wrap gap-x-2 gap-y-1">
          {keys.map(k => <span key={k}><span className="font-medium">{k}:</span> {stringifyVal(ev.data[k])}</span>)}
        </div>
      );
    }
  }
  return null;
}

function stringifyVal(v){
  if (v == null) return '—';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}
function formatPrice(p){
  try { return new Intl.NumberFormat('fr-FR',{ style:'currency', currency:'XOF'}).format(p); } catch { return p; }
}
