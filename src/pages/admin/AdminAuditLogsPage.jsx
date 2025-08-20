import React, { useEffect, useState, useRef } from 'react';
import { useRealtimeTable, useRealtimeUsers, useRealtimeParcels, useRealtimeParcelSubmissions } from '@/hooks/useRealtimeTable';
import { SupabaseDataService } from '@/services/supabaseDataService';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [eventType, setEventType] = useState('');
  const [actor, setActor] = useState('');
  const [target, setTarget] = useState('');
  const [sortDir, setSortDir] = useState('desc');
  const [search, setSearch] = useState('');
  const [createdAfter, setCreatedAfter] = useState('');
  const [createdBefore, setCreatedBefore] = useState('');
  const channelRef = useRef(null);

  const load = async () => {
    setLoading(true);
  const { data, total: t } = await SupabaseDataService.listAuditLogs({ page, pageSize, eventType: eventType||null, actorUserId: actor||null, targetUserId: target||null, sortDir, createdAfter: createdAfter||null, createdBefore: createdBefore||null });
    setLogs(data);
    setTotal(t);
    setLoading(false);
  };

  useEffect(()=>{ load(); }, [page, pageSize, eventType, actor, target, sortDir, createdAfter, createdBefore]);

  // Realtime subscription
  useEffect(()=>{
    channelRef.current = supabase.channel('audit_logs_live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, (payload)=>{
        setLogs(prev => [payload.new, ...prev].slice(0, pageSize));
        setTotal(prev => prev + 1);
      })
      .subscribe();
    return ()=>{ if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, [pageSize]);

  const filtered = logs.filter(l => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (l.event_type||'').toLowerCase().includes(s) || (l.target_table||'').toLowerCase().includes(s) || (l.target_id||'').toLowerCase().includes(s);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-semibold">Audit Logs</h1>
        <div className="flex gap-2 flex-wrap items-center">
          <Input placeholder="Recherche" value={search} onChange={e=>{setSearch(e.target.value); setPage(1);}} className="w-52" />
          <Input placeholder="Event" value={eventType} onChange={e=>{setEventType(e.target.value); setPage(1);}} className="w-40" />
          <Input placeholder="Actor UUID" value={actor} onChange={e=>{setActor(e.target.value); setPage(1);}} className="w-40" />
          <Input placeholder="Target UUID" value={target} onChange={e=>{setTarget(e.target.value); setPage(1);}} className="w-40" />
          <input type="date" value={createdAfter} onChange={e=>{setCreatedAfter(e.target.value); setPage(1);}} className="border rounded px-2 py-1 text-xs" />
          <input type="date" value={createdBefore} onChange={e=>{setCreatedBefore(e.target.value); setPage(1);}} className="border rounded px-2 py-1 text-xs" />
          <Button size="sm" variant="outline" onClick={()=>{setCreatedAfter(''); setCreatedBefore('');}}>Reset Dates</Button>
          <select value={pageSize} onChange={e=>{setPageSize(Number(e.target.value)); setPage(1);}} className="border rounded px-2 py-1 text-sm">
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <button onClick={()=>setSortDir(d=>d==='asc'?'desc':'asc')} className="text-xs underline">{sortDir==='asc'?'Asc':'Desc'}</button>
          <Button size="sm" onClick={load} disabled={loading}>{loading?'...':'Rafraîchir'}</Button>
          <Button size="sm" variant="secondary" onClick={()=>{
            const csv = SupabaseDataService.toCSV(logs, [
              { label:'ID', accessor: r=>r.id },
              { label:'Event', accessor: r=>r.event_type },
              { label:'Actor', accessor: r=>r.actor_user_id },
              { label:'Target', accessor: r=>r.target_user_id },
              { label:'Table', accessor: r=>r.target_table },
              { label:'TargetId', accessor: r=>r.target_id },
              { label:'CreatedAt', accessor: r=>r.created_at }
            ]);
            SupabaseDataService.downloadCSV('audit_logs.csv', csv);
          }}>Export CSV</Button>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">Total: {total} (affichés: {filtered.length})</div>
      <div className="space-y-3 max-h-[70vh] overflow-auto pr-2">
        {filtered.map(log => (
          <Card key={log.id} className="p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="font-semibold">{log.event_type}</span>
              <span>{new Date(log.created_at).toLocaleString('fr-FR')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium">Actor:</span> {log.actor_user_id || '—'}{' '}
                {log.actor_user_id && <button className="text-[10px] underline" onClick={()=>{navigator.clipboard.writeText(log.actor_user_id);}}>Copier</button>}
              </div>
              <div>
                <span className="font-medium">Target:</span> {log.target_user_id || '—'}{' '}
                {log.target_user_id && <button className="text-[10px] underline" onClick={()=>{navigator.clipboard.writeText(log.target_user_id);}}>Copier</button>}
              </div>
              <div>
                <span className="font-medium">Table:</span> {log.target_table || '—'}
              </div>
              <div>
                <span className="font-medium">ID:</span> {log.target_id || '—'}{' '}
                {log.target_id && <button className="text-[10px] underline" onClick={()=>{navigator.clipboard.writeText(log.target_id);}}>Copier</button>}
              </div>
            </div>
            {log.metadata && (
              <details>
                <summary className="cursor-pointer">Metadata</summary>
                <pre className="mt-1 bg-muted/30 p-2 rounded max-h-40 overflow-auto text-[10px]">{JSON.stringify(log.metadata, null, 2)}</pre>
              </details>
            )}
          </Card>
        ))}
        {!loading && filtered.length === 0 && <div className="text-center text-sm text-muted-foreground py-10">Aucun log.</div>}
      </div>
      <div className="flex items-center justify-between pt-2">
        <Button size="sm" variant="outline" disabled={page===1 || loading} onClick={()=>setPage(p=>p-1)}>Précédent</Button>
        <div className="text-xs">Page {page} / {Math.max(1, Math.ceil(total / pageSize))}</div>
        <Button size="sm" variant="outline" disabled={(page * pageSize) >= total || loading} onClick={()=>setPage(p=>p+1)}>Suivant</Button>
      </div>
    </div>
  );
}
