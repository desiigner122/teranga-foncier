import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { exceptionalRoleSchemas, defaultExceptionalTypeOrder } from './ExceptionalUserSchemasImproved';
import SupabaseDataService from '@/services/supabaseDataService';
import { senegalAdministrativeDivisions, senegalBanks, notaireSpecialities, professionnelTypes } from '@/data/senegalData';

// Utility
const slugify = (s) => (s||'').toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');

export default function ExceptionalAddUserDialogImproved({ open, onOpenChange, onCreated }) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [baseType, setBaseType] = useState('Mairie');
  const [autoVerify, setAutoVerify] = useState(true);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [invitation, setInvitation] = useState(false);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [showLocalData, setShowLocalData] = useState(false);

  const schema = exceptionalRoleSchemas[baseType] || [];

  const handleChange = (key, val) => setValues(v => ({ ...v, [key]: val }));

  // État local pour les données administratives du Sénégal (pour fallback)
  const [regions, setRegions] = useState([]);
  const [departments, setDepartments] = useState([]); // pour la région sélectionnée
  const [communes, setCommunes] = useState([]); // pour le département sélectionné
  const [banks, setBanks] = useState([]);
  const [notaireSpecs, setNotaireSpecs] = useState([]);

  // Utilisation des données locales comme fallback
  const useLocalData = () => {
    setShowLocalData(true);
    const r = senegalAdministrativeDivisions.map(region => ({ 
      id: region.code, 
      name: region.name,
      code: region.code
    }));
    setRegions(r);
    setBanks(senegalBanks);
    setNotaireSpecs(notaireSpecialities);
    toast({
      title: "Utilisation des données locales",
      description: "Les données sont chargées depuis le fichier local."
    });
  };

  // Charger les données de référence quand le dialogue s'ouvre
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        // Essayer de charger depuis Supabase d'abord
        const [r, b, ns] = await Promise.all([
          SupabaseDataService.listRegions(),
          SupabaseDataService.listBanks(),
          SupabaseDataService.listNotaireSpecialities()
        ]);
        
        // Si les données sont vides ou non disponibles, utiliser les données locales
        if (!r || r.length === 0 || !b || b.length === 0 || !ns || ns.length === 0) {
          useLocalData();
        } else {
          setRegions(r);
          setBanks(b);
          setNotaireSpecs(ns);
          setShowLocalData(false);
        }
      } catch (error) {
        console.error("Erreur de chargement des données de référence:", error);
        useLocalData();
      }
    })();
  }, [open]);

  // Charger les départements quand la région change
  useEffect(() => {
    if (!values.region) { 
      setDepartments([]); 
      setCommunes([]); 
      return; 
    }

    if (showLocalData) {
      // Utiliser les données locales
      const selectedRegion = senegalAdministrativeDivisions.find(r => r.code === values.region);
      if (selectedRegion) {
        const deps = selectedRegion.departments.map(dept => ({
          id: dept.code,
          name: dept.name,
          code: dept.code
        }));
        setDepartments(deps);
      }
    } else {
      // Essayer de charger depuis Supabase
      (async () => {
        try {
          const regionObj = regions.find(r => String(r.id) === String(values.region) || r.code === values.region);
          const regionId = regionObj?.id || values.region; // permettre id ou code
          const deps = await SupabaseDataService.listDepartmentsByRegion(regionId);
          
          if (!deps || deps.length === 0) {
            // Fallback sur les données locales si Supabase ne retourne rien
            useLocalData();
            const selectedRegion = senegalAdministrativeDivisions.find(r => r.code === values.region);
            if (selectedRegion) {
              const localDeps = selectedRegion.departments.map(dept => ({
                id: dept.code,
                name: dept.name,
                code: dept.code
              }));
              setDepartments(localDeps);
            }
          } else {
            setDepartments(deps);
          }
        } catch (error) {
          console.error("Erreur de chargement des départements:", error);
          useLocalData();
        }
      })();
    }
  }, [values.region, regions, showLocalData]);

  // Charger les communes quand le département change
  useEffect(() => {
    if (!values.department) { 
      setCommunes([]); 
      return; 
    }

    if (showLocalData) {
      // Utiliser les données locales
      const selectedRegion = senegalAdministrativeDivisions.find(r => r.code === values.region);
      if (selectedRegion) {
        const selectedDept = selectedRegion.departments.find(d => d.code === values.department);
        if (selectedDept) {
          const coms = selectedDept.communes.map(com => ({
            id: com.code,
            name: com.name,
            code: com.code
          }));
          setCommunes(coms);
        }
      }
    } else {
      // Essayer de charger depuis Supabase
      (async () => {
        try {
          const depObj = departments.find(d => String(d.id) === String(values.department) || d.code === values.department);
          const depId = depObj?.id || values.department;
          const cms = await SupabaseDataService.listCommunesByDepartment(depId);
          
          if (!cms || cms.length === 0) {
            // Fallback sur les données locales si Supabase ne retourne rien
            useLocalData();
            const selectedRegion = senegalAdministrativeDivisions.find(r => r.code === values.region);
            if (selectedRegion) {
              const selectedDept = selectedRegion.departments.find(d => d.code === values.department);
              if (selectedDept) {
                const localComs = selectedDept.communes.map(com => ({
                  id: com.code,
                  name: com.name,
                  code: com.code
                }));
                setCommunes(localComs);
              }
            }
          } else {
            setCommunes(cms);
          }
        } catch (error) {
          console.error("Erreur de chargement des communes:", error);
          useLocalData();
        }
      })();
    }
  }, [values.department, departments, values.region, showLocalData]);

  const regionOptions = regions.map(r => ({ value: r.id || r.code, label: r.name }));
  const departmentOptions = departments.map(d => ({ value: d.id || d.code, label: d.name }));
  const communeOptions = communes.map(c => ({ value: c.id || c.code, label: c.name }));
  const bankOptions = banks.map(b => ({ value: b, label: b }));
  const notaireSpecOptions = notaireSpecs.map(s => ({ value: s, label: s }));
  const professionnelTypeOptions = professionnelTypes.map(t => ({ value: t, label: t }));

  const validate = () => {
    if (!email) return 'Email requis';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Email invalide';
    for (const field of schema) {
      if (field.required && !values[field.key]) return `Champ requis: ${field.label}`;
      if (field.type === 'number' && values[field.key] && isNaN(Number(values[field.key]))) return `Valeur numérique invalide pour ${field.label}`;
    }
    // Vérifications spécifiques pour la chaîne géographique
    if (['Mairie', 'Vendeur', 'Agriculteur'].includes(baseType)) {
      if (!values.region || !values.department || !values.commune) return 'Hiérarchie géographique incomplète';
    }
    if (baseType === 'Banque' && !values.bank_name) return 'Banque requise';
    if (baseType === 'Notaire' && !values.notaire_speciality) return 'Spécialité requise';
    return null;
  };

  const reset = () => {
    setEmail(''); 
    setBaseType('Mairie'); 
    setValues({}); 
    setAutoVerify(true); 
    setInvitation(false); 
    setSendingInvite(false);
  };

  const handleCreate = async () => {
    const err = validate();
    if (err) { 
      toast({ variant: 'destructive', title: 'Validation', description: err }); 
      return; 
    }
    setLoading(true);
    try {
      const now = new Date().toISOString();
      const slug = slugify(values.full_name || values.bank_name || values.study_name || baseType) + '-' + Math.random().toString(36).substring(2, 8);
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
      try { 
        await SupabaseDataService.assignRole(created.id, baseType.toLowerCase()); 
      } catch (e) {
        console.warn("Erreur d'attribution de rôle RBAC:", e);
      }
      
      // Institution profile for institution types
      if (['Mairie', 'Banque', 'Notaire', 'Agent Immobilier', 'Géomètre', 'Avocat', 'Expert Immobilier'].includes(baseType)) {
        await SupabaseDataService.createInstitutionProfile({
          user_id: created.id,
          type: baseType,
          slug,
          region: values.region || null,
          department: values.department || null,
          commune: values.commune || null,
          bank_name: values.bank_name || null,
          notaire_speciality: values.notaire_speciality || null,
          professionnel_type: values.professionnel_type || null,
          created_at: now,
          updated_at: now
        });
      }
      
      if (invitation) {
        setSendingInvite(true);
        await SupabaseDataService.sendAuthInvitation(userPayload.email, 'user');
      }
      
      // Event logging (best-effort)
      SupabaseDataService.logEvent({ 
        entityType: 'user', 
        entityId: created.id, 
        eventType: 'user.created_exceptional', 
        actorUserId: null, 
        source: 'admin_ui', 
        importance: 1, 
        data: { 
          type: baseType, 
          slug 
        } 
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
    const common = { 
      id: field.key, 
      value: values[field.key] || '', 
      onChange: e => handleChange(field.key, e.target.value),
      className: "w-full"
    };
    
    switch(field.type) {
      case 'text':
      case 'number':
        return <Input type={field.type} {...common} placeholder={field.placeholder || ''} />;
      
      case 'checkbox':
        return (
          <input 
            type="checkbox" 
            checked={!!values[field.key]} 
            onChange={e => handleChange(field.key, e.target.checked)} 
          />
        );
      
      case 'select-region':
        return (
          <select 
            className="w-full border rounded h-9 px-2 text-sm" 
            value={values.region || ''} 
            onChange={e => {
              handleChange('region', e.target.value); 
              handleChange('department', ''); 
              handleChange('commune', '');
            }}
          >
            <option value="">--Sélectionner--</option>
            {regionOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        );
      
      case 'select-department':
        return (
          <select 
            className="w-full border rounded h-9 px-2 text-sm" 
            value={values.department || ''} 
            disabled={!values.region} 
            onChange={e => {
              handleChange('department', e.target.value); 
              handleChange('commune', '');
            }}
          >
            <option value="">--Sélectionner--</option>
            {departmentOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        );
      
      case 'select-commune':
        return (
          <select 
            className="w-full border rounded h-9 px-2 text-sm" 
            value={values.commune || ''} 
            disabled={!values.department} 
            onChange={e => handleChange('commune', e.target.value)}
          >
            <option value="">--Sélectionner--</option>
            {communeOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        );
      
      case 'select-bank':
        return (
          <select 
            className="w-full border rounded h-9 px-2 text-sm" 
            value={values.bank_name || ''} 
            onChange={e => handleChange('bank_name', e.target.value)}
          >
            <option value="">--Sélectionner--</option>
            {bankOptions.map(b => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        );
      
      case 'select-notaire-speciality':
        return (
          <select 
            className="w-full border rounded h-9 px-2 text-sm" 
            value={values.notaire_speciality || ''} 
            onChange={e => handleChange('notaire_speciality', e.target.value)}
          >
            <option value="">--Sélectionner--</option>
            {notaireSpecOptions.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        );

      case 'select-professionnel-type':
        return (
          <select 
            className="w-full border rounded h-9 px-2 text-sm" 
            value={values.professionnel_type || ''} 
            onChange={e => handleChange('professionnel_type', e.target.value)}
          >
            <option value="">--Sélectionner--</option>
            {professionnelTypeOptions.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        );
      
      case 'textarea':
        return (
          <textarea
            id={field.key}
            value={values[field.key] || ''}
            onChange={e => handleChange(field.key, e.target.value)}
            placeholder={field.placeholder || ''}
            rows={4}
            className="w-full border rounded-md p-2 text-sm"
          />
        );

      default:
        return <Input type="text" {...common} />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if(!o) reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajout exceptionnel</DialogTitle>
          <DialogDescription>
            Création rapide d'un utilisateur institutionnel ou acteur avec vérification automatique.
            {showLocalData && <div className="text-amber-600 mt-1">Utilisation des données locales (offline)</div>}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="email@exemple.com" 
              className="w-full"
            />
          </div>
          
          <div className="grid gap-2">
            <Label>Type</Label>
            <select 
              className="w-full border rounded-md h-9 px-2 text-sm" 
              value={baseType} 
              onChange={e => { 
                setBaseType(e.target.value); 
                setValues({}); 
              }}
            >
              {defaultExceptionalTypeOrder.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          
          {/* Dynamic fields */}
          {schema.length > 0 && (
            <div className="space-y-3">
              {schema.map(f => (
                <div className="grid gap-1" key={f.key}>
                  <Label htmlFor={f.key} className="flex items-center gap-2">
                    {f.label}{f.required && <span className="text-red-500">*</span>}
                  </Label>
                  {renderField(f)}
                  {f.description && <p className="text-xs text-muted-foreground">{f.description}</p>}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-2 mt-4">
            <input 
              id="autoVerify" 
              type="checkbox" 
              checked={autoVerify} 
              onChange={e => setAutoVerify(e.target.checked)} 
            />
            <Label htmlFor="autoVerify" className="text-sm cursor-pointer">
              Auto-vérifier (bypasse la confirmation par email)
            </Label>
          </div>
          
          <div className="flex items-center gap-2">
            <input 
              id="invitation" 
              type="checkbox" 
              checked={invitation} 
              onChange={e => setInvitation(e.target.checked)} 
            />
            <Label htmlFor="invitation" className="text-sm cursor-pointer">
              Envoyer invitation par email
            </Label>
          </div>
          
          <div className="border-t pt-3 mt-4">
            <p className="text-xs text-muted-foreground">
              Validation dynamique selon le type d'utilisateur sélectionné. Un profil d'institution sera créé si nécessaire.
              {!showLocalData ? 
                " Les données sont chargées depuis Supabase." : 
                " Les données sont chargées depuis le fichier local (fallback)."}
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="min-w-[100px]"
          >
            Annuler
          </Button>
          <Button 
            disabled={loading || sendingInvite} 
            onClick={handleCreate} 
            className="bg-green-600 hover:bg-green-700 min-w-[100px]"
          >
            {loading ? 'Création...' : sendingInvite ? 'Envoi...' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
