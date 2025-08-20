import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { 
  FileText, 
  MapPin, 
  DollarSign, 
  Calendar,
  Upload,
  Info,
  Building2,
  TreePine,
  Home,
  Factory
} from 'lucide-react';
import { SupabaseDataService } from '@/services/supabaseDataService';
import { useAuth } from '@/contexts/AuthContext';

const CreateRequestPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    type: '', // 'terrain_communal' ou 'financement'
    title: '',
    description: '',
    location: '',
    surface: '',
    budget: '',
    urgency: 'normale',
    documents: [],
    // Terrain communal specific
    usage_prevu: '',
    duree_souhaitee: '',
    justification: '',
    // Financement specific
    montant_demande: '',
    objet_financement: '',
    revenus_mensuels: '',
    apport_personnel: '',
    situation_professionnelle: ''
  });

  const requestTypes = [
    {
      id: 'terrain_communal',
      title: 'Demande de Terrain Communal',
      description: 'Demander l\'attribution d\'un terrain communal pour usage personnel ou professionnel',
      icon: TreePine,
      color: 'bg-green-500'
    },
    {
      id: 'financement',
      title: 'Demande de Financement',
      description: 'Demander un financement pour votre projet immobilier ou foncier',
      icon: DollarSign,
      color: 'bg-blue-500'
    }
  ];

  const usageOptions = [
    { value: 'habitation', label: 'Construction d\'habitation' },
    { value: 'agriculture', label: 'Usage agricole' },
    { value: 'commerce', label: 'Activité commerciale' },
    { value: 'industrie', label: 'Activité industrielle' },
    { value: 'autre', label: 'Autre usage' }
  ];

  const urgencyOptions = [
    { value: 'basse', label: 'Basse', color: 'text-green-600' },
    { value: 'normale', label: 'Normale', color: 'text-blue-600' },
    { value: 'haute', label: 'Haute', color: 'text-orange-600' },
    { value: 'urgente', label: 'Urgente', color: 'text-red-600' }
  ];

  const handleSubmit = async () => {
    if (!formData.type || !formData.title || !formData.description) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires"
      });
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        user_id: user.id,
        type: formData.type,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        status: 'en_attente',
        urgency: formData.urgency,
        data: {
          ...formData,
          created_at: new Date().toISOString()
        }
      };

      await SupabaseDataService.createRequest(requestData);
      
      toast({
        title: "Demande créée",
        description: "Votre demande a été soumise avec succès. Vous recevrez une notification dès qu'elle sera traitée."
      });

      // Reset form
      setFormData({
        type: '',
        title: '',
        description: '',
        location: '',
        surface: '',
        budget: '',
        urgency: 'normale',
        documents: [],
        usage_prevu: '',
        duree_souhaitee: '',
        justification: '',
        montant_demande: '',
        objet_financement: '',
        revenus_mensuels: '',
        apport_personnel: '',
        situation_professionnelle: ''
      });
      setStep(1);
      
    } catch (error) {
      console.error('Erreur lors de la création de la demande:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer la demande. Veuillez réessayer."
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Choisissez le type de demande</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requestTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Card 
                      key={type.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        formData.type === type.id ? 'ring-2 ring-primary border-primary' : ''
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${type.color} text-white`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{type.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {type.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Titre de la demande *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Demande de terrain pour construction maison familiale"
              />
            </div>

            <div>
              <Label htmlFor="description">Description détaillée *</Label>
              <Textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Décrivez votre projet en détail..."
              />
            </div>

            <div>
              <Label htmlFor="location">Localisation</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Adresse ou zone géographique"
              />
            </div>

            <div>
              <Label>Niveau d'urgence</Label>
              <RadioGroup 
                value={formData.urgency} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}
                className="flex flex-wrap gap-4 mt-2"
              >
                {urgencyOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className={option.color}>
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        );

      case 3:
        if (formData.type === 'terrain_communal') {
          return (
            <div className="space-y-6">
              <div>
                <Label htmlFor="usage_prevu">Usage prévu du terrain *</Label>
                <Select value={formData.usage_prevu} onValueChange={(value) => setFormData(prev => ({ ...prev, usage_prevu: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez l'usage prévu" />
                  </SelectTrigger>
                  <SelectContent>
                    {usageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="surface">Surface souhaitée (m²)</Label>
                <Input
                  id="surface"
                  type="number"
                  value={formData.surface}
                  onChange={(e) => setFormData(prev => ({ ...prev, surface: e.target.value }))}
                  placeholder="Ex: 500"
                />
              </div>

              <div>
                <Label htmlFor="duree_souhaitee">Durée d'occupation souhaitée</Label>
                <Input
                  id="duree_souhaitee"
                  value={formData.duree_souhaitee}
                  onChange={(e) => setFormData(prev => ({ ...prev, duree_souhaitee: e.target.value }))}
                  placeholder="Ex: 10 ans, permanente, etc."
                />
              </div>

              <div>
                <Label htmlFor="justification">Justification de la demande *</Label>
                <Textarea
                  id="justification"
                  rows={4}
                  value={formData.justification}
                  onChange={(e) => setFormData(prev => ({ ...prev, justification: e.target.value }))}
                  placeholder="Expliquez pourquoi vous avez besoin de ce terrain..."
                />
              </div>
            </div>
          );
        } else if (formData.type === 'financement') {
          return (
            <div className="space-y-6">
              <div>
                <Label htmlFor="montant_demande">Montant demandé (FCFA) *</Label>
                <Input
                  id="montant_demande"
                  type="number"
                  value={formData.montant_demande}
                  onChange={(e) => setFormData(prev => ({ ...prev, montant_demande: e.target.value }))}
                  placeholder="Ex: 5000000"
                />
              </div>

              <div>
                <Label htmlFor="objet_financement">Objet du financement *</Label>
                <Input
                  id="objet_financement"
                  value={formData.objet_financement}
                  onChange={(e) => setFormData(prev => ({ ...prev, objet_financement: e.target.value }))}
                  placeholder="Ex: Achat terrain, construction maison, etc."
                />
              </div>

              <div>
                <Label htmlFor="revenus_mensuels">Revenus mensuels (FCFA)</Label>
                <Input
                  id="revenus_mensuels"
                  type="number"
                  value={formData.revenus_mensuels}
                  onChange={(e) => setFormData(prev => ({ ...prev, revenus_mensuels: e.target.value }))}
                  placeholder="Ex: 200000"
                />
              </div>

              <div>
                <Label htmlFor="apport_personnel">Apport personnel (FCFA)</Label>
                <Input
                  id="apport_personnel"
                  type="number"
                  value={formData.apport_personnel}
                  onChange={(e) => setFormData(prev => ({ ...prev, apport_personnel: e.target.value }))}
                  placeholder="Ex: 1000000"
                />
              </div>

              <div>
                <Label htmlFor="situation_professionnelle">Situation professionnelle</Label>
                <Input
                  id="situation_professionnelle"
                  value={formData.situation_professionnelle}
                  onChange={(e) => setFormData(prev => ({ ...prev, situation_professionnelle: e.target.value }))}
                  placeholder="Ex: Fonctionnaire, Commerçant, etc."
                />
              </div>
            </div>
          );
        }
        break;

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 p-4 md:p-6 lg:p-8"
    >
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Créer une Demande
        </h1>
        <p className="text-muted-foreground">
          Soumettez votre demande de terrain communal ou de financement
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
              ${step >= stepNumber 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
              }
            `}>
              {stepNumber}
            </div>
            {stepNumber < 3 && (
              <div className={`
                w-12 h-1 mx-2
                ${step > stepNumber ? 'bg-primary' : 'bg-muted'}
              `} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && "Type de demande"}
            {step === 2 && "Informations générales"}
            {step === 3 && "Détails spécifiques"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Sélectionnez le type de demande que vous souhaitez faire"}
            {step === 2 && "Renseignez les informations de base de votre demande"}
            {step === 3 && "Complétez les informations spécifiques à votre demande"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(prev => Math.max(1, prev - 1))}
          disabled={step === 1}
        >
          Précédent
        </Button>
        
        {step < 3 ? (
          <Button
            onClick={() => setStep(prev => prev + 1)}
            disabled={step === 1 && !formData.type}
          >
            Suivant
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Création..." : "Créer la demande"}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default CreateRequestPage;
