import React, { useState, useMemo, useEffect, React } from 'react';
// Utility
const slugify = (s) => (s||'').toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');

export default function ExceptionalAddUserDialogWithPassword({ open, onOpenChange, onCreated }) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [baseType, setBaseType] = useState('Mairie');
  const [autoVerify, setAutoVerify] = useState(true);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [invitation, setInvitation] = useState(false);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);

  const schema = exceptionalRoleSchemas[baseType] || [];

  const handleChange = (key, val) => setValues(v => ({ ...v, [key]: val }));

  const [regions, setRegions] = useState([]);
  const [departments, setDepartments] = useState([]); // for selected region
  const [communes, setCommunes] = useState([]); // for selected department
  const [banks, setBanks] = useState([]);
  const [notaireSpecs, setNotaireSpecs] = useState([]);

  // Load base reference data when dialog opens
  React.useEffect(()=>{
    if (!open) return;
    (async ()=>{
      try {
        const [r, b, ns] = await Promise.all([
          SupabaseDataService.listRegions(),
          SupabaseDataService.listBanks(),
          SupabaseDataService.listNotaireSpecialities()
        ]);
        setRegions(r);
        setBanks(b);
        setNotaireSpecs(ns);
      } catch {/* silent */}
    })();
  }, [open]);

  // Load departments when region changes
  React.useEffect(()=>{
    if (!values.region) { setDepartments([]); setCommunes([]); return; }
    (async ()=>{
      try {
        const regionObj = regions.find(r=> String(r.id) === String(values.region) || r.code === values.region);
        const regionId = regionObj?.id || values.region; // allow id or code
        const deps = await SupabaseDataService.listDepartmentsByRegion(regionId);
        setDepartments(deps);
      } catch {/* ignore */}
    })();
  }, [values.region, regions]);

  // Load communes when department changes
  React.useEffect(()=>{
    if (!values.department) { setCommunes([]); return; }
    (async ()=>{
      try {
        const depObj = departments.find(d=> String(d.id) === String(values.department) || d.code === values.department);
        const depId = depObj?.id || values.department;
        const cms = await SupabaseDataService.listCommunesByDepartment(depId);
        setCommunes(cms);
      } catch {/* ignore */}
    })();
  }, [values.department, departments]);

  const regionOptions = regions.map(r => ({ value: r.id || r.code, label: r.name }));
  const departmentOptions = departments.map(d => ({ value: d.id || d.code, label: d.name }));
  const communeOptions = communes.map(c => ({ value: c.id || c.code, label: c.name }));

  const validate = () => {
    if (!email) return 'Email requis';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Email invalide';
    if (!password) return 'Mot de passe requis';
    if (password.length < 8) return 'Mot de passe trop court (min 8 caractères)';
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
    setEmail(''); 
    setPassword('');
    setBaseType('Mairie'); 
    setValues({}); 
    setAutoVerify(true); 
    setInvitation(false); 
    setSendingInvite(false);
  };

  const handleCreate = async () => {
    const err = validate();
    if (err) { toast({ variant:'destructive', title:'Validation', description: err }); return; }
    setLoading(true);
    try {
      const now = new Date().toISOString();
      const slug = slugify(values.full_name || values.bank_name || values.study_name || baseType) + '-' + Math.random().toString(36).substring(2,8);
      
      // Créer l'utilisateur avec mot de passe via RPC ou API sécurisée
      // Note: Ceci est un exemple - dans une implémentation réelle, il faudrait appeler une API sécurisée
      // qui crée l'utilisateur dans auth.users avec le mot de passe
      const created = await SupabaseDataService.createUserWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
        full_name: values.full_name || values.study_name || values.bank_name || email,
        type: baseType,
        role: 'user',
        verification_status: autoVerify ? 'verified' : 'not_verified',
        metadata: { ...values, slug }
      });

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
        await SupabaseDataService.sendAuthInvitation(email.trim().toLowerCase(), 'user');
      }
      
      // Event logging
      SupabaseDataService.logEvent({ 
        entityType: 'user', 
        entityId: created.id, 
        eventType: 'user.created_exceptional', 
        actorUserId: null, 
        source: 'admin_ui', 
        importance: 1, 
        data: { type: baseType, slug } 
      });
      
      toast({ title: 'Créé', description: `Utilisateur ${created.full_name}` });
      onCreated?.(created);
      onOpenChange(false);
      reset();
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erreur création', description: e.message || String(e) });
    } finally { 
      setLoading(false); 
      setSendingInvite(false); 
    }
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
        return <select className="border rounded h-9 px-2 text-sm w-full" value={values.region||''} onChange={e=>{handleChange('region', e.target.value); handleChange('department',''); handleChange('commune','');}}><option value="">--</option>{regionOptions.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
      case 'select-department':
        return <select className="border rounded h-9 px-2 text-sm w-full" value={values.department||''} disabled={!values.region} onChange={e=>{handleChange('department', e.target.value); handleChange('commune','');}}><option value="">--</option>{departmentOptions.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
      case 'select-commune':
        return <select className="border rounded h-9 px-2 text-sm w-full" value={values.commune||''} disabled={!values.department} onChange={e=>handleChange('commune', e.target.value)}><option value="">--</option>{communeOptions.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
      case 'select-bank':
        return <select className="border rounded h-9 px-2 text-sm w-full" value={values.bank_name||''} onChange={e=>handleChange('bank_name', e.target.value)}><option value="">--</option>{banks.map(b=> <option key={b} value={b}>{b}</option>)}</select>;
      case 'select-notaire-speciality':
        return <select className="border rounded h-9 px-2 text-sm w-full" value={values.notaire_speciality||''} onChange={e=>handleChange('notaire_speciality', e.target.value)}><option value="">--</option>{notaireSpecs.map(s=> <option key={s} value={s}>{s}</option>)}</select>;
      default:
        return <Input type="text" {...common} />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o)=>{ if(!o) reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle>Ajout utilisateur complet</DialogTitle>
          <DialogDescription>Création d'un utilisateur avec mot de passe et informations complètes.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-black">Email</Label>
            <Input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@exemple.com" className="bg-white border-gray-300 text-black" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-black">Mot de passe</Label>
            <Input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" className="bg-white border-gray-300 text-black" />
            <p className="text-xs text-gray-500">Minimum 8 caractères.</p>
          </div>
          <div className="grid gap-2">
            <Label className="text-black">Type</Label>
            <select 
              className="border rounded-md h-9 px-2 text-sm bg-white border-gray-300 text-black w-full" 
              value={baseType} 
              onChange={e=>{ setBaseType(e.target.value); setValues({}); }}
            >
              {defaultExceptionalTypeOrder.map(t=> <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          
          {/* Dynamic fields */}
          {schema.length > 0 && (
            <div className="space-y-3">
              {schema.map(f => (
                <div className="grid gap-1" key={f.key}>
                  <Label htmlFor={f.key} className="flex items-center gap-2 text-black">
                    {f.label}{f.required && <span className="text-red-500">*</span>}
                  </Label>
                  {renderField(f)}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <input id="autoVerify" type="checkbox" checked={autoVerify} onChange={e=>setAutoVerify(e.target.checked)} />
            <Label htmlFor="autoVerify" className="text-sm cursor-pointer text-black">Auto-vérifier</Label>
          </div>
          <div className="flex items-center gap-2">
            <input id="invitation" type="checkbox" checked={invitation} onChange={e=>setInvitation(e.target.checked)} />
            <Label htmlFor="invitation" className="text-sm cursor-pointer text-black">Envoyer invitation (facultatif)</Label>
          </div>
          <p className="text-xs text-gray-500">Validation dynamique selon rôle. Institution_profile créé si nécessaire. Attribution rôle RBAC si disponible.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={()=>onOpenChange(false)} className="bg-white text-black">Annuler</Button>
          <Button 
            disabled={loading || sendingInvite} 
            onClick={handleCreate} 
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? 'Création...' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
