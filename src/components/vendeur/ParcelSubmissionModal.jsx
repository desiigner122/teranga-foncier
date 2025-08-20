import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { SupabaseDataService } from '@/services/supabaseDataService';
import { supabase } from '@/lib/supabaseClient';

/**
 * ParcelSubmissionModal
 * Permet à un vendeur de soumettre une nouvelle parcelle pour validation (anti-fraude) avant publication.
 * Props:
 *  - isOpen
 *  - onClose
 *  - owner (user object)
 *  - onSubmitted(newSubmission)
 */
const REQUIRED_DOCS = [
  { key: 'titre_foncier', label: 'Titre foncier (scan)' },
  { key: 'plan_cadastral', label: 'Plan cadastral' },
  { key: 'certificat_situation', label: 'Certificat de situation' }
];

const ParcelSubmissionModal = ({ isOpen, onClose, owner, onSubmitted }) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    reference: '',
    location: '',
    type: 'terrain',
    surface: '',
    price: '',
    description: ''
  });
  const [documents, setDocuments] = useState([]); // {key,name,file}
  const [errors, setErrors] = useState({});
  const refreshTimerRef = useRef(null);
  const [docsMetaState, setDocsMetaState] = useState([]); // keep latest signed URLs

  // Renew signed URLs every 45 minutes if modal stays open step 2
  useEffect(()=>{
    if (isOpen && step===2 && docsMetaState.length>0) {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = setTimeout(async ()=>{
        try {
          const bucket='parcel-docs';
          const renewed=[];
          for (const d of docsMetaState) {
            if (!d.path) { renewed.push(d); continue; }
            const { data, error } = await supabase.storage.from(bucket).createSignedUrl(d.path, 3600);
            renewed.push({ ...d, url: error? d.url : data.signedUrl });
          }
          setDocsMetaState(renewed);
        } catch(e){/* silent */}
      }, 45*60*1000);
    }
    return ()=> { if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current); };
  }, [isOpen, step, docsMetaState]);

  const attachDoc = (key, file) => {
    setDocuments(prev => {
      const others = prev.filter(d => d.key !== key);
      return [...others, { key, name: file.name, file }];
    });
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.reference.trim()) e.reference = 'Référence requise';
    if (!form.location.trim()) e.location = 'Localisation requise';
    if (!form.surface) e.surface = 'Surface requise';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const allRequiredDocsProvided = REQUIRED_DOCS.every(req => documents.some(d => d.key === req.key));

  const handleSubmit = async () => {
    if (!allRequiredDocsProvided) {
      toast({ variant:'destructive', title:'Documents requis', description:'Merci de fournir tous les documents obligatoires.' });
      return;
    }
    setSubmitting(true);
    try {
      // Upload docs to storage bucket 'parcel-docs'
      const bucket = 'parcel-docs';
      const docsMeta = [];
      for (const doc of documents) {
        const file = doc.file;
        // Compute hash (SHA-256) for integrity (optional if browser supports SubtleCrypto)
        let hash = null;
        try { hash = await SupabaseDataService.computeDocumentHash(file); } catch {/* ignore */}
        const ext = file.name.split('.').pop();
        const safeRef = (form.reference || 'ref').replace(/[^a-zA-Z0-9_-]/g,'_');
        const path = `${owner?.id || 'unknown'}/${safeRef}/${doc.key}-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
        if (upErr) throw new Error(`Upload échoué (${doc.key}): ${upErr.message}`);
        const { data: signed, error: signErr } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
        if (signErr) throw new Error(`Signature URL échouée (${doc.key}): ${signErr.message}`);
        const meta = { key: doc.key, name: doc.name, url: signed.signedUrl, path, verified: false, hash };
        docsMeta.push(meta);
      }
      setDocsMetaState(docsMeta);
      const submission = await SupabaseDataService.createParcelSubmission({
        ownerId: owner?.id,
        reference: form.reference.trim(),
        location: form.location.trim(),
        type: form.type,
        price: form.price? Number(form.price): null,
        surface: form.surface? Number(form.surface): null,
        description: form.description?.trim() || null,
        documents: docsMeta
      });
      toast({ title:'Soumission envoyée', description:`Référence ${submission.reference}` });
      onSubmitted?.(submission);
      onClose();
      setStep(1); setForm({ reference:'', location:'', type:'terrain', surface:'', price:'', description:'' }); setDocuments([]);
    } catch (e) {
      console.error(e);
      toast({ variant:'destructive', title:'Erreur', description:'Impossible de soumettre la parcelle' });
    } finally { setSubmitting(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={o=> !submitting && !o ? onClose() : null}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Soumission de Parcelle</DialogTitle>
          <DialogDescription>
            Étape {step} sur 2. Les documents sont requis pour validation anti-fraude.
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Référence *</Label>
                <Input value={form.reference} onChange={e=>setForm(f=>({...f, reference:e.target.value}))} />
                {errors.reference && <p className="text-xs text-red-600 mt-1">{errors.reference}</p>}
              </div>
              <div>
                <Label>Localisation *</Label>
                <Input value={form.location} onChange={e=>setForm(f=>({...f, location:e.target.value}))} />
                {errors.location && <p className="text-xs text-red-600 mt-1">{errors.location}</p>}
              </div>
              <div>
                <Label>Surface (m²) *</Label>
                <Input type="number" value={form.surface} onChange={e=>setForm(f=>({...f, surface:e.target.value}))} />
                {errors.surface && <p className="text-xs text-red-600 mt-1">{errors.surface}</p>}
              </div>
              <div>
                <Label>Prix (XOF)</Label>
                <Input type="number" value={form.price} onChange={e=>setForm(f=>({...f, price:e.target.value}))} />
              </div>
              <div className="md:col-span-2">
                <Label>Description</Label>
                <Textarea rows={3} value={form.description} onChange={e=>setForm(f=>({...f, description:e.target.value}))} />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">Téléversez les documents requis (images / PDF). Des URL signées temporaires sont générées (1h) puis renouvelées automatiquement.</p>
            <div className="space-y-3">
              {REQUIRED_DOCS.map(req => {
                const existing = documents.find(d=>d.key===req.key);
                return (
                  <div key={req.key} className="flex items-center justify-between border rounded px-3 py-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{req.label}</span>
                      <span className="text-xs text-muted-foreground">{existing? existing.name : 'Aucun fichier'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {existing ? <Badge className="bg-green-100 text-green-800">OK</Badge> : <Badge variant="outline">Manquant</Badge>}
                      <label className="cursor-pointer text-sm font-medium text-blue-600 hover:underline">
                        <input type="file" className="hidden" onChange={e=> e.target.files?.[0] && attachDoc(req.key, e.target.files[0])} />
                        {existing? 'Remplacer':'Uploader'}
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="pt-2 text-sm">
              {allRequiredDocsProvided ? (
                <div className="flex items-center text-green-600 gap-2"><CheckCircle2 className="h-4 w-4" /> Tous les documents requis sont présents.</div>
              ) : (
                <div className="flex items-center text-red-600 gap-2"><XCircle className="h-4 w-4" /> Documents manquants.</div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <div>
            {step===2 && (
              <Button variant="outline" disabled={submitting} onClick={()=>setStep(1)}>Précédent</Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={submitting} onClick={()=>!submitting && onClose()}>Annuler</Button>
            {step===1 && (
              <Button onClick={()=> validateStep1() && setStep(2)}>Suivant</Button>
            )}
            {step===2 && (
              <Button disabled={submitting || !allRequiredDocsProvided} onClick={handleSubmit}>
                {submitting? 'Soumission...' : 'Soumettre'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ParcelSubmissionModal;
