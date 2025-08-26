import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const SettingsPage = () => {
  const [settings, setSettings] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        const { data, error: err2 } = await supabase
          .from('users')
          .select('full_name, email, phone')
          .eq('id', user.id)
          .single();
        if (err2) throw err2;
        setSettings({ name: data.full_name, email: data.email, phone: data.phone });
      } catch (e) {
        toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [toast]);

  const handleChange = e => {
    setSettings(s => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      const { error: err2 } = await supabase
        .from('users')
        .update({ full_name: settings.name, email: settings.email, phone: settings.phone })
        .eq('id', user.id);
      if (err2) throw err2;
      toast({ title: 'Succès', description: 'Paramètres mis à jour.' });
    } catch (e) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Paramètres Banque</h1>
      {loading ? <p>Chargement...</p> : (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nom</label>
            <input name="name" value={settings.name} onChange={handleChange} className="border rounded px-2 py-1 w-full" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input name="email" value={settings.email} onChange={handleChange} className="border rounded px-2 py-1 w-full" required type="email" />
          </div>
          <div>
            <label className="block text-sm font-medium">Téléphone</label>
            <input name="phone" value={settings.phone || ''} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
          </div>
          <Button type="submit" disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
        </form>
      )}
    </div>
  );
};

export default SettingsPage;
