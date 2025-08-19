import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { exceptionalRoleSchemas, defaultExceptionalTypeOrder } from './ExceptionalUserSchemas';
import { senegalAdministrativeDivisions, senegalBanks, notaireSpecialities } from '@/data/senegalLocations';
import SupabaseDataService from '@/services/supabaseDataService';

// Utility
const slugify = (s) => (s||'').toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');

export default function ExceptionalAddUserDialog({ open, onOpenChange, onCreated }) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [baseType, setBaseType] = useState('Mairie');
  const [autoVerify, setAutoVerify] = useState(true);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [invitation, setInvitation] = useState(false);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);

  const schema = exceptionalRoleSchemas[baseType] || [];

  const handleChange = (key, val) => setValues(v => ({ ...v, [key]: val }));

  const regionOptions = senegalAdministrativeDivisions.map(r => ({ value: r.code, label: r.name, raw: r }));
  const departmentOptions = useMemo(() => {
    const regionObj = senegalAdministrativeDivisions.find(r=>r.code===values.region);
    return regionObj ? regionObj.departments.map(d=>({ value:d.code, label:d.name, raw:d })) : [];
  }, [values.region]);
  const communeOptions = useMemo(()=>{
    const regionObj = senegalAdministrativeDivisions.find(r=>r.code===values.region);
    const dept = regionObj?.departments.find(d=>d.code===values.department);
    return dept ? dept.communes.map(c=>({ value:c.code, label:c.name, raw:c })) : [];
  }, [values.region, values.department]);

  const validate = () => {
    if (!email) return 'Email requis';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Email invalide';
    for (const field of schema) {
      if (field.required && !values[field.key]) return `Champ requis: ${field.label}`;
      if (field.type === 'number' && values[field.key] && isNaN(Number(values[field.key]))) return `Valeur numérique invalide pour ${field.label}`;
    }
    // Specific checks commune chain
    if (['Mairie','Vendeur','Agriculteur'].includes(baseType)) {
      if (!values.region || !values.department || !values.commune) return 'Hiérarchie géographique incomplète';
    }
    if (baseType === 'Banque' && !values.bank_name) return 'Banque requise';
    if (baseType === 'Notaire' && !values.notaire_speciality) return 'Spécialité requise';
    return null;
  };

  const reset = () => {
    setEmail(''); setBaseType('Mairie'); setValues({}); setAutoVerify(true); setInvitation(false); setSendingInvite(false);
  };

  const handleCreate = async () => {
    const err = validate();
    if (err) { toast({ variant:'destructive', title:'Validation', description: err }); return; }
    setLoading(true);
    try {
      const now = new Date().toISOString();
      const slug = slugify(values.full_name || values.bank_name || values.study_name || baseType) + '-' + Math.random().toString(36).substring(2,8);
      const userPayload = {
        email: email.trim().toLowerCase(),
        full_name: values.full_name || values.study_name || values.bank_name || email,
        type: baseType,
        role: 'user',
        verification_status: autoVerify ? 'verified' : 'not_verified',
        created_at: now,
        updated_at: now,
        metadata: { ...values, slug }
      };
      const created = await SupabaseDataService.createUser(userPayload);
      // Assign role (new RBAC) if function is there
      try { await SupabaseDataService.assignRole(created.id, baseType.toLowerCase()); } catch {/* ignore */}
      // Institution profile for institution types
      if (['Mairie','Banque','Notaire'].includes(baseType)) {
        await SupabaseDataService.createInstitutionProfile({
          user_id: created.id,
          type: baseType,
          slug,
          region: values.region || null,
          department: values.department || null,
          commune: values.commune || null,
          bank_name: values.bank_name || null,
          notaire_speciality: values.notaire_speciality || null,
          created_at: now,
          updated_at: now
        });
      }
      if (invitation) {
        setSendingInvite(true);
        await SupabaseDataService.sendAuthInvitation(userPayload.email, 'user');
      }
      // Event logging (best-effort)
      SupabaseDataService.logEvent({ entityType:'user', entityId: created.id, eventType:'user.created_exceptional', actorUserId:null, source:'admin_ui', importance:1, data:{ type:baseType, slug } });
      toast({ title:'Créé', description: `Utilisateur ${created.full_name}` });
      onCreated?.(created);
      onOpenChange(false);
      reset();
    } catch (e) {
      toast({ variant:'destructive', title:'Erreur création', description: e.message || String(e) });
    } finally { setLoading(false); setSendingInvite(false); }
  };

  const renderField = (field) => {
    const common = { id: field.key, value: values[field.key] || '', onChange: e => handleChange(field.key, e.target.value) };
    switch(field.type) {
      case 'text':
      case 'number':
        return <Input type={field.type} {...common} placeholder={field.placeholder||''} />;
      case 'checkbox':
        return <input type="checkbox" checked={!!values[field.key]} onChange={e=>handleChange(field.key, e.target.checked)} />;
      case 'select-region':
        return <select className="border rounded h-9 px-2 text-sm" value={values.region||''} onChange={e=>{handleChange('region', e.target.value); handleChange('department',''); handleChange('commune','');}}><option value="">--</option>{regionOptions.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
      case 'select-department':
        return <select className="border rounded h-9 px-2 text-sm" value={values.department||''} disabled={!values.region} onChange={e=>{handleChange('department', e.target.value); handleChange('commune','');}}><option value="">--</option>{departmentOptions.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
      case 'select-commune':
        return <select className="border rounded h-9 px-2 text-sm" value={values.commune||''} disabled={!values.department} onChange={e=>handleChange('commune', e.target.value)}><option value="">--</option>{communeOptions.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
      case 'select-bank':
        return <select className="border rounded h-9 px-2 text-sm" value={values.bank_name||''} onChange={e=>handleChange('bank_name', e.target.value)}><option value="">--</option>{senegalBanks.map(b=> <option key={b} value={b}>{b}</option>)}</select>;
      case 'select-notaire-speciality':
        return <select className="border rounded h-9 px-2 text-sm" value={values.notaire_speciality||''} onChange={e=>handleChange('notaire_speciality', e.target.value)}><option value="">--</option>{notaireSpecialities.map(s=> <option key={s} value={s}>{s}</option>)}</select>;
      default:
        return <Input type="text" {...common} />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o)=>{ if(!o) reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajout exceptionnel</DialogTitle>
          <DialogDescription>Création rapide d'un utilisateur institutionnel ou acteur avec champs dynamiques.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@exemple.com" />
          </div>
          <div className="grid gap-2">
            <Label>Type</Label>
            <select className="border rounded-md h-9 px-2 text-sm" value={baseType} onChange={e=>{ setBaseType(e.target.value); setValues({}); }}>
              {defaultExceptionalTypeOrder.map(t=> <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {/* Dynamic fields */}
          {schema.length > 0 && (
            <div className="space-y-3">
              {schema.map(f => (
                <div className="grid gap-1" key={f.key}>
                  <Label htmlFor={f.key} className="flex items-center gap-2">{f.label}{f.required && <span className="text-red-500">*</span>}</Label>
                  {renderField(f)}
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <input id="autoVerify" type="checkbox" checked={autoVerify} onChange={e=>setAutoVerify(e.target.checked)} />
            <Label htmlFor="autoVerify" className="text-sm cursor-pointer">Auto-vérifier</Label>
          </div>
          <div className="flex items-center gap-2">
            <input id="invitation" type="checkbox" checked={invitation} onChange={e=>setInvitation(e.target.checked)} />
            <Label htmlFor="invitation" className="text-sm cursor-pointer">Envoyer invitation (Edge)</Label>
          </div>
          <p className="text-xs text-muted-foreground">Validation dynamique selon rôle. Institution_profile créé si nécessaire. Attribution rôle RBAC si disponible.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={()=>onOpenChange(false)}>Annuler</Button>
          <Button disabled={loading || sendingInvite} onClick={handleCreate} className="bg-green-600 hover:bg-green-700">
            {loading ? 'Création...' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
