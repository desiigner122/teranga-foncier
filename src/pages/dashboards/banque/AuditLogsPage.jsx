import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/spinner';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('audit_logs')
        .select('id, action, actor_user_id, target_user_id, description, created_at')
        .eq('entity_type', 'banque')
        .order('created_at', { ascending: false });
      setLogs(data || []);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Logs d'audit Banque</h1>
      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {logs.length === 0 ? <p>Aucun log trouvé.</p> : logs.map(log => (
            <Card key={log.id}>
              <CardHeader>
                <CardTitle>{log.action}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-gray-500">Par: {log.actor_user_id} | Cible: {log.target_user_id}</div>
                <div className="text-sm">{log.description}</div>
                <div className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString()}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
