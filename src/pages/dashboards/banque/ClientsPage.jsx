import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/spinner';
import { useToast } from '@/components/ui/use-toast';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('users')
          .select('id, full_name, email, phone, created_at')
          .eq('role', 'client');
        if (search) {
          query = query.ilike('full_name', `%${search}%`);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        setClients(data || []);
      } catch (e) {
        toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [toast, search]);

  const handleSelect = (id) => {
    setSelected(sel => sel.includes(id) ? sel.filter(s => s !== id) : [...sel, id]);
  };

  const handleSelectAll = () => {
    if (selected.length === clients.length) setSelected([]);
    else setSelected(clients.map(c => c.id));
  };

  const handleExport = () => {
    setExporting(true);
    const rows = [
      ['Nom', 'Email', 'Téléphone', 'Date inscription'],
      ...clients.filter(c => selected.length === 0 || selected.includes(c.id)).map(c => [c.full_name, c.email, c.phone || '', new Date(c.created_at).toLocaleDateString()])
    ];
    const csv = rows.map(r => r.map(x => '"'+(x||'')+'"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clients.csv';
    a.click();
    setExporting(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Clients Banque</h1>
      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Recherche par nom..." className="border rounded px-2 py-1 w-full md:w-64" />
        <Button onClick={handleSelectAll} variant="outline" size="sm">{selected.length === clients.length ? 'Tout désélectionner' : 'Tout sélectionner'}</Button>
        <Button onClick={handleExport} disabled={exporting || clients.length === 0} size="sm">Exporter CSV</Button>
        {/* Exemple d'action en masse */}
        {/* <Button disabled={selected.length === 0}>Notifier sélectionnés</Button> */}
      </div>
      {loading ? <LoadingSpinner /> : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th><input type="checkbox" checked={selected.length === clients.length && clients.length > 0} onChange={handleSelectAll} /></th>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Date inscription</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-4">Aucun client trouvé.</td></tr>
              ) : clients.map(client => (
                <tr key={client.id} className={selected.includes(client.id) ? 'bg-blue-50' : ''}>
                  <td><input type="checkbox" checked={selected.includes(client.id)} onChange={()=>handleSelect(client.id)} /></td>
                  <td>{client.full_name}</td>
                  <td>{client.email}</td>
                  <td>{client.phone || '—'}</td>
                  <td>{new Date(client.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
