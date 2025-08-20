import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Building, 
  MapPin, 
  UserPlus,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import GeographicSelector from '@/components/ui/GeographicSelector';
import SupabaseDataService from '@/services/supabaseDataService';
import LoadingSpinner from '@/components/ui/spinner';

const CreateUserModal = ({ isOpen, onClose, onUserCreated, userType }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    // Informations de base
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    type: userType || '',
    role: 'user',
    
    // Informations géographiques
    location: {
      region: '',
      department: '',
      commune: ''
    },
    
    // Métadonnées spécifiques selon le type
    metadata: {
      // Pour les mairies
      maire_name: '',
      institution_name: '',
      official_email: '',
      office_phone: '',
      services_offered: [],
      
      // Pour les banques
      bank_name: '',
      bank_code: '',
      branch_name: '',
      manager_name: '',
      services: [],
      
      // Pour les particuliers
      profession: '',
      date_naissance: '',
      
      // Pour les agents/vendeurs
      company: '',
      license_number: '',
      specialization: ''
    }
  });

  const userTypes = [
    { 
      value: 'particulier', 
      label: 'Particulier', 
      description: 'Citoyen recherchant des terrains ou services fonciers',
      icon: User 
    },
    { 
      value: 'mairie', 
      label: 'Mairie', 
      description: 'Administration municipale gérant les terrains communaux',
      icon: Building 
    },
    { 
      value: 'banque', 
      label: 'Banque', 
      description: 'Institution financière proposant des financements',
      icon: Building 
    },
    { 
      value: 'agent', 
      label: 'Agent Immobilier', 
      description: 'Professionnel de l\'immobilier et du foncier',
      icon: User 
    },
    { 
      value: 'vendeur', 
      label: 'Vendeur', 
      description: 'Propriétaire vendant des terrains',
      icon: User 
    },
    { 
      value: 'notaire', 
      label: 'Notaire', 
      description: 'Officier public authentifiant les actes',
      icon: User 
    }
  ];

  const services = {
    mairie: [
      'Certificats d\'urbanisme',
      'Permis de construire', 
      'Attribution terrains communaux',
      'Viabilisation',
      'Cadastre',
      'État civil'
    ],
    banque: [
      'Crédit immobilier',
      'Crédit foncier',
      'Épargne logement',
      'Garanties hypothécaires',
      'Conseil financier',
      'Micro-crédit'
    ]
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      full_name: '',
      phone: '',
      type: '',
      role: 'user',
      location: { region: '', department: '', commune: '' },
      metadata: {}
    });
    setStep(1);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMetadataChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value
      }
    }));
  };

  const handleLocationChange = (location) => {
    setFormData(prev => ({
      ...prev,
      location
    }));
  };

  const handleServiceToggle = (service) => {
    const serviceKey = formData.type === 'mairie' ? 'services_offered' : 'services';
    const currentServices = formData.metadata[serviceKey] || [];
    
    const updatedServices = currentServices.includes(service)
      ? currentServices.filter(s => s !== service)
      : [...currentServices, service];
    
    handleMetadataChange(serviceKey, updatedServices);
  };

  const validateStep1 = () => {
    return (
      formData.email &&
      formData.password &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword &&
      formData.full_name &&
      formData.phone &&
      formData.type
    );
  };

  const validateStep2 = () => {
    if (!formData.location.region || !formData.location.department || !formData.location.commune) {
      return false;
    }

    if (formData.type === 'mairie') {
      return formData.metadata.maire_name && formData.metadata.institution_name;
    }
    
    if (formData.type === 'banque') {
      return formData.metadata.bank_name && formData.metadata.branch_name;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires"
      });
      return;
    }

    setLoading(true);
    try {
      // Préparer les données utilisateur
      const userData = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone: formData.phone,
        type: formData.type,
        role: formData.role,
        location: `${formData.location.commune}, ${formData.location.department}, ${formData.location.region}`,
        metadata: {
          ...formData.metadata,
          geographic_data: formData.location,
          created_via: 'admin_panel',
          created_at: new Date().toISOString()
        },
        is_active: true,
        verification_status: 'verified' // Auto-vérifié car créé par admin
      };

      console.log("Création utilisateur:", formData.type, userData);

      // Créer l'utilisateur
      let newUser;
      
      // Normaliser le type d'utilisateur (première lettre en majuscule)
      const normalizedType = formData.type.charAt(0).toUpperCase() + formData.type.slice(1).toLowerCase();
      userData.type = normalizedType;
      
      if (normalizedType === 'Banque' || normalizedType === 'Mairie' || normalizedType === 'Notaire') {
        // Pour ces types institutionnels, utiliser la méthode spécifique
        newUser = await SupabaseDataService.createInstitutionUser({
          email: userData.email,
          password: userData.password,
          full_name: userData.full_name,
          phone: userData.phone,
          type: normalizedType,
          role: 'institution',
          location: formData.location,
          metadata: userData.metadata
        });
      } else {
        // Pour les autres types (particulier, agent, etc.)
        newUser = await SupabaseDataService.createUser(userData);
      }
      
      toast({
        title: "Utilisateur créé",
        description: `${formData.full_name} (${formData.type}) a été créé avec succès`,
        className: "bg-green-600 text-white"
      });

      onUserCreated?.(newUser);
      onClose();
      resetForm();

    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de créer l'utilisateur. Vérifiez que l'email n'existe pas déjà."
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="full_name" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Nom complet *
          </Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => handleInputChange('full_name', e.target.value)}
            placeholder="Prénom et nom"
          />
        </div>
        
        <div>
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="email@example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Téléphone *
          </Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+221 XX XXX XX XX"
          />
        </div>

        <div>
          <Label htmlFor="type">Type d'utilisateur *</Label>
          <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez le type" />
            </SelectTrigger>
            <SelectContent>
              {userTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <type.icon className="h-4 w-4" />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="password" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Mot de passe *
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Mot de passe sécurisé"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            placeholder="Répétez le mot de passe"
          />
          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <p className="text-sm text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
          )}
        </div>
      </div>

      {formData.type && (
        <div className="p-3 bg-muted/50 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="font-medium">Type sélectionné : {userTypes.find(t => t.value === formData.type)?.label}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {userTypes.find(t => t.value === formData.type)?.description}
          </p>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Localisation géographique */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Localisation géographique
        </h3>
        <GeographicSelector
          value={formData.location}
          onChange={handleLocationChange}
          required={true}
        />
      </div>

      {/* Champs spécifiques selon le type */}
      {formData.type === 'mairie' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Informations mairie</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maire_name">Nom du maire *</Label>
                <Input
                  id="maire_name"
                  value={formData.metadata.maire_name || ''}
                  onChange={(e) => handleMetadataChange('maire_name', e.target.value)}
                  placeholder="Prénom et nom du maire"
                />
              </div>
              <div>
                <Label htmlFor="institution_name">Nom officiel de la mairie *</Label>
                <Input
                  id="institution_name"
                  value={formData.metadata.institution_name || ''}
                  onChange={(e) => handleMetadataChange('institution_name', e.target.value)}
                  placeholder="Mairie de..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="official_email">Email officiel</Label>
                <Input
                  id="official_email"
                  type="email"
                  value={formData.metadata.official_email || ''}
                  onChange={(e) => handleMetadataChange('official_email', e.target.value)}
                  placeholder="mairie@commune.sn"
                />
              </div>
              <div>
                <Label htmlFor="office_phone">Téléphone bureau</Label>
                <Input
                  id="office_phone"
                  value={formData.metadata.office_phone || ''}
                  onChange={(e) => handleMetadataChange('office_phone', e.target.value)}
                  placeholder="+221 XX XXX XX XX"
                />
              </div>
            </div>

            <div>
              <Label>Services proposés</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {services.mairie.map((service) => (
                  <Badge
                    key={service}
                    variant={formData.metadata.services_offered?.includes(service) ? "default" : "outline"}
                    className="cursor-pointer justify-center p-2"
                    onClick={() => handleServiceToggle(service)}
                  >
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {formData.type === 'banque' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Informations banque</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bank_name">Nom de la banque *</Label>
                <Input
                  id="bank_name"
                  value={formData.metadata.bank_name || ''}
                  onChange={(e) => handleMetadataChange('bank_name', e.target.value)}
                  placeholder="Ex: CBAO, UBA, SGBS..."
                />
              </div>
              <div>
                <Label htmlFor="branch_name">Agence *</Label>
                <Input
                  id="branch_name"
                  value={formData.metadata.branch_name || ''}
                  onChange={(e) => handleMetadataChange('branch_name', e.target.value)}
                  placeholder="Ex: Agence Dakar Plateau"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bank_code">Code banque</Label>
                <Input
                  id="bank_code"
                  value={formData.metadata.bank_code || ''}
                  onChange={(e) => handleMetadataChange('bank_code', e.target.value)}
                  placeholder="Code BCEAO"
                />
              </div>
              <div>
                <Label htmlFor="manager_name">Responsable agence</Label>
                <Input
                  id="manager_name"
                  value={formData.metadata.manager_name || ''}
                  onChange={(e) => handleMetadataChange('manager_name', e.target.value)}
                  placeholder="Nom du responsable"
                />
              </div>
            </div>

            <div>
              <Label>Services financiers</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {services.banque.map((service) => (
                  <Badge
                    key={service}
                    variant={formData.metadata.services?.includes(service) ? "default" : "outline"}
                    className="cursor-pointer justify-center p-2"
                    onClick={() => handleServiceToggle(service)}
                  >
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {formData.type === 'particulier' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Informations personnelles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="profession">Profession</Label>
              <Input
                id="profession"
                value={formData.metadata.profession || ''}
                onChange={(e) => handleMetadataChange('profession', e.target.value)}
                placeholder="Votre profession"
              />
            </div>
            <div>
              <Label htmlFor="date_naissance">Date de naissance</Label>
              <Input
                id="date_naissance"
                type="date"
                value={formData.metadata.date_naissance || ''}
                onChange={(e) => handleMetadataChange('date_naissance', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {(formData.type === 'agent' || formData.type === 'vendeur' || formData.type === 'notaire') && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Informations professionnelles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company">Entreprise/Cabinet</Label>
              <Input
                id="company"
                value={formData.metadata.company || ''}
                onChange={(e) => handleMetadataChange('company', e.target.value)}
                placeholder="Nom de l'entreprise"
              />
            </div>
            <div>
              <Label htmlFor="license_number">Numéro de licence</Label>
              <Input
                id="license_number"
                value={formData.metadata.license_number || ''}
                onChange={(e) => handleMetadataChange('license_number', e.target.value)}
                placeholder="Numéro professionnel"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Créer un nouvel utilisateur
          </DialogTitle>
          <DialogDescription>
            Étape {step} sur 2 : {step === 1 ? 'Informations de connexion' : 'Localisation et détails spécifiques'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === 1 ? renderStep1() : renderStep2()}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {step === 2 && (
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Précédent
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            
            {step === 1 ? (
              <Button
                onClick={() => setStep(2)}
                disabled={!validateStep1()}
              >
                Suivant
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!validateStep2() || loading}
              >
                {loading && <LoadingSpinner className="mr-2 h-4 w-4" />}
                Créer l'utilisateur
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserModal;
