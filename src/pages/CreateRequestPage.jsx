import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { 
  FileText, 
  MapPin, 
  DollarSign, 
  TreePine,
  Home,
  Building2
} from 'lucide-react';
import SupabaseDataService from '@/services/supabaseDataService';
import { useAuth } from '@/context/AuthContext';
import GeographicSelector from '@/components/ui/GeographicSelector';

const CreateRequestPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [mairies, setMairies] = useState([]);
  const [banques, setBanques] = useState([]);
  const [userParcels, setUserParcels] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  
  const [formData, setFormData] = useState({
    type: '', // 'terrain_communal' ou 'financement'
    title: '',
    description: '',
    location: '',
    surface: '',
    budget: '',
    urgency: 'normale',
    // Terrain communal specific - ROUTE VERS MAIRIE
    mairie_id: '', // Mairie destinataire
    geographic_location: { region: '', department: '', commune: '' }, // Localisation géographique
    usage_prevu: '',
    duree_souhaitee: '',
    justification: '',
    // Financement specific - ROUTE VERS BANQUE
    banque_id: '', // Banque destinataire
    terrain_reference: '', // Référence du terrain pour financement
    parcel_id: '', // ID de la parcelle soumise
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

  // Charger les options (mairies, banques, parcelles utilisateur)
  useEffect(() => {
    const loadOptions = async () => {
      if (!user) return;
      
      setLoadingOptions(true);
      try {
        // Charger les mairies
        const mairesData = await SupabaseDataService.getUsersByType('Mairie');
        setMairies(mairesData || []);

        // Charger les banques
        const banquesData = await SupabaseDataService.getUsersByType('Banque');
        setBanques(banquesData || []);

        // Charger les parcelles de l'utilisateur pour financement
        const userParcelsData = await SupabaseDataService.getParcelsByOwner(user.id);
        setUserParcels(userParcelsData || []);
      } catch (error) {
        console.error('Erreur chargement options:', error);
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, [user]);

  const handleSubmit = async () => {
    if (!formData.type || !formData.title || !formData.description) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires"
      });
      return;
    }

    // Validation spécifique par type
    if (formData.type === 'terrain_communal' && !formData.mairie_id) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner une mairie destinataire"
      });
      return;
    }

    if (formData.type === 'financement' && (!formData.banque_id || !formData.parcel_id)) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner une banque et un terrain pour le financement"
      });
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        user_id: user.id,
        request_type: formData.type,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        status: 'pending',
        urgency: formData.urgency,
        // Destinataire spécifique selon le type
        recipient_type: formData.type === 'terrain_communal' ? 'Mairie' : 'Banque',
        recipient_id: formData.type === 'terrain_communal' ? formData.mairie_id : formData.banque_id,
        parcel_id: formData.parcel_id || null,
        data: {
          ...formData,
          created_at: new Date().toISOString()
        }
      };

      const createdRequest = await SupabaseDataService.createRequest(requestData);
      
      // Créer une notification pour le destinataire
      const recipientMessage = formData.type === 'terrain_communal' 
        ? `Nouvelle demande de terrain communal de ${user.email}`
        : `Nouvelle demande de financement de ${user.email}`;

      await SupabaseDataService.createNotification({
        userId: formData.type === 'terrain_communal' ? formData.mairie_id : formData.banque_id,
        type: 'new_request',
        title: 'Nouvelle demande reçue',
        body: recipientMessage,
        data: {
          request_id: createdRequest.id,
          request_type: formData.type,
          requester: user.email
        }
      });
      
      toast({
        title: "Demande créée",
        description: `Votre demande a été envoyée à ${formData.type === 'terrain_communal' ? 'la mairie' : 'la banque'} concernée. Vous recevrez une notification dès qu'elle sera traitée.`
      });

      // Redirect to requests page
      navigate('/dashboard/my-requests');
      
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
                <Label htmlFor="mairie_id">Mairie destinataire *</Label>
                <Select value={formData.mairie_id} onValueChange={(value) => setFormData(prev => ({ ...prev, mairie_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez la mairie concernée" />
                  </SelectTrigger>
                  <SelectContent>
                    {mairies.map((mairie) => (
                      <SelectItem key={mairie.id} value={mairie.id}>
                        {mairie.full_name || mairie.email} - {mairie.metadata?.commune || 'Commune non spécifiée'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Votre demande sera directement envoyée à cette mairie
                </p>
              </div>

              <div>
                <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Localisation du terrain demandé
                </h4>
                <GeographicSelector
                  value={formData.geographic_location}
                  onChange={(location) => setFormData(prev => ({ ...prev, geographic_location: location }))}
                  required={true}
                />
              </div>

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
                <Label htmlFor="banque_id">Banque destinataire *</Label>
                <Select value={formData.banque_id} onValueChange={(value) => setFormData(prev => ({ ...prev, banque_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez la banque" />
                  </SelectTrigger>
                  <SelectContent>
                    {banques.map((banque) => (
                      <SelectItem key={banque.id} value={banque.id}>
                        {banque.full_name || banque.email} - {banque.metadata?.bank_name || 'Banque'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Votre demande de financement sera directement envoyée à cette banque
                </p>
              </div>

              <div>
                <Label htmlFor="parcel_id">Terrain à financer *</Label>
                <Select value={formData.parcel_id} onValueChange={(value) => setFormData(prev => ({ ...prev, parcel_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le terrain concerné" />
                  </SelectTrigger>
                  <SelectContent>
                    {userParcels.map((parcel) => (
                      <SelectItem key={parcel.id} value={parcel.id}>
                        {parcel.reference} - {parcel.name} ({parcel.surface_area}m²)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  La banque pourra voir tous les détails de ce terrain
                </p>
              </div>

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      className="container mx-auto px-4 py-8 space-y-6"
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
