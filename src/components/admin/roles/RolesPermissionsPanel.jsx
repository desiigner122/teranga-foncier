import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { SupabaseDataService } from '@/services/supabaseDataService';
import usePermissions from '@/hooks/usePermissions';

const basePermissionsReference = [
  'parcel.read','parcel.create','parcel.update','request.submit','user.verify','audit.view','feature.flags.edit','institution.manage'
];

export default function RolesPermissionsPanel() {
  const { hasPermission } = usePermissions();
  const { toast } = useToast();
  const [roles, setRoles] = useState([]);
  // Loading géré par le hook temps réel
  const [createOpen, setCreateOpen] = useState(false);
  const [newRole, setNewRole] = useState({ key:'', label:'', description:'', permissions:[], feature_flags:[] });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const data = await SupabaseDataService.listRoles(); setRoles(data); } catch {/* toast? */} finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  const togglePermission = (perm) => {
    setNewRole(r => ({ ...r, permissions: r.permissions.includes(perm) ? r.permissions.filter(p=>p!==perm) : [...r.permissions, perm] }));
  };

  const handleCreate = async () => {
    if (!newRole.key || !newRole.label) { toast({ variant:'destructive', title:'Champs requis', description:'key et label' }); return; }
    setSaving(true);
    try {
      await SupabaseDataService.createRole({ key:newRole.key.toLowerCase(), label:newRole.label, description:newRole.description, defaultPermissions:newRole.permissions, featureFlags:newRole.feature_flags });
      toast({ title:'Rôle créé', description:newRole.label });
      setCreateOpen(false); setNewRole({ key:'', label:'', description:'', permissions:[], feature_flags:[] });
      load();
    } catch (e) { toast({ variant:'destructive', title:'Erreur création', description: e.message||String(e) }); }
    finally { setSaving(false); }
  };

  if (!hasPermission('feature.flags.edit')) {
    return <p className="text-sm text-muted-foreground">Accès limité (permissions insuffisantes).</p>;
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Rôles & Permissions</CardTitle>
        <Button size="sm" onClick={()=>setCreateOpen(true)}>+ Nouveau rôle</Button>
      </CardHeader>
      <CardContent>
        {loading ? <p className="text-sm">Chargement...</p> : roles.length === 0 ? <p className="text-sm text-muted-foreground">Aucun rôle.</p> : (
          <div className="space-y-3">
            {roles.map(r => (
              <div key={r.id} className="border rounded p-3 flex flex-col gap-1 relative group">
                <div className="flex gap-2 items-center flex-wrap">
                  <span className="font-medium">{r.label}</span>
                  <Badge variant="outline">{r.key}</Badge>
                  {(r.is_system || r.is_protected) && <Badge variant="secondary">protégé</Badge>}
                  {!r.is_system && !r.is_protected && (
                    <button
                      onClick={async ()=>{
                        if (!confirm(`Supprimer le rôle ${r.label} ?`)) return;
                        try { await SupabaseDataService.deleteRole(r.key); toast({ title:'Rôle supprimé', description:r.label }); load(); }
                        catch(e){ toast({ variant:'destructive', title:'Suppression impossible', description:e.message||String(e) }); }
                      }}
                      className="ml-auto text-xs px-2 py-1 rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                    >Supprimer</button>
                  )}
                </div>
                {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
                {Array.isArray(r.default_permissions) && r.default_permissions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {r.default_permissions.map(p => <Badge key={p} className="bg-blue-50 text-blue-700 border-blue-200">{p}</Badge>)}
                  </div>
                )}
                {Array.isArray(r.feature_flags) && r.feature_flags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {r.feature_flags.map(f => <Badge key={f} className="bg-green-50 text-green-700 border-green-200">{f}</Badge>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouveau rôle</DialogTitle>
            <DialogDescription>Créer un rôle personnalisé et définir ses permissions.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Key (slug)</label>
              <Input value={newRole.key} onChange={e=>setNewRole(r=>({...r,key:e.target.value}))} placeholder="ex: analyste" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Label</label>
              <Input value={newRole.label} onChange={e=>setNewRole(r=>({...r,label:e.target.value}))} placeholder="Nom affiché" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Description</label>
              <Input value={newRole.description} onChange={e=>setNewRole(r=>({...r,description:e.target.value}))} placeholder="Description courte" />
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Permissions</p>
              <div className="flex flex-wrap gap-2">
                {basePermissionsReference.map(p => {
                  const active = newRole.permissions.includes(p);
                  return (
                    <button key={p} type="button" onClick={()=>togglePermission(p)} className={`text-xs px-2 py-1 rounded border ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-blue-50'}`}>{p}</button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Feature Flags (séparés par virgule)</p>
              <Input value={newRole.feature_flags.join(',')} onChange={e=>setNewRole(r=>({...r, feature_flags:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}))} placeholder="flag1,flag2" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setCreateOpen(false)}>Annuler</Button>
            <Button disabled={saving} onClick={handleCreate}>{saving ? 'Création...' : 'Créer'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
