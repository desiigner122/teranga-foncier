import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Landmark, Send, UploadCloud } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const MunicipalLandRequestPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    mairie: '',
    purpose: '',
    areaSought: '',
    message: '',
  });
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour soumettre une demande.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Municipal Land Request Submitted: { ...formData, files: files.map(f => f.name) }

    toast({
      title: "Demande Envoyée (Simulation)",
      description: `Votre demande a bien été transmise à la Mairie de ${formData.mairie}.`,
      className: "bg-green-500 text-white",
    });

    navigate('/my-requests');
  };

  const mairies = ['Saly', 'Dakar', 'Thiès', 'Diamniadio', 'Ziguinchor', 'Saint-Louis'];
  const purposes = ['Habitat Social', 'Habitat Résidentiel', 'Projet Commercial', 'Projet Agricole'];

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
            Soumettez votre demande d'acquisition d'une parcelle auprès d'une mairie partenaire.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="mairie">Mairie Concernée</Label>
                <Select name="mairie" onValueChange={(value) => handleSelectChange('mairie', value)} value={formData.mairie} required>
                  <SelectTrigger id="mairie" className="w-full h-11">
                    <SelectValue placeholder="Sélectionnez une mairie" />
                  </SelectTrigger>
                  <SelectContent>
                    {mairies.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="purpose">Objet de la Demande</Label>
                <Select name="purpose" onValueChange={(value) => handleSelectChange('purpose', value)} value={formData.purpose} required>
                  <SelectTrigger id="purpose" className="w-full h-11">
                    <SelectValue placeholder="Sélectionnez l'objet" />
                  </SelectTrigger>
                  <SelectContent>
                    {purposes.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="areaSought">Superficie Recherchée (m²)</Label>
              <Input id="areaSought" name="areaSought" type="number" placeholder="Ex: 300" value={formData.areaSought} onChange={handleInputChange} required className="h-11" />
            </div>

            <div>
              <Label htmlFor="message">Message de Motivation</Label>
              <Textarea id="message" name="message" placeholder="Expliquez votre projet et votre motivation pour cette demande..." value={formData.message} onChange={handleInputChange} rows={5} required />
            </div>

            <div>
              <Label htmlFor="documents">Pièces Jointes (Dossier de demande)</Label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors border-border">
                <div className="space-y-1 text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="flex text-sm text-muted-foreground">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80">
                      <span>Téléchargez vos fichiers</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} />
                    </label>
                    <p className="pl-1">ou glissez-déposez</p>
                  </div>
                  <p className="text-xs text-muted-foreground">PDF, JPG, PNG (Max. 5MB par fichier)</p>
                  {files.length > 0 && (
                    <ul className="mt-2 text-xs text-foreground list-disc list-inside">
                      {files.map(file => <li key={file.name}>{file.name}</li>)}
                    </ul>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Joindre : Pièce d'identité, justificatif de domicile, plan de financement (si disponible).</p>
            </div>

            <p className="text-xs text-muted-foreground">
              En soumettant, vous acceptez que vos données soient transmises à la mairie sélectionnée et traitées conformément à notre <Link to="/privacy" className="underline hover:text-primary">politique de confidentialité</Link>.
            </p>

            <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-primary to-green-600 hover:opacity-90 text-white text-base" disabled={isSubmitting}>
              {isSubmitting ? 'Envoi en cours...' : <><Send className="mr-2 h-5 w-5" /> Envoyer ma Demande</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MunicipalLandRequestPage;