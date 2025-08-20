import React, { useState, useEffect, useMemo } from 'react';
import { useRealtimeTable, useRealtimeUsers, useRealtimeParcels, useRealtimeParcelSubmissions } from '@/hooks/useRealtimeTable';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Landmark, Send, UploadCloud, CheckCircle2, ArrowLeft, ArrowRight, FileText, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { SupabaseDataService } from '@/services/supabaseDataService';

const MunicipalLandRequestPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [step, setStep] = useState(1); // 1: localisation, 2: details, 3: documents, 4: révision
  const [formData, setFormData] = useState({
    region: '',
    department: '',
    commune: '',
    requestType: '',
    areaSqm: '',
    message: ''
  });
  const [files, setFiles] = useState([]); // File objects
  const [filesMeta, setFilesMeta] = useState([]); // { name, size, type }
  const [fileErrors, setFileErrors] = useState([]); // { name, error }
  const [progress, setProgress] = useState(0); // 0-100
  const [uploading, setUploading] = useState(false);
  const [mairieResolvedId, setMairieResolvedId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [regions, setRegions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);

  // Load regions once
  useEffect(()=>{
    let active = true;
    (async()=>{
      setGeoLoading(true); setGeoError(null);
      try {
        const regs = await SupabaseDataService.listRegions();
        if (active) setRegions(regs.map(r=> r.name || r.code || r.id));
      } catch (e){ if (active) setGeoError('Erreur chargement régions'); }
      finally { if (active) setGeoLoading(false); }
    })();
    return ()=>{ active=false; };
  }, []);

  // When region changes, load departments
  useEffect(()=>{
    let active = true;
    if (!formData.region){ setDepartments([]); return; }
    (async()=>{
      try {
        const regs = await SupabaseDataService.listRegions();
        const match = regs.find(r=> (r.name===formData.region || r.code===formData.region));
        if (!match){ setDepartments([]); return; }
        const deps = await SupabaseDataService.listDepartmentsByRegion(match.id);
        if (active) setDepartments(deps.map(d=> d.name));
      } catch (e){ if (active) setDepartments([]); }
    })();
    return ()=>{ active=false; };
  }, [formData.region]);

  // When department changes, load communes
  useEffect(()=>{
    let active = true;
    if (!formData.department){ setCommunes([]); return; }
    (async()=>{
      try {
        const regs = await SupabaseDataService.listRegions();
        const regMatch = regs.find(r=> (r.name===formData.region || r.code===formData.region));
        if (!regMatch){ setCommunes([]); return; }
        const deps = await SupabaseDataService.listDepartmentsByRegion(regMatch.id);
        const depMatch = deps.find(d=> d.name===formData.department || d.code===formData.department);
        if (!depMatch){ setCommunes([]); return; }
        const cms = await SupabaseDataService.listCommunesByDepartment(depMatch.id);
        if (active) setCommunes(cms.map(c=> c.name));
      } catch (e){ if (active) setCommunes([]); }
    })();
    return ()=>{ active=false; };
  }, [formData.region, formData.department]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => {
      // Reset cascade when higher level changes
      if (name === 'region') return { ...prev, region:value, department:'', commune:'' };
      if (name === 'department') return { ...prev, department:value, commune:'' };
      return { ...prev, [name]: value };
    });
  };

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ACCEPTED_TYPES = ['application/pdf','image/jpeg','image/png'];

  const handleFileChange = (e) => {
    const list = Array.from(e.target.files || []);
    const accepted = [];
    const meta = [];
    const errors = [];
    list.forEach(f=>{
      if (f.size > MAX_FILE_SIZE) {
        errors.push({ name:f.name, error:'Fichier > 5MB' });
        return;
      }
      if (!ACCEPTED_TYPES.includes(f.type)) {
        errors.push({ name:f.name, error:'Type non autorisé (PDF, JPG, PNG)' });
        return;
      }
      accepted.push(f);
      meta.push({ name:f.name, size:f.size, type:f.type });
    });
    setFiles(accepted);
    setFilesMeta(meta);
    setFileErrors(errors);
  };

  const removeFile = (name) => {
    const idx = files.findIndex(f=>f.name===name);
    if (idx !== -1) {
      const newFiles = [...files]; newFiles.splice(idx,1);
      setFiles(newFiles);
      setFilesMeta(newFiles.map(f=>({ name:f.name, size:f.size, type:f.type })));
    }
  };

  const requestTypes = ['Permis de construire', 'Certificat d\'urbanisme', 'Demande d\'acquisition', 'Autorisation d\'occupation', 'Projet Agricole'];

  const canProceedStep1 = formData.region && formData.department && formData.commune;
  const canProceedStep2 = formData.requestType && formData.areaSqm && Number(formData.areaSqm) > 0 && formData.message.length >= 20;
  const canProceedStep3 = files.length > 0; // At least one document

  const goNext = () => setStep(s => Math.min(4, s+1));
  const goPrev = () => setStep(s => Math.max(1, s-1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({ title:'Connexion requise', description:'Connectez-vous pour soumettre une demande.', variant:'destructive' });
      navigate('/login');
      return;
    }
    setIsSubmitting(true);
    try {
      // Upload des fichiers un par un (simple séquentiel pour MVP)
      setUploading(true); setProgress(0);
      // Upload parallèle avec suivi simple (incrémente sur chaque résolution)
      let completed = 0; const total = files.length || 1;
      const uploadedDocIds = [];
      await Promise.allSettled(files.map(async f => {
        try {
          const doc = await SupabaseDataService.uploadDocument(user.id, f);
          if (doc?.id) uploadedDocIds.push(doc.id);
        } catch (err) {
          console.warn('Echec upload fichier', f.name, err.message||err);
        } finally {
          completed +=1; setProgress(Math.round((completed/total)*100));
        }
      }));
      setUploading(false); setProgress(100);
      const created = await SupabaseDataService.createMunicipalRequest({
        requesterId: user.id,
        region: formData.region,
        department: formData.department,
        commune: formData.commune,
        requestType: formData.requestType,
        areaSqm: Number(formData.areaSqm),
        message: formData.message,
        documentIds: uploadedDocIds,
        rawDocumentsMeta: filesMeta,
        mairieId: null,
        autoResolveMairie: true
      });
      setMairieResolvedId(created.mairie_id || null);
      toast({ title:'Demande soumise', description:`Référence ${created.reference}`, className:'bg-green-600 text-white' });
      navigate('/my-requests');
    } catch (err) {
      console.error(err);
      toast({ title:'Erreur', description:'Impossible de créer la demande. Réessayez.', variant:'destructive' });
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8 px-4 md:py-12 max-w-3xl"
    >
      <Card className="shadow-xl border-border/50 bg-card">
        <CardHeader className="text-center">
          <Landmark className="h-12 w-12 mx-auto mb-3 text-primary" />
          <CardTitle className="text-3xl font-bold text-foreground">Demande de Terrain Communal</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Sélectionnez la localisation, précisez votre projet et joignez vos pièces justificatives.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Progression */}
            <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide">
              {[1,2,3,4].map(s => (
                <div key={s} className={`flex-1 flex items-center ${s!==4 ? 'mr-2' : ''}`}>
                  <div className={`flex items-center justify-center h-8 w-8 rounded-full text-white text-sm font-bold ${step>=s ? 'bg-primary' : 'bg-muted-foreground/40'}`}>{step> s ? <CheckCircle2 className="h-5 w-5" /> : s}</div>
                  {s!==4 && <div className={`flex-1 h-1 ${step> s ? 'bg-primary' : 'bg-muted-foreground/20'} rounded`} />}
                </div>
              ))}
            </div>

            {/* Étape 1: Localisation */}
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Localisation</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label>Région</Label>
                    <Select value={formData.region} onValueChange={v=>handleSelectChange('region', v)}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Choisir" /></SelectTrigger>
                      <SelectContent>{regions.map(r=><SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Département</Label>
                    <Select value={formData.department} onValueChange={v=>handleSelectChange('department', v)} disabled={!formData.region}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Choisir" /></SelectTrigger>
                      <SelectContent>{departments.map(d=><SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Commune</Label>
                    <Select value={formData.commune} onValueChange={v=>handleSelectChange('commune', v)} disabled={!formData.department}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Choisir" /></SelectTrigger>
                      <SelectContent>{communes.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="button" onClick={goNext} disabled={!canProceedStep1}>Continuer <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>
              </div>
            )}

            {/* Étape 2: Détails */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Détails de la Demande</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Type de demande</Label>
                    <Select value={formData.requestType} onValueChange={v=>handleSelectChange('requestType', v)}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                      <SelectContent>{requestTypes.map(rt=> <SelectItem key={rt} value={rt}>{rt}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Superficie souhaitée (m²)</Label>
                    <Input type="number" name="areaSqm" value={formData.areaSqm} onChange={handleInputChange} placeholder="Ex: 300" className="h-11" />
                  </div>
                </div>
                <div>
                  <Label>Motivation / Description du projet</Label>
                  <Textarea name="message" value={formData.message} onChange={handleInputChange} rows={6} placeholder="Expliquez votre projet, l'usage prévu, l'impact économique/social..." />
                  <p className="text-xs text-muted-foreground mt-1">Minimum 20 caractères.</p>
                </div>
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={goPrev}><ArrowLeft className="mr-2 h-4 w-4" /> Retour</Button>
                  <Button type="button" onClick={goNext} disabled={!canProceedStep2}>Continuer <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>
              </div>
            )}

            {/* Étape 3: Documents */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold flex items-center gap-2"><UploadCloud className="h-5 w-5 text-primary" /> Pièces Jointes</h3>
                <p className="text-sm text-muted-foreground">Ajoutez les documents requis (PDF, JPG, PNG, max 5MB). Recommandé: Pièce identité, justificatif domicile, plan sommaire, financement.</p>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors border-border">
                  <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="flex text-sm text-muted-foreground">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80">
                        <span>Sélectionnez des fichiers</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} />
                      </label>
                      <p className="pl-1">ou glissez-déposez</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Max 5MB / fichier</p>
                    {fileErrors.length > 0 && (
                      <ul className="mt-3 text-xs text-red-500 text-left">
                        {fileErrors.map(e=> <li key={e.name}>{e.name}: {e.error}</li>)}
                      </ul>
                    )}
                    {files.length > 0 && (
                      <ul className="mt-3 text-xs text-foreground text-left max-h-40 overflow-auto space-y-1">
                        {files.map(f => (
                          <li key={f.name} className="flex justify-between items-center gap-2 bg-muted/40 px-2 py-1 rounded">
                            <span className="truncate" title={f.name}>{f.name}</span>
                            <span className="text-[10px] text-muted-foreground">{(f.size/1024).toFixed(1)} KB</span>
                            <button type="button" onClick={()=>removeFile(f.name)} className="text-red-600 text-[10px] font-semibold">Retirer</button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                {uploading && (
                  <div className="w-full bg-muted rounded h-2 overflow-hidden">
                    <div className="h-2 bg-primary transition-all" style={{ width: `${progress}%`}}></div>
                  </div>
                )}
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={goPrev}><ArrowLeft className="mr-2 h-4 w-4" /> Retour</Button>
                  <Button type="button" onClick={goNext} disabled={!canProceedStep3}>Continuer <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>
              </div>
            )}

            {/* Étape 4: Révision & Soumission */}
            {step === 4 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary" /> Vérification Finale</h3>
                <div className="bg-muted/40 rounded-md p-4 space-y-3 text-sm">
                  <div><strong>Localisation:</strong> {formData.commune}, {formData.department}, {formData.region}</div>
                  <div><strong>Type de demande:</strong> {formData.requestType}</div>
                  <div><strong>Superficie demandée:</strong> {formData.areaSqm} m²</div>
                  <div><strong>Motivation:</strong> {formData.message.slice(0, 200)}{formData.message.length>200 && '...'}</div>
                  <div><strong>Documents:</strong> {files.length} fichier(s) {files.length>0 && `(${files.map(f=>f.name).join(', ')})`}</div>
                </div>
                <p className="text-xs text-muted-foreground">En soumettant, vous acceptez le partage de ces informations avec la mairie concernée selon notre <Link to="/privacy" className="underline">politique de confidentialité</Link>.</p>
                {mairieResolvedId === null && isSubmitting && (
                  <div className="text-xs text-muted-foreground flex items-center gap-2"><Info className="h-4 w-4"/> Résolution de la mairie associée en cours...</div>
                )}
                <div className="flex justify-between items-center">
                  <Button type="button" variant="outline" onClick={goPrev} disabled={isSubmitting}><ArrowLeft className="mr-2 h-4 w-4" /> Retour</Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-primary to-green-600 text-white">{isSubmitting ? (uploading ? 'Téléversement...' : 'Envoi...') : <><Send className="mr-2 h-5 w-5" /> Soumettre la Demande</>}</Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MunicipalLandRequestPage;
