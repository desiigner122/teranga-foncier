import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { UploadCloud, MapPin, DollarSign, FileText, Send, User, Phone, Mail, Award, Check, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SupabaseDataService } from '@/services/supabaseDataService';

const SellPropertyPage = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    propertyType: '',
    location: '',
    surfaceArea: '',
    price: '',
    titleDeedNumber: '',
    description: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
  });
  const [files, setFiles] = useState([]);
  const [checkedDocs, setCheckedDocs] = useState({});
  const [reference, setReference] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  // Liste des documents requis / recommandés pour anti-fraude
  const requiredDocs = useMemo(()=>[
    { key:'identity', label:"Pièce d'identité (CNI ou Passeport)", required:true },
    { key:'title', label:"Titre Foncier / Bail / Délibération", required:true },
    { key:'plan', label:"Plan cadastral ou plan de masse", required:true },
    { key:'urbanism', label:"Certificat d'urbanisme (si disponible)", required:false },
    { key:'fiscal', label:"Quitus fiscal / Attestation fiscale", required:false },
    { key:'litigation', label:"Attestation d'absence de litige / mainlevée hypothèque", required:false },
  ],[]);

  const toggleDoc = (key) => {
    setCheckedDocs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const mandatoryComplete = requiredDocs.filter(d=>d.required).every(d=>checkedDocs[d.key]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const docsMeta = files.map(f=>({ name:f.name, size:f.size, type:f.type }));
      const res = await SupabaseDataService.logListingSubmission({
        userId: null, // TODO: inject current user id via auth context
        propertyType: formData.propertyType,
        surfaceArea: formData.surfaceArea,
        price: formData.price,
        description: formData.description,
        titleDeedNumber: formData.titleDeedNumber,
        documentsMeta: docsMeta,
        allRequiredProvided: mandatoryComplete
      });
      setReference(res.reference);
      toast({
        title: mandatoryComplete ? 'Soumission complète' : 'Soumission partielle',
        description: mandatoryComplete ? "Tous les documents essentiels sont fournis. Accélération de la vérification." : "Annonce reçue. Fournissez les documents manquants pour obtenir le badge de confiance.",
        className: mandatoryComplete ? 'bg-green-600 text-white' : 'bg-amber-500 text-white'
      });
      nextStep();
    } catch (err) {
      console.error(err);
      toast({ title:'Erreur', description:"La soumission a échoué. Réessayez.", variant:'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h3 className="text-xl font-semibold text-center">Étape 1: Informations sur le Terrain</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="propertyType">Type de Bien</Label>
                <Select name="propertyType" onValueChange={(value) => handleSelectChange('propertyType', value)} value={formData.propertyType}>
                  <SelectTrigger id="propertyType" className="w-full h-11"><SelectValue placeholder="Sélectionnez..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="terrain_nu_tf">Terrain Nu (Titre Foncier)</SelectItem>
                    <SelectItem value="terrain_bail">Terrain (Bail)</SelectItem>
                    <SelectItem value="terrain_deliberation">Terrain (Délibération)</SelectItem>
                    <SelectItem value="propriete_batie">Propriété Bâtie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Localisation</Label>
                <Input id="location" name="location" placeholder="Ex: Dakar, Almadies" value={formData.location} onChange={handleInputChange} required className="h-11" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="surfaceArea">Superficie (m²)</Label>
                <Input id="surfaceArea" name="surfaceArea" type="number" placeholder="Ex: 300" value={formData.surfaceArea} onChange={handleInputChange} required className="h-11" />
              </div>
              <div>
                <Label htmlFor="price">Prix Demandé (FCFA)</Label>
                <Input id="price" name="price" type="number" placeholder="Ex: 50000000" value={formData.price} onChange={handleInputChange} required className="h-11" />
              </div>
            </div>
            <Button onClick={nextStep} className="w-full" size="lg">Suivant</Button>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
             <h3 className="text-xl font-semibold text-center">Étape 2: Documents & Description</h3>
             <div>
               <Label htmlFor="titleDeedNumber">Numéro du Titre (TF, Bail, etc.)</Label>
               <Input id="titleDeedNumber" name="titleDeedNumber" placeholder="Ex: TF 1234/DG" value={formData.titleDeedNumber} onChange={handleInputChange} className="h-11" />
             </div>
             <div>
               <Label htmlFor="description">Description Détaillée</Label>
               <Textarea id="description" name="description" placeholder="Atouts, environnement, situation..." value={formData.description} onChange={handleInputChange} rows={3} />
             </div>
             <div className="border rounded-lg p-4 bg-muted/30">
               <p className="font-semibold mb-2 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary"/> Vérification Anti-Fraude</p>
               <p className="text-xs text-muted-foreground mb-3">Cochez les documents que vous êtes prêt à fournir. Les éléments obligatoires sont marqués (*).</p>
               <ul className="space-y-2 text-sm">
                 {requiredDocs.map(doc => (
                   <li key={doc.key} className="flex items-start gap-2">
                     <input type="checkbox" id={`doc-${doc.key}`} checked={!!checkedDocs[doc.key]} onChange={()=>toggleDoc(doc.key)} className="mt-1" />
                     <label htmlFor={`doc-${doc.key}`} className="cursor-pointer select-none">
                       {doc.label}{doc.required && <span className="text-red-500"> *</span>}
                     </label>
                   </li>
                 ))}
               </ul>
               <div className="mt-3 text-xs">
                 {mandatoryComplete ? (
                   <span className="text-green-600 flex items-center gap-1"><Check className="h-4 w-4"/> Pré-requis essentiels complets – Badge éligible.</span>
                 ) : (
                   <span className="text-amber-600 flex items-center gap-1"><AlertTriangle className="h-4 w-4"/> Documents essentiels manquants – la vérification sera plus lente.</span>
                 )}
               </div>
             </div>
             <div className="flex gap-4">
               <Button onClick={prevStep} variant="outline" className="w-full" size="lg">Précédent</Button>
               <Button onClick={nextStep} className="w-full" size="lg">Suivant</Button>
             </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h3 className="text-xl font-semibold text-center">Étape 3: Vos Coordonnées</h3>
            <div>
              <Label htmlFor="contactName">Nom Complet</Label>
              <Input id="contactName" name="contactName" placeholder="Prénom Nom" value={formData.contactName} onChange={handleInputChange} required className="h-11" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="contactPhone">Téléphone</Label>
                <Input id="contactPhone" name="contactPhone" type="tel" placeholder="+221 77 123 45 67" value={formData.contactPhone} onChange={handleInputChange} required className="h-11" />
              </div>
              <div>
                <Label htmlFor="contactEmail">Email</Label>
                <Input id="contactEmail" name="contactEmail" type="email" placeholder="nom@exemple.com" value={formData.contactEmail} onChange={handleInputChange} required className="h-11" />
              </div>
            </div>
            <div className="flex gap-4">
              <Button onClick={prevStep} variant="outline" className="w-full" size="lg">Précédent</Button>
              <Button onClick={nextStep} className="w-full" size="lg">Suivant</Button>
            </div>
          </motion.div>
        );
      case 4:
         return (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
             <h3 className="text-xl font-semibold text-center">Étape 4: Téléversement de Documents</h3>
              <div>
               <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors border-border">
                <div className="space-y-1 text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="flex text-sm text-muted-foreground">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80">
                      <span>Cliquez pour choisir</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} />
                    </label>
                  </div>
                   <p className="text-xs text-muted-foreground">Pièce d'identité, Titre de propriété, Plan, etc.</p>
                  {files.length > 0 && (
                    <ul className="mt-2 text-xs text-green-600 list-none">
                      {files.map(file => <li key={file.name}>{file.name} ({ (file.size / 1024).toFixed(1) } KB)</li>)}
                    </ul>
                  )}
                 </div>
               </div>
               <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                    <h4 className="font-semibold text-primary flex items-center"><Award className="mr-2 h-5 w-5"/>Obtenez le Badge "Vendeur de Confiance"</h4>
                    <p className="text-xs text-primary/80 mt-1">En fournissant des documents clairs, vous accélérez la vérification et obtenez un badge qui rassure les acheteurs et augmente la visibilité de votre annonce.</p>
               </div>
             </div>
             <div className="flex gap-4">
                <Button onClick={prevStep} variant="outline" className="w-full" size="lg">Précédent</Button>
                <Button onClick={handleSubmit} className="w-full" size="lg" disabled={isSubmitting}>
                   {isSubmitting ? 'Soumission...' : 'Soumettre ma Proposition'}
                </Button>
             </div>
          </motion.div>
         );
  case 5:
        return (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
                <Check className="mx-auto h-16 w-16 text-green-500 bg-green-100 rounded-full p-2" />
                <h3 className="text-2xl font-bold">Proposition Envoyée !</h3>
        <p className="text-muted-foreground">Merci pour votre confiance. {reference && (<><br/>Référence: <span className="font-mono font-semibold">{reference}</span></>)}<br/>{mandatoryComplete ? 'Votre dossier complet sera priorisé.' : 'Ajoutez les documents manquants pour accélérer la vérification.'}</p>
                <div className="flex justify-center gap-4 pt-4">
                    <Button asChild variant="outline"><Link to="/my-listings">Voir Mes Annonces</Link></Button>
                    <Button asChild><Link to="/">Retour à l'Accueil</Link></Button>
                </div>
            </motion.div>
        );
      default:
        return null;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto py-8 px-4 md:py-12 max-w-3xl"
    >
      <Card className="shadow-xl border-border/50 bg-card">
        <CardHeader className="text-center pb-4">
          <FileText className="h-12 w-12 mx-auto mb-3 text-primary" />
          <CardTitle className="text-3xl font-bold">Vendez Votre Terrain en 5 Étapes</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">Un processus simple et guidé pour une vente sécurisée.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-muted rounded-full h-2.5 mb-6">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${(step / 5) * 100}%`, transition: 'width 0.5s ease-in-out' }}></div>
          </div>
          {renderStep()}
        </CardContent>
         <CardFooter className="text-sm text-muted-foreground text-center flex-col gap-2 pt-6">
             <p className="text-xs">
              En soumettant, vous acceptez nos <Link to="/legal" className="underline">Termes</Link> et notre <Link to="/privacy" className="underline">Politique de Confidentialité</Link>.
            </p>
            <p>Pour toute question, <Link to="/contact" className="underline hover:text-primary">contactez-nous</Link>.</p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default SellPropertyPage;
